# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
from pymongo import MongoClient

from judgement_spider.util.toolbox import current_time_milli, current_date


class JudgementSpiderPipeline(object):

    def __init__(self, spider_settings):

        host = spider_settings.get('MONGO_HOST', 'localhost')
        port = spider_settings.getint('MONGO_PORT', 27017)
        db = spider_settings.get('MONGO_DB', 'wenshu_data')
        self.spider_settings = spider_settings

        self.client = MongoClient(host, int(port))
        self.db = self.client[db]

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            spider_settings=crawler.settings
        )

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        item['crawled_at'] = str(current_time_milli())
        current_date_str = self.spider_settings.get(
            'CURRENT_DATE_STRING', current_date())
        self.__persist(item, current_date_str)
        return item

    def __persist(self, item, collection_name):
        self.db[collection_name].insert_one(item)
