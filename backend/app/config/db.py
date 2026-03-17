"""MongoDB async connection using Motor."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    print(f"✅ Connected to MongoDB: {settings.database_name}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB disconnected")


def get_db():
    return db
