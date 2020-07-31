import os
from icrawler.builtin import BingImageCrawler

BASE_DIR = '../static/'


def download_data(dataset_name, classes, num_images):
    for c in classes:
        bing_crawler = BingImageCrawler(downloader_threads=6, storage={
            'root_dir': f'../static/datasets/{dataset_name}/{c}'})
        bing_crawler.crawl(
            keyword=c, filters=None, offset=0, max_num=num_images*2)
