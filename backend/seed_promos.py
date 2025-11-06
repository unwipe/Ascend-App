# Seed promo codes into MongoDB
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_promo_codes():
    """Seed initial promo codes"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]
    
    promo_codes = [
        {
            "code": "WELCOME100",
            "type": "xp",
            "amount": 100,
            "active": True,
            "max_uses": None,
            "used_count": 0
        },
        {
            "code": "ASCEND500",
            "type": "xp",
            "amount": 500,
            "active": True,
            "max_uses": 100,
            "used_count": 0
        },
        {
            "code": "COINS50",
            "type": "coins",
            "amount": 50,
            "active": True,
            "max_uses": None,
            "used_count": 0
        },
        {
            "code": "BOOST2024",
            "type": "xp",
            "amount": 250,
            "active": True,
            "max_uses": 50,
            "used_count": 0
        }
    ]
    
    # Clear existing promo codes
    await db.promo_codes.delete_many({})
    
    # Insert new promo codes
    result = await db.promo_codes.insert_many(promo_codes)
    
    print(f"✅ Seeded {len(result.inserted_ids)} promo codes:")
    for code in promo_codes:
        print(f"  - {code['code']}: {code['amount']} {code['type'].upper()}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_promo_codes())
