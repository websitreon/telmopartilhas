import { handleApi } from '../_lib/api.js';
export async function onRequest(context){const api=await handleApi(context.request,context.env);return api||context.next();}
