from judgement_spider.util.toolbox import current_time


class Logger:
    def __init__(self, log_file_path=None):
        self.log_file_path = log_file_path

    def info(self, msg):
        msg = '[INFO] {} {}\n'.format(current_time(), msg)
        if self.log_file_path is None:
            print(msg)
        else:
            with open(self.log_file_path, 'a+', encoding='utf-8') as file:
                file.write(msg)
                file.flush()
                file.close()


if __name__ == '__main__':
    l1=Logger()
    l1.info('hello')
    l2=Logger('/tmp/log.log')
    l2.info('hello')