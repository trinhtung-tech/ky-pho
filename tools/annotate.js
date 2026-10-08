// Tự chú thích từng nước dựa trên luật (chiếu, ăn quân, thí quân, che, chạy Tướng).
// node tools/annotate.js "<fen>" "<chuỗi nước Việt>"  -> in lại chuỗi kèm {chú thích}
const XQ = require('../src/engine.js');
const NAME = { r: 'Xe', n: 'Mã', b: 'Tượng', a: 'Sĩ', k: 'Tướng', c: 'Pháo', p: 'Tốt' };
function annotate(fen, line) {
  let pos = XQ.parseFen(fen);
  const toks = line.split(/\s+/).filter(Boolean);
  const out = [];
  for (const t of toks) {
    if (/^\d+\.(\.\.)?$/.test(t)) { out.push(t); continue; }
    const mv = XQ.parseMove(pos, t);
    const me = pos.turn, piece = pos.board[mv.from], cap = pos.board[mv.to];
    const wasCheck = XQ.inCheck(pos.board, me);
    const next = XQ.applyMove(pos, mv.from, mv.to);
    const check = XQ.inCheck(next.board, next.turn);
    const replies = XQ.legalMoves(next);
    const bits = [];
    const nm = NAME[piece.toLowerCase()];
    if (cap) bits.push(`${nm} ăn ${NAME[cap.toLowerCase()]}`);
    if (!cap && !wasCheck && replies.some(([f, to]) => to === mv.to) && piece.toLowerCase() !== 'k') bits.push(`thí ${nm}`);
    if (wasCheck) bits.push(piece.toLowerCase() === 'k' ? 'Tướng tránh chiếu' : (cap ? 'giải chiếu' : `${nm} che`));
    if (check) bits.push(replies.length ? 'chiếu' : 'chiếu bí');
    else if (!replies.length) bits.push('Đen hết nước đi, thua cờ');
    out.push(t + (bits.length ? ' {' + bits.join(', ').replace(/^./, (c) => c.toUpperCase()) + '.}' : ''));
    pos = next;
  }
  return out.join(' ');
}
module.exports = { annotate };
if (require.main === module) console.log(annotate(process.argv[2], process.argv[3]));
