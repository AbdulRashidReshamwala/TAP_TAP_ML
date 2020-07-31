from pymongo import MongoClient
from config import DATABASE_NAME, DATASET_COLLECTION_NAME
from scrapper_utils import download_data


db = MongoClient()
conn = db[DATABASE_NAME][DATASET_COLLECTION_NAME]

while 1:
    dataset = conn.find_one(
        {"status": "queued"})
    if dataset:
        conn.update_one({"name": dataset["name"]}, {
                        "$set": {"status": "working"}})
        download_data(dataset['name'], dataset['classes'],
                      dataset['num_images'])
        conn.update_one({"name": dataset["name"]}, {
                        "$set": {"status": "completed"}})
