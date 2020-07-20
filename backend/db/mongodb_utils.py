
from .mongodb import db, MongoClient
from bson import ObjectId


async def connect_to_mongo():
    db.client = MongoClient()


async def close_mongo_connection():
    db.client.close()

