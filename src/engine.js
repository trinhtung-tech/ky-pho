// Cờ tướng: luật đi quân, đọc ký hiệu Việt Nam, đọc file thế cờ (cây biến).
// Bàn cờ: mảng 90 ô, chỉ số = hàng*9 + cột. Hàng 0 là đáy bên Đen (trên), hàng 9 là đáy bên Trắng/Đỏ (dưới).
// Cột 0 là bên trái khi nhìn từ phía Trắng. Quân: chữ hoa = Trắng (đỏ), chữ thường = Đen.
// k Tướng, a Sĩ, b Tượng, n Mã, r Xe, c Pháo, p Tốt.
(function (root) {
  'use strict';

  const START_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w';

  const isRed = (p) => p && p === p.toUpperCase();
  const sideOf = (p) => (p ? (isRed(p) ? 'w' : 'b') : null);
  const RC = (i) => [Math.floor(i / 9), i % 9];
  const IDX = (r, c) => r * 9 + c;
  const onBoard = (r, c) => r >= 0 && r < 10 && c >= 0 && c < 9;

  function parseFen(fen) {
    const [rows, turn] = fen.trim().split(/\s+/);
    const board = new Array(90).fill(null);
    rows.split('/').forEach((row, r) => {
      let c = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) c += +ch;
        else board[IDX(r, c++)] = ch;
      }
    });
    return { board, turn: turn === 'b' ? 'b' : 'w' };
  }

  function toFen(pos) {
    const rows = [];
    for (let r = 0; r < 10; r++) {
      let s = '', e = 0;
      for (let c = 0; c < 9; c++) {
        const p = pos.board[IDX(r, c)];
        if (!p) e++;
        else { if (e) s += e; e = 0; s += p; }
      }
      if (e) s += e;
      rows.push(s);
    }
    return rows.join('/') + ' ' + pos.turn;
  }

  const inPalace = (r, c, side) => c >= 3 && c <= 5 && (side === 'w' ? r >= 7 : r <= 2);
  const ownHalf = (r, side) => (side === 'w' ? r >= 5 : r <= 4);

  // Nước đi giả hợp lệ (chưa xét bị chiếu) của quân ở ô i.
  function pseudoMoves(board, i) {
    const p = board[i];
    if (!p) return [];
    const side = sideOf(p), t = p.toLowerCase();
    const [r, c] = RC(i);
    const out = [];
    const add = (rr, cc) => {
      if (!onBoard(rr, cc)) return;
      const q = board[IDX(rr, cc)];
      if (!q || sideOf(q) !== side) out.push(IDX(rr, cc));
    };
    const fwd = side === 'w' ? -1 : 1;
    if (t === 'k') {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
        if (inPalace(r + dr, c + dc, side)) add(r + dr, c + dc);
    } else if (t === 'a') {
      for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
        if (inPalace(r + dr, c + dc, side)) add(r + dr, c + dc);
    } else if (t === 'b') {
      for (const [dr, dc] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) {
        const rr = r + dr, cc = c + dc;
        if (onBoard(rr, cc) && ownHalf(rr, side) && !board[IDX(r + dr / 2, c + dc / 2)]) add(rr, cc);
      }
    } else if (t === 'n') {
      for (const [dr, dc, lr, lc] of [[2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0],
        [1, 2, 0, 1], [-1, 2, 0, 1], [1, -2, 0, -1], [-1, -2, 0, -1]]) {
        if (onBoard(r + lr, c + lc) && !board[IDX(r + lr, c + lc)]) add(r + dr, c + dc);
      }
    } else if (t === 'r' || t === 'c') {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let rr = r + dr, cc = c + dc, screen = false;
        while (onBoard(rr, cc)) {
          const q = board[IDX(rr, cc)];
          if (t === 'r') {
            if (!q) out.push(IDX(rr, cc));
            else { if (sideOf(q) !== side) out.push(IDX(rr, cc)); break; }
          } else if (!screen) {
            if (!q) out.push(IDX(rr, cc)); else screen = true;
          } else if (q) {
            if (sideOf(q) !== side) out.push(IDX(rr, cc));
            break;
          }
          rr += dr; cc += dc;
        }
      }
    } else if (t === 'p') {
      add(r + fwd, c);
      if (!ownHalf(r, side)) { add(r, c + 1); add(r, c - 1); }
    }
    return out;
  }

  function kingSq(board, side) {
    const k = side === 'w' ? 'K' : 'k';
    return board.indexOf(k);
  }

  function inCheck(board, side) {
    const ks = kingSq(board, side);
    if (ks < 0) return true;
    const other = side === 'w' ? 'b' : 'w';
    // Hai tướng đối mặt
    const ok = kingSq(board, other);
    if (ok >= 0 && ok % 9 === ks % 9) {
      const [a, b] = [Math.min(ok, ks), Math.max(ok, ks)];
      let blocked = false;
      for (let i = a + 9; i < b; i += 9) if (board[i]) { blocked = true; break; }
      if (!blocked) return true;
    }
    for (let i = 0; i < 90; i++) {
      if (board[i] && sideOf(board[i]) === other && pseudoMoves(board, i).includes(ks)) return true;
    }
    return false;
  }

  function isLegal(board, from, to) {
    const p = board[from];
    if (!p || !pseudoMoves(board, from).includes(to)) return false;
    const nb = board.slice();
    nb[to] = p; nb[from] = null;
    return !inCheck(nb, sideOf(p));
  }

  function legalMoves(pos) {
    const out = [];
    for (let i = 0; i < 90; i++) {
      if (pos.board[i] && sideOf(pos.board[i]) === pos.turn)
        for (const to of pseudoMoves(pos.board, i)) if (isLegal(pos.board, i, to)) out.push([i, to]);
    }
    return out;
  }

  function applyMove(pos, from, to) {
    const board = pos.board.slice();
    const captured = board[to];
    board[to] = board[from]; board[from] = null;
    return { board, turn: pos.turn === 'w' ? 'b' : 'w', captured };
  }

  // ---------- Ký hiệu Việt Nam ----------
  const LETTER = { X: 'r', M: 'n', T: 'b', S: 'a', TG: 'k', P: 'c', B: 'p' };
  const HAN = { '車': 'X', '俥': 'X', '馬': 'M', '傌': 'M', '相': 'T', '象': 'T', '仕': 'S', '士': 'S',
    '帥': 'Tg', '將': 'Tg', '将': 'Tg', '帅': 'Tg', '炮': 'P', '砲': 'P', '包': 'P', '兵': 'B', '卒': 'B' };
  const TYPE_LETTER = { r: 'X', n: 'M', b: 'T', a: 'S', k: 'Tg', c: 'P', p: 'B' };
  const HAN_OF = {
    w: { r: '車', n: '馬', b: '相', a: '仕', k: '帥', c: '炮', p: '兵' },
    b: { r: '車', n: '馬', b: '象', a: '士', k: '將', c: '砲', p: '卒' },
  };

  function normalizeNotation(s) {
    let t = s.trim();
    for (const [h, l] of Object.entries(HAN)) t = t.split(h).join(l);
    const words = [
      [/tướng/gi, 'Tg'], [/sĩ/gi, 'S'], [/tượng/gi, 'T'], [/xe/gi, 'X'], [/pháo/gi, 'P'], [/mã/gi, 'M'],
      [/tốt|binh(?!\s*\d)/gi, 'B'], [/tiến/gi, '.'], [/thoái|lui/gi, '/'], [/bình/gi, '-'],
      [/trước/gi, 't'], [/giữa/gi, 'g'], [/sau/gi, 's'],
    ];
    for (const [re, rep] of words) t = t.replace(re, rep);
    t = t.replace(/\s+/g, '');
    return t;
  }

  const NOTE_RE = /^(Tg|TG|tg|X|M|T|S|P|B)([1-9]|t|s|g)([.\-/])([1-9])$/;

  // Trả về {from,to,text} hoặc ném lỗi với lời giải thích tiếng Việt.
  function parseMove(pos, raw) {
    const s = normalizeNotation(raw);
    const m = NOTE_RE.exec(s);
    if (!m) throw new Error(`không hiểu ký hiệu "${raw}"`);
    const type = LETTER[m[1].toUpperCase()];
    const which = m[2], op = m[3], n = +m[4];
    const side = pos.turn;
    const fwd = side === 'w' ? -1 : 1;
    const colOf = (f) => (side === 'w' ? 9 - f : f - 1);
    const fileOf = (c) => (side === 'w' ? 9 - c : c + 1);
    const pieceCh = side === 'w' ? type.toUpperCase() : type;

    // Ứng viên: các quân cùng loại
    let cands = [];
    for (let i = 0; i < 90; i++) if (pos.board[i] === pieceCh) cands.push(i);
    if (/[1-9]/.test(which)) {
      cands = cands.filter((i) => fileOf(i % 9) === +which);
    } else {
      // t / s / g: chọn trong cột có từ 2 quân cùng loại; xếp theo độ tiến
      const byCol = {};
      for (const i of cands) (byCol[i % 9] = byCol[i % 9] || []).push(i);
      const cols = Object.values(byCol).filter((a) => a.length >= 2);
      cands = [];
      for (const arr of cols) {
        arr.sort((a, b) => (side === 'w' ? a - b : b - a)); // quân trước (gần đối phương) đứng đầu
        if (which === 't') cands.push(arr[0]);
        else if (which === 's') cands.push(arr[arr.length - 1]);
        else if (arr.length >= 3) cands.push(arr[1]);
      }
    }
    if (!cands.length) throw new Error(`không có quân ${m[1]} ở cột ${which}`);

    const results = [];
    for (const from of cands) {
      const [r, c] = RC(from);
      let tr, tc;
      if ('rckp'.includes(type)) {
        if (op === '-') { tr = r; tc = colOf(n); }
        else { tc = c; tr = r + (op === '.' ? fwd : -fwd) * n; }
      } else {
        if (op === '-') continue;
        tc = colOf(n);
        const dc = Math.abs(tc - c);
        const dr = type === 'n' ? (dc === 1 ? 2 : dc === 2 ? 1 : -99) : type === 'b' ? 2 : 1;
        if (dr < 0) continue;
        tr = r + (op === '.' ? fwd : -fwd) * dr;
      }
      if (!onBoard(tr, tc)) continue;
      const to = IDX(tr, tc);
      if (isLegal(pos.board, from, to)) results.push({ from, to });
    }
    if (results.length === 0) throw new Error(`nước "${raw}" không hợp lệ ở thế cờ này`);
    if (results.length > 1) throw new Error(`nước "${raw}" mơ hồ (có ${results.length} quân đi được), cần ghi t/s`);
    const text = s.replace(/^TG|^tg/, 'Tg');
    return { ...results[0], text };
  }

  // Tạo ký hiệu chuẩn cho một nước (dùng khi người dùng đi trên bàn).
  function moveToNotation(pos, from, to) {
    const p = pos.board[from], side = sideOf(p), t = p.toLowerCase();
    const fileOf = (c) => (side === 'w' ? 9 - c : c + 1);
    const fwd = side === 'w' ? -1 : 1;
    const [r, c] = RC(from), [tr, tc] = RC(to);
    let which = String(fileOf(c));
    const same = [];
    for (let i = c; i < 90; i += 9) if (pos.board[i] === p) same.push(i);
    if (same.length >= 2 && t !== 'a' && t !== 'b') {
      same.sort((a, b) => (side === 'w' ? a - b : b - a));
      if (same.length === 2) which = same[0] === from ? 't' : 's';
      else which = same[0] === from ? 't' : same[same.length - 1] === from ? 's' : 'g';
    }
    let op, n;
    if (tr === r) { op = '-'; n = fileOf(tc); }
    else {
      op = (tr - r) * fwd > 0 ? '.' : '/';
      n = 'rckp'.includes(t) ? Math.abs(tr - r) : fileOf(tc);
    }
    return TYPE_LETTER[t] + which + op + n;
  }

  // "P2-5" -> "Pháo 2 bình 5"
  function toViet(text) {
    const m = /^(Tg|X|M|T|S|P|B)([1-9tsg])([.\-/])([1-9])$/.exec(text);
    if (!m) return text;
    const name = { Tg: 'Tướng', X: 'Xe', M: 'Mã', T: 'Tượng', S: 'Sĩ', P: 'Pháo', B: 'Tốt' }[m[1]];
    const w = { t: 'trước', s: 'sau', g: 'giữa' }[m[2]] || m[2];
    const op = { '.': 'tiến', '/': 'thoái', '-': 'bình' }[m[3]];
    return `${name} ${w} ${op} ${m[4]}`;
  }

  // ---------- Đọc file thế cờ ----------
  // Định dạng:
  //   @@ Tên thế cờ          (bắt đầu một thế mới)
  //   @sach / @phan / @fen   (thông tin)
  //   1. P2-5 M8.7 2. M2.3 {chú thích} [Nhãn biến] ( 2... X9-8 ... )
  function tokenize(text) {
    const toks = [];
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '{') { const j = text.indexOf('}', i); toks.push({ t: 'comment', v: text.slice(i + 1, j).trim() }); i = j + 1; continue; }
      if (ch === '[') { const j = text.indexOf(']', i); toks.push({ t: 'label', v: text.slice(i + 1, j).trim() }); i = j + 1; continue; }
      if (ch === '(' || ch === ')') { toks.push({ t: ch }); i++; continue; }
      let j = i;
      while (j < text.length && !/[\s{}()[\]]/.test(text[j])) j++;
      const w = text.slice(i, j);
      i = j;
      const mm = /^(\d+)\.(\.\.)?(.*)$/.exec(w); // "8.", "8...", "8...B7.1"
      if (mm) {
        toks.push({ t: 'num', ply: (+mm[1] - 1) * 2 + (mm[2] ? 1 : 0) });
        if (mm[3]) toks.push({ t: 'move', v: mm[3] });
      } else toks.push({ t: 'move', v: w });
    }
    return toks;
  }

  function parseGame(body, fen) {
    const rootPos = parseFen(fen || START_FEN);
    const root = { pos: rootPos, children: [], parent: null, ply: 0 };
    const toks = tokenize(body);
    const errors = [];
    let cur = root, last = null, pendingLabel = null, branchFrom = null;
    const stack = [];
    for (const tk of toks) {
      if (tk.t === 'comment') {
        const target = last || cur;
        target.comment = target.comment ? target.comment + ' ' + tk.v : tk.v;
      } else if (tk.t === 'label') {
        pendingLabel = tk.v;
      } else if (tk.t === 'num') {
        // Số thứ tự ngay sau "(" cho biết biến rẽ từ nước nào trên đường đang đi
        if (branchFrom) {
          let a = branchFrom;
          while (a && a.ply > tk.ply) a = a.parent;
          if (a && a.ply === tk.ply) cur = a;
          branchFrom = null;
        }
      } else if (tk.t === '(') {
        stack.push({ cur, last });
        branchFrom = last || cur;
        cur = last ? last.parent : cur;
        last = null;
      } else if (tk.t === ')') {
        ({ cur, last } = stack.pop());
        // tiếp tục từ nước trước khi mở ngoặc
        cur = last || cur;
      } else if (tk.t === 'move') {
        branchFrom = null;
        try {
          const mv = parseMove(cur.pos, tk.v);
          let node = cur.children.find((ch) => ch.from === mv.from && ch.to === mv.to);
          const isNew = !node;
          if (!node) {
            node = { from: mv.from, to: mv.to, text: mv.text, side: cur.pos.turn,
              piece: cur.pos.board[mv.from], pos: applyMove(cur.pos, mv.from, mv.to),
              children: [], parent: cur, ply: cur.ply + 1 };
            cur.children.push(node);
          }
          // Nhãn nhánh gắn vào nước đầu tiên mà nhánh tách khỏi đường đã có
          if (pendingLabel && isNew) { node.label = pendingLabel; pendingLabel = null; }
          cur = node; last = node;
        } catch (e) {
          errors.push(`Nước ${Math.floor(cur.ply / 2) + 1}${cur.pos.turn === 'b' ? '...' : '.'} ${tk.v}: ${e.message}`);
          // bỏ qua phần còn lại của nhánh này
          break;
        }
      }
    }
    return { root, errors };
  }

  // Đọc nhiều thế, mỗi thế bắt đầu bằng dòng "@@ Tên".
  function parseLibrary(text) {
    const games = [];
    let g = null;
    for (const line of text.split('\n')) {
      const l = line.trim();
      if (l.startsWith('@@')) { g = { title: l.slice(2).trim(), meta: {}, body: '' }; games.push(g); continue; }
      if (!g) continue;
      const mm = /^@(\w+)\s+(.*)$/.exec(l);
      if (mm) { g.meta[mm[1]] = mm[2].trim(); continue; }
      if (l.startsWith('#')) continue;
      g.body += line + '\n';
    }
    for (const gm of games) {
      const { root, errors } = parseGame(gm.body, gm.meta.fen);
      gm.root = root; gm.errors = errors;
    }
    return games;
  }

  const api = { START_FEN, parseFen, toFen, legalMoves, isLegal, applyMove, inCheck, parseMove,
    moveToNotation, toViet, parseGame, parseLibrary, HAN_OF, sideOf, RC, IDX };
  if (typeof module !== 'undefined') module.exports = api;
  else root.XQ = api;
})(typeof window !== 'undefined' ? window : globalThis);
