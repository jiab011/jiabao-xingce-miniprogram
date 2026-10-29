const fs=require('fs'),path=require('path'),zlib=require('zlib'),catalog=require('./catalog.json'),indexes={};let styles=null;
function moduleInfo(id){const m=catalog.find(m=>m.id===id);if(!m)throw new Error('这个模块暂未接入');return m;}
function index(id){moduleInfo(id);if(indexes[id])return indexes[id];const result=JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(path.join(__dirname,id+'.json.br'))));indexes[id]=result;const keys=Object.keys(indexes);while(keys.length>2)delete indexes[keys.shift()];return result;}
function filtered(i,e){return i.papers.filter(p=>(!e.group||e.group==='all'||p.group===e.group)&&(!e.year||Number(e.year)===p.year)&&(!e.region||e.region===p.region));}
function publicPaper(p){return {id:p.id,title:p.title,year:p.year,region:p.region,group:p.group,count:p.count};}
function shuffle(a,rng=Math.random){a=a.slice();for(let j=a.length-1;j>0;j--){const k=Math.floor(rng()*(j+1));[a[j],a[k]]=[a[k],a[j]];}return a;}
function buildRun(i,e,rng){let entries=[],blocks=[];const origins={};
 function add(p,block){const ids=[];for(const id of block.ids){if(entries.includes(id))continue;entries.push(id);ids.push(id);const item=p.items.find(r=>r.id===id);origins[id]={paperId:p.id,title:p.title,year:p.year,region:p.region,group:p.group,no:item.no,module:i.module};}if(ids.length)blocks.push({materialId:block.materialId,ids});}
 if(e.kind==='paper'){const p=i.papers.find(p=>p.id===e.paperId);if(!p)throw new Error('未找到这套试卷');p.blocks.forEach(b=>add(p,b));}
 else if(e.kind==='random'){
  const count=Number(e.count);if(!Number.isInteger(count)||count<1||count>200)throw new Error('题数需在1至200之间');const papers=filtered(i,{group:e.scope||'all',year:e.year});const units=shuffle(papers.flatMap(p=>p.blocks.map(b=>({p,b}))),rng),seenRaw=new Set();
  for(const {p,b} of units){if(entries.length>=count)break;if(entries.length+b.ids.length>count)continue;if(b.ids.some(id=>seenRaw.has(i.meta[id].qid)))continue;add(p,b);b.ids.forEach(id=>seenRaw.add(i.meta[id].qid));}
  if(!entries.length)throw new Error('该范围需按整组材料抽题，请增加题数后重试');
 }else if(e.kind==='review'||e.kind==='wrongReview'||e.kind==='favorites'){
  if(!Array.isArray(e.ids)||!e.ids.length||e.ids.length>200||e.ids.some(id=>!Object.prototype.hasOwnProperty.call(i.meta,id)))throw new Error('题目列表无效');
  entries=[...new Set(e.ids)];blocks=[];for(const id of entries){const p=i.papers.find(p=>p.items.some(x=>x.id===id)),item=p.items.find(x=>x.id===id);origins[id]={paperId:p.id,title:p.title,year:p.year,region:p.region,group:p.group,no:item.no,module:i.module};const materialId=i.meta[id].materialId;if(materialId&&blocks.length&&blocks[blocks.length-1].materialId===materialId)blocks[blocks.length-1].ids.push(id);else blocks.push({materialId,ids:[id]});}
 }else throw new Error('练习方式无效');
 return {module:i.module,kind:e.kind,paperId:e.kind==='paper'?e.paperId:'',ids:entries,keys:Object.fromEntries(entries.map(id=>[id,i.keys[id]])),meta:Object.fromEntries(entries.map(id=>[id,i.meta[id]])),origins,blocks,requestedCount:e.kind==='random'?Number(e.count):entries.length,actualCount:entries.length};
}
function create(resources){return {async handle(e){
 if(e.action==='catalog')return {ok:true,modules:catalog};const i=index(e.module),info=moduleInfo(e.module);
 if(e.action==='papers'){const papers=filtered(i,e).filter(p=>!e.query||p.title.includes(String(e.query).slice(0,80)));return {ok:true,papers:papers.map(publicPaper),module:info};}
 if(e.action==='start')return {ok:true,run:buildRun(i,e)};
 if(e.action==='lookup'){if(!Array.isArray(e.ids)||e.ids.length>200)throw new Error('题目列表无效');return {ok:true,rows:e.ids.filter(id=>Object.prototype.hasOwnProperty.call(i.meta,id)).map(id=>({...i.meta[id],paper:i.papers.find(p=>p.items.some(x=>x.id===id)).title}))};}
 if(e.action==='search'){
  const query=String(e.query||'').trim().toLowerCase().replace(/\s+/g,'');if(!query||query.length>80)throw new Error('请输入1至80字的题干或选项关键词');const offset=Math.max(0,Math.min(5000,Number(e.offset)||0)),ids=Object.keys(i.search).filter(id=>i.search[id].includes(query));return {ok:true,total:ids.length,rows:ids.slice(offset,offset+20).map(id=>({...i.meta[id],paper:i.papers.find(p=>p.items.some(x=>x.id===id)).title})),next:offset+20<ids.length?offset+20:null};
 }
 if(e.action==='question'){
  if(!Object.prototype.hasOwnProperty.call(i.meta,e.id))throw new Error('题目未收录');const meta=i.meta[e.id];if(!styles)styles=JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(path.join(__dirname,'style-overrides.json.br'))));const [question,material]=await Promise.all([resources.read(e.id),meta.materialId&&e.includeMaterial!==false?resources.read(meta.materialId):Promise.resolve(null)]);const override=styles.questions[e.id]||{};const parts=rows=>(rows||[]).map(row=>row.type==='image'?{...row,formula:row.formula&&row.height<=90&&row.ratio<=16,bytes:resources.manifest[row.assetId].length,extension:resources.manifest[row.assetId].extension}:row);return {ok:true,question:{...question,stem:parts(override.stem||question.stem),analysis:parts(override.analysis||question.analysis),options:question.options.map(o=>({...o,content:parts(override.options&&override.options[o.label]||o.content)}))},material:material?{...material,content:parts(styles.materials[material.id]||material.content)}:null};
 }
 if(e.action==='asset'){
  if(!/^a[a-f0-9]{24}$/.test(e.id||'')||!Object.prototype.hasOwnProperty.call(resources.manifest,e.id))throw new Error('图片未收录');const entry=resources.manifest[e.id],offset=Number(e.offset),length=Number(e.length);if(!Number.isInteger(offset)||offset<0||!Number.isInteger(length)||length<1||length>300000||offset+length>entry.length)throw new Error('图片分段无效');return {ok:true,extension:entry.extension,data:(await resources.read(e.id)).subarray(offset,offset+length).toString('base64')};
 }
 if(e.action==='assets'){
  if(!Array.isArray(e.ids)||e.ids.length>12||!e.ids.length)throw new Error('图片列表无效');const ids=[...new Set(e.ids)];let size=0;ids.forEach(id=>{if(!/^a[a-f0-9]{24}$/.test(id)||!Object.prototype.hasOwnProperty.call(resources.manifest,id))throw new Error('图片未收录');size+=resources.manifest[id].length;});if(size>2100000)throw new Error('图片较多，请分批加载');const rows=await Promise.all(ids.map(async id=>({id,extension:resources.manifest[id].extension,data:(await resources.read(id)).toString('base64')})));return {ok:true,rows};
 }
 throw new Error('不支持的题库操作');
}};}
module.exports={create,index,moduleInfo,buildRun,filtered,publicPaper};
