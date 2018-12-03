# -*- coding: utf-8 -*-
import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from scrapy.utils.project import get_project_settings
from judgement_spider.util.toolbox import load_json
import os
import random
from judgement_spider.util.decoder import Decoder
from scrapy.exceptions import CloseSpider
from judgement_spider.util.toolbox import dump_json
import demjson


class CourtSpiderSpider(CrawlSpider):
    name = 'court_spider'
    decoder = None
    # allowed_domains = ['wenshu.court.gov.cn']
    # # start_urls = ['http://wenshu.court.gov.cn/']

    # rules = (
    #     Rule(LinkExtractor(allow=r'Items/'), callback='parse_item', follow=True),
    # )
    provinces = []

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

    def __pre_request(self):
        province_list = load_json(os.path.join(
            '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/util/provinces', 'province.json'))
        for p in province_list:
            self.provinces.append(p['name'])
        self.decoder = Decoder(
            '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/public')

        self.guid = self.__get_guid()

    # start form vjkl5

    def start_requests(self):
        url = "http://wenshu.court.gov.cn/List/List"
        headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.8",
            "Host": "wenshu.court.gov.cn",
            'User-Agent': self.settings.get('UA')
        }

        self.__pre_request()
        yield scrapy.FormRequest(url=url, headers=headers, method="POST", formdata={'guid': self.guid}, callback=self.parse_vjkl5)

    def parse_vjkl5(self, response):
        # status_code = response.status
        # if status_code == 302 or status_code == 301:
        #     self.logger.error(
        #         'Unfortunately, we meet redirect,shutting down the spider')
        #     raise CloseSpider(REDIRECT)

        # if len(response.headers.getlist('Set-Cookie')) == 0:
        #     raise CloseSpider(CANCELLED)
        c = response.headers.getlist('Set-Cookie')[0].decode('utf-8')
        vjkl5 = c.split(";")[0].split("=")[1]
        self.logger.info('Get encoded vjkl5={}'.format(vjkl5))
        self.vl5x = self.decoder.decode_vl5x(vjkl5)
        self.logger.info('Get decoded vl5x={}'.format(self.vl5x))

        court_url = 'http://wenshu.court.gov.cn/Index/GetCourt'
        headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Host": "wenshu.court.gov.cn",
            "Origin": "http://wenshu.court.gov.cn",
            "Referer": "http://wenshu.court.gov.cn/Index",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest"
        }

        for p in self.provinces:
            yield scrapy.FormRequest(url=court_url, formdata={'province':p},meta={'province':p},method="POST",callback=self.parse_court_info)

    def parse_court_info(self,response:scrapy.http.Response):
        province=response.meta['province']
        #'"[{ court:\'广西壮族自治区高级人民法院\', province:\'广西\',region:\'\', leval:\'2\', key:\'001020000\'},{ court:\'广西壮族自治区南宁市中级人民法院\', province:\'广西\',region:\'南宁市\', leval:\'3\', key:\'001020001000\'},{ court:\'广西壮族自治区柳州市中级人民法院\', province:\'广西\',region:\'柳州市\', leval:\'3\', key:\'001020002000\'},{ court:\'广西壮族自治区桂林市中级人民法院\', province:\'广西\',region:\'桂林市\', leval:\'3\', key:\'001020003000\'},{ court:\'广西壮族自治区梧州市中级人民法院\', province:\'广西\',region:\'梧州市\', leval:\'3\', key:\'001020004000\'},{ court:\'广西壮族自治区北海市中级人民法院\', province:\'广西\',region:\'北海市\', leval:\'3\', key:\'001020005000\'},{ court:\'广西壮族自治区崇左市中级人民法院\', province:\'广西\',region:\'崇左市\', leval:\'3\', key:\'001020006000\'},{ court:\'广西壮族自治区来宾市中级人民法院\', province:\'广西\',region:\'来宾市\', leval:\'3\', key:\'001020007000\'},{ court:\'广西壮族自治区贺州市中级人民法院\', province:\'广西\',region:\'贺州市\', leval:\'3\', key:\'001020009000\'},{ court:\'广西壮族自治区玉林市中级人民法院\', province:\'广西\',region:\'玉林市\', leval:\'3\', key:\'001020010000\'},{ court:\'广西壮族自治区百色市中级人民法院\', province:\'广西\',region:\'百色市\', leval:\'3\', key:\'001020011000\'},{ court:\'广西壮族自治区河池市中级人民法院\', province:\'广西\',region:\'河池市\', leval:\'3\', key:\'001020012000\'},{ court:\'广西壮族自治区钦州市中级人民法院\', province:\'广西\',region:\'钦州市\', leval:\'3\', key:\'001020013000\'},{ court:\'广西壮族自治区防城港市中级人民法院\', province:\'广西\',region:\'防城港市\', leval:\'3\', key:\'001020014000\'},{ court:\'广西壮族自治区贵港市中级人民法院\', province:\'广西\',region:\'贵港市\', leval:\'3\', key:\'001020015000\'},{ court:\'南宁铁路运输中级法院\', province:\'广西\',region:\'南宁铁路运输中级法院\', leval:\'3\', key:\'001020016000\'},{ court:\'北海海事法院\', province:\'广西\',region:\'北海海事法院\', leval:\'3\', key:\'001020017000\'}]"'

        return_data=response.text.replace('"[', '[').replace(
            ']"', ']') \
            .replace('＆ｌｄｑｕｏ;', '“').replace('＆ｒｄｑｕｏ;', '”').replace('\\u0027',"'")
        
        
        self.logger.info('Crawled court data={}'.format(return_data))
        dump_json(os.path.join('/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/util/provinces','{}.json'.format(province)),demjson.decode(return_data))
        



