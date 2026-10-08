// Tóm tắt quân bị ăn trên một đường đi: node tools/material.js "<fen>" "<chuỗi nước Việt>"
const XQ = require('../src/engine.js');
const NAME = { r: 'Xe', n: 'Mã', b: 'Tượng', a: 'Sĩ', c: 'Pháo', p: 'Tốt' };
const VAL = { r: 9, n: 4, c: 4.5, b: 2, a: 2, p: 1, k: 0 };
function summary(fen, line) {
  let pos = XQ.parseFen(fen); const got = { w: [], b: [] }; let score = 0;
  for (const t of line.split(/\s+/)) {
    if (!t || /^\d+\.(\.\.)?$/.test(t)) continue;
    const mv = XQ.parseMove(pos, t), cap = pos.board[mv.to];
    if (cap) { got[pos.turn].push(NAME[cap.toLowerCase()]); score += (pos.turn === 'w' ? 1 : -1) * VAL[cap.toLowerCase()]; }
    pos = XQ.applyMove(pos, mv.from, mv.to);
  }
  return { w: got.w, b: got.b, score };
}
module.exports = { summary };
if (require.main === module) console.log(JSON.stringify(summary(process.argv[2], process.argv[3])));
