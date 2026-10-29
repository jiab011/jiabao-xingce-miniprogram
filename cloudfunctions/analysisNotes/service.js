const crypto=require('crypto'),ink=require('./ink');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function input(event,questions){
 const qid=event.questionId;if(typeof qid!=='string'||!/^x[a-f0-9]{24}$/.test(qid)||!Object.prototype.hasOwnProperty.call(questions,qid))throw new Error('题目未收录');
 if(event.action==='list')return {qid};
 if(!['publish','validate'].includes(event.action)||event.editorVersion!==1)throw new Error('请重新打开解析笔记编辑窗口');
 if(typeof event.text!=='string'||Array.from(event.text).length>2000)throw new Error('文字请控制在2000字以内');
 const text=event.text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim(),strokes=ink.normalize(event.strokes);
 if(!text&&!strokes.some(s=>s.tool==='pen'))throw new Error('请写下文字或手写笔记');
 if(event.action==='publish'&&(!/^a[a-z0-9]{16,64}$/.test(event.requestId||'')||!Number.isSafeInteger(event.baseRevision)||event.baseRevision<0))throw new Error('请重新打开笔记后发布');
 return {qid,text,strokes,digest:hash(JSON.stringify({text,strokes})),requestId:event.requestId,baseRevision:event.baseRevision};
}
async function first(db,name,id){const r=await db.collection(name).where({_id:id}).limit(1).get();return r.data[0]||null;}
async function txGet(ref){try{const r=await ref.get(),row=Array.isArray(r.data)?r.data[0]:r.data;return row&&Object.keys(row).length?row:null;}catch(e){if(e.errCode===-502005||/not exist|not found|不存在|DOCUMENT_NOT_EXISTS/i.test(e.message||e.errMsg||''))return null;throw e;}}
function checkOwner(row,openid){if(row&&row.owner!==openid)throw new Error('只能修改自己的解析笔记');}
function ownView(row){return row?{revision:row.revision,text:row.text,strokes:row.strokes,updatedAt:row.updatedAt}:null;}
function receipt(row,data){const old=(row&&row.receipts||[]).find(r=>r.id===data.requestId);if(old&&old.digest!==data.digest)throw new Error('本次发布内容已改变，请重新发布');return old;}
function create(cloud,questions){
 async function decorate(rows,uid){const ids=[...new Set(rows.flatMap(r=>[r.imageFileID,r.author.avatarFileID]).filter(Boolean))],urls={};if(ids.length){try{const r=await cloud.getTempFileURL({fileList:ids});for(const f of r.fileList||[])if(f.tempFileURL)urls[f.fileID]=f.tempFileURL;}catch(_){}}
 return rows.map(r=>({...r,mine:r.author.uid===uid,imageUrl:urls[r.imageFileID]||r.imageFileID||'',author:{...r.author,avatarUrl:urls[r.author.avatarFileID]||''}}));}
 async function moderate(openid,data){let png=null;if(data.strokes.some(s=>s.tool==='pen'))png=ink.render(data.strokes);
 await Promise.all([data.text?cloud.openapi.security.msgSecCheck({openid,scene:2,version:2,content:data.text}).then(r=>{if(!r.result||r.result.suggest!=='pass')throw new Error('文字暂未通过检查，笔记草稿已保留');}):null,png?cloud.openapi.security.imgSecCheck({media:{contentType:'image/png',value:png}}).then(r=>{const code=r.errCode===undefined?r.errcode:r.errCode;if(code!==0)throw new Error('手写内容暂未通过检查，笔记草稿已保留');}):null]);return png;
 }
 return async(event,context)=>{
 const {OPENID:openid,APPID:appid}=context;if(!openid||!appid)throw new Error('请在微信小程序内操作');const data=input(event,questions),db=cloud.database(),uid=hash(appid+':'+openid).slice(0,32),id=hash(uid+':analysisNote:'+data.qid).slice(0,40),boardId=hash('analysisBoard:'+data.qid).slice(0,40);if(event.expectedUid!==uid)throw new Error('登录身份已更新，请到“我的”重新登录');
 if(event.action==='list'){const [board,mine]=await Promise.all([first(db,'study_usage',boardId),first(db,'study_notes',id)]);checkOwner(mine,openid);return {ok:true,uid,rows:await decorate(board&&board.rows||[],uid),mine:ownView(mine)};}
 const p=await first(db,'study_profiles',uid);checkOwner(p,openid);if(!p||!p.nickname)throw new Error('先到“我的”确认头像昵称');
 const previous=await first(db,'study_notes',id);checkOwner(previous,openid);const prior=receipt(previous,data);
 if(prior&&event.action==='publish')return {ok:true,revision:prior.revision,updatedAt:prior.updatedAt,duplicate:true,mine:ownView(previous)};
 if(event.action==='publish'&&(previous&&previous.revision||0)!==data.baseRevision)throw new Error('这条笔记已在其他设备更新，请重新打开后编辑');
 const png=await moderate(openid,data);if(event.action==='validate')return {ok:true,textChecked:!!data.text,imageChecked:!!png,imageBytes:png?png.length:0};
 let imageFileID='';if(png){const uploaded=await cloud.uploadFile({cloudPath:'analysis-notes/'+uid+'/'+data.qid+'/'+data.requestId+'-'+data.digest.slice(0,16)+'.png',fileContent:png});if(!uploaded.fileID)throw new Error('手写图片暂未保存，请稍后重试');imageFileID=uploaded.fileID;}
 const result=await db.runTransaction(async tx=>{const ref=tx.collection('study_notes').doc(id),boardRef=tx.collection('study_usage').doc(boardId),row=await txGet(ref),board=await txGet(boardRef);checkOwner(row,openid);const old=receipt(row,data);if(old)return {ok:true,revision:old.revision,updatedAt:old.updatedAt,duplicate:true,mine:ownView(row)};if((row&&row.revision||0)!==data.baseRevision)throw new Error('这条笔记已在其他设备更新，请重新打开后编辑');
 const now=Date.now(),revision=(row&&row.revision||0)+1,author={uid,nickname:p.nickname,avatarFileID:p.avatarFileID||''},next={owner:openid,kind:'analysisNote',questionId:data.qid,text:data.text,strokes:data.strokes,imageFileID,author,revision,createdAt:row?row.createdAt:now,updatedAt:now,receipts:[...(row&&row.receipts||[]),{id:data.requestId,digest:data.digest,revision,updatedAt:now}].slice(-10)},publicRow={id,text:data.text,imageFileID,author,revision,updatedAt:now},rows=[publicRow,...(board&&board.rows||[]).filter(r=>r.author.uid!==uid)].slice(0,20);
 await ref.set({data:next});await boardRef.set({data:{kind:'analysisBoard',questionId:data.qid,rows,updatedAt:now}});return {ok:true,revision,updatedAt:now,mine:ownView(next)};});return result&&result.result||result;
 };
}
module.exports={create,input,hash};
