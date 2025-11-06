# Authentication utilities for Google OAuth and JWT
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_MINUTES = int(os.environ.get('JWT_EXPIRATION_MINUTES', 43200))  # 30 days default
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

security = HTTPBearer()


def verify_google_token(token: str) -> dict:
    """
    Verify Google ID token and return user info
    
    Args:
        token: Google ID token from frontend
        
    Returns:
        dict with user info (sub, email, name, picture)
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Token is valid, return user info
        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'name': idinfo.get('name', ''),
            'avatar': idinfo.get('picture', '')
        }
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=401,
            detail=f"Invalid Google token: {str(e)}"
        )


def create_jwt_token(user_data: dict) -> str:
    """
    Create JWT token for authenticated user
    
    Args:
        user_data: Dictionary with user info (must include google_id and email)
        
    Returns:
        JWT token string
    """
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET is not configured")
    
    expires = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    
    payload = {
        'google_id': user_data['google_id'],
        'email': user_data['email'],
        'exp': expires,
        'iat': datetime.now(timezone.utc)
    }
    
    # Ensure secret is a string (not bytes) for python-jose
    secret_key = JWT_SECRET if isinstance(JWT_SECRET, str) else JWT_SECRET.decode('utf-8')
    token = jwt.encode(payload, secret_key, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Verify JWT token from Authorization header
    
    Args:
        credentials: HTTP Bearer credentials
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET is not configured")
    
    token = credentials.credentials
    
    try:
        # Ensure secret is a string (not bytes) for python-jose
        secret_key = JWT_SECRET if isinstance(JWT_SECRET, str) else JWT_SECRET.decode('utf-8')
        payload = jwt.decode(token, secret_key, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired token: {str(e)}"
        )


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Extract google_id from JWT token
    
    Args:
        credentials: HTTP Bearer credentials
        
    Returns:
        Google ID string
    """
    payload = verify_jwt_token(credentials)
    return payload.get('google_id')
