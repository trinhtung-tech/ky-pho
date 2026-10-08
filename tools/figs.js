// In thế cờ ở mọi nút có chú thích "Hình" để so với hình trong sách
const XQ=require('../src/engine.js');const fs=require('fs');
const H={r:'車',n:'馬',b:'象',a:'士',k:'將',c:'砲',p:'卒',R:'俥',N:'傌',B:'相',A:'仕',K:'帥',C:'炮',P:'兵'};
for(const g of XQ.parseLibrary(fs.readFileSync(process.argv[2],'utf8'))){
 (function w(nd){
  if(nd.comment&&/Hình/i.test(nd.comment)){
   const labs=[];for(let a=nd;a;a=a.parent)if(a.label)labs.unshift(a.label.split(':')[0]);
   console.log('##',labs.join(' > '),Math.ceil(nd.ply/2)+(nd.side==='b'?'...':'.'),nd.text,'|',nd.comment.slice(0,30));
   for(let r=0;r<10;r++){let l='';for(let c=0;c<9;c++){const p=nd.pos.board[r*9+c];l+=p?(p===p.toUpperCase()?'('+H[p]+')':'['+H[p]+']'):' ・ ';}console.log(l);}
  }
  nd.children.forEach(w);
 })(g.root);
}
