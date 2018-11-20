import random
from scrapy.utils.project import get_project_settings
from scrapy.crawler import CrawlerProcess, CrawlerRunner
import os
from judgement_spider.spiders.JudgementSpider import JudgementSpider
import platform
from pathlib import Path
import schedule
from judgement_spider.util.toolbox import current_time_milli, current_time
import multiprocessing as mp
from twisted.internet import reactor

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

    # Android
    'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.0; SM-G930VC Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.83 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0.1; SM-G935S Build/MMB29K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.1.1; G8231 Build/41.2.A.0.219; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/59.0.3071.125 Mobile Safari/537.36',

    # iPhone
    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/69.0.3497.105 Mobile/15E148 Safari/605.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/13.2b11866 Mobile/16A366 Safari/605.1.15',
    'Mozilla/5.0 (iPhone9,4; U; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1',
]


def main():
    time_str = current_time()
    settings_file_path = 'judgement_spider.settings'
    os.environ.setdefault('SCRAPY_SETTINGS_MODULE', settings_file_path)
    ua = user_agents[random.randint(0, len(user_agents) - 1)]
    settings = get_project_settings()
    settings.set('UA', ua)
    settings.set('LOG_FILE', os.path.join(settings.get('LOG_DIR'), '{}.log'.format(time_str)))

    if "Darwin" in platform.platform():
        pass
    elif "Linux" in platform.platform():
        settings.set('PERSIST_FILE', "/home/stack/judgement/process.json")
        settings.set('PUBLIC_DIR', '/home/stack/judgement/judgement_spider/public')
    else:
        raise Exception('Unsupported platform due to some bugs, please use Linux or macOS')

    content_html = Path(os.path.join(settings.get('PUBLIC_DIR'), 'content.html'))
    eval_js = Path(os.path.join(settings.get('PUBLIC_DIR'), 'eval_.js'))
    docid_js = Path(os.path.join(settings.get('PUBLIC_DIR'), 'docid.js'))
    if not (content_html.is_file() and eval_js.is_file() and docid_js.is_file()):
        raise Exception('Please check your public_dir in settings')

    if not os.path.isdir(settings.get('DOCS_DIR')):
        os.mkdir(settings.get('DOCS_DIR'))

    os.mkdir(os.path.join(settings.get('DOCS_DIR'), time_str))
    settings.set('DOC_DIR', os.path.join(settings.get('DOCS_DIR'), time_str))

    process = CrawlerProcess(settings=settings)
    process.crawl(JudgementSpider)
    process.start()
    # run = CrawlerRunner(settings)
    # d = run.crawl(JudgementSpider)
    # d.addBoth(lambda _: reactor.stop())
    # print('Starting reactor...')
    # reactor.run()


if __name__ == '__main__':
    import time

    while True:
        p = mp.Process(target=main)
        p.start()
        p.join()

        # we need to sleep 10 minute
        print('Last process exists,current time: {},now sleeping'.format(current_time()))
        time.sleep(60 * 10)
        print('Sleeping over,starting another spider,current time:{}'.format(current_time()))
