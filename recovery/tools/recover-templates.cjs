// Static recovery of this application's GlassEasel compiled templates and styles.
// The input application code is parsed as AST, never executed.
const fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');
const dep=createRequire(path.join(__dirname,'../tool-dependencies/package.json'));
const parser=dep('@babel/parser'),generate=dep('@babel/generator').default;
const root=path.resolve(__dirname,'..'),input=path.join(root,'unpacked'),output=path.join(root,'restored-project/miniprogram');
const diagnostics=[],templates=new Map(),styles=new Map(),sharedStyles=new Map(),wxsScripts=new Map();
const clone=n=>n==null?n:JSON.parse(JSON.stringify(n));
const id=name=>({type:'Identifier',name});
const code=n=>generate(n,{comments:false,compact:false,jsescOption:{quotes:'single'}}).code;
function walk(n,visit){if(!n||typeof n!=='object')return;visit(n);for(const[k,v]of Object.entries(n)){if(['loc','start','end','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,visit));else if(v&&typeof v==='object')walk(v,visit);}}
function files(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(d,e.name)):[path.join(d,e.name)]);}
function prop(n){return n?.computed?n.property?.value:n?.property?.name;}
function key(n){return n?.type==='Identifier'?n.name:n?.value;}
function isFn(n){return n&&['ArrowFunctionExpression','FunctionExpression','FunctionDeclaration'].includes(n.type);}
function xml(s,attribute=false){s=String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return attribute?s.replace(/"/g,'&quot;'):s;}
class Scope{constructor(parent){this.parent=parent;this.values=new Map();}get(n){return this.values.has(n)?this.values.get(n):this.parent?.get(n);}set(n,v){this.values.set(n,v);}}
function scopeFor(fn,parent){const scope=new Scope(parent);for(const p of fn.params||[])if(p.type==='Identifier')scope.set(p.name,{parameter:true});for(const statement of fn.body?.body||[]){if(statement.type==='VariableDeclaration')for(const d of statement.declarations)if(d.id.type==='Identifier')scope.set(d.id.name,{node:d.init});if(statement.type==='FunctionDeclaration')scope.set(statement.id.name,{node:statement});}return scope;}
function resolveFn(node,scope){return isFn(node)?node:node?.type==='Identifier'&&isFn(scope.get(node.name)?.node)?scope.get(node.name).node:null;}
function scriptAlias(moduleName,ctx){const name='wxs_'+moduleName.replace(/[^a-zA-Z0-9_]/g,'_');ctx.wxs.set(name,moduleName+'.wxs');return name;}
function expression(node,scope,ctx,seen=new Set()){
 if(!node)return id('undefined');
 if(node.type==='Identifier'){
  if(seen.has(node.name))return clone(node);
  const binding=scope.get(node.name);
  if(binding?.alias)return id(binding.alias);
  if(binding?.node&&!isFn(binding.node)){const next=new Set(seen);next.add(node.name);return expression(binding.node,scope,ctx,next);}
  return clone(node);
 }
 if(node.type==='CallExpression'&&node.callee.type==='Identifier'&&['X','Y'].includes(node.callee.name))return expression(node.arguments[0],scope,ctx,seen);
 if(node.type==='CallExpression'&&node.callee.type==='MemberExpression'&&node.callee.object.name==='R'&&node.callee.computed&&typeof prop(node.callee)==='string')return id(scriptAlias(prop(node.callee),ctx));
 if(node.type==='MemberExpression'&&node.object.type==='Identifier'&&node.object.name==='D'){
  return node.computed?{type:'MemberExpression',object:id('__root'),computed:true,property:expression(node.property,scope,ctx,seen)}:id(node.property.name);
 }
 if(node.type==='MemberExpression'&&!node.computed)return {...clone(node),object:expression(node.object,scope,ctx,seen)};
 const result=clone(node);delete result.extra;
 for(const[k,v]of Object.entries(result)){if(['loc','start','end','type'].includes(k))continue;if(Array.isArray(v))result[k]=v.map(x=>x&&typeof x==='object'?expression(x,scope,ctx,seen):x);else if(v&&typeof v==='object'&&v.type)result[k]=expression(v,scope,ctx,seen);}
 return result;
}
function stringExpression(n){return n?.type==='StringLiteral'||n?.type==='CallExpression'&&n.callee.name==='Y'||n?.type==='BinaryExpression'&&n.operator==='+'&&(stringExpression(n.left)||stringExpression(n.right));}
function binding(node,scope,ctx,attribute=false){
 if(node?.type==='CallExpression'&&node.callee.name==='Y')return binding(node.arguments[0],scope,ctx,attribute);
 if(node?.type==='BinaryExpression'&&node.operator==='+'&&stringExpression(node))return binding(node.left,scope,ctx,attribute)+binding(node.right,scope,ctx,attribute);
 const expr=expression(node,scope,ctx);if(expr.type==='StringLiteral')return xml(expr.value,attribute);const raw=code(expr).replace(/"/g,'\\x22');parser.parseExpression(raw);return '{{'+raw+'}}';
}
function updateAlwaysTrue(node){if(node?.type==='Identifier'&&['C','K'].includes(node.name))return true;if(node?.type==='LogicalExpression'&&node.operator==='||')return updateAlwaysTrue(node.left)||updateAlwaysTrue(node.right);return false;}
function hasRender(node){let found=false;walk(node,n=>{if(n.type==='CallExpression'&&n.callee.type==='Identifier'&&['E','T','B','F'].includes(n.callee.name))found=true;});return found;}
function nodeBlock(children,attrs={}){return {tag:'block',attrs,children};}
function renderFn(fn,parent,ctx,aliases={}){if(!fn)return[];const scope=scopeFor(fn,parent);for(const[n,a]of Object.entries(aliases))scope.set(n,{alias:a});const statements=fn.body.type==='BlockStatement'?fn.body.body:[{type:'ExpressionStatement',expression:fn.body}];return renderStatements(statements,scope,ctx);}
function renderStatements(statements,scope,ctx){const result=[];for(const s of statements||[]){
 if(s.type==='VariableDeclaration'){for(const d of s.declarations)if(d.id.type==='Identifier')scope.set(d.id.name,{node:d.init});continue;}
 if(s.type==='BlockStatement'){result.push(...renderStatements(s.body,new Scope(scope),ctx));continue;}
 if(s.type==='IfStatement'){
  if(!hasRender(s))continue;
  if(updateAlwaysTrue(s.test)){result.push(...renderStatements(s.consequent.type==='BlockStatement'?s.consequent.body:[s.consequent],scope,ctx));continue;}
  let current=s,first=true;
  while(current?.type==='IfStatement'){
   const children=renderStatements(current.consequent.type==='BlockStatement'?current.consequent.body:[current.consequent],new Scope(scope),ctx);
   result.push(nodeBlock(children,{[first?'wx:if':'wx:elif']:binding(current.test,scope,ctx,true)}));first=false;
   if(current.alternate?.type==='IfStatement')current=current.alternate;else{if(current.alternate)result.push(nodeBlock(renderStatements(current.alternate.type==='BlockStatement'?current.alternate.body:[current.alternate],new Scope(scope),ctx),{'wx:else':null}));break;}
  }continue;
 }
 if(s.type==='ExpressionStatement'){result.push(...renderExpression(s.expression,scope,ctx));continue;}
 if(['ReturnStatement','EmptyStatement','FunctionDeclaration'].includes(s.type))continue;
 if(hasRender(s))diagnostics.push({page:ctx.page,kind:'unhandled-render-statement',type:s.type});
 }return result;}
function renderExpression(n,scope,ctx){if(!n)return[];
 if(n.type==='SequenceExpression')return n.expressions.flatMap(e=>renderExpression(e,scope,ctx));
 if(n.type==='AssignmentExpression'){if(n.left.type==='Identifier')scope.set(n.left.name,{node:n.right});return[];}
 if(n.type==='ConditionalExpression'){
  if(updateAlwaysTrue(n.test))return renderExpression(n.consequent,scope,ctx);
  const consequent=renderExpression(n.consequent,scope,ctx),alternate=renderExpression(n.alternate,scope,ctx);
  if(consequent.length&&!alternate.length&&n.alternate.type==='CallExpression'&&n.alternate.callee.name==='T'&&n.alternate.arguments.length===0)return consequent;
  const ret=[];if(consequent.length)ret.push(nodeBlock(consequent,{'wx:if':binding(n.test,scope,ctx,true)}));if(alternate.length)ret.push(nodeBlock(alternate,{'wx:else':null}));return ret;
 }
 if(n.type!=='CallExpression'||n.callee.type!=='Identifier')return[];
 const call=n.callee.name,args=n.arguments;
 if(call==='T')return args.length?[{text:binding(args[0],scope,ctx)}]:[];
 if(call==='E'){
  if(args[0]?.type!=='StringLiteral'){diagnostics.push({page:ctx.page,kind:'dynamic-element'});return[];}
  const attrs=attributes(resolveFn(args[2],scope),scope,ctx),children=renderFn(resolveFn(args[3],scope),scope,ctx);
  return [{tag:args[0].value,attrs,children}];
 }
 if(call==='B'){const fn=resolveFn(args[1],scope);if(!fn)diagnostics.push({page:ctx.page,kind:'missing-branch-function'});return renderFn(fn,scope,ctx);}
 if(call==='F'){
  const fn=resolveFn(args[4],scope);if(!fn){diagnostics.push({page:ctx.page,kind:'missing-loop-function'});return[];}
  const itemName=fn.params[1]?.name,indexName=fn.params[2]?.name;
  const aliases={};if(itemName)aliases[itemName]='item_'+itemName;if(indexName)aliases[indexName]='index_'+indexName;
  const attrs={'wx:for':binding(args[0],scope,ctx,true),'wx:for-item':aliases[itemName]||'item','wx:for-index':aliases[indexName]||'index'};
  if(args[1]?.type==='StringLiteral'&&args[1].value)attrs['wx:key']=xml(args[1].value,true);
  return[nodeBlock(renderFn(fn,scope,ctx,aliases),attrs)];
 }
 const fn=resolveFn(n.callee,scope);if(fn){diagnostics.push({page:ctx.page,kind:'direct-render-helper',name:call});return renderFn(fn,scope,ctx);}return[];
}
function attributes(fn,parent,ctx){const attrs={};if(!fn)return attrs;const scope=scopeFor(fn,parent);
 function visit(n){if(!n||isFn(n))return;
  if(n.type==='VariableDeclaration'){for(const d of n.declarations)if(d.id.type==='Identifier')scope.set(d.id.name,{node:d.init});return;}
  if(n.type==='CallExpression'){
   const method=n.callee.type==='Identifier'?n.callee.name:n.callee.type==='MemberExpression'&&n.callee.object.name==='R'?prop(n.callee):null;
   const a=n.arguments;if(a[0]?.type==='Identifier'&&a[0].name==='N'){
    if(['L','M'].includes(method)){const value=binding(a[1],scope,ctx,true);attrs.class=attrs.class?attrs.class+' '+value:value;return;}
    if(method==='O'&&a[1]?.type==='StringLiteral'){attrs[a[1].value]=binding(a[2],scope,ctx,true);return;}
    if(method==='d'&&a[1]?.type==='StringLiteral'){attrs['data-'+a[1].value.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=binding(a[2],scope,ctx,true);return;}
    if(method==='i'){attrs.id=binding(a[1],scope,ctx,true);return;}
    if(method==='y'){attrs.style=binding(a[1],scope,ctx,true);return;}
    if(method==='p'&&a[1]?.type==='StringLiteral'){attrs['change:'+a[1].value]=binding(a[2],scope,ctx,true);return;}
    if(method==='E'&&a.length===1)return;
    diagnostics.push({page:ctx.page,kind:'unhandled-attribute-method',method});return;
   }
  }
  if(n.type==='AssignmentExpression'&&n.left.type==='Identifier'){scope.set(n.left.name,{node:n.right});return;}
  for(const[k,v]of Object.entries(n)){if(['loc','start','end','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>x&&typeof x==='object'&&visit(x));else if(v&&typeof v==='object'&&v.type)visit(v);}
 }
 for(const s of fn.body?.body||[])visit(s);return attrs;
}
function serialize(nodes,indent=0){return nodes.map(n=>{if(n.text!==undefined)return n.text;const attrs=Object.entries(n.attrs||{}).map(([k,v])=>' '+k+(v===null?'':'="'+v+'"')).join('');if(!n.children?.length)return'  '.repeat(indent)+'<'+n.tag+attrs+' />\n';if(n.children.some(c=>c.text!==undefined)){const inner=n.children.map(c=>c.text!==undefined?c.text:serialize([c],0).trim()).join('');return'  '.repeat(indent)+'<'+n.tag+attrs+'>'+inner+'</'+n.tag+'>\n';}return'  '.repeat(indent)+'<'+n.tag+attrs+'>\n'+serialize(n.children,indent+1)+'  '.repeat(indent)+'</'+n.tag+'>\n';}).join('');}
function staticValue(n){if(!n)throw new Error('Missing static value');if(['StringLiteral','NumericLiteral','BooleanLiteral'].includes(n.type))return n.value;if(n.type==='UnaryExpression'&&n.operator==='-')return-staticValue(n.argument);if(n.type==='UnaryExpression'&&n.operator==='+')return+staticValue(n.argument);if(n.type==='ArrayExpression')return n.elements.map(staticValue);if(n.type==='NullLiteral')return null;throw new Error('Non-static CSS value '+n.type);}
function restoreCss(parts){return parts.map(p=>{if(typeof p==='string')return p;if(Array.isArray(p)){if(p[0]===0)return p[1]+'rpx';if(p[0]===1)return'';if(p[0]===2){if(typeof p[1]==='string')return'\n@import "'+p[1].replace(/^\.\//,'/')+'";\n';throw new Error('Numeric shared CSS reference '+p[1]);}}throw new Error('Unknown style token');}).join('').replace(/\bwx-([a-z][a-z-]*)\b/g,'$1').replace(/(^|[},\s])body(?=[\s,.#:{>+~[])/g,'$1page');}
for(const file of files(input).filter(f=>/\.js$/.test(f)&&!/(?:appservice|app-service)/.test(path.basename(f)))){
 const src=fs.readFileSync(file,'utf8');if(!src)continue;let ast;try{ast=parser.parse(src,{sourceType:'script'});}catch(error){diagnostics.push({file:path.relative(input,file),kind:'parse-error',message:error.message});continue;}
 walk(ast,node=>{
  if(node.type==='AssignmentExpression'&&node.left.type==='MemberExpression'&&node.left.object.name==='__COMMON_STYLESHEETS__'&&typeof prop(node.left)==='string')try{sharedStyles.set(prop(node.left),staticValue(node.right));}catch(error){diagnostics.push({kind:'shared-css',message:error.message});}
  if(node.type==='CallExpression'&&node.callee.name==='setCssToHead'&&node.arguments[0]?.type==='ArrayExpression'){
   const options=node.arguments.find(a=>a?.type==='ObjectExpression'),name=options?.properties.find(p=>key(p.key)==='path')?.value?.value;
   if(name)try{const text=restoreCss(staticValue(node.arguments[0]));if(styles.has(name)&&styles.get(name)!==text)diagnostics.push({kind:'different-css',name});styles.set(name,text);}catch(error){diagnostics.push({kind:'css',name,message:error.message});}
  }
  if(node.type!=='CallExpression'||node.callee.type!=='MemberExpression')return;
  if(prop(node.callee)==='batchAddCompiledScripts'){
   walk(node.arguments[0],n=>{if(n.type!=='CallExpression'||n.callee.name!=='D'||n.arguments[0]?.type!=='StringLiteral'||!isFn(n.arguments[1]))return;const fn=n.arguments[1].body.body.find(s=>s.type==='FunctionDeclaration'&&s.params[0]?.name==='nv_require');if(!fn)return;const body=clone(fn.body);walk(body,x=>{if(x.type==='Identifier'&&x.name.startsWith('nv_'))x.name=x.name.slice(3);if(x.type==='StringLiteral'&&x.value.startsWith('nv_')){x.value=x.value.slice(3);delete x.extra;}});wxsScripts.set(n.arguments[0].value+'.wxs',body.body.map(s=>code(s)).join('\n')+'\n');});
  }
  if(prop(node.callee)!=='batchAddCompiledTemplate')return;
  const batch=node.arguments[0],returned=batch?.body?.body?.find(s=>s.type==='ReturnStatement')?.argument;if(returned?.type!=='ObjectExpression')return;
  for(const property of returned.properties){const page=key(property.key);if(typeof page!=='string')continue;const factories=[];walk(property.value,n=>{if(n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'&&n.left.object.name==='H'&&isFn(n.right))factories.push({name:prop(n.left),fn:n.right});});
   const ctx={page,wxs:new Map()},fragments=[];
   for(const {name,fn}of factories){const scope=scopeFor(fn,null),ret=fn.body.body.find(s=>s.type==='ReturnStatement')?.argument;const renderId=ret?.type==='ObjectExpression'?ret.properties.find(p=>key(p.key)==='C')?.value:null;const render=resolveFn(renderId,scope);if(!render){diagnostics.push({page,kind:'missing-root-render'});continue;}const nodes=renderFn(render,scope,ctx);fragments.push(name?serialize([{tag:'template',attrs:{name:xml(name,true)},children:nodes}]):serialize(nodes));}
   if(fragments.length){const imports=[...ctx.wxs].map(([alias,p])=>'<wxs module="'+alias+'" src="/'+p+'" />\n').join('');const text=imports+fragments.join('\n');if(templates.has(page)&&templates.get(page)!==text)diagnostics.push({page,kind:'different-template'});templates.set(page,text);}
  }
 });
}
function write(relative,contents){const destination=path.resolve(output,relative.replace(/^[/\\]+/,''));if(!destination.startsWith(output+path.sep))throw new Error('Unsafe output path');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,contents);}
for(const [name,parts]of sharedStyles)try{styles.set(name,restoreCss(parts));}catch(error){diagnostics.push({kind:'shared-css',name,message:error.message});}
for(const [name,text]of templates)write(name+'.wxml',text);
for(const [name,text]of styles)write(name,text);
for(const [name,text]of wxsScripts)write(name,text);
fs.writeFileSync(path.join(root,'template-recovery-report.json'),JSON.stringify({templateCount:templates.size,styleCount:styles.size,wxsCount:wxsScripts.size,templates:[...templates.keys()],styles:[...styles.keys()],wxs:[...wxsScripts.keys()],diagnostics},null,2));
console.log(JSON.stringify({templateCount:templates.size,styleCount:styles.size,wxsCount:wxsScripts.size,diagnosticCount:diagnostics.length,diagnostics:diagnostics.slice(0,20)}));
