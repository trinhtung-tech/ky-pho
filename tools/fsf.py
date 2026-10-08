"""Gọi Fairy-Stockfish (biến thể xiangqi) để kiểm chứng thế cờ.
Dùng: python3 tools/fsf.py "<fen>" [độ sâu]  -> in điểm, nước tốt nhất, PV."""
import subprocess, sys, os, re
ENGINE = os.environ.get('FSF', '/home/claude/fairy-stockfish/fairy-stockfish/src/stockfish')

class Engine:
    def __init__(self):
        self.p = subprocess.Popen([ENGINE], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1)
        self.send('uci'); self.wait('uciok')
        self.send('setoption name UCI_Variant value xiangqi')
        self.send('setoption name Threads value 4')
        self.send('setoption name Hash value 256')
        self.send('isready'); self.wait('readyok')
    def send(self, s): self.p.stdin.write(s + '\n'); self.p.stdin.flush()
    def wait(self, tok):
        lines = []
        while True:
            l = self.p.stdout.readline()
            if not l: raise RuntimeError('engine died')
            lines.append(l.strip())
            if l.startswith(tok): return lines
    def analyse(self, fen, moves=(), depth=None, movetime=None, multipv=1):
        self.send(f'setoption name MultiPV value {multipv}')
        self.send('ucinewgame'); self.send('isready'); self.wait('readyok')
        self.send(f'position fen {fen}' + (' moves ' + ' '.join(moves) if moves else ''))
        self.send(f'go depth {depth}' if depth else f'go movetime {movetime or 2000}')
        lines = self.wait('bestmove')
        best = {}
        for l in lines:
            m = re.search(r' multipv (\d+) .*score (cp|mate) (-?\d+).* pv (.*)$', l)
            if m: best[int(m.group(1))] = (m.group(2), int(m.group(3)), m.group(4).split())
        return [best[k] for k in sorted(best)], lines[-1].split()[1]

if __name__ == '__main__':
    e = Engine()
    res, bm = e.analyse(sys.argv[1], depth=int(sys.argv[2]) if len(sys.argv) > 2 else 20, multipv=int(sys.argv[3]) if len(sys.argv) > 3 else 1)
    for r in res: print(r[0], r[1], ' '.join(r[2]))
    print('best', bm)
