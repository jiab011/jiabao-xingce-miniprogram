const cloud=require('wx-server-sdk'),zlib=require('zlib'),fs=require('fs'),path=require('path');
cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});
const handle=require('./service').create(cloud,JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(path.join(__dirname,'resource-ids.json.br'))).toString('utf8')));
exports.main=async event=>{try{return await handle(event||{},cloud.getWXContext());}catch(e){console.error('analysisNotes',e.errCode||'request',e.message);return {ok:false,message:e.message||'暂时无法发布，草稿已保留'};}};
