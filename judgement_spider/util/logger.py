from judgement_spider.util.toolbox import current_time


class Logger:
    def __init__(self, name, log_file_path=None):
        self.log_file_path = log_file_path
        self.name = name

    def __log(self, tag, msg):
        msg = '[{}] {} : {} {}\n'.format(tag, self.name, current_time(), msg)
        if self.log_file_path is None:
            print(msg)
        else:
            with open(self.log_file_path, 'a+', encoding='utf-8') as file:
                file.write(msg)
                file.flush()
                file.close()

    def info(self, message):
        self.__log('INFO', msg=message)

    def err(self, message):
        self.__log('ERROR', msg=message)


if __name__ == '__main__':
    l1 = Logger(__name__)
    l1.info('hello')
    l2 = Logger(__name__, '/tmp/log.log')
    l2.info('hello')
