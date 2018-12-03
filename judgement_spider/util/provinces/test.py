from judgement_spider.util.toolbox import load_json, dump_json
import os
# import urllib.parse
dir = '/Users/stack/code/py3/wenshu/judgement_spider/judgement_spider/util/provinces'

if __name__ == "__main__":
    provinces = load_json(os.path.join(dir, 'province.json'))
    courts = {}
    for p in provinces:
        p_name = p['name'].encode('utf-8').decode('utf-8')
        json_path = os.path.join(dir, '{}.json'.format(p_name))
        p_courts = load_json(json_path)
        p_c = []
        for court in p_courts:
            obj = {
                "court": court["court"],
                "province": court['province'],
                'region': court['region'],
                'leval': court['leval'],
                'key': court['key']
            }
            p_c.append(obj)
            print(obj)

        courts[p_name] = p_c
    dump_json(os.path.join(dir, 'converted.json'), courts)
