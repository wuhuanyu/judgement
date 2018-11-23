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
from ..util.ocr import ocr
from ..util.decoder import Decoder
from datetime import datetime, timedelta
from ..util.toolbox import str_to_datetime, datetime_to_str

# 检索关键词
keyword = '*'
# 检索类型
search_type_list = ['全文检索', '首部', '事实', '理由', '判决结果', '尾部']
# 案由
case_list = ['全部', '刑事案由', '民事案由', '行政案由', '赔偿案由']
# 法院层级
court_type_list = ['全部', '最高法院', '高级法院', '中级法院', '基层法院']
# 案件类型
case_type_list = ['全部', '刑事案件', '民事案件', '行政案件', '赔偿案件',
                  '执行案件']
# 审判程序
case_process_list = ['全部', '一审', '二审', '再审', '复核', '刑罚变重', '再审审查与审判监督',
                     '其他']
# 文书类型
wenshu_type_list = ['全部', '裁判书', '调解书', '决定书', '通知书', '批复', '答复',
                    '函', '令', '其他']
# 裁判日期
start_date = '2018-05-15'
end_date = '2018-05-16'

# 法院地域，需要二次获取，判断那些省份的法院有数据
court_loc_list = ['全部']


# todo setting.json
class JudgementSpider(scrapy.Spider):
    name = "judgement"
    param = "案件类型:刑事案件"
    page = 10
    order = "法院层级"
    direction = "asc"
    start_date = datetime(year=2018, month=10, day=30)
    time_delta = timedelta(days=1)

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
        spider = super(JudgementSpider, cls).from_crawler(crawler, *args, **kwargs)
        crawler.signals.connect(spider.engine_shutdown_cbk, signal=signals.spider_closed)
        return spider

    def engine_shutdown_cbk(self, reason):
        last_index = None
        last_date = None
        done = 0
        # 表示这一页数据一共请求了多少次，如果上一页数据完成了，该值为0
        last_page_tried_times = 0

        if reason == 'finished':
            last_index = self.index
            last_date = datetime_to_str(self.date_to_crawl)
            done = 1
        elif reason == "redirect":
            last_index = self.last_index
            last_date = datetime_to_str(self.last_date)
            done = 0
            last_page_tried_times = self.last_page_tried_times + 1
        elif reason == "validation":
            last_index = self.last_index
            last_date = datetime_to_str(self.last_date)
            done = 0
            last_page_tried_times = self.last_page_tried_times + 1

        self.logger.info('Shutting down scrapy engine,persisting process file to {}'.format(
            self.settings['PERSIST_FILE']))
        with open(self.settings['PERSIST_FILE'], 'w', encoding="utf-8") as persist_file:
            json.dump({'last_index': last_index,
                       'last_date': last_date,
                       'last_finish_timestamp': str(datetime.now()),
                       'done': done,
                       'last_page_tried_times': last_page_tried_times,
                       'finish_reason': reason
                       }, persist_file)
            persist_file.flush()
            persist_file.close()
        self.logger.info('Persist process file completed')

    def __init__(self, *a, **kwargs):
        super(JudgementSpider, self).__init__(*a, **kwargs)
        self.guid = None
        self.number = None
        self.vl5x = None
        self.index = 1
        self.date_to_crawl = self.start_date
        self.last_index = None
        self.last_date = None
        self.decoder = None
        self.last_page_tried_times = None
        self.tasks = []

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

    # first start request ford number and parse it
    def start_requests(self):
        self.decoder = Decoder(self.settings.get('PUBLIC_DIR'))
        # get process log from file
        process_file = Path(self.settings.get('PERSIST_FILE'))
        if process_file.is_file():
            with open(self.settings.get('PERSIST_FILE')) as file:
                process = json.load(file)
                file.close()
                # 2018-3-20
                last_date = str_to_datetime(process['last_date'])
                self.last_date = last_date

                last_index = int(process['last_index'])
                self.last_index = last_index

                self.last_page_tried_times = int(process['last_page_tried_times'])

                if last_index == int(self.settings.get('INDEXES_PER_DATE', 10)):
                    # to crawl last_date-1
                    self.index = 1
                    self.date_to_crawl = last_date - self.time_delta
                else:
                    self.index = last_index + 1
                    self.date_to_crawl = last_date
        self.param = "案件类型:刑事案件,裁判日期:{} TO {}".format(
            datetime_to_str(self.date_to_crawl),
            datetime_to_str(self.date_to_crawl)
        )

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
            url = "http://wenshu.court.gov.cn/list/list/?sorttype=1&number=" + self.number + "&guid=" + self.guid + "&conditions=searchWord+1+AJLX+++" + parse.quote(
                self.param)
            headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.8",
                "Host": "wenshu.court.gov.cn",
                "Proxy-Connection": "keep-alive",
                'User-Agent': self.settings.get('UA')
            }

            yield scrapy.Request(url=url, headers=headers, method="GET", callback=self.parse_vjkl5)

    def parse_vjkl5(self, response: scrapy.http.Response):
        # todo move the redirect check to some middleware or ...
        status_code = response.status
        if status_code == 302 or status_code == 301:
            self.logger.error('Unfortunately, we meet redirect,shutting down the spider')
            raise CloseSpider('redirect')

        if len(response.headers.getlist('Set-Cookie')) == 0:
            return
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
            # return 'wens'
            return yzm1

            # init data request

        url = "http://wenshu.court.gov.cn/List/ListContent"

        referer = "http://wenshu.court.gov.cn/List/List/?sorttype=1&number={}&guid={}&conditions=searchWord+1+AJLX++{}".format(
            self.number, self.guid, parse.quote(self.param))
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
            "Index": str(self.index),
            "Page": str(self.page),
            "Order": self.order,
            "Direction": self.direction,
            "vl5x": self.vl5x,
            "number": self.number,
            "guid": self.guid
        }
        yield scrapy.FormRequest(url=url, method="POST", formdata=data, headers=headers,
                                 callback=self.parse_data, meta={'current_index': self.index})

        # update guid and number

        # self.old_number = self.number
        # yield self.__construct_request_for_number(self.parse_number, refresh=True)

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

        # validate code
        if return_data == '"remind"' or return_data == '"remind key"':
            self.logger.info('Unfortunately,we meet validation code,shutting down the spider...')
            raise CloseSpider('validation')
            # yield construct_validate_code_request(self.parse_validate_code)
            # yield self.__construct_request_for_number(self.parse_number, True)

        else:
            # luckily we don't meet validate code and we parse the data
            # and we get json
            data = json.loads(return_data)
            if len(data) == 0:
                print('Done')
            else:
                RunEval = data[0]['RunEval']
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
                    self.tasks.append(id)
                    # yield data_dict
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
                                         meta={'doc_id': doc_id, 'judgement_info': data_dict},
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
        html_name = res.meta['html_name']
        word_name = html_name
        file_dir = self.settings.get('DOC_DIR', '/tmp')
        file_name = os.path.join(file_dir, '{}.doc'.format(word_name))
        with open(file_name, 'wb') as file:
            file.write(res.body)
            file.flush()
            file.close()
        self.logger.info('Downloaded {}.doc'.format(word_name))

    def parse_validate_code(self, response: scrapy.http.Response):
        orc_code = None
        with open(self.settings.get('VALIDATE_CODE'), 'wb') as file:
            print("Starting persist check_code")
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
            print("validate code is wrong!")
            exit(-1)
        else:
            print("validate code is right")
            self.guid = self.__get_guid()
