const fs=require('fs');const path=require('path');
const root=path.join(__dirname,'..');
const data=fs.readdirSync(path.join(root,'data')).filter(f=>f.endsWith('.txt')).sort().map(f=>fs.readFileSync(path.join(root,'data',f),'utf8')).join('\n');
if(/<\/script/i.test(data)) throw new Error('data chứa </script');
let html=fs.readFileSync(path.join(root,'src/app.html'),'utf8');
html=html.replace('__DATA__',()=>data).replace('__ENGINE__',()=>fs.readFileSync(path.join(root,'src/engine.js'),'utf8'));
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist/ky-pho.html'),html);
console.log('ok',html.length);
// Bản PWA (cài lên màn hình iPhone, chạy không cần mạng)
const pw=path.join(root,'dist/pwa');fs.mkdirSync(pw,{recursive:true});
const head='<!doctype html><meta charset="utf-8"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-180.png"><meta name="theme-color" content="#8b5a2b">';
const reg='<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");</script>';
fs.writeFileSync(path.join(pw,'index.html'),head+html+reg);
const ver=require('crypto').createHash('md5').update(html).digest('hex').slice(0,8);
fs.writeFileSync(path.join(pw,'sw.js'),fs.readFileSync(path.join(root,'pwa/sw.js'),'utf8').replace('__VER__',ver));
for(const f of ['manifest.webmanifest','icon-180.png','icon-512.png'])fs.copyFileSync(path.join(root,'pwa',f),path.join(pw,f));
console.log('pwa ok',ver);
// Trang GitHub Pages nằm ở thư mục gốc kho
for(const f of fs.readdirSync(pw))fs.copyFileSync(path.join(pw,f),path.join(root,f));
