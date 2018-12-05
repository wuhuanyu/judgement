
import smtplib
from email.header import Header
from email.mime.text import MIMEText
class Sender():
    def send_email(self, subject, content):
        email_client = smtplib.SMTP('smtp.163.com',25)
        email_client.login('18852856450@163.com', 'why90951213')
        msg = MIMEText(content, 'plain', 'utf-8')
        msg['Subject'] = Header(subject, 'utf-8')  # subject
        msg['From'] = '18852856450@163.com'
        msg['To'] = '18852856450@163.com'
        email_client.sendmail('18852856450@163.com', '18852856450@163.com', msg.as_string())
        email_client.quit()


if __name__ == '__main__':
    sender=Sender()
    sender.send_email('log','hello,world')

