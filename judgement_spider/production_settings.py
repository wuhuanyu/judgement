# -*- coding: utf-8 -*-

# Scrapy settings for judgement_spider project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://doc.scrapy.org/en/latest/topics/settings.html
#     https://doc.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://doc.scrapy.org/en/latest/topics/spider-middleware.html

BOT_NAME = 'judgement_spider'

SPIDER_MODULES = ['judgement_spider.spiders']
NEWSPIDER_MODULE = 'judgement_spider.spiders'

# Crawl responsibly by identifying yourself (and your website) on the user-agent
# USER_AGENT = 'judgement_spider (+http://www.yourdomain.com)'

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Configure maximum concurrent requests performed by Scrapy (default: 16)
CONCURRENT_REQUESTS = 1

# Configure a delay for requests for the same website (default: 0)
# See https://doc.scrapy.org/en/latest/topics/settings.html#download-delay
# See also autothrottle settings and docs
# The download delay setting will honor only one of:
# CONCURRENT_REQUESTS_PER_DOMAIN = 16
# CONCURRENT_REQUESTS_PER_IP = 16

# Disable cookies (enabled by default)
# COOKIES_ENABLED = False

# Disable Telnet Console (enabled by default)
# TELNETCONSOLE_ENABLED = False

# Override the default request headers:
DEFAULT_REQUEST_HEADERS = {
    'Host': 'wenshu.court.gov.cn',
    'Origin': 'http://wenshu.court.gov.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
}

# Enable or disable spider middlewares
# See https://doc.scrapy.org/en/latest/topics/spider-middleware.html
# SPIDER_MIDDLEWARES = {
#    'judgement_spider.middlewares.JudgementSpiderSpiderMiddleware': 543,
# }

# Enable or disable downloader middlewares
# See https://doc.scrapy.org/en/latest/topics/downloader-middleware.html
# DOWNLOADER_MIDDLEWARES = {
#    'judgement_spider.middlewares.JudgementSpiderDownloaderMiddleware': 543,
# }

# Enable or disable extensions
# See https://doc.scrapy.org/en/latest/topics/extensions.html
# EXTENSIONS = {
#    'scrapy.extensions.telnet.TelnetConsole': None,
# }

# Configure item pipelines
# See https://doc.scrapy.org/en/latest/topics/item-pipeline.html
ITEM_PIPELINES = {
    'judgement_spider.pipelines.JudgementSpiderPipeline': 300,
}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://doc.scrapy.org/en/latest/topics/autothrottle.html
AUTOTHROTTLE_ENABLED = True
# The initial download delay
# AUTOTHROTTLE_START_DELAY = 5
# The maximum download delay to be set in case of high latencies
# AUTOTHROTTLE_MAX_DELAY = 60
# The average number of requests Scrapy should be sending in parallel to
# each remote server
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
# AUTOTHROTTLE_DEBUG = False
# 每次请求1000毫秒延迟 随机
DOWNLOAD_DELAY = 7
INDEXES_PER_DATE = 12

# Enable and configure HTTP caching (disabled by default)
# See https://doc.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
# HTTPCACHE_ENABLED = True
# HTTPCACHE_EXPIRATION_SECS = 0
# HTTPCACHE_DIR = 'httpcache'
# HTTPCACHE_IGNORE_HTTP_CODES = []
# HTTPCACHE_STORAGE = 'scrapy.extensions.httpcache.FilesystemCacheStorage'

LOG_ENABLED = True
RETRY_TIMES = 5
LOG_FILE = "/tmp/judgement_log"

RUNNER_LOG = "/home/stack/runner.log"

REDIRECTED_ENABLED = False

DOCS_DIR = "/home/stack/judgement_docs"
LOG_DIR = "/home/stack/judgement_logs"
PERSIST_FILE = "/home/stack/judgement_code/process.json"
PUBLIC_DIR = "/home/stack/judgement_code/judgement_spider/public"

MONGO_HOST = "localhost"
MONGO_PORT = "27017"
MONGO_DB = "wenshu_data"
MONGO_COLLECTION = "docs"

# production settings
# DOCS_DIR = "/home/stack/spider/docs"
# LOG_DIR = "/home/stack/spider/logs"

VALIDATE_CODE = "/tmp/validate_code.jpeg"
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'

# if last crawl finished,we take a short break
SHORT_BREAK = 60 * 20
# or we met validation code in the last crawl,we take a long break
LONG_BREAK = 60 * 60 * 1.5
# if we  met validation code the second time,the long break time will be 60*60*1.5*1.1 and so on until the the long break
LONG_BREAK_TIMES = 1.1
LONG_BREAK_UP_BOUND = 60 * 60 * 2.5
