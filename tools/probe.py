"""Thử nhanh nhiều thế: python3 tools/probe.py file.tsv  (mỗi dòng: tên<TAB>fen)
In: kết quả máy (mate/cp), PV bằng ký hiệu Việt, và phương án tốt thứ 2."""
import sys, json, subprocess
sys.path.insert(0, 'tools'); from fsf import Engine
e = Engine()
def viet(fen, mv):
    try: return json.loads(subprocess.check_output(['node', 'tools/uci.js', fen] + mv, text=True))
    except subprocess.CalledProcessError: return {'text': '?'}
for line in open(sys.argv[1], encoding='utf8'):
    if not line.strip() or line.startswith('#'): continue
    name, fen = line.rstrip('\n').split('\t')[:2]
    depth = int(sys.argv[2]) if len(sys.argv) > 2 else 22
    res, bm = e.analyse(fen if ' ' in fen else fen + ' w', depth=depth, multipv=2)
    print('==', name)
    for k, (kind, v, pv) in enumerate(res):
        v2 = viet(fen if ' ' in fen else fen + ' w', pv)
        print(f'  {k+1}. {kind} {v}: {v2["text"]}' + ('  [BÍ]' if v2.get('mate') else ''))
