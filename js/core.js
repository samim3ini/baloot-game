// الحالة العامة وقواعد اللعب والحساب (منطق بلا واجهة)
const $=id=>document.getElementById(id),RED=c=>c.s%2==1;
let G,S=[0,0],D=Math.random()*4|0,RN=0,RT=0,mt;
const SPEEDS=[1.1,.7,.4];let SPD=1,STREAK=0;
const T=(f,ms,raw)=>{const t=RT;setTimeout(()=>{if(t==RT)f()},raw?ms:ms*SPEEDS[SPD])};
const hk=()=>G.mode=='h',isT=c=>hk()&&c.s==G.tr;
const val=(c,L)=>isT(c)?10+ST[c.r]:c.s==L?SN[c.r]:-1;
const pts=c=>isT(c)?PT[c.r]:PN[c.r];
const str=c=>isT(c)?10+ST[c.r]:SN[c.r];
const win=()=>G.t.reduce((a,b)=>val(b.c,G.t[0].c.s)>val(a.c,G.t[0].c.s)?b:a);
const sortH=h=>h.sort((a,b)=>a.s-b.s||SN[b.r]-SN[a.r]).reverse();
function hs(h,s){const x=h.filter(c=>c.s==s);return x.reduce((a,c)=>a+[0,0,3,1,4,0,0,2][c.r],0)+(x.length>2?1:0)}
function projItems(h){
 const it=[];
 for(let r=3;r<8;r++){const x=h.filter(c=>c.r==r);if(x.length==4){const v=r==7&&!hk()?400:100;it.push({v,k:v*100+r,cards:x})}}
 for(let s=0;s<4;s++){let run=[];const fl=()=>{if(run.length>=3){const L=run.length,v=L>=5?100:L==4?50:20;it.push({v,k:v*100+10+run[L-1].r,cards:run.slice()})}run=[]};
  for(let r=0;r<8;r++){const c=h.find(x=>x.s==s&&x.r==r);if(c)run.push(c);else fl()}fl()}
 return it}
function projOptions(h){
 const it=projItems(h),out=[];
 for(let m=1;m<(1<<it.length);m++){const sel=it.filter((_,j)=>m>>j&1),used=sel.flatMap(x=>x.cards);
  if(new Set(used).size==used.length)out.push({items:sel,v:sel.reduce((a,x)=>a+x.v,0),k:Math.max(...sel.map(x=>x.k))})}
 return out.sort((a,b)=>b.v-a.v||b.k-a.k)}
function setProj(i,o){G.pv[i]=o?o.items.map(x=>x.v):[];G.pcd[i]=o?o.items.map(x=>x.cards):[];G.pk[i]=o?o.k:0;G.pj[i]=o?Math.floor(o.k/100):0}
function legal(h,i){
 if(!G.t.length){if(G.cl&&hk()){const nt=h.filter(c=>c.s!=G.tr);if(nt.length)return nt}return h}
 const L=G.t[0].c.s,same=h.filter(c=>c.s==L);
 if(same.length){
  if(hk()&&L==G.tr){const mx=Math.max(...G.t.filter(t=>t.c.s==L).map(t=>ST[t.c.r])),up=same.filter(c=>ST[c.r]>mx);return up.length?up:same}
  return same}
 if(hk()){const tr=h.filter(c=>c.s==G.tr);
  if(tr.length&&win().i%2!=i%2){const mx=Math.max(-1,...G.t.filter(t=>t.c.s==G.tr).map(t=>ST[t.c.r])),up=tr.filter(c=>ST[c.r]>mx);return up.length?up:tr}}
 return h}
function isMaster(c){const pl=G.pl.flat();for(let r=0;r<8;r++)if(SN[r]>SN[c.r]&&!pl.some(x=>x.s==c.s&&x.r==r))return false;return true}
function sawaOK(){
 const pl=G.pl.flat(),me=G.h[0],o=[];
 for(let s=0;s<4;s++)for(let r=0;r<8;r++)if(![...pl,...me].some(x=>x.s==s&&x.r==r))o.push({s,r});
 return me.every(c=>!o.some(x=>x.s==c.s&&str(x)>str(c))&&!(hk()&&!isT(c)&&o.some(x=>x.s==G.tr)))}
function rp(a,o){if(hk())return a%10==5?Math.floor(a/10):Math.round(a/10);return a%10==5?a/5:Math.round(a/10)*2}
function pjP(i){return G.pv[i].reduce((a,v)=>a+(hk()?v/10:v==400?40:v/5),0)}
const HIST=[];
let RESULT=false;

// ===== القيد: كشف المخالفات وإثباتها =====
// المخالفة تُسجَّل لحظة اللعب مع «دليلها» (chk): ورقة لاحقة من يد المخالف تثبت أنه كان يملك ما تجاهله. لا يصح الطلب قبل ظهور الدليل.
const VT={cut:'قاطع',nodq:'ما دق بحكم',nobig:'ما كبّر بحكم',open:'ربّع في الدبل المقفل',ace:'إكة خاطئة',sawa:'سوا خاطئ'};
function violationOf(h,i,c){
 const LG=legal(h,i);if(LG.includes(c))return null;const v=vio0(h,i,c);v.leg=LG.map(x=>x.s*8+x.r);return v}
function vio0(h,i,c){
 if(!G.t.length)return {type:'open',why:'ربّع بالحكم في دبل مقفل وعنده غيره',chk:x=>x.s!=G.tr};
 const L=G.t[0].c.s;
 if(h.some(x=>x.s==L)){
  if(c.s!=L)return {type:'cut',why:'قطع '+SU[L]+' ثم ظهر معه منه',chk:x=>x.s==L};
  const mx=Math.max(...G.t.filter(t=>t.c.s==L).map(t=>ST[t.c.r]));
  return {type:'nobig',why:'لعب حكمًا أصغر مع وجود أعلى',chk:x=>x.s==L&&ST[x.r]>mx}}
 if(c.s!=G.tr)return {type:'nodq',why:'لم يدق بالحكم ثم ظهر معه حكم',chk:x=>x.s==G.tr};
 const mx=Math.max(-1,...G.t.filter(t=>t.c.s==G.tr).map(t=>ST[t.c.r]));
 return {type:'nobig',why:'دق بحكم أصغر مع وجود أعلى',chk:x=>x.s==G.tr&&ST[x.r]>mx}}
