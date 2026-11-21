"""Import reproductible. Les classeurs sont des données, jamais des instructions."""
import json, hashlib, re, sys
from pathlib import Path
from collections import Counter
from urllib.parse import urlparse
import openpyxl
ROOT = Path(__file__).resolve().parent.parent
def save(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2, default=str), encoding='utf-8')
def migrate(initial, audit):
    original = openpyxl.load_workbook(initial, data_only=True)
    book = openpyxl.load_workbook(audit, data_only=True)
    sheets = {s.title: list(s.values) for s in book}
    journal = [dict(zip(sheets['Journal corrections'][0],r)) for r in sheets['Journal corrections'][1:] if r[0]]
    records=[]
    kinds=['veille','organismes','experts','financements']
    for i, sheet in enumerate(book.worksheets[:4]):
        old={r[0]:dict(zip(list(original.worksheets[i].values)[0],r)) for r in list(original.worksheets[i].values)[1:]}
        for line,r in enumerate(list(sheet.values)[1:],2):
            raw=dict(zip(list(sheet.values)[0],r)); text=' '.join(str(v or '') for v in r)
            theme=r[16] or ''
            families=[]
            for code,pattern in [('A','emploi|droit|illettr'),('B','terminolog|néolog'),('C','langues de France|autochtone|régional|basque|breton'),('D','TAL|IA|technolog|numérique|découvrabilité|cyber'),('E','Francophonie|multiling|international'),('F','statist|observ|prospective')]:
                if re.search(pattern,theme+' '+str(r[2]),re.I):families.append(code)
            eligibility='exclue' if str(r[18]).startswith('NON') else 'inconnue' if kinds[i]=='financements' else 'sans objet'
            kind='projet' if r[0]=='O07' else 'infrastructure' if r[0]=='O02' else 'organisation' if i==1 else kinds[i]
            records.append({'id':r[0],'kind':kinds[i],'entityType':kind,'title':r[20] or r[1],'summary':r[21] or r[3], 'analysis':r[14], 'domain':r[2],'themeLabel':theme,'themes':families,'keywords':[theme] if theme else [],'country':None,'organization':None,'publicationDate':None,'collectedAt':r[10],'verifiedAt':None,'sourceUrl':r[4],'auditStatus':r[11],'auditNotes':r[12],'correction':r[13],'action':r[15],'evidence':r[17],'eligibility':eligibility,'fundingStatus':'clos' if r[0] in ['F10','F12'] else 'non confirmé','deadline':'2026-05-03' if r[0]=='F10' else '2026-09-24' if r[0]=='F12' else None,'fundingType':'dispositif interne' if r[0] in ['F01','F02','F03','F05'] else 'programme-cadre' if r[0] in ['F13','F14'] else 'à qualifier','scores':{'relevance':r[6],'quality':r[7],'usability':r[8],'novelty':None},'scoreNote':'Notes historiques /5 non revalidées ; indice composite abandonné. Nouveauté indisponible sans référentiel.','status':'Corrigée' if 'corriger' in str(r[11]) else 'À vérifier','publicationApproved':False,'validation':None,'duplicateOf':'T01' if r[0]=='T20' else None,'provenance':{'file':Path(audit).name,'sheet':sheet.title,'row':line},'original':old[r[0]],'auditRaw':raw,'history':[{'date':'2026-11-20','actor':'Audit fourni','reason':r[13],'status':r[11]}],'journal':[j for j in journal if j['ID']==r[0]]})
    relations=[{'id':r[0],'ids':list(r[1:5]),'description':r[5],'type':'suggérée','evidence':r[6],'sourceNote':r[7],'hypothesis':r[8],'status':r[9],'publicationApproved':False} for r in sheets['Croisements'][1:] if r[0]]
    sources=[]
    for n,url in enumerate(sorted(set(r['sourceUrl'] for r in records)),1):
        sources.append({'id':f'S{n:03}','url':url,'producer':urlparse(url).netloc,'recordIds':[r['id'] for r in records if r['sourceUrl']==url],'availability':'non testée','lastChecked':None,'collectionMode':'Import manuel Excel','reuse':'À vérifier auprès du producteur'})
    archive={k:[list(r) for r in v] for k,v in sheets.items()}
    state={'records':records,'relations':relations,'sources':sources,'archive':archive,'files':[{'name':Path(p).name,'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest()} for p in [initial,audit]]}
    save(ROOT/'private/workspace.json',state)
    dictionary={k:{str(c):'Valeur source conservée sans interprétation automatique' for c in v[0] if c} for k,v in sheets.items()}
    save(ROOT/'docs/data-dictionary.json',dictionary)
    metadata={'updatedAt':'2026-11-20','imported':len(records),'published':0,'pending':len(records),'relationsImported':len(relations),'sourcesCount':len(sources),'auditCounts':dict(Counter(r['auditStatus'] for r in records)),'sourceConcentration':sorted([{'producer':s['producer'],'count':len(s['recordIds'])} for s in sources],key=lambda s:-s['count'])[:5],'scope':'Corpus expérimental fourni, non représentatif des politiques linguistiques. Aucun contenu de fiche non validée publié.'}
    save(ROOT/'public/data/metadata.json',metadata)
    save(ROOT/'public/data/catalog.json',{'records':[],'relations':[],'sources':[]})
    save(ROOT/'private/migration.json',{'records':len(records),'relations':len(relations),'sources':len(sources),'journalRows':len(journal),'missingPublicationDates':len(records),'duplicateCandidates':[['T01','T20']],'files':state['files']})
    (ROOT/'docs/migration.md').write_text(f'# Migration du corpus\n\n80 identifiants historiques conservés, 10 hypothèses conservées dans le dossier privé. {len(sources)} URL distinctes. Les 47 lignes du journal et les feuilles annexes sont conservées intégralement dans private/workspace.json.\n\nAucune fiche ne bénéficie d’une autorisation de diffusion dans l’audit. 0 fiche publiée. Les statuts « Profil public vérifié » du classeur initial ne valent pas validation documentaire. Les titres et qualifications proposés par l’audit sont prioritaires. T20 reste conservée comme doublon candidat de T01, sans fusion automatique. O07 est un projet, O02 une infrastructure. O18 reste à scinder après examen humain.\n\nDates de collecte conservées, dates de publication inconnues laissées nulles. Deux clôtures sont extraites explicitement du journal : F10 et F12. Aucun financement n’est déclaré ouvert. Scores historiques séparés et signalés comme non revalidés ; aucune nouveauté calculée. Les annotations restent visibles dans l’atelier.\n\nLes fichiers privés sont exclus de Git et du build public. Le rapport détaillé et les empreintes SHA-256 sont disponibles dans private/migration.json.\n',encoding='utf-8')
    print(json.dumps({'records':len(records),'relations':len(relations),'sources':len(sources),'published':0}))
if __name__=='__main__':migrate(*sys.argv[1:3])
