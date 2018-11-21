### Wenshu spider

#### TODO
<ul>Add IP Proxies</ul>

#### Requirements
`pip install -r requirements.txt`
Besides, you need to install  `Nodejs` and make your you have command `node' in the path

In case the spider meets validation code, you need to install `tesseract` and `tesseract-ocr` plus some python wrappers. Note that this is a to-do functionality.


#### Pre Run
Please change some settings in `judgement_spider/settings.py` before you run the script

#### Run
`python runner.py`

#### Deployment
Deployment via `Docker` is recommended. Please specify 3 folders and mount them to `/home/stack/judgement_logs`,`/home/stack/judgement_docs` and `/home/stack/judgement_mongo_db` respectively. 

Besides, map host port 27017 to container port 27017.

#### Note
<b>Please be friendly to the website!!!</b>