import fs from 'node:fs';
const urls=process.argv.slice(2);
for(const url of urls){try{const r=await fetch(url,{signal:AbortSignal.timeout(15000)});const html=await r.text();const images=[...html.matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);fs.mkdirSync('private/portraits',{recursive:true});fs.writeFileSync('private/portraits/'+new URL(url).hostname+'.html',html);console.log(JSON.stringify({url,status:r.status,images}));}catch(e){console.log(JSON.stringify({url,error:e.message}));}}
