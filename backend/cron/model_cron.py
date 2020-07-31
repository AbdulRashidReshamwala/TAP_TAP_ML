from pymongo import MongoClient
from model_utils import train_model
from config import DATABASE_NAME, MODEL_COLLECTION_NAME, DATASET_COLLECTION_NAME


db = MongoClient()
conn = db[DATABASE_NAME]

while 1:
    model = conn[MODEL_COLLECTION_NAME].find_one(
        {"status": "queued"})
    if model:
        conn[MODEL_COLLECTION_NAME].update_one({"name": model["name"]}, {
            "$set": {"status": "working"}})
        dataset = conn[DATASET_COLLECTION_NAME].find_one(
            {'name': model['dataset_name']})
        meta = train_model(model['name'], model['dataset_name'], model['arch'],
                           model['img_size'], model['epochs'])
        conn[MODEL_COLLECTION_NAME].update_one({"name": model["name"]}, {
            "$set": {"status": "completed", "meta": meta}})
