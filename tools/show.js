// In bàn cờ từ FEN: node tools/show.js "<fen>"
const XQ = require('../src/engine.js');
const pos = XQ.parseFen(process.argv[2]);
for (let r = 0; r < 10; r++) {
  let s = String(10 - r).padStart(2) + ' ';
  for (let c = 0; c < 9; c++) { const p = pos.board[r * 9 + c]; s += p ? (XQ.sideOf(p) === 'w' ? '(' + XQ.HAN_OF[XQ.sideOf(p)][p.toLowerCase()] + ')' : '[' + XQ.HAN_OF[XQ.sideOf(p)][p.toLowerCase()] + ']') : ' ・ '; }
  console.log(s);
}
console.log('    a   b   c   d   e   f   g   h   i');
console.log('chiếu Trắng:', XQ.inCheck(pos.board, 'w'), ' chiếu Đen:', XQ.inCheck(pos.board, 'b'), ' số nước hợp lệ:', XQ.legalMoves(pos).length);
