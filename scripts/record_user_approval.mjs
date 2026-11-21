import fs from 'node:fs';import {publish}from'./documentary.mjs';import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),file=root+'/private/workspace.json';
const state=JSON.parse(fs.readFileSync(file,'utf8'));const date=new Date().toISOString();
fs.copyFileSync(file,root+'/private/workspace-before-user-approval.json');
const reason='Validation et autorisation explicites de publication par le demandeur dans la conversation : « Je valide les fiches (vu dans ChatGPT) : tu peux publier les fiches ». Les réserves de l’audit sont conservées ; cette décision ne vaut pas nouvelle vérification des sources.';
for(const r of state.records){r.status='Validée';r.publicationApproved=true;r.validation={mode:'user_approval',author:'Demandeur du projet',reason,evidence:'Décision explicite dans la conversation, corpus expérimental et audit du 20 novembre 2026 examinés dans ChatGPT par le demandeur.',date};r.history.push({date,actor:'Demandeur du projet',reason,status:'Validée pour diffusion avec réserves'});if(r.id==='T20'){r.duplicateDisposition='secondary-source';r.history.push({date,actor:'Traitement documentaire',reason:'T20 diffusée comme source secondaire de T01 ; le lien de doublon est conservé. Ne pas compter comme tendance indépendante.'});}}
fs.writeFileSync(file,JSON.stringify(state,null,2));console.log(publish(root));
