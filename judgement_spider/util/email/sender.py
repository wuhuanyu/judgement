
import smtplib
from email.header import Header
from email.mime.text import MIMEText
from judgement_spider.util.toolbox import load_json
from pathlib import Path
class Sender():
    def __init__(self,config_path):
        if not Path(config_path).is_file:
            raise Exception('Please provide your email config')
        self.config:dict=load_json(config_path)
    def send_email(self, subject, content):
        for key in ['smtp_server','port','user_name','passwd','from','to']:
            if key not in list(self.config.keys()):
                raise Exception('Please check your config file')
        
        config=self.config

        smtp_server=config['smtp_server']
        port=int(config['port'])
        user_name=config['user_name']
        passwd=config['passwd']
        from_=config['from']
        to_=config['to']

        email_client = smtplib.SMTP(smtp_server,port)
        email_client.login(user_name, passwd)
        msg = MIMEText(content, 'plain', 'utf-8')
        msg['Subject'] = Header(subject, 'utf-8')  # subject
        msg['From'] = from_
        msg['To'] = to_
        email_client.sendmail(from_, to_, msg.as_string())
        email_client.quit()


if __name__ == '__main__':
    pass
    sender=Sender('/Users/stack/code/py3/wenshu/judgement_spider/.email.json')
    sender.send_email('log','hello,world')

