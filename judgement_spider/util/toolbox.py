import time
import datetime

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
    return datetime.datetime(
        year=int(specs[0]),
        month=int(specs[1]),
        day=int(specs[2])
    )


def datetime_to_str(date: datetime.datetime):
    '''
    convert datetime(2018,10,12) to string 2018-10-12
    :param date:
    :return:
    '''
    return '{}-{}-{}'.format(date.year,
                             date.month,
                             date.day)
