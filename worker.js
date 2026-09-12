import { handleApi } from './functions/_lib/api.js';
export default { async fetch(request,env,ctx){ const api=await handleApi(request,env); if(api)return api; return env.ASSETS.fetch(request); } };
