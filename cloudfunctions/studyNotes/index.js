const cloud=require('wx-server-sdk');
const crypto=require('crypto');
const words=require('./words.json');
cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});
const NAMES={profiles:'study_profiles',notes:'study_notes',usage:'study_usage'};
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function safeText(value,max){if(typeof value!=='string')throw new Error('请输入文字');const text=value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();if(Array.from(text).length>max)throw new Error('文字太长，请稍作精简');return text;}
function wordId(value){if(typeof value!=='string'||!Object.prototype.hasOwnProperty.call(words,value))throw new Error('未找到这个成语');return value;}
async function first(collection,id){const r=await collection.where({_id:id}).limit(1).get();return r.data[0]||null;}
function own(row,openid){if(!row||row.owner!==openid)throw new Error('只能修改自己的内容');}
async function textStatus(openid,text){const r=await cloud.openapi.security.msgSecCheck({openid,scene:2,version:2,content:text});const suggest=r.result&&r.result.suggest;if(suggest==='pass')return 'published';if(suggest==='review')return 'pending';throw new Error('这段内容暂时无法公开，请修改后重试');}
async function avatarUrls(rows){const ids=[...new Set(rows.map(r=>r.author.avatarFileID).filter(Boolean))];if(!ids.length)return rows;const result=await cloud.getTempFileURL({fileList:ids});const urls={};(result.fileList||[]).forEach(f=>{if(f.tempFileURL)urls[f.fileID]=f.tempFileURL;});return rows.map(r=>({...r,author:{...r.author,avatarUrl:urls[r.author.avatarFileID]||''}}));}
exports.main=async event=>{
 try{
  const {OPENID,APPID}=cloud.getWXContext();if(!OPENID||!APPID)throw new Error('请在微信小程序内操作');
  if(event.action==='source')return await require('./source-reader').read(wordId(event.wordId),event.index);
  const db=cloud.database(),uid=hash(APPID+':'+OPENID).slice(0,32),now=Date.now();
  const profiles=db.collection(NAMES.profiles),notes=db.collection(NAMES.notes),usage=db.collection(NAMES.usage);
  const action=event.action;
  if(action==='login'){const p=await first(profiles,uid);return {ok:true,uid,profile:p?{nickname:p.nickname,avatarFileID:p.avatarFileID||''}:{}};}
  if(action==='profile'){
   const nickname=safeText(event.nickname,24);if(!nickname)throw new Error('请填写展示昵称');
   const file=typeof event.avatarFileID==='string'?event.avatarFileID:'';
   if(file&&!new RegExp('^cloud://[a-zA-Z0-9_.-]+/study-avatars/'+uid+'/[a-zA-Z0-9_.-]+$').test(file))throw new Error('请重新选择自己的头像');
   const status=await textStatus(OPENID,nickname);if(status!=='published')throw new Error('昵称正在检查，请稍后再试');
   await profiles.doc(uid).set({data:{owner:OPENID,nickname,avatarFileID:file,updatedAt:now}});
   return {ok:true,uid,profile:{nickname,avatarFileID:file}};
  }
  if(action==='readQuestionInk'||action==='saveQuestionInk')return await require('./question-ink').handle(event,db,OPENID,uid,now);
  const id=wordId(event.wordId);
  if(action==='wordDetail'||action==='wordQuestions')return require('./word-content').handle(event,id);
  const understandingId=hash(uid+':understanding:'+id).slice(0,40);
  if(action==='understandings'){
   const published=await notes.where({wordId:id,kind:'understanding',status:'published'}).orderBy('updatedAt','desc').limit(20).get(),mine=await first(notes,understandingId);
   const data=published.data.slice();if(mine&&!data.some(r=>r._id===mine._id)){own(mine,OPENID);data.unshift(mine);}
   const rows=data.map(r=>({id:r._id,text:r.text,status:r.status,mine:r.owner===OPENID,createdAt:r.createdAt,updatedAt:r.updatedAt,author:{uid:r.author.uid,nickname:r.author.nickname,avatarFileID:r.author.avatarFileID||''}}));
   return {ok:true,rows:await avatarUrls(rows)};
  }
  if(action==='saveUnderstanding'){
   const text=safeText(event.text,120);if(!text)throw new Error('请写下你的简易理解');const p=await first(profiles,uid);if(!p)throw new Error('先到“我的”确认头像昵称');
   const previous=await first(notes,understandingId);if(previous)own(previous,OPENID);const status=await textStatus(OPENID,text);
   await notes.doc(understandingId).set({data:{owner:OPENID,wordId:id,word:words[id],kind:'understanding',text,status,author:{uid,nickname:p.nickname,avatarFileID:p.avatarFileID||''},createdAt:previous?previous.createdAt:now,updatedAt:now}});
   return {ok:true,id:understandingId,text,status,updatedAt:now};
  }
  if(action==='list'){
   const limit=20,where={wordId:id,status:'published',kind:db.command.neq('understanding')};
   const cursor=Number(event.cursor);if(Number.isFinite(cursor)&&cursor>0)where.createdAt=db.command.lt(cursor);
   const result=await notes.where(where).orderBy('createdAt','desc').limit(limit).get();
   const mine=event.cursor?{data:[]}:await notes.where({wordId:id,owner:OPENID,status:db.command.neq('published'),kind:db.command.neq('understanding')}).orderBy('createdAt','desc').limit(20).get();
   const combined=[...mine.data,...result.data].sort((a,b)=>b.createdAt-a.createdAt);
   const rows=combined.map(r=>({id:r._id,wordId:id,text:r.text,createdAt:r.createdAt,updatedAt:r.updatedAt,status:r.status,mine:r.owner===OPENID,author:{uid:r.author.uid,nickname:r.author.nickname,avatarFileID:r.author.avatarFileID||''}}));
   return {ok:true,rows:await avatarUrls(rows),cursor:result.data.length===limit?result.data[result.data.length-1].createdAt:null};
  }
  if(action==='publish'){
   const text=safeText(event.text,2000);if(!text)throw new Error('先写下你的学习笔记');
   if(typeof event.requestId!=='string'||!/^n[a-z0-9]{12,64}$/.test(event.requestId))throw new Error('请重新保存这条笔记');
   const p=await first(profiles,uid);if(!p)throw new Error('先填写展示昵称和头像');
   const noteId=hash(uid+':'+event.requestId).slice(0,40),existing=await first(notes,noteId);
   if(existing){own(existing,OPENID);if(existing.wordId!==id)throw new Error('笔记与当前词条不匹配');return {ok:true,id:noteId,createdAt:existing.createdAt,status:existing.status};}
   const status=await textStatus(OPENID,text);
   await notes.doc(noteId).set({data:{owner:OPENID,wordId:id,word:words[id],kind:'note',text,status,author:{uid,nickname:p.nickname,avatarFileID:p.avatarFileID||''},createdAt:now,updatedAt:now}});
   return {ok:true,id:noteId,createdAt:now,status};
  }
  if(action==='delete'){
   if(typeof event.id!=='string'||!/^[a-f0-9]{40}$/.test(event.id))throw new Error('笔记不存在');
   const existing=await first(notes,event.id);own(existing,OPENID);if(existing.wordId!==id)throw new Error('笔记与当前词条不匹配');
   await notes.doc(event.id).remove();return {ok:true};
  }
  const usageId=hash(uid+':'+id).slice(0,40);
  if(action==='readUsage'){const r=await first(usage,usageId);if(r)own(r,OPENID);return {ok:true,fields:r?r.fields:{},updatedAt:r?r.updatedAt:0};}
  if(action==='saveUsage'){
   const input=event.fields;if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('修改内容无效');
   const fields={};for(const key of Object.keys(input)){if(!/^(context[0-9]|signal|signalGuide|trap)$/.test(key))throw new Error('不能修改公共底稿');fields[key]=safeText(input[key],500);}
   await usage.doc(usageId).set({data:{owner:OPENID,wordId:id,fields,updatedAt:now}});return {ok:true,updatedAt:now};
  }
  throw new Error('不支持的操作');
 }catch(error){console.error('studyNotes failure',error&&error.errCode||'request',error&&error.message);return {ok:false,message:error&&error.message||'暂时无法完成，请稍后再试'};}
};
