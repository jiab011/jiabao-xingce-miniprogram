const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const dep=createRequire(path.join(__dirname,'../tool-dependencies/package.json'));
const parser=dep('@babel/parser'),generate=dep('@babel/generator').default;
const root=path.resolve(__dirname,'..'),project=path.join(root,'restored-project'),mini=path.join(project,'miniprogram');
const config=JSON.parse(fs.readFileSync(path.join(root,'unpacked/__APP__/app-config.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'module-recovery-manifest.json'),'utf8'));
const known=new Set(manifest.modules.map(m=>m.module)),missingImports=[];
function walk(n,visit){if(!n||typeof n!=='object')return;visit(n);for(const[k,v]of Object.entries(n)){if(['loc','start','end','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,visit));else if(v&&typeof v==='object')walk(v,visit);}}
function write(relative,text){const target=path.join(project,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);}
for(const entry of manifest.modules){const ast=parser.parse(fs.readFileSync(path.join(root,'recovered-code',entry.module),'utf8'));
 walk(ast,n=>{if(n.type!=='CallExpression'||n.callee.name!=='require'||n.arguments[0]?.type!=='StringLiteral')return;const spec=n.arguments[0].value;let candidate=spec.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(entry.module),spec)):spec.replace(/^\//,'');if(!candidate.endsWith('.js'))candidate+='.js';if(!known.has(candidate)){missingImports.push({module:entry.module,request:spec,candidate});return;}let relative=path.posix.relative(path.posix.dirname(entry.module),candidate);if(!relative.startsWith('.'))relative='./'+relative;n.arguments[0].value=relative;delete n.arguments[0].extra;});
 const result=generate(ast,{comments:true,compact:false}).code+'\n';new vm.Script(result,{filename:entry.module});write(path.join('miniprogram',entry.module),result);
}
fs.cpSync(path.join(root,'recovered-code/assets'),path.join(mini,'assets'),{recursive:true});
const subPackages=config.subPackages.map(pack=>({...pack,pages:config.pages.filter(page=>page.startsWith(pack.root)).map(page=>page.slice(pack.root.length))}));
const app={pages:config.pages.filter(page=>!subPackages.some(pack=>page.startsWith(pack.root))),window:config.global.window,subPackages,tabBar:{...config.tabBar,list:config.tabBar.list.map((tab,index)=>{const result={...tab,pagePath:tab.pagePath.replace(/\.html$/,'')};for(const[encoded,key]of [['iconData','iconPath'],['selectedIconData','selectedIconPath']]){if(result[encoded]){const file='assets/recovered-tabs/'+index+'-'+key+'.png';write(path.join('miniprogram',file),Buffer.from(result[encoded],'base64'));result[key]=file;delete result[encoded];}}return result;})}};
app.subPackages=app.subPackages.map(pack=>({...pack,name:pack.name||pack.root.replace(/\/$/,''),root:pack.root.replace(/\/$/,'')}));
for(const key of ['resizable','preloadRule','style','renderer','componentFramework'])if(config[key]!==undefined)app[key]=config[key];
for(const key of ['renderer','componentFramework'])if(app[key]&&typeof app[key]==='object')app[key]=app[key].default||Object.values(app[key])[0];
write('miniprogram/app.json',JSON.stringify(app,null,2));
for(const[page,settings]of Object.entries(config.page||{})){const name=page.replace(/\.html$/,'');write('miniprogram/'+name+'.json',JSON.stringify(settings.window||settings,null,2));}
function copyComponentJson(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())copyComponentJson(file);else if(entry.name.endsWith('.json')&&file.includes(path.sep+'components'+path.sep)){const rel=file.slice(file.indexOf(path.sep+'exam'+path.sep)+1);write(path.join('miniprogram',rel),fs.readFileSync(file));}}}
copyComponentJson(path.join(root,'unpacked'));
fs.cpSync(path.join(root,'cloudfunctions'),path.join(project,'cloudfunctions'),{recursive:true});
write('project.config.json',JSON.stringify({appid:'wx54427ecbe711c90c',projectname:'佳宝行测学习用-恢复工程',compileType:'miniprogram',miniprogramRoot:'miniprogram/',cloudfunctionRoot:'cloudfunctions/',cloudfunctionTemplateRoot:'cloudfunctionTemplate/',setting:{es6:true,enhance:true,minified:true,postcss:true,uploadWithSourceMap:true},packOptions:{ignore:[],include:[]}},null,2));
write('cloudbaserc.json',JSON.stringify({envId:'xingce-8877-d7gmih1gacff8de51'},null,2));
write('.gitignore','node_modules/\n*.key\n*.pem\n.env*\nproject.private.config.json\n');
const missingPageFiles=[];for(const page of config.pages)for(const ext of ['.js','.wxml','.json','.wxss'])if(!fs.existsSync(path.join(mini,page+ext)))missingPageFiles.push(page+ext);
const templateReport=JSON.parse(fs.readFileSync(path.join(root,'template-recovery-report.json'),'utf8'));
const result={pageCount:config.pages.length,recoveredModules:manifest.modules.length,missingPageFiles,missingImports,templateDiagnosticCount:templateReport.diagnostics.length,readyForDeployment:missingPageFiles.length===0&&missingImports.length===0&&templateReport.diagnostics.length===0};
fs.writeFileSync(path.join(root,'project-validation.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({pageCount:result.pageCount,recoveredModules:result.recoveredModules,missingPageFileCount:missingPageFiles.length,missingImportCount:missingImports.length,missingImports:missingImports.slice(0,15),readyForDeployment:result.readyForDeployment}));
