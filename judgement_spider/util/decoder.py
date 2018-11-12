import execjs
import re


class Decoder():
    def __init__(self):
        with open(
                '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/public/eval_.js') as file:
            js = file.read()
            self.vl5x_ctx = execjs.compile(js)
            file.close()
        with open(
                '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/public/docid.js') as fp:
            js = fp.read()
            self.docid_ctx = execjs.compile(js)
            fp.close()

    def decode_vl5x(self, vjkl5):
        return self.vl5x_ctx.call('getKey',vjkl5)

    def decode_docid(self, RunEval, id):
        js = self.docid_ctx.call("GetJs", RunEval)
        js_objs = js.split(";;")
        js1 = js_objs[0] + ';'
        js2 = re.findall(r"_\[_\]\[_\]\((.*?)\)\(\);", js_objs[1])[0]
        key = self.docid_ctx.call("EvalKey", js1, js2)
        key = re.findall(r"\"([0-9a-z]{32})\"", key)[0]
        docid = self.docid_ctx.call("DecryptDocID", key, id)
        return docid


if __name__ == "__main__":
    decoder = Decoder()
    decoded_ = decoder.decode_vl5x('55cc8599ff76ecac014e185b0a187582214ad56c')
    print(len(decoded_))
    print(decoded_)