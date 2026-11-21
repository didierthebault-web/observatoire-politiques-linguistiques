import {publish} from './documentary.mjs';
import {fileURLToPath} from 'node:url';
console.log(publish(fileURLToPath(new URL('..',import.meta.url))));
