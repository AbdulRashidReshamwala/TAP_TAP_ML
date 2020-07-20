from pymongo import MongoClient


class DataBase:
    client: MongoClient = None


db = DataBase()


async def get_database() -> MongoClient:
    return db.client

def convert_object_id(document):
    o = document['_id']
    document['created_at'] = o.generation_time
    document['id'] = str(o)
    document.pop('_id')
    return document