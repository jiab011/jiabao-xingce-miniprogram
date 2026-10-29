// Compare recovered WXML with the original generated render functions using
// isolated, offline page defaults. No lifecycle callbacks or cloud APIs run.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const cheerio=require(path.join(root,'tools/unpacker-source/wxappUnpacker-main/node_modules/cheerio'));
const source=path.join(root,'restored-project/miniprogram');
const pages=new Map(),modules=new Map(),compileErrors=[];
const noop=()=>{};
const info={windowWidth:375,windowHeight:812,screenWidth:375,screenHeight:812,pixelRatio:2,statusBarHeight:20,platform:'devtools',safeArea:{top:20,bottom:780,left:0,right:375,width:375,height:760}};
const wx=new Proxy({cloud:{init:noop,callFunction(){throw new Error('Cloud API disabled in offline validation');}},getStorageSync:()=>'',getSystemInfoSync:()=>info,getWindowInfo:()=>info,getDeviceInfo:()=>info,getAppBaseInfo:()=>({SDKVersion:'3.14.0'}),getAccountInfoSync:()=>({miniProgram:{envVersion:'release'}}),getMenuButtonBoundingClientRect:()=>({top:24,left:280,width:80,height:32,bottom:56,right:360}),canIUse:()=>true},{get:(target,key)=>key in target?target[key]:noop});
const context=vm.createContext({wx,console:{log:noop,warn:noop,error:noop},Page(obj){pages.set(context.__moduleName,obj);},Component:noop,App:noop,getApp:()=>({globalData:{}}),setTimeout:()=>0,clearTimeout:noop,Promise,URL});
wx.base64ToArrayBuffer=encoded=>{context.__base64bytes=[...Buffer.from(encoded,'base64')];const value=new vm.Script('Uint8Array.from(__base64bytes).buffer').runInContext(context);delete context.__base64bytes;return value;};
function load(relative){relative=path.posix.normalize(relative.replace(/\\/g,'/'));if(!relative.endsWith('.js'))relative+='.js';if(modules.has(relative))return modules.get(relative).exports;const file=path.join(source,relative);if(!fs.existsSync(file))throw new Error('Unresolved module: '+relative);const module={exports:{}};modules.set(relative,module);const wrapper=new vm.Script('(function(require,module,exports){'+fs.readFileSync(file,'utf8')+'\n})',{filename:relative}).runInContext(context,{timeout:3000});const previous=context.__moduleName;context.__moduleName=relative;wrapper(request=>{if(!request.startsWith('.'))throw new Error('External module disabled: '+request);return load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),request)));},module,module.exports);context.__moduleName=previous;return module.exports;}
const config=JSON.parse(fs.readFileSync(path.join(source,'app.json'),'utf8'));
const routes=[...config.pages,...config.subPackages.flatMap(pack=>pack.pages.map(p=>pack.root+'/'+p))];
for(const route of routes){if(!fs.existsSync(path.join(source,route+'.js')))continue;try{load(route+'.js');}catch(error){compileErrors.push({page:route,error:String(error.message||error)});}}
const compiled=new Map();
const scriptNamespace=new Proxy({},{get:()=>()=>({sync:noop,reset:noop,start:noop,move:noop,end:noop})});
const renderContext=vm.createContext({window:{},navigator:{userAgent:'offline'},__wxAppCode__:{},setCssToHead:()=>noop,__wxCodeSpace__:{batchAddCompiledScripts:noop,batchAddCompiledTemplate(factory){const all=factory({}, scriptNamespace, {}, {A:noop,B:noop,C:noop}, noop, value=>value,value=>value==null?'':String(value),()=>true,{});for(const[name,resolve]of Object.entries(all))compiled.set(name,resolve(''));}},console:{log:noop,warn:noop,error:noop}});
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of files(path.join(root,'unpacked')).filter(f=>/chunk_\d+\.webview\.js$/.test(f))){try{new vm.Script(fs.readFileSync(file,'utf8')).runInContext(renderContext,{timeout:3000});}catch(error){compileErrors.push({file:path.relative(root,file),error:error.message});}}
function renderOriginal(factory,data){const result=[];const runtime=new Proxy({c:(node,value)=>node.attrs.class=String(value),m:(node,value)=>node.attrs.class=String(value),r:(node,key,value)=>node.attrs[key]=value,d:(node,key,value)=>node.attrs['data-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=value,y:(node,value)=>node.attrs.style=value,i:(node,value)=>node.attrs.id=value,p:noop,setEventListenerWrapper:noop,setFnFilter:noop},{get:(target,key)=>key in target?target[key]:()=>({sync:noop,reset:noop,start:noop,move:noop,end:noop})});
 const render=factory(runtime,true,data,true,undefined).C;
 function helpers(target){const T=value=>{if(value!==undefined&&value!==null)target.push({text:String(value)});};const E=(tag,options,attrs,child)=>{const node={tag,attrs:{},children:[]};attrs(node,true,noop);target.push(node);if(child)child(true,...helpers(node.children));};const B=(branch,fn)=>fn(true,...helpers(target));const F=(items,key,update,trace,fn)=>{if(!items)return;for(const[index,item]of Object.entries(items))fn(true,item,Array.isArray(items)?Number(index):index,true,undefined,[],...helpers(target));};return[T,E,B,F];}
 render(true,...helpers(result));return result;
}
function evaluate(expr,data){const scope=new Proxy({...data},{has:()=>true,get:(target,key)=>key===Symbol.unscopables?undefined:target[key]});return new vm.Script('(function(){with(__scope){return ('+expr+')}})()').runInNewContext({__scope:scope},{timeout:1000});}
function value(text,data){if(text.startsWith('{{')&&text.endsWith('}}')&&text.indexOf('}}')===text.length-2)return evaluate(text.slice(2,-2),data);return text.replace(/\{\{([\s\S]*?)\}\}/g,(_,expr)=>{const value=evaluate(expr,data);return value==null?'':String(value);});}
function renderRecovered(text,data){const $=cheerio.load(text,{xmlMode:true,decodeEntities:true});data={...data};$('wxs').each((_,node)=>{data[node.attribs.module]={sync:noop,reset:noop,start:noop,move:noop,end:noop};});
 function renderChildren(children,scope){const out=[];let chain=false;for(const node of children){if(node.type==='text'){if(node.data.trim()){const rendered=value(node.data,scope);out.push({text:rendered==null?'':String(rendered)});}continue;}if(node.type!=='tag'||node.name==='wxs')continue;const attrs=node.attribs||{};
  if('wx:if'in attrs){chain=!!value(attrs['wx:if'],scope);if(!chain)continue;}else if('wx:elif'in attrs){if(chain)continue;chain=!!value(attrs['wx:elif'],scope);if(!chain)continue;}else if('wx:else'in attrs){if(chain)continue;chain=true;}else chain=false;
  if('wx:for'in attrs){const items=value(attrs['wx:for'],scope)||[];for(const[index,item]of Object.entries(items)){const next={...scope,[attrs['wx:for-item']||'item']:item,[attrs['wx:for-index']||'index']:Array.isArray(items)?Number(index):index};const clone={...node,attribs:Object.fromEntries(Object.entries(attrs).filter(([key])=>!key.startsWith('wx:')))};out.push(...renderChildren([clone],next));}continue;}
  const nested=renderChildren(node.children||[],scope);if(node.name==='block'){out.push(...nested);continue;}
  const normalized={};for(const[key,raw]of Object.entries(attrs))if(!key.startsWith('wx:')&&!key.startsWith('change:'))normalized[key]=value(raw,scope);
  out.push({tag:node.name,attrs:normalized,children:nested});
 }return out;}
 return renderChildren($.root()[0].children,data);
}
function normalize(nodes){return nodes.map(node=>{if('text'in node)return {text:node.text};const attrs={};for(const[key,value]of Object.entries(node.attrs).sort(([a],[b])=>a.localeCompare(b))){if(typeof value==='function'||value===undefined)continue;attrs[key]=typeof value==='object'?JSON.parse(JSON.stringify(value)):value;}return{tag:node.tag,attrs,children:normalize(node.children)};});}
const results=[],skippedFixtures=[];
for(const[relative,page]of pages){const route=relative.replace(/\.js$/,'');const original=compiled.get(route),wxml=path.join(source,route+'.wxml');if(!original||!fs.existsSync(wxml))continue;
 const defaults=JSON.parse(JSON.stringify(page.data||{})),cases=[{name:'initial',data:defaults}];
 for(const[key,current]of Object.entries(defaults))if(typeof current==='boolean')cases.push({name:'toggle-'+key,data:{...defaults,[key]:!current}});
 if(route==='pages/profile/index')cases.push({name:'profile-editing-and-error',data:{...defaults,signedIn:true,editing:true,avatar:'/offline-avatar.png',editAvatar:'/offline-avatar.png',nickname:'离线核对',editNickname:'离线核对',profileError:'离线校验信息',shareNotes:true}});
 for(const fixture of cases){let a;try{a=normalize(renderOriginal(original,fixture.data));}catch(error){if(fixture.name==='initial')results.push({page:route,fixture:fixture.name,match:false,error:error.message});else skippedFixtures.push({page:route,fixture:fixture.name,reason:'Incomplete synthetic data for original renderer'});continue;}
  try{const b=normalize(renderRecovered(fs.readFileSync(wxml,'utf8'),fixture.data));const match=JSON.stringify(a)===JSON.stringify(b);results.push({page:route,fixture:fixture.name,match,originalRootNodes:a.length,recoveredRootNodes:b.length});if(!match){fs.mkdirSync(path.join(root,'render-comparisons'),{recursive:true});fs.writeFileSync(path.join(root,'render-comparisons',route.replaceAll('/','_')+'-'+fixture.name+'.json'),JSON.stringify({original:a,recovered:b},null,2));}}catch(error){results.push({page:route,fixture:fixture.name,match:false,error:error.message});}
 }
}
const report={capturedPageDefaults:pages.size,comparedPages:new Set(results.map(r=>r.page)).size,comparedFixtures:results.length,matchingFixtures:results.filter(r=>r.match).length,matchingInitialPages:results.filter(r=>r.fixture==='initial'&&r.match).length,compileErrors,skippedFixtures,results};fs.writeFileSync(path.join(root,'render-comparison-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:results.filter(r=>!r.match)},null,2));
