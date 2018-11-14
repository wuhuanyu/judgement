# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
from pymongo import MongoClient
import base64
from .util.toolbox import current_time, current_time_milli


class JudgementSpiderPipeline(object):

    def __init__(self, *a, **kwargs):
        self.client = MongoClient('localhost', 27017)
        self.db = self.client['wenshu_data']
        self.docs = self.db['docs']

    def process_item(self, item, spider):
        # data_dict = dict(
        #     id=id,文书id
        #     name=name, 案件名称
        #     type=type,案件类型
        #     date=date,案件裁判日期
        #     number=number,案件号码
        #     court=court,法庭
        # )

        # we convert chinese character into base64
        # item['name'] = base64.b64encode(item['name'])
        # item['court'] = base64.b64encode(item['court'])
        item['crawled_at'] = str(current_time_milli())
        self.__persist(item)

        return item

    def __persist(self, item):
        self.docs.insert_one(item)
