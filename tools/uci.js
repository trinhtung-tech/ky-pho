// Đổi qua lại giữa nước UCI (a0..i9 kiểu Fairy-Stockfish: a1..i10) và ký hiệu Việt.
const XQ = require('../src/engine.js');
const sq = (i) => 'abcdefghi'[i % 9] + (10 - Math.floor(i / 9));
const unsq = (s) => { const c = s.charCodeAt(0) - 97, r = 10 - parseInt(s.slice(1), 10); return r * 9 + c; };
function splitUci(m) { const k = /^([a-i]\d+)([a-i]\d+)$/.exec(m); return [unsq(k[1]), unsq(k[2])]; }
// uci -> chuỗi "1. X2-5 X8.1 2. ..." (Trắng đi trước nếu turn w)
function toViet(fen, ucis) {
  let pos = XQ.parseFen(fen), ply = pos.turn === 'w' ? 0 : 1, out = [];
  for (const m of ucis) {
    const [f, t] = splitUci(m);
    if (!XQ.legalMoves(pos).some((x) => x[0] === f && x[1] === t)) throw new Error('nước không hợp lệ ' + m);
    const n = XQ.moveToNotation(pos, f, t);
    const no = Math.floor(ply / 2) + 1;
    if (ply % 2 === 0) out.push(no + '. ' + n); else out.push((out.length ? '' : no + '... ') + n);
    pos = XQ.applyMove(pos, f, t); ply++;
  }
  return { text: out.join(' '), fen: XQ.toFen(pos), mate: XQ.legalMoves(pos).length === 0, check: XQ.inCheck(pos.board, pos.turn) };
}
// Duyệt mọi nhánh của một thế -> danh sách đường đi UCI
function lines(game) {
  const res = [];
  (function walk(nd, path) {
    if (!nd.children.length) { res.push({ moves: path, mate: XQ.legalMoves(nd.pos).length === 0, comment: nd.comment || '' }); return; }
    nd.children.forEach((c) => walk(c, path.concat(sq(c.from) + sq(c.to))));
  })(game.root, []);
  return res;
}
module.exports = { sq, unsq, toViet, lines };
if (require.main === module) {
  const [fen, ...mv] = process.argv.slice(2);
  console.log(JSON.stringify(toViet(fen, mv)));
}
