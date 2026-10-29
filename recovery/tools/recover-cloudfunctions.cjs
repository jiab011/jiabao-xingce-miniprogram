const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const JSZip = require('C:/Users/jiabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip');
const root = path.resolve(__dirname, '..');
const source = 'C:/Users/jiabao/Desktop/微信小程序';
const archiveRoot = path.join(root, 'cloud-function-archives');
const functionRoot = path.join(root, 'cloudfunctions');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  fs.mkdirSync(archiveRoot, {recursive:true});
  const results = [];
  for (const name of ['analysisNotes','examBank','studyNotes']) {
    const archiveName = name + '.zip';
    const archiveBytes = fs.readFileSync(path.join(source,archiveName));
    const backupPath = path.join(archiveRoot,archiveName);
    fs.writeFileSync(backupPath,archiveBytes,{flag:'wx'});
    if (sha256(fs.readFileSync(backupPath)) !== sha256(archiveBytes)) throw new Error('Backup hash mismatch: '+name);
    const archive = await JSZip.loadAsync(archiveBytes,{checkCRC32:true});
    const destinationRoot = path.resolve(functionRoot,name);
    const files=[];
    for (const entry of Object.values(archive.files)) {
      if (entry.dir || /(^|\/)node_modules\//.test(entry.name)) continue;
      const destination = path.resolve(destinationRoot,entry.name);
      if (!destination.startsWith(destinationRoot+path.sep)) throw new Error('Unsafe archive path: '+entry.name);
      const bytes = await entry.async('nodebuffer');
      fs.mkdirSync(path.dirname(destination),{recursive:true});
      fs.writeFileSync(destination,bytes,{flag:'wx'});
      if (entry.name.endsWith('.js')) new vm.Script(bytes.toString('utf8'),{filename:name+'/'+entry.name});
      files.push({path:entry.name,bytes:bytes.length,sha256:sha256(bytes)});
    }
    const packageInfo=JSON.parse(fs.readFileSync(path.join(destinationRoot,'package.json'),'utf8'));
    results.push({name,archiveBytes:archiveBytes.length,archiveSha256:sha256(archiveBytes),archiveEntries:Object.keys(archive.files).length,sourceFileCount:files.length,dependencies:packageInfo.dependencies||{},files});
  }
  fs.writeFileSync(path.join(root,'cloud-recovery-manifest.json'),JSON.stringify({date:'2026-10-26',note:'Deployed source files extracted without node_modules; complete dependency archives preserved separately. CRC32 checked for all ZIP entries; first-party JavaScript syntax checked without execution.',functions:results},null,2),{flag:'wx'});
  console.log(JSON.stringify(results.map(({name,archiveEntries,sourceFileCount,dependencies})=>({name,archiveEntries,sourceFileCount,dependencies}))));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
