'''
Spider manager to manage spider,
configure param and some other dirty work
'''
from judgement_spider.util.toolbox import load_json, dump_json, construct_param, datetime_to_str, str_to_datetime
from judgement_spider.constant import FINISHED, NEED_RETRY, VALIDATION, REDIRECT, CANCELLED, SHUT_DOWN
from judgement_spider.constant import TIME_DELTA, TIME_DELTA_REGION
from judgement_spider.constant import START_DATE, START_INDEX
from datetime import datetime
from scrapy.crawler import CrawlerProcess,CrawlerRunner
from judgement_spider.spiders import JudgementSpider

# default_process = construct_param({

#     '案件类型': '刑事案件',
#     '裁判日期': '{} TO {}'.format('2018-09-17', datetime_to_str(str_to_datetime('2018-09-17')+TIME_DELTA_REGION)),
#     '法院地域': '北京市'
    
# })

default_process={
    'date_to_crawl':'2018-09-17',
    'province_to_crawl':'北京市',
    'index_to_crawl':1,
    'current_tried_times':1,
}


class SpiderManager:
    def __init__(self, process_file_path, settings, provinces_file_path, default_process=default_process):
        self.process_file_path = process_file_path
        self.next_process: dict = None
        self.default_process = default_process
        self.settings = settings

        self.provinces = []
        for p in load_json(provinces_file_path):
            self.provinces.append(p['name'])

    def configure(self):
        settings = self.settings
        next_process: dict = None

        if self.process_file_path is None:
            next_process = default_process
        else:
            date_to_crawl = None
            index_to_crawl = None
            province_to_crawl = None
            current_tried_times = None

            last_process: dict = load_json(self.process_file_path)
            last_index = last_process['last_index']
            last_date = str_to_datetime(last_process['last_date'])
            finish_reason = last_process['finish_reason']
            last_tried_times = int(last_process['last_tried_times'])
            last_province = last_process['last_province']
            last_province_idx = self.provinces.index(last_province)

            if 'all_indexes' in list(last_process.keys()):
                all_indexes = last_process['all_indexes']

            need_change_param = False
            # we finished or we meet the max index,change param,change province or date
            if (finish_reason == FINISHED) and (last_index == all_indexes
                                                or last_index == settings.getint('INDEXES_PER_DEPTH', 20)
                                                ):
                need_change_param = True
            # we need retry but we have met max tried times and further we cannot chagne index because we have meet the max index
            if (finish_reason == NEED_RETRY) and \
                (last_tried_times == settings.getint('MAX_TRIED_TIMES', 3)) and \
                    (last_index == all_indexes or last_index == settings.getint('INDEX_PER_DEPTH', 20)):
                need_change_param = True

            elif finish_reason in [VALIDATION, REDIRECT, CANCELLED, SHUT_DOWN]:
                pass
            elif finish_reason == NEED_RETRY:
                pass

            if need_change_param:
                # 1. keep province unchanged and change  date
                # 2. change province and date from first
                # we have not arrive the last province
                if last_province_idx != len(self.provinces)-1:
                    # we change date and keep province unchanged
                    if str_to_datetime(settings.get('STOP_DATE', '2018-09-17')) < last_date-TIME_DELTA_REGION:
                        date_to_crawl = last_date-TIME_DELTA_REGION
                        province_to_crawl = last_province
                    else:
                        # we can not change date, we change province:
                        province_to_crawl = self.provinces[last_province_idx+1]
                        date_to_crawl = str_to_datetime(START_DATE)
                    index_to_crawl = START_INDEX

                else:
                    # we have arrive at the last province
                    if str_to_datetime(settings.get('STOP_DATE', '2018-09-17')) < last_date-TIME_DELTA_REGION:
                        date_to_crawl = last_date-TIME_DELTA_REGION
                        province_to_crawl = last_province
                        index_to_crawl = START_INDEX
                    else:
                        # we have finish all province and all date in 2018
                        pass

                current_tried_times = 1
            else:
                # no need to change province or date,
                date_to_crawl = last_date
                province_to_crawl = last_province
                if finish_reason in [REDIRECT, VALIDATION, SHUT_DOWN, CANCELLED]:
                    current_tried_times = last_tried_times+1
                    index_to_crawl = last_index
                else:
                    index_to_crawl = last_index+1
                    current_tried_times = 1
            next_process={
                'date_to_crawl':date_to_crawl,
                'province_to_crawl':province_to_crawl,
                'index_to_crawl':index_to_crawl,
                'current_tried_times':current_tried_times
            }
        self.settings.set('PARAM',next_process)
        self.settings.set('MANAGER',self)
    
    def start_spider(self,next_process):
        p=CrawlerProcess(settings=self.settings)
        p.crawl(JudgementSpider)
        p.start()
    
    def engine_shutdown_cbk(self,process:dict):
        dump_json(self.process_file_path, process)

