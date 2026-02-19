from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

print(f"Connecting to MongoDB at {settings.MONGO_URL}")
client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]
users_collection = db["users"]
