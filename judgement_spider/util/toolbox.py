import time
import datetime
import json
from pathlib import Path
import random
from judgement_spider.util.params import search_type_list, case_list, court_type_list, \
    case_type_list, case_process_list, wenshu_type_list

current_time_milli = lambda: int(round(time.time() * 1000))

current_time = lambda: '-'.join(str(datetime.datetime.now()).split(' '))

'''
date to create docs folder
'''
current_date = lambda: ''.join([str(datetime.datetime.now().year),
                                str(datetime.datetime.now().month),
                                str(datetime.datetime.now().day)
                                ])


def str_to_datetime(time_str: str):
    '''
    convert datetime string 2018-10-12 to datetime(2018,10,12)

    :param time_str:
    :return:
    '''
    specs = time_str.split('-')
    if len(specs) != 3:
        raise Exception('time string must be in the form like:2018-10-12')

    month_str: str = specs[1]
    date_str: str = specs[2]
    # 2018-09-03 to 2018-9-3
    if '0' == month_str[0]:
        month_str = month_str[1:]
    if '0' == date_str[0:]:
        date_str = date_str[1:]
    return datetime.datetime(
        year=int(specs[0]),
        month=int(month_str),
        day=int(date_str)
    )


def datetime_to_str(date: datetime.datetime):
    '''
    convert datetime(2018,10,12) to string 2018-10-12
    :param date:
    :return:
    '''
    month = date.month
    day = date.day

    # 2018-9-12
    if 1 <= month <= 9:
        month = '0{}'.format(month)
    if 1 <= day <= 9:
        day = '0{}'.format(day)
    return '{}-{}-{}'.format(date.year,
                             month,
                             day)


def construct_param(param_dict: dict):
    # todo check key exists
    '''
    construct params from a dict,unquoted
    :param param_dict:
    :return:
    案件类型:刑事案件,裁判日期:2018-10-30  TO  2018-10-30,审判程序:二审
    '''

    def param_value_exists(param_valuee):
        return param_valuee in search_type_list or \
               param_valuee in case_list or \
               param_valuee in court_type_list or \
               param_valuee in case_process_list or \
               param_valuee in wenshu_type_list or \
               param_valuee in case_type_list

    params = []
    for param_key in param_dict.keys():
        if param_key != '裁判日期' and param_key != '上传日期':
            if not param_value_exists(param_dict[param_key]):
                raise Exception('Not a valid param key')
        params.append('{}:{}'.format(param_key, param_dict[param_key]))

    return ','.join(params)


def load_json(filepath):
    path = Path(filepath)
    if path.is_file():
        with open(filepath, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            fp.close()
            return data
    else:
        raise Exception('Error in load_json, check your filepath')


def dump_json(filepath, data: dict):
    with open(filepath, 'w', encoding="utf-8") as fp:
        json.dump(data, fp)
        fp.flush()
        fp.close()

def get_guid():
        def create_guid():
            return str(hex((int(((1 + random.random()) * 0x10000)) | 0)))[3:]

        return '{}{}-{}-{}{}-{}{}{}' \
            .format(
            create_guid(), create_guid(),
            create_guid(), create_guid(),
            create_guid(), create_guid(),
            create_guid(), create_guid()
        )

if __name__ == '__main__':
    # param_dict = {
    #     "案件类型": "刑事案件",
    #     "裁判日期": "{} TO {}".format(
    #         '2018-09-24', '2018-09-24'
    #     )
    # }

    # print(construct_param(param_dict))

    # datetime_str='2018-9-9'
    print(str_to_datetime('2018-9-9'))
    print(str_to_datetime('2018-09-09'))

    print(str_to_datetime('2018-1-1'))
    print(str_to_datetime('2018-01-01'))

    print(str_to_datetime('2018-10-10'))

    print(datetime_to_str(datetime.datetime(2018, 9, 9)))
    print(datetime_to_str(datetime.datetime(2018, 10, 10)))
    print(datetime_to_str(datetime.datetime(2018, 1, 1)))
