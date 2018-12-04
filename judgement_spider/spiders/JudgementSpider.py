import scrapy
from scrapy import signals
import random
from scrapy.exceptions import CloseSpider
from urllib import parse
from pathlib import Path
import json
import re
import os
import datetime
import math
from ..util.ocr import ocr
from ..util.decoder import Decoder
from datetime import datetime, timedelta
from judgement_spider.util.toolbox import str_to_datetime, datetime_to_str, load_json, dump_json, \
    construct_param
import base64
from judgement_spider.constant import FINISHED, REDIRECT, VALIDATION, UNKNOWN, SHUT_DOWN, CANCELLED, \
    DATE_FINISHED, NEED_RETRY
from judgement_spider.constant import TIME_DELTA, START_DATE, START_INDEX
from judgement_spider.constant import TIME_DELTA
from judgement_spider.util.toolbox import get_guid


class JudgementSpider(scrapy.Spider):
    name = "judgement"
    page = 10
    order = "法院层级"
    direction = "asc"

    def __get_guid(self):
        def create_guid():
            return str(hex((int(((1 + random.random()) * 0x10000)) | 0)))[3:]

        return '{}{}-{}-{}{}-{}{}{}' \
            .format(
            create_guid(), create_guid(),
            create_guid(), create_guid(),
            create_guid(), create_guid(),
            create_guid(), create_guid()
        )

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super(JudgementSpider, cls).from_crawler(
            crawler, *args, **kwargs)
        crawler.signals.connect(
            spider.engine_shutdown_cbk, signal=signals.spider_closed)
        return spider

    def engine_shutdown_cbk(self, reason):
        current_process = {
            'last_index': self.index_to_crawl,
            'last_date': datetime_to_str(self.date_to_crawl),
            'all_indexes': self.all_indexes,
            'last_finish_timestamp': str(datetime.now()),
            'done': 1 if reason == FINISHED else 0,
            'finish_reason': reason
        }

        self.logger.info('Shutting down scrapy engine,persisting process file to {}'.format(
            self.settings.get('PERSIST_FILE')))
        dump_json(self.settings.get('PERSIST_FILE'), current_process)
        self.logger.info('Persist process file completed')

    def __init__(self, *a, **kwargs):
        super(JudgementSpider, self).__init__(*a, **kwargs)
        self.guid = None
        self.number = None
        self.vl5x = None
        self.date_to_crawl = None
        self.index_to_crawl = None
        self.last_index = None
        self.all_indexes = None
        self.last_date = None
        self.decoder = None
        self.param = None

    def __construct_request_for_number(self, cbk, refresh=True):

        data = {
            "guid": self.guid
        }
        url = "http://wenshu.court.gov.cn/ValiCode/GetCode"
        headers = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip,deflate',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'wenshu.court.gov.cn',
            'Origin': 'http://wenshu.court.gov.cn',
            'Referer': 'http://wenshu.court.gov.cn/',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': self.settings.get('UA')
        }
        return scrapy.FormRequest(url=url,
                                  method="POST",
                                  formdata=data,
                                  headers=headers,
                                  # if refresh is true,then we donnot need to initial request for vjkl5 and so on
                                  meta={'refresh': refresh},
                                  callback=cbk)

    def __construct_request_for_check_code(self, callback):
        pass

    def __pre_request(self):
        '''
        do some dirty work,etc. set params
        :return:
        '''
        self.decoder = Decoder(self.settings.get('PUBLIC_DIR'))
        process_file = Path(self.settings.get('PERSIST_FILE'))
        settings = self.settings
        # we have process_file
        if process_file.is_file():
            last_process: dict = load_json(self.settings.get('PERSIST_FILE'))
            last_index = last_process['last_index']
            last_date = str_to_datetime(last_process['last_date'])
            finish_reason = last_process['finish_reason']
            # we finished
            if finish_reason == FINISHED:
                self.all_indexes = int(last_process['all_indexes'])
                if last_index == self.all_indexes or last_index == settings.getint(
                        'INDEXES_PER_DATE',
                        20):
                    self.date_to_crawl = last_date - TIME_DELTA
                    self.index_to_crawl = START_INDEX
                else:
                    self.date_to_crawl = last_date
                    self.index_to_crawl = last_index + 1
            # we have not finish yet
            elif finish_reason in [REDIRECT, VALIDATION, SHUT_DOWN, CANCELLED, NEED_RETRY]:
                self.date_to_crawl = last_date
                self.index_to_crawl = last_index
            # unknown shutdown reason
            elif finish_reason in [UNKNOWN, DATE_FINISHED]:
                self.date_to_crawl = last_date - TIME_DELTA
                self.index_to_crawl = START_INDEX
        # we have nothing,start from scratch
        else:
            self.date_to_crawl = str_to_datetime(START_DATE)
            self.index_to_crawl = START_INDEX

        self.logger.info('Date to crawl {},index to crawl {}'.format(
            datetime_to_str(self.date_to_crawl),
            self.index_to_crawl
        ))

    # first start request ford number and parse it
    def start_requests(self):
        self.__pre_request()

        param_dict = {
            "案件类型": "刑事案件",
            "裁判日期": "{} TO {}".format(
                datetime_to_str(self.date_to_crawl),
                datetime_to_str(self.date_to_crawl)
            )
        }
        self.param = construct_param(param_dict)

        self.guid = self.__get_guid()
        self.logger.info('Generate guid={}'.format(self.guid))
        # this is not for refresh,it is our first time.
        yield self.__construct_request_for_number(self.parse_number, False)

    def parse_number(self, response: scrapy.http.Response):
        number = response.body.decode('utf-8')
        refresh = response.meta['refresh']
        self.logger.info("Get number:{}".format(number))

        # update the number
        self.number = number
        # we are to refresh the number and we just update it.Done, return
        if refresh:
            self.logger.info("Refreshed the number:{}".format(self.number))
            return
        else:
            # we are not to refresh the number, so we need to proceed to get vjkl5
            # get vjkl5
            url = "http://wenshu.court.gov.cn/List/List/?sorttype=1&number=" + self.number + "&guid=" + self.guid + "&conditions=searchWord+1+AJLX++" + parse.quote(
                self.param)
            headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.8",
                "Host": "wenshu.court.gov.cn",
                'User-Agent': self.settings.get('UA')
            }

            yield scrapy.Request(url=url, headers=headers, method="GET", callback=self.parse_vjkl5)

    def parse_vjkl5(self, response: scrapy.http.Response):
        # todo move the redirect check to some middleware or ...
        status_code = response.status
        if status_code == 302 or status_code == 301:
            self.logger.error(
                'Unfortunately, we meet redirect,shutting down the spider')
            raise CloseSpider(REDIRECT)

        if len(response.headers.getlist('Set-Cookie')) == 0:
            raise CloseSpider(CANCELLED)
        c = response.headers.getlist('Set-Cookie')[0].decode('utf-8')
        vjkl5 = c.split(";")[0].split("=")[1]
        self.logger.info('Get encoded vjkl5={}'.format(vjkl5))
        self.vl5x = self.decoder.decode_vl5x(vjkl5)
        self.logger.info('Get decoded vl5x={}'.format(self.vl5x))

        def construct_number(urll):
            if "&number" not in urll:
                nyzm = -1
            else:
                nyzm = urll.index("&number")
            subyzm = urll[(nyzm + 1):]
            yzm1 = subyzm[7:11]
            return yzm1

        url = "http://wenshu.court.gov.cn/List/ListContent"

        # http://wenshu.court.gov.cn/list/list/?sorttype=1&number=&guid=eac5719d-c2ac-940c7327-237ced013bdd&conditions=searchWord+1+AJLX++%E6%A1%88%E4%BB%B6%E7%B1%BB%E5%9E%8B:%E5%88%91%E4%BA%8B%E6%A1%88%E4%BB%B6&conditions=searchWord++CPRQ++%E8%A3%81%E5%88%A4%E6%97%A5%E6%9C%9F:2018-10-30%20TO%202018-10-30
        # http://wenshu.court.gov.cn/list/list/?sorttype=1&number=&guid=d03bb3b6-31ec-d030d65b-e3e7451652d1&conditions=searchWord+1+AJLX++%E6%A1%88%E4%BB%B6%E7%B1%BB%E5%9E%8B:%E5%88%91%E4%BA%8B%E6%A1%88%E4%BB%B6&conditions=searchWord++CPRQ++%E8%A3%81%E5%88%A4%E6%97%A5%E6%9C%9F:2018-10-30%20TO%202018-10-30
        referer = "http://wenshu.court.gov.cn/list/list/?sorttype=1&number={}&guid={}&conditions=searchWord+1+AJLX++{}&conditions=searchWord++CPRQ++{}".format(
            self.number, self.guid, parse.quote('案件类型:刑事案件'), parse.quote(
                '裁判日期:{} TO {}'.format(datetime_to_str(self.date_to_crawl),
                                       datetime_to_str(self.date_to_crawl))
            )
        )
        # referer = "http://wenshu.court.gov.cn/list/list/?sorttype=1&number={}&guid={}&conditions=searchWord+1+AJLX++{}".format(
        #     self.number, self.guid, parse.quote('案件类型:刑事案件'))

        headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Host": "wenshu.court.gov.cn",
            "Origin": "http://wenshu.court.gov.cn",
            "Connection": "keep-alive",
            "Referer": referer,
            "X-Requested-With": "XMLHttpRequest",
            'User-Agent': self.settings.get('UA')
        }
        data = {
            "Param": self.param,
            "Index": str(self.index_to_crawl),
            "Page": str(self.page),
            "Order": self.order,
            "Direction": self.direction,
            "vl5x": self.vl5x,
            "number": construct_number(referer),
            "guid": self.guid
        }
        self.logger.debug("Post form data={}".format(data))
        yield scrapy.FormRequest(url=url, method="POST", formdata=data, headers=headers,
                                 callback=self.parse_data)

    def parse_data(self, response: scrapy.http.Response):

        def construct_validate_code_request(cbk):
            check_code_url = 'http://wenshu.court.gov.cn/User/ValidateCode'
            headers = {
                'Host': 'wenshu.court.gov.cn',
                'Origin': 'http://wenshu.court.gov.cn',
            }
            return scrapy.Request(url=check_code_url,
                                  headers=headers,
                                  callback=cbk,
                                  )

        return_data = response.body.decode('utf-8').replace('\\', '').replace('"[', '[').replace(
            ']"', ']') \
            .replace('＆ｌｄｑｕｏ;', '“').replace('＆ｒｄｑｕｏ;', '”')

        self.logger.debug('returned data = {}'.format(response.body.decode('utf-8')))

        # validate code
        if return_data == '"remind"' or return_data == '"remind key"':
            self.logger.info(
                'Unfortunately,we meet validation code,shutting down the spider...')
            raise CloseSpider('validation')

        else:
            # luckily we don't meet validate code and we parse the data
            # and we get json
            data = json.loads(return_data)
            if len(data) == 0:
                # self.logger.info('Dut to unknown error,close,response data={}'.format(data))
                raise CloseSpider(NEED_RETRY)
            elif len(data) == 1:
                self.logger.info(
                    'date {} index {} done,please change date.'.format(
                        datetime_to_str(self.date_to_crawl), self.index_to_crawl))
                raise CloseSpider(DATE_FINISHED)
            else:
                RunEval = data[0]['RunEval']
                count = int(data[0]['Count'])
                self.logger.info('Date {} has {} items'.format(
                    datetime_to_str(self.date_to_crawl),
                    count
                ))
                self.all_indexes = math.ceil(count / 10)
                # 从第2项开始
                for i in range(1, len(data)):
                    name = data[i]['案件名称'] if '案件名称' in data[i] else ''
                    court = data[i]['法院名称'] if '法院名称' in data[i] else ''
                    number = data[i]['案号'] if '案号' in data[i] else ''
                    type = data[i]['案件类型'] if '案件类型' in data[i] else ''
                    id = data[i]['文书ID'] if '文书ID' in data[i] else ''
                    id = self.decoder.decode_docid(RunEval, id)
                    date = data[i]['裁判日期'] if '裁判日期' in data[i] else ''
                    data_dict = dict(
                        id=id,
                        name=name,
                        type=type,
                        date=date,
                        number=number,
                        court=court
                    )
                    doc_id = id
                    # we continue to download doc
                    # first we must get 'CreateContentJS.aspx'
                    content_js_url = "https://wenshu.court.gov.cn/CreateContentJS/CreateContentJS.aspx?DocID={}".format(
                        doc_id)
                    content_js_headers = {
                        "Accept": "text/javascript, application/javascript, */*",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                        "Referer": "https://wenshu.court.gov.cn/content/content?DocID={}&KeyWord=".format(
                            doc_id),
                        'User-Agent': self.settings.get('UA'),
                        "X-Requested-With": "XMLHttpRequest"
                    }
                    yield scrapy.Request(url=content_js_url,
                                         headers=content_js_headers,
                                         method="GET",
                                         meta={'doc_id': doc_id,
                                               'judgement_info': data_dict},
                                         callback=self.get_court_info_download,
                                         priority=400
                                         )

    def get_court_info_download(self, res: scrapy.http.Response):
        doc_id = res.meta['doc_id']
        judgement_info = res.meta['judgement_info']
        return_data = res.body.decode("utf-8").replace('\\', '')

        read_count = re.findall(r'"浏览\：(\d*)次"', return_data)
        court_title = re.findall(r'\"Title\"\:\"(.*?)\"', return_data)
        court_date = re.findall(r'\"PubDate\"\:\"(.*?)\"', return_data)
        court_content = re.findall(r'\"Html\"\:\"(.*?)\"', return_data)

        if len(read_count) == 0 or len(court_title) == 0 or len(court_date) == 0 or len(
                court_content) == 0:
            self.logger.error(
                'Met parse error when crawl {} and we return from the method'.format(doc_id))
            return
            # raise CloseSpider(CANCELLED)

        read_count = read_count[0]
        court_title = court_title[0]
        court_date = court_date[0]
        court_content = court_content[0]

        self.logger.info('Crawled court info {}'.format(court_title))

        info = {
            'court_title': court_title,
            'court_date': court_date,
            'read_count': read_count,
            'court_content': court_content,
            'doc_id': doc_id,
        }
        judgement_info['court_title'] = court_title
        yield judgement_info

        html_2_word_url = 'http://wenshu.court.gov.cn/Content/GetHtml2Word'
        html_2_word_referer = 'http://wenshu.court.gov.cn/content/content?DocID={}&KeyWord='.format(
            info['doc_id'])
        html_2_word_headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'wenshu.court.gov.cn',
            'Origin': 'http://wenshu.court.gov.cn',
            'User-Agent': self.settings.get('UA'),

            'Referer': html_2_word_referer,
        }
        # get html content
        with open(os.path.join(self.settings.get('PUBLIC_DIR'), 'content.html', ),
                  encoding="utf-8") as file:
            html_str = file.read()
            file.close()
        html_str = html_str \
            .replace('court_title', info['court_title']) \
            .replace('court_date', info['court_date']) \
            .replace('read_count', info['read_count']) \
            .replace('court_content', info['court_content'])
        html_name = info['court_title']

        html_2_word_data = {
            'htmlStr': parse.quote(html_str),
            'htmlName': parse.quote(html_name),
            'DocID': info['doc_id']
        }
        self.logger.info('Initializing form request for {}'.format(html_name))
        yield scrapy.http.FormRequest(
            url=html_2_word_url,
            headers=html_2_word_headers,
            method="POST",
            formdata=html_2_word_data,
            meta={'html_name': html_name},
            callback=self.parse_word,
            priority=500
        )

    def parse_word(self, res: scrapy.http.Response):
        html_name: str = res.meta['html_name']
        word_name = html_name.encode("utf-8")

        word_name = base64.b64encode(word_name)

        tmp_name = '_'.join(word_name.decode('utf-8').split('/'))
        file_dir = self.settings.get('DOC_DIR', '/tmp')
        file_name = os.path.join(file_dir, '{}.doc'.format(tmp_name))
        with open(file_name, 'wb') as file:
            file.write(res.body)
            file.flush()
            file.close()
        self.logger.info('Downloaded {}.doc'.format(
            base64.b64decode(word_name).decode('utf-8')))

    def parse_validate_code(self, response: scrapy.http.Response):
        orc_code = None
        with open(self.settings.get('VALIDATE_CODE'), 'wb') as file:
            # print("Starting persist check_code")
            file.write(response.body)
            file.flush()
            file.close()
        orc_code = ocr(self.settings.get('VALIDATE_CODE'))

        check_url = 'http://wenshu.court.gov.cn/Content/CheckVisitCode'
        headers = {
            'Host': 'wenshu.court.gov.cn',
            'Origin': 'http://wenshu.court.gov.cn',
            'Referer': 'http://wenshu.court.gov.cn/Html_Pages/VisitRemind.html',
            'User-Agent': self.settings.get('UA'),
        }

        data = {
            'ValidateCode': orc_code
        }
        yield scrapy.FormRequest(url=check_url,
                                 formdata=data,
                                 headers=headers,
                                 callback=self.process_check_validate_code_result
                                 )

    def process_check_validate_code_result(self, response: scrapy.http.Response):
        result = response.text
        check_code_url = 'http://wenshu.court.gov.cn/User/ValidateCode'
        headers = {
            'Host': 'wenshu.court.gov.cn',
            'Origin': 'http://wenshu.court.gov.cn',
            'User-Agent': self.settings.get('UA'),
        }

        if result == "2":
            # print("validate code is wrong!")
            exit(-1)
        else:
            # print("validate code is right")
            self.guid = self.__get_guid()
