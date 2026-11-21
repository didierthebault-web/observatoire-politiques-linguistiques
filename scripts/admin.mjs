import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {validateRecord,publish} from './documentary.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=5197,base='/observatoire-politiques-linguistiques/';
const stateFile=path.join(root,'private/workspace.json');
const load=()=>JSON.parse(fs.readFileSync(stateFile,'utf8'));
function persist(state){fs.writeFileSync(stateFile+'.tmp',JSON.stringify(state,null,2));fs.renameSync(stateFile+'.tmp',stateFile);}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
 const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
 if(req.headers.host!==`127.0.0.1:${port}`){send(403,{error:'Hôte refusé'});return;}
 const url=new URL(req.url,`http://127.0.0.1:${port}`);
 if(url.pathname.startsWith(base+'api/')){
  if(req.headers['x-documentary-client']!=='local'||(req.headers.origin&&req.headers.origin!==`http://127.0.0.1:${port}`)){send(403,{error:'Requête locale requise'});return;}
  try{
   if(req.method==='GET'&&url.pathname.endsWith('/workspace')){send(200,load());return;}
   if(req.method!=='POST'){send(405,{error:'Méthode refusée'});return;}
   let body='';for await(const chunk of req){body+=chunk;if(body.length>5000000)throw Error('Import trop volumineux');}
   const data=JSON.parse(body||'{}'),state=load();
   if(url.pathname.endsWith('/save')){
    const record=state.records.find(r=>r.id===data.id);if(!record)throw Error('Fiche inconnue');
    if(!data.author?.trim()||!data.reason?.trim())throw Error('Auteur et motif obligatoires');
    const allowed=['title','summary','analysis','themes','keywords','country','organization','publicationDate','sourceUrl','status','publicationApproved','duplicateOf','fundingStatus','eligibility','deadline'];
    const updated={...record};for(const key of allowed)if(key in data.patch)updated[key]=data.patch[key];
    if(!['non confirmé','clos','ouvert','à venir'].includes(updated.fundingStatus))throw Error('Statut de financement invalide');
    if(updated.status==='Validée'){updated.verifiedAt=new Date().toISOString().slice(0,10);updated.validation={author:data.author,reason:data.reason,evidence:data.evidence,date:new Date().toISOString()};}
    const errors=validateRecord(updated);if(errors.length)throw Error(errors.join('; '));
    updated.history=[...record.history,{date:new Date().toISOString(),actor:data.author,reason:data.reason,patch:data.patch,evidence:data.evidence||null}];
    state.records[state.records.indexOf(record)]=updated;persist(state);send(200,updated);return;
   }
   if(url.pathname.endsWith('/publish')){send(200,publish(root));return;}
   if(url.pathname.endsWith('/import')){
    if(!Array.isArray(data.records))throw Error('Format attendu : {records: [...]}');
    const proposals=data.records.map(r=>{if(!state.records.some(x=>x.id===r.id))throw Error('ID inconnu : '+r.id);return {id:r.id,proposal:r,receivedAt:new Date().toISOString(),status:'Importée, examen requis'};});
    const file=path.join(root,'private/imports.json');const previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];fs.writeFileSync(file,JSON.stringify([...previous,...proposals],null,2));send(200,{imported:proposals.length,message:'Propositions sauvegardées dans private/imports.json ; aucune validation automatique.'});return;
   }
   send(404,{error:'Action inconnue'});
  }catch(e){send(400,{error:e.message});}return;
 }
 let relative=url.pathname.startsWith(base)?url.pathname.slice(base.length):'';if(!relative)relative='index.html';
 const file=path.resolve(root,'dist',relative);if(!file.startsWith(path.join(root,'dist')+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Introuvable');return;}
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});server.listen(port,'127.0.0.1',()=>console.log(`Atelier local : http://127.0.0.1:${port}${base}#/administration`));
