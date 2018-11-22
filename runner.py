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
from judgement_spider.util.toolbox import current_time, current_date

if "Darwin" in platform.platform():
    settings_file_path = 'judgement_spider.dev_settings'
elif "Linux" in platform.platform():
    settings_file_path = 'judgement_spider.production_settings'
else:
    raise Exception('Unsupported platform due to some bugs, please use Linux or macOS')

os.environ.setdefault('SCRAPY_SETTINGS_MODULE', settings_file_path)

user_agents = [

    # Chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
    # Firefox
    'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
    'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 6.2; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0)',
    'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)',
]


def main():
    time_str = current_time()
    current_date_str = current_date()

    ua = user_agents[random.randint(0, len(user_agents) - 1)]
    settings = get_project_settings()
    settings.set('UA', ua)

    content_html = Path(os.path.join(settings.get('PUBLIC_DIR'), 'content.html'))
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
    reason = "finished"
    settings = get_project_settings()
    process_file = Path(settings.get('PERSIST_FILE'))
    if process_file.is_file():
        with open(settings.get('PERSIST_FILE'), 'r', encoding='utf-8') as file:
            if __name__ == '__main__':
                process = json.load(file)
                file.close()
                reason = process['finish_reason']

    return reason


if __name__ == '__main__':
    settings = get_project_settings()

    while True:
        last_finish_reason = last_finish_reason()
        break_time = 60 * 15
        if last_finish_reason == "finished":
            break_time = settings.getint('SHORT_BREAK', 60 * 15)
        elif last_finish_reason == "validation":
            break_time = settings.getint('LONG_BREAK', 60 * 60 * 1.2)
        p = mp.Process(target=main)
        p.start()
        p.join()

        # we need to sleep 10 minute
        print('Last process exists,current time: {},now sleeping'.format(current_time()))
        time.sleep(break_time)
        print('Sleeping over,starting another spider,current time:{}'.format(current_time()))
