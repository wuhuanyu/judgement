import json
import multiprocessing as mp
import os
import platform
import random
import time
from pathlib import Path

from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

from judgement_spider.spiders.JudgementSpider import JudgementSpider
from judgement_spider.util.toolbox import current_time, current_date, load_json
from judgement_spider.util.logger import Logger
from judgement_spider.util.user_agents import user_agents
from judgement_spider.constant import FINISHED, REDIRECT, VALIDATION, UNKNOWN, SHUT_DOWN, CANCELLED, \
    DATE_FINISHED, NEED_RETRY

from judgement_spider.spiders.court_spider import CourtSpiderSpider

if "Darwin" in platform.platform():
    settings_file_path = 'judgement_spider.dev_settings'

os.environ.setdefault('SCRAPY_SETTINGS_MODULE', settings_file_path)

settings = get_project_settings()
settings.set('LOG_FILE','/tmp/court_info.log')

# runner_log_path = settings.get('RUNNER_LOG', '/tmp/runner.log')

# logger = Logger('runner.py', runner_log_path)

if __name__ == "__main__":
    process=CrawlerProcess(settings=settings)
    process.crawl(CourtSpiderSpider)
    process.start()