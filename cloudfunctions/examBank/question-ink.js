const crypto=require('crypto'),questions=JSON.parse(require('zlib').brotliDecompressSync(require('fs').readFileSync(require('path').join(__dirname,'resource-ids.json.br'))).toString('utf8'));
const FONTS=['28','32','36','40'],SURFACES=['question','analysis','workspace'],COLORS=['#202124','#f25561','#3b78ff','#f4be38'];
function sanitize(event){
 const qid=String(event.questionId||'');if(!/^[xm][a-f0-9]{24}$/.test(qid)||!Object.prototype.hasOwnProperty.call(questions,qid))throw new Error('题目未收录');
 if(event.action==='readQuestionInk')return {qid};
 if(!/^d[a-z0-9]{16,40}$/.test(event.device||''))throw new Error('标记设备信息无效');
 if(!Array.isArray(event.operations)||event.operations.length>300)throw new Error('标记数量过多，请稍后分批同步');let points=0;
 const operations=event.operations.map(v=>{if(!FONTS.includes(String(v.font))||!SURFACES.includes(v.surface)||!Number.isSafeInteger(v.seq)||v.seq<1||!['pen','eraser','clear'].includes(v.tool))throw new Error('标记格式无效');const row={font:String(v.font),surface:v.surface,seq:v.seq,tool:v.tool};if(v.legacyId&&/^[a-z0-9_]{1,64}$/.test(v.legacyId))row.legacyId=v.legacyId;if(v.tool!=='clear'){if(!COLORS.includes(v.color)||!Number.isFinite(v.width)||v.width<10||v.width>1500||!Array.isArray(v.points)||!v.points.length||v.points.length>1200)throw new Error('画笔数据无效');row.color=v.color;row.width=v.width;row.points=v.points.map(p=>{if(!Array.isArray(p)||p.length!==2||p.some((n,i)=>!Number.isInteger(n)||n<0||n>(row.surface==='workspace'&&i===1?1000000:10000)))throw new Error('标记坐标无效');return p.slice();});points+=row.points.length;}return row;}).sort((a,b)=>a.seq-b.seq);
 if(points>25000)throw new Error('本次标记较多，请分批同步');return {qid,device:event.device,operations};
}
function publicRow(row){return row?{version:2,revision:row.revision||0,layouts:row.layouts||{},heads:row.heads||{},updatedAt:row.updatedAt||0}:{version:2,revision:0,layouts:{},heads:{},updatedAt:0};}
function apply(existing,input,owner,now){
 if(existing&&existing.owner!==owner)throw new Error('只能读取或修改自己的标记');
 const row=existing?JSON.parse(JSON.stringify(existing)):{owner,kind:'questionInk',questionId:input.qid,version:2,revision:0,layouts:{},heads:{},legacySeen:{}};row.legacySeen=row.legacySeen||{};let head=row.heads[input.device]||0,changed=false;
 input.operations.forEach(op=>{if(op.seq<=head)return;head=op.seq;changed=true;if(op.legacyId&&row.legacySeen[op.legacyId])return;if(op.legacyId)row.legacySeen[op.legacyId]=true;const layout=row.layouts[op.font]||(row.layouts[op.font]={question:[],analysis:[]});if(!Array.isArray(layout[op.surface]))layout[op.surface]=[];if(op.tool==='clear')layout[op.surface]=[];else layout[op.surface].push({tool:op.tool,color:op.color,width:op.width,points:op.points});});
 row.heads[input.device]=head;if(changed){row.revision++;row.updatedAt=now;}if(JSON.stringify(row).length>650000)throw new Error('本题标记较多，请清空不需要的部分后重试');return row;
}
async function handle(event,db,owner,uid,now){const input=sanitize(event),id=crypto.createHash('sha256').update(uid+':questionInk:'+input.qid).digest('hex').slice(0,40);
 if(event.action==='readQuestionInk'){const r=await db.collection('study_usage').where({_id:id}).limit(1).get(),row=r.data[0];if(row&&row.owner!==owner)throw new Error('只能读取自己的标记');return {ok:true,document:publicRow(row)};}
 const result=await db.runTransaction(async tx=>{const ref=tx.collection('study_usage').doc(id);let row;try{const r=await ref.get();row=Array.isArray(r.data)?r.data[0]||null:r.data||null;if(row&&!Object.keys(row).length)row=null;}catch(e){if(e.errCode===-502005||/not exist|not found|不存在|DOCUMENT_NOT_EXISTS/i.test(e.message||e.errMsg||''))row=null;else throw e;}const next=apply(row,input,owner,now);delete next._id;await ref.set({data:next});return publicRow(next);});
 const document=result&&result.result?result.result:result;return {ok:true,document};
}
module.exports={sanitize,apply,publicRow,handle};
