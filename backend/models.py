# Pydantic models for API request/response
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime
import uuid


class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth login"""
    token: str


class UserQuests(BaseModel):
    """User's quest data"""
    daily: List[Dict[str, Any]] = Field(default_factory=list)
    weekly: List[Dict[str, Any]] = Field(default_factory=list)
    main: Optional[Dict[str, Any]] = None
    side: List[Dict[str, Any]] = Field(default_factory=list)


class UserData(BaseModel):
    """Complete user data model"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    google_id: str
    email: EmailStr
    name: str
    avatar: str = ""
    
    # Game progress
    xp: int = 0
    level: int = 1
    coins: int = 0
    
    # Quests
    quests: UserQuests = Field(default_factory=UserQuests)
    
    # Streaks
    streaks: Dict[str, Any] = Field(default_factory=dict)
    quest_streaks: Dict[str, Any] = Field(default_factory=dict)
    
    # Inventory & Effects
    inventory: List[Dict[str, Any]] = Field(default_factory=list)
    active_effects: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Settings & Metadata
    settings: Dict[str, Any] = Field(default_factory=dict)
    used_promo_codes: List[str] = Field(default_factory=list)
    used_inspiration_suggestions: List[str] = Field(default_factory=list)
    
    # Quest creation limits
    daily_quest_creation_count: int = 0
    daily_quest_creation_date: Optional[str] = None
    weekly_quest_creation_count: int = 0
    weekly_quest_creation_date: Optional[str] = None
    
    # Cooldowns
    main_quest_cooldown: Optional[str] = None
    daily_check_in_date: Optional[str] = None
    
    # History
    main_quest_history: List[Dict[str, Any]] = Field(default_factory=list)
    achievements: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())


class UserUpdateRequest(BaseModel):
    """Request model for updating user data"""
    xp: Optional[int] = None
    level: Optional[int] = None
    coins: Optional[int] = None
    quests: Optional[Dict[str, Any]] = None
    streaks: Optional[Dict[str, Any]] = None
    quest_streaks: Optional[Dict[str, Any]] = None
    inventory: Optional[Dict[str, Any]] = None
    active_effects: Optional[List[Dict[str, Any]]] = None
    settings: Optional[Dict[str, Any]] = None
    used_promo_codes: Optional[List[str]] = None
    used_inspiration_suggestions: Optional[List[str]] = None
    daily_quest_creation_count: Optional[int] = None
    daily_quest_creation_date: Optional[str] = None
    weekly_quest_creation_count: Optional[int] = None
    weekly_quest_creation_date: Optional[str] = None
    main_quest_cooldown: Optional[str] = None
    daily_check_in_date: Optional[str] = None
    main_quest_history: Optional[List[Dict[str, Any]]] = None
    achievements: Optional[List[Dict[str, Any]]] = None


class AuthResponse(BaseModel):
    """Response model for authentication"""
    token: str
    user: UserData


class PromoCode(BaseModel):
    """Promo code model"""
    model_config = ConfigDict(extra="ignore")
    
    code: str
    type: str  # 'xp', 'coins', 'item'
    amount: Optional[int] = None
    item_id: Optional[str] = None
    active: bool = True
    max_uses: Optional[int] = None
    used_count: int = 0


class PromoRedeemRequest(BaseModel):
    """Request model for redeeming promo code"""
    code: str


class PromoRedeemResponse(BaseModel):
    """Response model for promo redemption"""
    success: bool
    message: str
    reward_type: Optional[str] = None
    reward_amount: Optional[int] = None
    item_id: Optional[str] = None
