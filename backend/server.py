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
@app.get("/health")
def health():
    return {"ok": True}

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
    logger.info("🔵 [Auth] Received Google auth request")
    logger.info(f"🔵 [Auth] Token preview: {auth_request.token[:50]}...")
    
    try:
        # Verify Google token
        logger.info("🔵 [Auth] Verifying Google token...")
        google_user = verify_google_token(auth_request.token)
        google_id = google_user['google_id']
        logger.info(f"🟢 [Auth] Google token verified: {google_user['email']}")
        
        # Check if user exists
        existing_user = await db.users.find_one({"google_id": google_id}, {"_id": 0})
        
        if existing_user:
            # User exists - update last login and return
            existing_user['updated_at'] = datetime.now(timezone.utc).isoformat()
            
            # MIGRATION: Convert inventory from object to array if needed
            inventory_needs_migration = False
            if 'inventory' in existing_user and not isinstance(existing_user['inventory'], list):
                logger.info(f"🔧 [Migration] Converting inventory from dict to array for {google_user['email']}")
                old_inventory = existing_user['inventory']
                # Convert object to array of items
                existing_user['inventory'] = []
                if isinstance(old_inventory, dict):
                    for item_name, count in old_inventory.items():
                        if isinstance(count, int) and count > 0:
                            for _ in range(count):
                                existing_user['inventory'].append({'name': item_name, 'count': 1})
                inventory_needs_migration = True
            elif 'inventory' not in existing_user:
                # Add inventory field if missing
                logger.info(f"🔧 [Migration] Adding missing inventory field for {google_user['email']}")
                existing_user['inventory'] = []
                inventory_needs_migration = True
            
            # Update database with migrated inventory
            if inventory_needs_migration:
                await db.users.update_one(
                    {"google_id": google_id},
                    {"$set": {"inventory": existing_user['inventory'], "updated_at": existing_user['updated_at']}}
                )
            else:
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
            logger.info(f"🟢 [Auth] Existing user logged in: {google_user['email']}")
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
                'streaks': {'dailyStreak': 0, 'weeklyStreak': 0, 'longestDailyStreak': 0, 'longestWeeklyStreak': 0},
                'quest_streaks': {},
                'inventory': [],  # Array, not object!
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
                # Profile stats
                'totalXPEarned': 0,
                'totalQuestsCompleted': 0,
                'totalCoinsEarned': 0,
                'totalCoinsSpent': 0,
                'totalPurchases': 0,
                'mainQuestsCompleted': 0,
                'memberSince': datetime.now(timezone.utc).isoformat(),
                'miniGamesPlayed': {},
                # Timestamps
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
        try:
            jwt_token = create_jwt_token({
                'google_id': google_id,
                'email': google_user['email']
            })
            logger.info(f"JWT token created successfully for user: {google_user['email']}")
        except Exception as jwt_error:
            logger.error(f"JWT token creation failed: {type(jwt_error).__name__}: {str(jwt_error)}")
            import traceback
            logger.error(f"JWT traceback: {traceback.format_exc()}")
            raise
        
        return AuthResponse(token=jwt_token, user=user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"Auth traceback: {traceback.format_exc()}")
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
        # Add item to inventory (inventory is an array)
        inventory = user.get('inventory', [])
        if not isinstance(inventory, list):
            # Migration: convert old dict inventory to array
            inventory = []
        
        item_id = promo['item_id']
        # Add item as object to array
        inventory.append({'name': item_id, 'count': 1})
        update_dict['inventory'] = inventory
        reward_amount = 1
        message = f"Redeemed! {item_id} added to inventory"
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

@api_router.get("/health")
async def health_check():
    """
    Health check endpoint for production monitoring
    Returns OK if service is running and DB is accessible
    """
    try:
        # Ping MongoDB to verify connection
        await db.command('ping')
        
        return {
            "ok": True,
            "status": "healthy",
            "environment": os.environ.get('ENVIRONMENT', 'production'),
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail={"ok": False, "status": "unhealthy", "error": str(e)}
        )


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

import logging
for r in app.router.routes:
    logging.getLogger(__name__).info(f"Route: {getattr(r, 'path', '')} – {getattr(r, 'methods', '')}")
 