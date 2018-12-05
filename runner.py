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

from judgement_spider.util.spider_manager import SpiderManager
from judgement_spider.util.email.sender import Sender

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

mail_sender = Sender()


def run_spider():
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

    manager = SpiderManager(settings)
    manager.configure()
    manager.start_spider()


def last_finish_reason():
    reason = FINISHED
    process_file = Path(settings.get('PERSIST_FILE'))
    if process_file.is_file():
        process = load_json(settings.get('PERSIST_FILE'))
        reason = process['finish_reason']
    return reason


def run_monitor():
    while True:
        current_date_str = current_date()
        today_docs_dir = os.path.join(settings.get('DOCS_DIR'), current_date_str)
        if Path(today_docs_dir).is_dir():
            count = len([name for name in os.listdir(today_docs_dir) if os.path.isfile(name)])
            mail_sender.send_email('Count', 'Date:{}, count={}'.format(current_date_str, count))
        time.sleep(settings.getint('MAIL_REPORT_INTERVAL', 60 * 60 * 4))


if __name__ == '__main__':

    is_long_break = False
    logger.info('Main progress started,pid={} '.format(os.getpid()))

    mail_process = mp.Process(target=run_monitor)
    mail_process.start()

    while True:
        p = mp.Process(target=run_spider)
        p.start()
        p.join()
        reason_ = last_finish_reason()
        if reason_ in [REDIRECT, VALIDATION, NEED_RETRY]:
            try:
                mail_sender.send_email('Alert', 'A {} has happened!'.format(reason_))
            except:
                pass
        break_time = settings.getint('SHORT_BREAK', 60 * 18)
        last_long_break_time = None

        if reason_ in [REDIRECT, VALIDATION]:
            break_time = settings.getint('LONG_BREAK', 60 * 60 * 1.5)
        if reason_ in [NEED_RETRY, UNKNOWN]:
            break_time = 120

        logger.info(
            'Last child process exists,now sleeping for {}'.format(
                break_time))
        time.sleep(break_time)
        logger.info('Sleeping over,now start another child process')
