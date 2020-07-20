import base64
from pymongo import MongoClient
from config import DATABASE_NAME, DATASET_COLLECTION_NAME
from icrawler.builtin import BingImageCrawler
from icrawler import ImageDownloader
from six.moves.urllib.parse import urlparse


class MyImageDownloader(ImageDownloader):

    def get_filename(self, task, default_ext):
        url_path = urlparse(task['file_url'])[2]
        if '.' in url_path:
            extension = url_path.split('.')[-1]
            if extension.lower() not in [
                    'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif', 'ppm', 'pgm'
            ]:
                extension = default_ext
        else:
            extension = default_ext
        filename = base64.b64encode(url_path.encode()).decode()
        return '{}.{}'.format(filename, extension)


db = MongoClient()
conn = db[DATABASE_NAME][DATASET_COLLECTION_NAME]

while 1:
    dataset = conn.find_one(
        {"status": "queued"})
    if dataset:
        conn.update_one({"name": dataset["name"]}, {
                        "$set": {"status": "working"}})
        for c in dataset["classes"]:
            bing_crawler = BingImageCrawler(downloader_cls=MyImageDownloader, downloader_threads=6, storage={
                'root_dir': f'../static/datasets/{dataset["name"]}'})
            res = bing_crawler.crawl(keyword=c, filters=None,
                                     offset=0, max_num=int(dataset["num_images"]))
            print(res)
        conn.update_one({"name": dataset["name"]}, {
                        "$set": {"status": "completed"}})
