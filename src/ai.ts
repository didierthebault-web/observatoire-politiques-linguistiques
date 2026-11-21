export interface DocumentaryService {available:boolean; analyze(document:string):Promise<unknown>}
export const documentaryService:DocumentaryService={available:false,async analyze(){throw new Error('Aucun service IA sécurisé configuré. Importez des propositions hors ligne dans l’atelier local.')}};
