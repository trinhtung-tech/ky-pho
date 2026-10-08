// node tools/sim.js "P2-5 M8.7 ..."  -> in bàn cờ sau chuỗi nước
const XQ=require('../src/engine.js');
let p=XQ.parseFen(XQ.START_FEN);
const H={r:'車',n:'馬',b:'象',a:'士',k:'將',c:'砲',p:'卒',R:'俥',N:'傌',B:'相',A:'仕',K:'帥',C:'炮',P:'兵'};
let i=0;
for(const m of process.argv[2].trim().split(/\s+/)){i++;try{const r=XQ.parseMove(p,m);p=XQ.applyMove(p,r.from,r.to);if(p.captured)console.log('ply',i,m,'ăn',p.captured);}catch(e){console.log('LỖI ply',i,m,e.message);break;}}
for(let r=0;r<10;r++){let l='';for(let c=0;c<9;c++){const q=p.board[r*9+c];l+=q?(q===q.toUpperCase()?'('+H[q]+')':'['+H[q]+']'):' ・ ';}console.log(l);}
