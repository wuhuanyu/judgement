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

if "Darwin" in platform.platform():
    settings_file_path = 'judgement_spider.dev_settings'
elif "Linux" in platform.platform():
    settings_file_path = 'judgement_spider.production_settings'
else:
    raise Exception(
        'Unsupported platform due to some bugs, please use Linux or macOS')

os.environ.setdefault('SCRAPY_SETTINGS_MODULE', settings_file_path)

settings = get_project_settings()
runner_log_path = settings.get('RUNNER_LOG', '/tmp/runner.log')
logger = Logger('runner.py', runner_log_path)


def main():
    # try:
    logger.info('A child progress started,pid={} '.format(os.getpid()))
    time_str = current_time()
    current_date_str = current_date()

    ua = random.choice(user_agents)
    settings.set('UA', ua)

    content_html = Path(os.path.join(
        settings.get('PUBLIC_DIR'), 'content.html'))
    eval_js = Path(os.path.join(settings.get('PUBLIC_DIR'), 'eval_.js'))
    docid_js = Path(os.path.join(settings.get('PUBLIC_DIR'), 'docid.js'))
    if not (content_html.is_file() and eval_js.is_file() and docid_js.is_file()):
        raise Exception('Please check your public_dir in settings')

    if not os.path.isdir(settings.get('DOCS_DIR')):
        os.mkdir(settings.get('DOCS_DIR'))
    doc_dir = os.path.join(settings.get('DOCS_DIR'), current_date_str)
    if not os.path.isdir(doc_dir):
        os.mkdir(doc_dir)
    settings.set('DOC_DIR', doc_dir)

    if not os.path.isdir(settings.get('LOGS_DIR')):
        os.mkdir(settings.get('LOGS_DIR'))
    log_dir = os.path.join(settings.get('LOGS_DIR'), current_date_str)
    if not os.path.isdir(log_dir):
        os.mkdir(log_dir)
    settings.set('LOG_FILE', os.path.join(log_dir, '{}.log'.format(time_str)))

    process = CrawlerProcess(settings=settings)
    process.crawl(JudgementSpider)
    process.start()


def last_finish_reason():
    reason = FINISHED
    process_file = Path(settings.get('PERSIST_FILE'))
    if process_file.is_file():
        process = load_json(settings.get('PERSIST_FILE'))
        reason = process['finish_reason']
    return reason


# todo 捕捉异常，发送邮件
# todo 统计功能,发送邮件
if __name__ == '__main__':

    is_long_break = False
    logger.info('Main progress started,pid={} '.format(os.getpid()))
    # todo 指数退避？
    # initial_long_break_time = settings.getint('LONG_BREAK', 60 * 60 * 1.2)

    while True:
        p = mp.Process(target=main)
        p.start()
        p.join()
        reason_ = last_finish_reason()
        break_time = settings.getint('SHORT_BREAK', 60 * 17)
        last_long_break_time = None

        if reason_ in [REDIRECT, VALIDATION]:
            break_time = settings.getint('LONG_BREAK', 60 * 60 * 1.5)
        if reason_ == NEED_RETRY:
            break_time = 30

        logger.info(
            'Last child process exists,now sleeping for {}'.format(
                break_time))
        time.sleep(break_time)
        logger.info('Sleeping over,now start another child process')
