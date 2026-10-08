const XQ=require('../src/engine.js');const fs=require('fs');
const g=XQ.parseLibrary(fs.readFileSync(process.argv[2],'utf8'))[0];
const want=process.argv.slice(3); // dạng "X9-8,B7.1,X2-4,..." theo nhãn? dùng đường đi bằng chỉ số con
function ascii(pos){const H={r:'車',n:'馬',b:'象',a:'士',k:'將',c:'砲',p:'卒',R:'俥',N:'傌',B:'相',A:'仕',K:'帥',C:'炮',P:'兵'};
 let s='';for(let r=0;r<10;r++){let l='';for(let c=0;c<9;c++){const p=pos.board[r*9+c];l+=p?(p===p.toUpperCase()?'('+H[p]+')':'['+H[p]+']'):' ・ ';}s+=l+'\n';}return s;}
function find(nd, pred){ if(pred(nd)) return nd; for(const c of nd.children){const r=find(c,pred); if(r) return r;} }
for(const w of want){ // w = "label|ply" 
  const [lab,ply]=w.split('|');
  let start=lab?find(g.root,n=>n.label&&n.label.startsWith(lab)):g.root;
  let nd=start; while(nd.ply<+ply) nd=nd.children[0];
  console.log('--',w, nd.text); console.log(ascii(nd.pos));
}
