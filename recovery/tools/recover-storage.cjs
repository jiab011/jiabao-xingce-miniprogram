const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const JSZip=require('C:/Users/jiabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip');
const root=path.resolve(__dirname,'..'),source='C:/Users/jiabao/Desktop/微信小程序';
const checklist=JSON.parse(fs.readFileSync(path.join(root,'storage-download-checklist.json'),'utf8'));
const resources=JSON.parse(fs.readFileSync(path.join(root,'cloud-data-readable/examBank/manifest.json'),'utf8'));
const required=new Map(checklist.packs.map(p=>[p.name,p])),found=new Map();
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function files(dir,depth=0){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isSymbolicLink()?[]:e.isDirectory()&&depth<3&&e.name!=='node_modules'?files(path.join(dir,e.name),depth+1):e.isFile()?[path.join(dir,e.name)]:[]);}
(async()=>{
 const local=files(source);
 for(const file of local)if(required.has(path.basename(file)))found.set(path.basename(file),fs.readFileSync(file));
 for(const file of local.filter(f=>f.endsWith('.zip')&&!/^(analysisNotes|examBank|studyNotes)\.zip$/.test(path.basename(f)))){
  const zip=await JSZip.loadAsync(fs.readFileSync(file));
  for(const entry of Object.values(zip.files))if(!entry.dir&&required.has(path.posix.basename(entry.name))){const name=path.posix.basename(entry.name),bytes=await entry.async('nodebuffer');if(found.has(name)&&!found.get(name).equals(bytes))throw new Error('Different copies of resource pack: '+name);found.set(name,bytes);}
 }
 const reports=[];
 for(const pack of checklist.packs){const destination=path.join(root,'cloud-storage',pack.path);let bytes=found.get(pack.name);if(!bytes&&fs.existsSync(destination))bytes=fs.readFileSync(destination);if(!bytes)continue;if(bytes.length<pack.expectedMinimumBytes)throw new Error('Truncated resource pack: '+pack.name);
  let checked=0;for(const entry of Object.values(resources).filter(e=>e.pack===pack.name)){if(sha(bytes.subarray(entry.offset,entry.offset+entry.length))!==entry.sha256)throw new Error('Resource hash mismatch in '+pack.name+' at '+entry.offset);checked++;}
  fs.mkdirSync(path.dirname(destination),{recursive:true});if(fs.existsSync(destination)){if(!fs.readFileSync(destination).equals(bytes))throw new Error('Existing resource backup differs: '+pack.name);}else fs.writeFileSync(destination,bytes,{flag:'wx'});
  reports.push({name:pack.name,path:pack.path,bytes:bytes.length,sha256:sha(bytes),verifiedResources:checked});
 }
 const report={requiredPacks:checklist.packs.length,recoveredPacks:reports.length,verifiedResources:reports.reduce((n,p)=>n+p.verifiedResources,0),missingPacks:checklist.packs.map(p=>p.name).filter(name=>!reports.some(p=>p.name===name)),packs:reports};
 fs.writeFileSync(path.join(root,'storage-recovery-manifest.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({requiredPacks:report.requiredPacks,recoveredPacks:report.recoveredPacks,verifiedResources:report.verifiedResources,missingPacks:report.missingPacks}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
