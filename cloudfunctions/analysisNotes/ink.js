const zlib=require('zlib');
const WIDTH=640,HEIGHT=480;
function normalize(value){
 if(!Array.isArray(value)||value.length>200)throw new Error('手写内容较多，请精简后再发布');let count=0;
 const strokes=value.map(s=>{if(!s||!['pen','eraser'].includes(s.tool)||!['#202124','#f25561'].includes(s.color)||!Number.isInteger(s.width)||s.width<10||s.width>500||!Array.isArray(s.points)||!s.points.length)throw new Error('手写笔记格式无效');
 count+=s.points.length;if(count>8000)throw new Error('手写内容较多，请精简后再发布');
 return {tool:s.tool,color:s.color,width:s.width,points:s.points.map(p=>{if(!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isInteger(n)||n<0||n>10000))throw new Error('手写坐标无效');return p.slice();})};});
 if(JSON.stringify(strokes).length>300000)throw new Error('手写内容较多，请精简后再发布');return strokes;
}
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let n=0xffffffff;for(const v of b)n=table[(n^v)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
function chunk(type,b){const t=Buffer.from(type),size=Buffer.alloc(4),sum=Buffer.alloc(4);size.writeUInt32BE(b.length);sum.writeUInt32BE(crc(Buffer.concat([t,b])));return Buffer.concat([size,t,b,sum]);}
function render(strokes){
 const pixels=Buffer.alloc(WIDTH*HEIGHT*3,255);let work=0;
 function disk(x,y,r,c){const x0=Math.max(0,Math.floor(x-r)),x1=Math.min(WIDTH-1,Math.ceil(x+r)),y0=Math.max(0,Math.floor(y-r)),y1=Math.min(HEIGHT-1,Math.ceil(y+r));work+=(x1-x0+1)*(y1-y0+1);if(work>12000000)throw new Error('手写线条过密，请精简后再发布');for(let iy=y0;iy<=y1;iy++)for(let ix=x0;ix<=x1;ix++)if((ix-x)**2+(iy-y)**2<=r*r){const at=(iy*WIDTH+ix)*3;pixels[at]=c[0];pixels[at+1]=c[1];pixels[at+2]=c[2];}}
 for(const s of strokes){const color=s.tool==='eraser'?[255,255,255]:s.color==='#f25561'?[242,85,97]:[32,33,36],r=Math.max(.6,s.width/10000*WIDTH/2),points=s.points.map(p=>[p[0]/10000*(WIDTH-1),p[1]/10000*(HEIGHT-1)]);disk(points[0][0],points[0][1],r,color);for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/Math.max(1,r*.6)));for(let j=1;j<=steps;j++)disk(a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps,r,color);}}
 const raw=Buffer.alloc((WIDTH*3+1)*HEIGHT);for(let y=0;y<HEIGHT;y++)pixels.copy(raw,y*(WIDTH*3+1)+1,y*WIDTH*3,(y+1)*WIDTH*3);
 const header=Buffer.alloc(13);header.writeUInt32BE(WIDTH);header.writeUInt32BE(HEIGHT,4);header[8]=8;header[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
module.exports={normalize,render,WIDTH,HEIGHT};
