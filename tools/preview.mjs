// Development-only server for supervised browser QA. Production is dist/.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const args=process.argv.slice(2),port=Number(process.env.PORT||args[args.indexOf('--port')+1]||4173);
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://preview');let rel=decodeURIComponent(url.pathname);const root=rel==='/qa.html'?process.cwd():path.join(process.cwd(),'dist');rel=rel==='/qa.html'?'tests/browser.html':rel.replace(/^\//,'')||'index.html';const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep))throw Error('Bad path');const data=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.txt':'text/plain'})[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'0.0.0.0');
