from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone

# Import our custom modules
from auth import verify_google_token, create_jwt_token, get_current_user_id
from models import (
    GoogleAuthRequest, AuthResponse, UserData, UserUpdateRequest,
    PromoCode, PromoRedeemRequest, PromoRedeemResponse, UserQuests
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app without a prefix
app = FastAPI(title="Ascend API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@api_router.post("/auth/google", response_model=AuthResponse)
async def google_auth(auth_request: GoogleAuthRequest):
    """
    Authenticate user with Google OAuth token
    - Verifies Google token
    - Creates new user if first login
    - Returns JWT token and user data
    """
    try:
        # Verify Google token
        google_user = verify_google_token(auth_request.token)
        google_id = google_user['google_id']
        
        # Check if user exists
        existing_user = await db.users.find_one({"google_id": google_id}, {"_id": 0})
        
        if existing_user:
            # User exists - update last login and return
            existing_user['updated_at'] = datetime.now(timezone.utc).isoformat()
            await db.users.update_one(
                {"google_id": google_id},
                {"$set": {"updated_at": existing_user['updated_at']}}
            )
            
            # Convert datetime strings back to datetime objects for Pydantic
            if isinstance(existing_user.get('created_at'), str):
                existing_user['created_at'] = datetime.fromisoformat(existing_user['created_at'])
            if isinstance(existing_user.get('updated_at'), str):
                existing_user['updated_at'] = datetime.fromisoformat(existing_user['updated_at'])
            
            user_data = UserData(**existing_user)
            logger.info(f"Existing user logged in: {google_user['email']}")
        else:
            # New user - create account
            new_user_data = {
                'google_id': google_id,
                'email': google_user['email'],
                'name': google_user['name'],
                'avatar': google_user['avatar'],
                'xp': 0,
                'level': 1,
                'coins': 0,
                'quests': {'daily': [], 'weekly': [], 'main': None, 'side': []},
                'streaks': {},
                'quest_streaks': {},
                'inventory': {},
                'active_effects': [],
                'settings': {},
                'used_promo_codes': [],
                'used_inspiration_suggestions': [],
                'daily_quest_creation_count': 0,
                'daily_quest_creation_date': None,
                'weekly_quest_creation_count': 0,
                'weekly_quest_creation_date': None,
                'main_quest_cooldown': None,
                'daily_check_in_date': None,
                'main_quest_history': [],
                'achievements': [],
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            user_data = UserData(**new_user_data)
            
            # Insert into database
            doc = user_data.model_dump()
            doc['created_at'] = doc['created_at'].isoformat() if isinstance(doc['created_at'], datetime) else doc['created_at']
            doc['updated_at'] = doc['updated_at'].isoformat() if isinstance(doc['updated_at'], datetime) else doc['updated_at']
            
            await db.users.insert_one(doc)
            logger.info(f"New user created: {google_user['email']}")
        
        # Generate JWT token
        jwt_token = create_jwt_token({
            'google_id': google_id,
            'email': google_user['email']
        })
        
        return AuthResponse(token=jwt_token, user=user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


# ============================================================================
# USER MANAGEMENT ENDPOINTS
# ============================================================================

@api_router.get("/user/{google_id}", response_model=UserData)
async def get_user(google_id: str, current_user_id: str = Depends(get_current_user_id)):
    """
    Get user data by Google ID
    Requires valid JWT token
    """
    # Verify user can only access their own data
    if google_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = await db.users.find_one({"google_id": google_id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert datetime strings
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    if isinstance(user.get('updated_at'), str):
        user['updated_at'] = datetime.fromisoformat(user['updated_at'])
    
    return UserData(**user)


@api_router.post("/user/update")
async def update_user(
    update_data: UserUpdateRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Update user data
    Requires valid JWT token
    """
    # Build update dict with only provided fields
    update_dict = {
        k: v for k, v in update_data.model_dump(exclude_none=True).items()
    }
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    # Add updated_at timestamp
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Update user
    result = await db.users.update_one(
        {"google_id": current_user_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.info(f"User {current_user_id} updated: {list(update_dict.keys())}")
    
    return {"success": True, "message": "User updated successfully"}


# ============================================================================
# PROMO CODE ENDPOINTS
# ============================================================================

@api_router.post("/promo/redeem", response_model=PromoRedeemResponse)
async def redeem_promo(
    redeem_request: PromoRedeemRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Redeem a promo code
    Requires valid JWT token
    """
    code = redeem_request.code.upper()
    
    # Get user
    user = await db.users.find_one({"google_id": current_user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already used
    used_codes = user.get('used_promo_codes', [])
    if code in used_codes:
        return PromoRedeemResponse(
            success=False,
            message="You've already used this promo code!"
        )
    
    # Find promo code
    promo = await db.promo_codes.find_one({"code": code, "active": True}, {"_id": 0})
    
    if not promo:
        return PromoRedeemResponse(
            success=False,
            message="Invalid or expired promo code"
        )
    
    # Check max uses
    if promo.get('max_uses') and promo.get('used_count', 0) >= promo['max_uses']:
        return PromoRedeemResponse(
            success=False,
            message="This promo code has reached its usage limit"
        )
    
    # Apply reward
    update_dict = {}
    reward_type = promo['type']
    
    if reward_type == 'xp':
        update_dict['xp'] = user.get('xp', 0) + promo['amount']
        reward_amount = promo['amount']
        message = f"Redeemed! +{reward_amount} XP"
    elif reward_type == 'coins':
        update_dict['coins'] = user.get('coins', 0) + promo['amount']
        reward_amount = promo['amount']
        message = f"Redeemed! +{reward_amount} Coins"
    elif reward_type == 'item':
        # Add item to inventory
        inventory = user.get('inventory', {})
        item_id = promo['item_id']
        inventory[item_id] = inventory.get(item_id, 0) + 1
        update_dict['inventory'] = inventory
        reward_amount = 1
        message = "Redeemed! Item added to inventory"
    else:
        raise HTTPException(status_code=500, detail="Invalid promo code type")
    
    # Update user
    used_codes.append(code)
    update_dict['used_promo_codes'] = used_codes
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"google_id": current_user_id},
        {"$set": update_dict}
    )
    
    # Increment promo code usage
    await db.promo_codes.update_one(
        {"code": code},
        {"$inc": {"used_count": 1}}
    )
    
    logger.info(f"User {current_user_id} redeemed promo: {code}")
    
    return PromoRedeemResponse(
        success=True,
        message=message,
        reward_type=reward_type,
        reward_amount=reward_amount,
        item_id=promo.get('item_id')
    )


# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/")
async def root():
    return {
        "message": "Ascend API is running",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/google",
            "user": "/api/user/{google_id}",
            "update": "/api/user/update",
            "promo": "/api/promo/redeem"
        }
    }


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("MongoDB connection closed")