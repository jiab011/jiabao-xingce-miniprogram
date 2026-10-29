const http=require('http'),https=require('https');
const sources=require('./sources.json'),idioms=require('./idioms.json');
const pattern=new RegExp(idioms.sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
const cache=new Map();
function allowed(url){const u=new URL(url);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&!u.port&&(u.hostname==='12371.cn'||u.hostname.endsWith('.12371.cn')||u.hostname==='people.com.cn'||u.hostname.endsWith('.people.com.cn'));}
function fetchPage(url,redirects=0){return new Promise((resolve,reject)=>{
 if(!allowed(url)||redirects>3){reject(new Error('原文来源无效'));return;}
 const transport=url.startsWith('https:')?https:http;
 const request=transport.get(url,{headers:{'User-Agent':'Mozilla/5.0','Accept-Encoding':'identity'}},response=>{
  if(response.statusCode>=300&&response.statusCode<400&&response.headers.location){response.resume();resolve(fetchPage(new URL(response.headers.location,url).href,redirects+1));return;}
  if(response.statusCode!==200){response.resume();reject(new Error('原网站暂时无法访问'));return;}
  const chunks=[];let size=0;response.on('data',chunk=>{size+=chunk.length;if(size>2*1024*1024){request.destroy(new Error('原文页面过大'));return;}chunks.push(chunk);});response.on('end',()=>{try{const bytes=Buffer.concat(chunks),head=bytes.slice(0,8192).toString('latin1'),charset=(String(response.headers['content-type']||'').match(/charset=["']?([a-zA-Z0-9_-]+)/i)||head.match(/charset[ \t]*=[ \t]*["']?([a-zA-Z0-9_-]+)/i)||[])[1]||'utf-8';resolve(new (require('util').TextDecoder)(charset).decode(bytes));}catch(error){reject(error);}});response.on('error',reject);
 });request.setTimeout(8000,()=>request.destroy(new Error('读取原文超时')));request.on('error',reject);
});}
function plain(html){return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code<=0x10ffff?String.fromCodePoint(code):'';}).replace(/&(nbsp|amp|quot|apos|lt|gt|ldquo|rdquo|lsquo|rsquo);/g,(_,n)=>({nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',ldquo:'“',rdquo:'”',lsquo:'‘',rsquo:'’'}[n])).replace(/\s+/g,' ').trim();}
function characterCount(text){return Array.from(text.replace(/[\s…]/g,'')).length;}
function selectParagraph(html,term,quote){
 const blocks=[...html.matchAll(/<(p|h1)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>({tag:m[1].toLowerCase(),text:plain(m[2])})).filter(p=>p.text);
 const normalized=s=>s.replace(/\s/g,'');const q=normalized(quote),at=q.indexOf(term),left=at>=0?q.slice(Math.max(0,at-12),at):'',right=at>=0?q.slice(at+term.length,at+term.length+12):'';
 const rows=[];blocks.forEach((p,block)=>{const sentences=p.text.match(/[^。！？]+[。！？]+[”’」』]*|[^。！？]+$/g)||[p.text];sentences.forEach(text=>rows.push({text,block,tag:p.tag}));});
 let anchor=-1,best=-1;rows.forEach((r,i)=>{if(!r.text.includes(term))return;const t=normalized(r.text);let score=(t.includes(q)?1000:0)+(r.tag==='p'?20:0)+(left&&t.includes(left)?100:0)+(right&&t.includes(right)?100:0);if(score>best){anchor=i;best=score;}});
 if(anchor<0)throw new Error('暂未定位到这个例句的原文');
 let lo=anchor,hi=anchor;const join=()=>rows.slice(lo,hi+1).map((r,i,selected)=>(i&&r.block!==selected[i-1].block?'\n':'')+r.text).join('');
 let before=false;while(characterCount(join())<=100&&(lo>0||hi<rows.length-1)){if((before&&lo>0)||hi===rows.length-1)lo--;else hi++;before=!before;}
 const text=join();if(characterCount(text)<=100)throw new Error('原文不足以展示完整上下文，请稍后重试');
 return text;
}
function parts(text,term,cues=[]){const ranges=[];for(const m of text.matchAll(new RegExp(term,'g')))ranges.push({s:m.index,e:m.index+term.length,kind:'target'});pattern.lastIndex=0;for(const m of text.matchAll(pattern)){const s=m.index,e=s+m[0].length;if(!ranges.some(r=>s<r.e&&e>r.s))ranges.push({s,e,kind:'keyword'});}const cueRanges=[];for(const cue of cues){let p=text.indexOf(cue);while(p>=0){cueRanges.push([p,p+cue.length]);p=text.indexOf(cue,p+cue.length);}}const bounds=new Set([0,text.length]);ranges.forEach(r=>{bounds.add(r.s);bounds.add(r.e);});cueRanges.forEach(r=>{bounds.add(r[0]);bounds.add(r[1]);});const points=[...bounds].sort((a,b)=>a-b),out=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],r=ranges.find(r=>r.s<=a&&r.e>=b);out.push({text:text.slice(a,b),kind:r?r.kind:'plain',cue:cueRanges.some(r=>r[0]<=a&&r[1]>=b)});}return out;}
async function read(wordId,index){const word=sources[wordId];if(!word||!Number.isInteger(index)||index<0||index>=word.examples.length)throw new Error('未找到这个例句的出处');const source=word.examples[index],key=wordId+':'+index;let result=cache.get(key);if(result&&Date.now()-result.at<3600000)return result.value;const html=await fetchPage(source.url),passage=selectParagraph(html,word.term,source.quote);const value={ok:true,title:source.title,site:source.site,date:source.date,parts:parts(passage,word.term,source.cues),paragraphVerified:true,completeSentence:true,characters:characterCount(passage)};cache.set(key,{at:Date.now(),value});if(cache.size>64)cache.delete(cache.keys().next().value);return value;}
module.exports={read,allowed,plain,selectParagraph,parts,characterCount};
