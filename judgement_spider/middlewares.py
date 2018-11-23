# -*- coding: utf-8 -*-

# Define here the models for your spider middleware
#
# See documentation in:
# https://doc.scrapy.org/en/latest/topics/spider-middleware.html

from scrapy import signals
import requests
import random


# import re
# import random
# import base64
# import logging
#
# log = logging.getLogger('scrapy.proxies')
#
#
# class Mode:
#     RANDOMIZE_PROXY_EVERY_REQUESTS, RANDOMIZE_PROXY_ONCE, SET_CUSTOM_PROXY = range(3)
#
#
# class RandomProxy(object):
#     def __init__(self, settings):
#         self.mode = settings.get('PROXY_MODE')
#         self.proxy_list = settings.get('PROXY_LIST')
#         self.chosen_proxy = ''
#
#         if self.mode == Mode.RANDOMIZE_PROXY_EVERY_REQUESTS or self.mode == Mode.RANDOMIZE_PROXY_ONCE:
#             if self.proxy_list is None:
#                 raise KeyError('PROXY_LIST setting is missing')
#             self.proxies = {}
#             fin = open(self.proxy_list)
#             try:
#                 for line in fin.readlines():
#                     parts = re.match('(\w+://)([^:]+?:[^@]+?@)?(.+)', line.strip())
#                     if not parts:
#                         continue
#
#                     # Cut trailing @
#                     if parts.group(2):
#                         user_pass = parts.group(2)[:-1]
#                     else:
#                         user_pass = ''
#
#                     self.proxies[parts.group(1) + parts.group(3)] = user_pass
#             finally:
#                 fin.close()
#             if self.mode == Mode.RANDOMIZE_PROXY_ONCE:
#                 self.chosen_proxy = random.choice(list(self.proxies.keys()))
#         elif self.mode == Mode.SET_CUSTOM_PROXY:
#             custom_proxy = settings.get('CUSTOM_PROXY')
#             self.proxies = {}
#             parts = re.match('(\w+://)([^:]+?:[^@]+?@)?(.+)', custom_proxy.strip())
#             if not parts:
#                 raise ValueError('CUSTOM_PROXY is not well formatted')
#
#             if parts.group(2):
#                 user_pass = parts.group(2)[:-1]
#             else:
#                 user_pass = ''
#
#             self.proxies[parts.group(1) + parts.group(3)] = user_pass
#             self.chosen_proxy = parts.group(1) + parts.group(3)
#
#     @classmethod
#     def from_crawler(cls, crawler):
#         return cls(crawler.settings)
#
#     def process_request(self, request, spider):
#         # Don't overwrite with a random one (server-side state for IP)
#         if 'proxy' in request.meta:
#             if request.meta["exception"] is False:
#                 return
#         request.meta["exception"] = False
#         if len(self.proxies) == 0:
#             raise ValueError('All proxies are unusable, cannot proceed')
#
#         if self.mode == Mode.RANDOMIZE_PROXY_EVERY_REQUESTS:
#             proxy_address = random.choice(list(self.proxies.keys()))
#         else:
#             proxy_address = self.chosen_proxy
#
#         proxy_user_pass = self.proxies[proxy_address]
#
#         if proxy_user_pass:
#             request.meta['proxy'] = proxy_address
#             basic_auth = 'Basic ' + base64.b64encode(proxy_user_pass.encode()).decode()
#             request.headers['Proxy-Authorization'] = basic_auth
#         else:
#             log.debug('Proxy user pass not found')
#         log.debug('Using proxy <%s>, %d proxies left' % (
#             proxy_address, len(self.proxies)))
#
#     def process_exception(self, request, exception, spider):
#         if 'proxy' not in request.meta:
#             return
#         if self.mode == Mode.RANDOMIZE_PROXY_EVERY_REQUESTS or self.mode == Mode.RANDOMIZE_PROXY_ONCE:
#             proxy = request.meta['proxy']
#             try:
#                 del self.proxies[proxy]
#             except KeyError:
#                 pass
#             request.meta["exception"] = True
#             if self.mode == Mode.RANDOMIZE_PROXY_ONCE:
#                 self.chosen_proxy = random.choice(list(self.proxies.keys()))
#             log.info('Removing failed proxy <%s>, %d proxies left' % (
#                 proxy, len(self.proxies)))
#
#
#


class JudgementSpiderSpiderMiddleware(object):
    # Not all methods need to be defined. If a method is not defined,
    # scrapy acts as if the spider middleware does not modify the
    # passed objects.

    @classmethod
    def from_crawler(cls, crawler):
        # This method is used by Scrapy to create your spiders.
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_spider_input(self, response, spider):
        # Called for each response that goes through the spider
        # middleware and into the spider.

        # Should return None or raise an exception.
        return None

    def process_spider_output(self, response, result, spider):
        # Called with the results returned from the Spider, after
        # it has processed the response.

        # Must return an iterable of Request, dict or Item objects.
        for i in result:
            yield i

    def process_spider_exception(self, response, exception, spider):
        # Called when a spider or process_spider_input() method
        # (from other spider middleware) raises an exception.

        # Should return either None or an iterable of Response, dict
        # or Item objects.
        pass

    def process_start_requests(self, start_requests, spider):
        # Called with the start requests of the spider, and works
        # similarly to the process_spider_output() method, except
        # that it doesn’t have a response associated.

        # Must return only requests (not items).
        for r in start_requests:
            yield r

    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)


class RandomProxyMiddleware(object):
    @staticmethod
    def get_proxy():
        return requests.get("http://localhost:5010/get/").content

    @staticmethod
    def delete_proxy(proxy):
        return requests.get("http://localhost:5010/delete?proxy={}".format(proxy))

    @classmethod
    def from_crawler(cls, crawler):
        # This method is used by Scrapy to create your spiders.
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_request(self, request, spider):
        coin = random.random()
        if coin > 0.5:
            if len(self.proxies) != 0:
                request.meta['proxy'] = random.choice(self.proxies)
        return request
        # Called for each request that goes through the downloader
        # middleware.

        # Must either:
        # - return None: continue processing this request
        # - or return a Response object
        # - or return a Request object
        # - or raise IgnoreRequest: process_exception() methods of
        #   installed downloader middleware will be called

    def process_response(self, request, response, spider):
        # Called with the response returned from the downloader.

        # Must either;
        # - return a Response object
        # - return a Request object
        # - or raise IgnoreRequest
        return response

    def process_exception(self, request, exception, spider):
        # Called when a download handler or a process_request()
        # (from other downloader middleware) raises an exception.

        # Must either:
        # - return None: continue processing this exception
        # - return a Response object: stops process_exception() chain
        # - return a Request object: stops process_exception() chain
        pass

    def spider_opened(self, spider):
        self.proxies = [RandomProxyMiddleware.get_proxy() for _ in range(40)]
        self.proxies = list(filter(lambda p: 'no proxy' not in p, self.proxies))
        # self.proxy = RandomProxyMiddleware.get_proxy()
        spider.logger.info('Spider opened: %s' % spider.name)


class RedirectMiddleWare(object):
    def process_response(self, request, response, spider):
        pass
