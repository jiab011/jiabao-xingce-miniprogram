const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const source=process.env.WECHAT_PACKAGE_CACHE;
if(!source)throw new Error('Set WECHAT_PACKAGE_CACHE to the local published-package cache directory');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const manifest=[];let added=0;
for(const name of fs.readdirSync(source).filter(n=>n.endsWith('.wxapkg'))){const origin=path.join(source,name),target=path.join(root,'packages',name),bytes=fs.readFileSync(origin);if(fs.existsSync(target)){if(!fs.readFileSync(target).equals(bytes))throw new Error('Cached package changed; preserve versions separately: '+name);}else{fs.writeFileSync(target,bytes,{flag:'wx'});added++;}manifest.push({Name:name,Length:bytes.length,SHA256:hash(bytes).toUpperCase(),Source:origin});}
fs.writeFileSync(path.join(root,'package-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({newPackages:added,totalPackages:manifest.length}));
if(!added){console.log('No new packages; existing recovery files were not changed.');process.exit(0);}
for(const script of ['unpack.cjs','recover-modules.cjs','recover-templates.cjs','assemble-project.cjs']){const result=cp.spawnSync(process.execPath,[path.join(__dirname,script)],{stdio:'inherit',cwd:root});if(result.status!==0)process.exit(result.status||1);}
