import scrapy
import execjs
import json
import random
from urllib import parse
from http.cookies import SimpleCookie
import re
from ..util.ocr import ocr
from ..util.decoder import Decoder

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


class JudgementSpider(scrapy.Spider):
    name = "judgement"

    param = "全文检索:*"
    page = 20
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

    def __init__(self, *a, **kwargs):
        super(JudgementSpider, self).__init__(*a, **kwargs)
        # with open(
        #         '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/public/vl5x.js') as fp:
        #     js = fp.read()
        #     self.vl5x_ctx = execjs.compile(js)
        #     fp.close()
        # with open(
        #         '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/public/docid.js') as fp:
        #     js = fp.read()
        #     self.docid_ctx = execjs.compile(js)
        #     fp.close()
        self.decoder = Decoder()

        self.guid = None
        self.number = None
        self.vl5x = None

    def __construct_request_for_number(self, cbk, refresh=True):

        data = {
            "guid": self.guid
        }
        url = "http://wenshu.court.gov.cn/ValiCode/GetCode"
        headers = {
            'Host': 'wenshu.court.gov.cn',
            'Origin': 'http://wenshu.court.gov.cn',
            'Referer': 'http://wenshu.court.gov.cn/',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
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

    # def __decrypt_id(self, RunEval, id):
    #     js = self.docid_ctx.call("GetJs", RunEval)
    #     js_objs = js.split(";;")
    #     js1 = js_objs[0] + ';'
    #     js2 = re.findall(r"_\[_\]\[_\]\((.*?)\)\(\);", js_objs[1])[0]
    #     key = self.docid_ctx.call("EvalKey", js1, js2)
    #     key = re.findall(r"\"([0-9a-z]{32})\"", key)[0]
    #     docid = self.docid_ctx.call("DecryptDocID", key, id)
    #     return docid

    # first start request for number and parse it
    def start_requests(self):
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
            return
        else:
            # we are not to refresh the number, so we need to proceed to get vjkl5
            # get vjkl5
            url = "http://wenshu.court.gov.cn/list/list/?sorttype=1&number=" + self.number + "&guid=" + self.guid + "&conditions=searchWord+QWJS+++" + parse.quote(
                self.param)
            headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.8",
                "Host": "wenshu.court.gov.cn",
                "Proxy-Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36"
            }

            yield scrapy.Request(url=url, headers=headers, method="GET", callback=self.parse_vjkl5)

    def parse_vjkl5(self, response: scrapy.http.Response):
        c = response.headers.getlist('Set-Cookie')[0].decode('utf-8')
        vjkl5 = c.split(";")[0].split("=")[1]
        self.logger.info('Get encoded vjkl5{}'.format(vjkl5))
        self.vl5x = self.decoder.decode_vl5x(vjkl5)
        self.logger.info('Get decoded vl5x{}'.format(self.vl5x))

        def construct_number(urll):
            # self.logger.info("Start construct number,the url={}".format(urll))
            if "&number" not in urll:
                nyzm = -1
            else:
                nyzm = urll.index("&number")
            subyzm = urll[(nyzm + 1):]
            yzm1 = subyzm[7:11]
            # self.logger.info("Constructed number={}".format(yzm1))
            return yzm1

        # init data request\
        index = 1
        url = "http://wenshu.court.gov.cn/List/ListContent"
        while True:
            referer = "http://wenshu.court.gov.cn/List/List/?sorttype=1&number={}&guid={}&conditions=searchWord+1+AJLX++{}".format(
                self.number, self.guid, parse.quote(self.param))
            headers = {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Content-Length": 237,
                "Host": "wenshu.court.gov.cn",
                "Origin": "http://wenshu.court.gov.cn",
                "Connection": "keep-alive",
                "Referer": referer,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest"
            }
            data = {
                "Param": self.param,
                "Index": str(index),
                "Page": str(self.page),
                "Order": self.order,
                "Direction": self.direction,
                "vl5x": self.vl5x,
                "number": construct_number(referer),
                "guid": self.guid
            }
            yield scrapy.FormRequest(url=url, method="POST", formdata=data,
                                     callback=self.parse_data)
            index = index + 1
            if index == 10:
                break

    def parse_data(self, response: scrapy.http.Response):

        def construct_validate_code_request(cbk):
            check_code_url = 'http://wenshu.court.gov.cn/User/ValidateCode'
            headers = {
                'Host': 'wenshu.court.gov.cn',
                'Origin': 'http://wenshu.court.gov.cn',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
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
            self.logger.info("We need validate code;initializing request...")
            yield construct_validate_code_request(self.parse_validate_code)
            yield self.__construct_request_for_number(self.parse_number, True)

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
                    yield data_dict
                    doc_id = id
                    # we continue to download doc
                    # first we must get 'CreateContentJS.aspx'
                    content_js_url = "https://wenshu.court.gov.cn/CreateContentJS/CreateContentJS.aspx?DocID={}".format(
                        doc_id)
                    content_js_headers = {
                        "accept": "text/javascript, application/javascript, */*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                        "referer": "https://wenshu.court.gov.cn/content/content?DocID={}&KeyWord=".format(
                            doc_id),
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36",
                        "x-requested-with": "XMLHttpRequest"
                    }
                    yield scrapy.Request(url=content_js_url,
                                         headers=content_js_headers,
                                         method="GET",
                                         meta={'doc_id': doc_id},
                                         callback=self.get_court_info_download
                                         )

    def get_court_info_download(self, res: scrapy.http.Response):
        doc_id = res.meta['doc_id']
        return_data = res.body.decode("utf-8").replace('\\', '')
        read_count = re.findall(r'"浏览\：(\d*)次"', return_data)[0]
        court_title = re.findall(r'\"Title\"\:\"(.*?)\"', return_data)[0]
        court_date = re.findall(r'\"PubDate\"\:\"(.*?)\"', return_data)[0]
        court_content = re.findall(r'\"Html\"\:\"(.*?)\"', return_data)[0]
        # we need to store it
        self.logger.info('Crawled court info {}'.format(court_title))

        info = {
            'court_title': court_title,
            'court_date': court_date,
            'read_count': read_count,
            'court_content': court_content,
            'doc_id': doc_id,
        }
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
            'Referer': html_2_word_referer,
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36"
        }
        # get html content
        with open(
                '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/public/content.html') as file:
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
        return scrapy.http.FormRequest(
            url=html_2_word_url,
            headers=html_2_word_headers,
            method="POST",
            formdata=html_2_word_data,
            meta={'html_name': html_name},
            callback=self.parse_word
        )

    def parse_word(self, res: scrapy.http.Response):
        html_name = res.meta['html_name']
        word_name = html_name
        with open(
                '/Users/stack/code/py3/wenshu/judgement_spider/crawls/{}.doc'.format(word_name),
                'wb') as file:
            file.write(res.body)
            file.flush()
            file.close()
        self.logger.info('Downloaded {}.doc'.format(word_name))

        # todo proceed to download doc

    def parse_validate_code(self, response: scrapy.http.Response):
        orc_code = None
        with open('/tmp/check_code.jpeg', 'wb') as file:
            print("Starting persist check_code")
            file.write(response.body)
            file.flush()
            file.close()
        orc_code = ocr('/tmp/check_code.jpeg')

        check_url = 'http://wenshu.court.gov.cn/Content/CheckVisitCode'
        headers = {
            'Host': 'wenshu.court.gov.cn',
            'Origin': 'http://wenshu.court.gov.cn',
            'Referer': 'http://wenshu.court.gov.cn/Html_Pages/VisitRemind.html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
        }

        if result == "2":
            print("validate code is wrong!")
            exit(-1)
        else:
            print("validate code is right")
            self.guid = self.__get_guid()
