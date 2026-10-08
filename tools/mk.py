"""Dựng FEN từ danh sách quân: mk('k e10 a f10 / K e1 C h1')  (thường=Đen, HOA=Trắng)"""
import sys
def mk(spec, turn='w'):
    g = [['' for _ in range(9)] for _ in range(10)]
    for tok in spec.replace('/', ' ').split():
        pass
    toks = spec.replace('/', ' ').split()
    for p, s in zip(toks[0::2], toks[1::2]):
        c = ord(s[0]) - 97; r = 10 - int(s[1:])
        assert not g[r][c], s
        g[r][c] = p
    rows = []
    for r in g:
        out, n = '', 0
        for x in r:
            if x: out += (str(n) if n else '') + x; n = 0
            else: n += 1
        rows.append(out + (str(n) if n else ''))
    return '/'.join(rows) + ' ' + turn
if __name__ == '__main__':
    for line in sys.stdin:
        if not line.strip() or line.startswith('#'): continue
        name, spec = line.split('|', 1)
        print(name.strip() + '\t' + mk(spec.strip()))
