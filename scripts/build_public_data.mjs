import {publish} from './documentary.mjs';
console.log(publish(new URL('..',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')));
