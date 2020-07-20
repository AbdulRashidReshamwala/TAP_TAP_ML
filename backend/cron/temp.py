from pymongo import MongoClient
from google_images_download import google_images_download
from config import DATABASE_NAME, DATASET_COLLECTION_NAME


db = MongoClient()
conn = db[DATABASE_NAME][DATASET_COLLECTION_NAME]

while 1:
    dataset = conn.find_one(
        {"status": "queued"})
    if dataset:
        conn.update_one({"name": dataset["name"]}, {
                        "$set": {"status": "working"}})
        images = {}
        for c in dataset["classes"]:
            response = google_images_download.googleimagesdownload()
            arguments = {"keywords": c,
                         "limit": dataset['num_images'],
                         "print_urls": False,
                         'output_directory': f'../static/datasets/{dataset["name"]}',
                         "no_directory": True,
                         "chromedriver": "/home/abdul/chromedriver",
                         "no_numbering": True}
            paths = response.download(arguments)
            filenames = [i.split('/')[-1] for i in paths[0][c]]
            images[c] = filenames
        conn.update_one({"name": dataset["name"]}, {
                        "$set": {"status": "completed", 'images': images}})
