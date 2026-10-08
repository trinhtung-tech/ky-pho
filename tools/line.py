"""Cho máy tự đi hai bên tới khi hết cờ: python3 tools/line.py "<fen>" [độ sâu] [số nửa nước tối đa]
In: kết quả mỗi bước và toàn bộ đường đi bằng ký hiệu Việt."""
import sys, json, subprocess
sys.path.insert(0, 'tools'); from fsf import Engine
import pyffish as sf
fen = sys.argv[1] if ' ' in sys.argv[1] else sys.argv[1] + ' w'
depth = int(sys.argv[2]) if len(sys.argv) > 2 else 24
maxply = int(sys.argv[3]) if len(sys.argv) > 3 else 80
e = Engine(); full = fen + ' - - 0 1'; moves = []; first = None
while len(moves) < maxply:
    if not sf.legal_moves('xiangqi', full, moves): break
    res, bm = e.analyse(full, moves, depth=depth)
    if first is None: first = res[0][:2]
    moves.append(bm)
v = json.loads(subprocess.check_output(['node', 'tools/uci.js', fen] + moves, text=True))
print('ban đầu:', first, 'số nửa nước:', len(moves), 'bí:', v['mate'])
print(v['text'])
