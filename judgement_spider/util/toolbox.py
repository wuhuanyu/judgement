import time
import datetime

current_time_milli = lambda: int(round(time.time() * 1000))

current_time = lambda: '-'.join(str(datetime.datetime.now()).split(' '))
