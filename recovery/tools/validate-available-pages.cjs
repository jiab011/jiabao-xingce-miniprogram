// Diagnostic build only. Missing pages are excluded from this disposable copy;
// the complete recovery project retains all original routes and is not uploaded.
const fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');
const dep=createRequire(path.join(__dirname,'../tool-dependencies/package.json'));
const ci=dep('miniprogram-ci');
const root=path.resolve(__dirname,'..'),source=path.join(root,'restored-project'),validation=path.join(root,'validation-project');
fs.mkdirSync(validation,{recursive:true});
fs.cpSync(path.join(source,'miniprogram'),path.join(validation,'miniprogram'),{recursive:true});
const config=JSON.parse(fs.readFileSync(path.join(source,'project.config.json'),'utf8'));
config.projectname='recovery-diagnostic-build-only';delete config.cloudfunctionRoot;
fs.writeFileSync(path.join(validation,'project.config.json'),JSON.stringify(config,null,2));
const appFile=path.join(validation,'miniprogram/app.json'),app=JSON.parse(fs.readFileSync(appFile,'utf8'));
app.subPackages=app.subPackages.filter(pack=>pack.pages.every(page=>fs.existsSync(path.join(validation,'miniprogram',pack.root,page+'.wxml'))));
delete app.preloadRule;
fs.writeFileSync(appFile,JSON.stringify(app,null,2));
const timer=setTimeout(()=>{console.log(JSON.stringify({status:'timeout'}));process.exit(2);},90000);
(async()=>{
 const project=new ci.Project({appid:config.appid,type:'miniProgram',projectPath:validation,privateKeyPath:'C:/Users/jiabao/Downloads/private.wx54427ecbe711c90c.key',ignores:['node_modules/**/*']});
 const result=await ci.getCompiledResult({project,setting:{es6:true,enhance:true,minified:true},threads:1},path.join(root,'diagnostic-compiled.zip'));
 const report={status:'compiled',fileCount:Object.keys(result).length,pageCount:app.pages.length+app.subPackages.reduce((sum,pack)=>sum+pack.pages.length,0),uploaded:false};
 fs.writeFileSync(path.join(root,'diagnostic-compile-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(error=>{const message=String(error.message||error).replace(/(?:\d{1,3}\.){3}\d{1,3}/g,'[redacted IP]');fs.writeFileSync(path.join(root,'diagnostic-compile-report.json'),JSON.stringify({status:'failed',message,uploaded:false},null,2));console.log(JSON.stringify({status:'failed',message}));process.exitCode=1;}).finally(()=>{clearTimeout(timer);setTimeout(()=>process.exit(process.exitCode||0),100);});
