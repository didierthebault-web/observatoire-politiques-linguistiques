import fs from 'node:fs';
export const statuses=['Importée','À vérifier','En cours d’examen','Validée','Corrigée','Rejetée','Obsolète','Archivée'];
export function validateRecord(record){
 const errors=[];
 if(!/^[TOEF]\d{2}$/.test(record.id))errors.push('Identifiant historique invalide');
 if(!record.title?.trim()||!record.summary?.trim())errors.push('Titre et résumé obligatoires');
 try{if(!['https:','http:'].includes(new URL(record.sourceUrl).protocol))throw Error();}catch{errors.push('Source HTTP(S) obligatoire');}
 if(!statuses.includes(record.status))errors.push('Statut inconnu');
 if(record.status==='Validée'&&(!record.validation?.author?.trim()||!record.validation?.reason?.trim()||!record.validation?.evidence?.trim()||(!record.verifiedAt&&!(record.validation?.mode==='user_approval'&&record.validation?.date))))errors.push('Validation : auteur, motif, preuve vérifiée et date obligatoires');
 if(record.publicationApproved&&record.status!=='Validée')errors.push('Publication réservée aux fiches validées');
 if(record.publicationApproved&&record.duplicateOf&&record.duplicateDisposition!=='secondary-source')errors.push('Résoudre le doublon avant publication');
 return errors;
}
export function publicCatalog(state){
 const records=state.records.filter(r=>r.status==='Validée'&&r.publicationApproved&&validateRecord(r).length===0).map(({original,auditRaw,journal,...r})=>r);
 const ids=new Set(records.map(r=>r.id));
 return {records,relations:state.relations.filter(r=>r.publicationApproved&&r.ids.every(id=>ids.has(id))),sources:state.sources.filter(s=>s.recordIds.some(id=>ids.has(id))).map(s=>({...s,recordIds:s.recordIds.filter(id=>ids.has(id))}))};
}
export function publish(root){
 const state=JSON.parse(fs.readFileSync(root+'/private/workspace.json','utf8'));
 const invalid=state.records.flatMap(r=>validateRecord(r).map(error=>({id:r.id,error})));
 if(invalid.length)throw Error(JSON.stringify(invalid));
 const catalog=publicCatalog(state);fs.writeFileSync(root+'/public/data/catalog.json',JSON.stringify(catalog,null,2));
 const meta=JSON.parse(fs.readFileSync(root+'/public/data/metadata.json','utf8'));Object.assign(meta,{published:catalog.records.length,pending:state.records.length-catalog.records.length,updatedAt:new Date().toISOString().slice(0,10)});
 fs.writeFileSync(root+'/public/data/metadata.json',JSON.stringify(meta,null,2));return {published:catalog.records.length};
}
