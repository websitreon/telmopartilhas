import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
const files=["public/js/site.js","public/js/cloudflare-sync.js","public/js/admin.js","cloudflare/api.js","cloudflare/worker.js"];
for(const f of files){execFileSync(process.execPath,["--check",f],{stdio:"inherit"})}
for(const f of ["public/index.html","public/admin.html","public/_headers","public/data/content.js","public/data/default-state.json","public/robots.txt","public/sitemap.xml"]){if(!existsSync(f))throw new Error(`Missing required file: ${f}`)}
JSON.parse(readFileSync("public/data/default-state.json","utf8"));
console.log("Telmo Partilhas checks passed.");
