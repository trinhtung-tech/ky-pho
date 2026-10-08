const XQ = require('../src/engine.js');
const fs = require('fs');
const text = fs.readFileSync(process.argv[2], 'utf8');
for (const g of XQ.parseLibrary(text)) {
  console.log('==', g.title, g.errors.length ? 'LỖI:' : 'OK');
  g.errors.forEach(e => console.log('  ', e));
  let n = 0, leaves = 0;
  (function walk(nd){ n++; if(!nd.children.length) leaves++; nd.children.forEach(walk); })(g.root);
  console.log('  nút:', n-1, 'nhánh cuối:', leaves);
}
