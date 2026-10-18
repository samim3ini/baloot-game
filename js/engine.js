// محرك لعبة البلوت: القواعد والمزايدة والدبل واللعب والقيد والحساب ولاعبو الحاسوب.
// لا يلمس الصفحة ولا المؤقتات مباشرة، فيعمل في المتصفح (اللعب الفردي) وعلى الخادم (اللعب الجماعي) بالكود نفسه.
//
// الاستعمال:
//   const E=BalootEngine.create({
//     emit(ev){},            // يستقبل أحداث المحرك (state, say, splash, roundEnd, ...) لترسمها الواجهة أو تبثّها الشبكة
//     after(fn,ms,raw){},    // مؤقّت. raw=true: لا تُضرب المدة بمعامل سرعة اللعب
//     rand, now,             // اختياريان (للاختبار)
//     botMs:250, ackMs:0, falseFlip:true, playMs:{...}
//   });
//   E.setHuman(0,true); E.newGame();
// المقاعد 0..3 (الفريقان: 0 و2 ضد 1 و3). المقعد غير البشري يلعبه بوت.
// كل فعل بشري (bid, play, ...) يتحقق من المقعد والدور والمرحلة ويعيد true إن قُبل.
(function(root){
'use strict';

// ===== البيانات المشتركة =====
const SU=['♠','♥','♣','♦'],RK=['7','8','9','10','J','Q','K','A'];
const SN=[0,1,2,6,3,4,5,7],ST=[0,1,6,4,7,2,3,5],PN=[0,0,0,10,2,3,4,11],PT=[0,0,14,10,20,3,4,11];
const PJ={20:'سرا',50:'خمسين',100:'مئة',150:'مئة وخمسون',200:'مئتان',400:'أربعمئة'};
const PV=[20,50,100,400];
const DN=['دبل','ثري','فور','قهوة'];
const VT={cut:'قاطع',nodq:'ما دق بحكم',nobig:'ما كبّر بحكم',open:'ربّع في الدبل المقفل',ace:'إكة خاطئة',sawa:'سوا خاطئ',proj:'مشروع كاذب'};
const idc=c=>c.s*8+c.r;

function create(env){
 env=env||{};
 const emit=env.emit||(()=>{}),rnd=env.rand||Math.random,now=env.now||Date.now;
 const SOLVE_MS=env.botMs==null?250:env.botMs,NODE_CAP=env.botNodes>0?env.botNodes:Infinity,ACK_MS=env.ackMs||0,FLIP=env.falseFlip!==false;
 const PMS=Object.assign({bot:720,look:450,hold:300,sweep:250},env.playMs);
 const defAfter=(f,ms)=>setTimeout(f,ms);
 const sched=env.after||defAfter;
 const HIST=[],S=[0,0],humans=[false,false,false,false];
 let G=null,D=env.dealer==null?(rnd()*4|0):env.dealer,RN=0,RT=0,paused=0,PQ=[],W=null,QK=null;

 // after: مؤقّت يتوقف أثناء نافذة القيد (paused) ويسقط عند بدء جولة جديدة (RT).
 // free: مؤقّت لا يتوقف أثناء القيد. cue: قرار بوت يُلغى إن تغيّر الدور (G.sq).
 const after=(f,ms,raw)=>{const t=RT;sched(function run(){if(t!=RT)return;if(paused){PQ.push(run);return}f()},ms,raw)};
 const free=(f,ms,raw)=>{const t=RT;sched(()=>{if(t==RT)f()},ms,raw)};
 const cue=(f,ms)=>{const k=++G.sq;after(()=>{if(G.sq==k)f()},ms)};
 const changed=()=>emit({t:'state'}),say=(i,m)=>emit({t:'say',i,m}),splash=(text,lv,sub)=>emit({t:'splash',text,lv,sub});
 const resume=drop=>{paused=0;const q=PQ.splice(0);if(!drop){q.forEach(r=>r());botTurn()}};

 // ===== القواعد =====
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
  if(hk()){const tr=h.filter(c=>c.s==G.tr),w=win();
   // الشريك الرابح يعفيك من الدق فقط إن كانت ورقته الآس، أو ورقة أعلى أُعلنت إكة. وإلا فعليك الدق.
   if(tr.length&&(w.i%2!=i%2||(w.i==G.t[0].i&&w.c.r!=7&&!G.ann))){const mx=Math.max(-1,...G.t.filter(t=>t.c.s==G.tr).map(t=>ST[t.c.r])),up=tr.filter(c=>ST[c.r]>mx);return up.length?up:tr}}
  return h}
 function isMaster(c){const pl=G.pl.flat();for(let r=0;r<8;r++)if(SN[r]>SN[c.r]&&!pl.some(x=>x.s==c.s&&x.r==r))return false;return true}
 function sawaOK(seat){
  const pl=G.pl.flat(),me=G.h[seat],o=[];
  for(let s=0;s<4;s++)for(let r=0;r<8;r++)if(![...pl,...me].some(x=>x.s==s&&x.r==r))o.push({s,r});
  return me.every(c=>!o.some(x=>x.s==c.s&&str(x)>str(c))&&!(hk()&&!isT(c)&&o.some(x=>x.s==G.tr)))}
 function rp(a){if(hk())return a%10==5?Math.floor(a/10):Math.round(a/10);return a%10==5?a/5:Math.round(a/10)*2}
 function pjP(i){return G.pv[i].reduce((a,v)=>a+(hk()?v/10:v==400?40:v/5),0)}
 const pnames=i=>G.pv[i].map(v=>PJ[v]).join(' + ');

 // ===== القيد: كشف المخالفات =====
 // المخالفة تُسجَّل لحظة اللعب مع قائمة الأوراق النظامية وقتها (leg). ويُحكم على الطلب بمطابقته لمخالفة مسجَّلة.
 function violationOf(h,i,c){
  const LG=legal(h,i);if(LG.includes(c))return null;const v=vio0(h,i,c);v.leg=LG.map(idc);return v}
 function vio0(h,i,c){
  if(!G.t.length)return {type:'open',why:'ربّع بالحكم في دبل مقفل وعنده غيره'};
  const L=G.t[0].c.s;
  if(h.some(x=>x.s==L)){
   if(c.s!=L)return {type:'cut',why:'قطع '+SU[L]+' ثم ظهر معه منه'};
   return {type:'nobig',why:'لعب حكمًا أصغر مع وجود أعلى'}}
  if(c.s!=G.tr)return {type:'nodq',why:'لم يدق بالحكم ثم ظهر معه حكم'};
  return {type:'nobig',why:'دق بحكم أصغر مع وجود أعلى'}}

 // ===== التوزيع =====
 function deal(){
  RT++;RN++;W=null;QK=null;paused=0;PQ=[];
  const dk=[];for(let s=0;s<4;s++)for(let r=0;r<8;r++)dk.push({s,r});
  for(let i=dk.length-1;i>0;i--){const j=rnd()*(i+1)|0;[dk[i],dk[j]]=[dk[j],dk[i]]}
  G={h:[0,1,2,3].map(()=>dk.splice(0,5)),fl:dk.pop(),dk,t:[],pt:[0,0],tk:[0,0],tr:-1,mode:'',n:0,pj:[0,0,0,0],pl:[[],[],[],[]],bl:[0,0],pw:-1,buyer:-1,rd:1,turn:(D+1)%4,cnt:0,ph:'b',fd:{},dc:[0,0,0,0],tag:['','','',''],ash:false,pk:[0,0,0,0],dealer:D,pile:[0,0,0,0],nf:0,m:1,dt:-1,coffee:0,cl:0,dst:0,q:[],po:[[],[],[],[]],pv:[[],[],[],[]],pcd:[[],[],[],[]],ps:[0,0,0,0],nq:0,bq:[],sb:-1,rv:{},vio:[],tl:[],sq:0,cs:-1,qa:null,res:null,dd:[0,0,0,0],ann:0};
  G.h.forEach(sortH);
  emit({t:'deal',dealer:D});emit({t:'fresh'});
  bidStep()}

 // ===== المزايدة =====
 // G.cs: المقعد الذي ينتظره المحرك الآن (-1 لا أحد). botTurn يجدول قرار البوت إن كان صاحب الدور بوتًا.
 function botTurn(){
  if(!G||paused||G.qa)return;const s=G.cs;if(s<0||humans[s])return;
  cue(()=>botDecide(s),G.ph=='p'?PMS.bot:1500)}
 // قرار البوت للمرحلة الحالية (للمقعد s)
 function botDecide(s){
  const ph=G.ph,sn=()=>G.h[s].reduce((a,c)=>a+(c.r==7?3:c.r==3?1:0),0);
  if(ph=='b')botBid(s);
  else if(ph=='q')ansQ(s,sn()>=5);
  else if(ph=='f')ansF(s,sn()>=7);
  else if(ph=='d'){const h=G.h[s],st=G.dst,base=hk()?hs(h,G.tr)/12:sn()/10;ansD(s,rnd()<base*[.9,.5,.3,.2][st]?1:0)}
  else if(ph=='p')botPlay(s)}
 function bidStep(){G.cs=G.turn;changed();botTurn()}
 function bid(i,k,s){
  if(k=='p'){const pw=G.rd==1?'بس':'ولا';G.tag[i]=pw;G.ps[i]=1;say(i,pw);G.turn=(G.turn+1)%4;
   if(++G.cnt==4){if(G.rd==1){G.rd=2;G.cnt=0;G.tag=['','','',''];G.ps=[0,0,0,0]}
    else{say(-1,'الكل بس — إعادة التوزيع');D=(D+1)%4;G.ph='r';G.cs=-1;changed();return after(deal,2400)}}
   return bidStep()}
  if(k=='s'&&!G.nq){const qc=beforeCands(i);if(qc.length){G.sb=i;G.bq=qc;G.ph='q';G.tag[i]='صن';return qNext()}}
  if(k=='h'&&!G.nf){const c=flipCands(i);if(c.length){G.fb={i,s};G.fq=c;G.ph='f';G.tag[i]='حكم '+SU[s];return flipNext()}}
  const fb=k=='a'?(i+2)%4:i,lb=k=='h'?'حكم '+SU[s]:k=='a'?'أشكل':'صن';
  G.mode=k=='h'?'h':'s';G.tr=k=='h'?s:-1;G.buyer=i;G.ph='d';G.ash=k=='a';G.cs=-1;
  G.tag=['','','',''];say(i,lb);
  for(let j=0;j<4;j++)G.h[j].push(...G.dk.splice(0,j==fb?2:3));
  G.h[fb].push(G.fl);G.h.forEach(sortH);
  // البوتات تُعلن أفضل مشروع تلقائيًا، واللاعب البشري يُعلن مشروعه بنفسه
  for(let j=0;j<4;j++){G.po[j]=projOptions(G.h[j]);setProj(j,!humans[j]&&G.po[j].length?G.po[j][0]:null)}
  G.turn=(G.dealer+1)%4;G.fly=fb;emit({t:'fresh'});changed();
  after(()=>{G.fly=null;changed()},1500);after(dblStart,2800)}
 function flipCands(i){const f0=(G.dealer+1)%4;if(G.fl.r==7)return i==f0?[]:[f0];const pi=((i-f0)%4+4)%4;return [1,2,3].filter(p=>p>pi).map(p=>(f0+p)%4)}
 function flipNext(){
  if(!G.fq.length){G.nf=1;G.ph='b';bid(G.fb.i,'h',G.fb.s);G.nf=0;return}
  G.cs=G.fq.shift();changed();botTurn()}
 function ansF(c,y){
  if(G.ph!='f'||G.cs!=c)return;
  if(y){G.ph='b';return bid(c,'s')}
  G.tag[c]='بس';G.ps[c]=1;say(c,'بس');flipNext()}
 function beforeCands(i){const f0=(G.dealer+1)%4,pi=((i-f0)%4+4)%4;return [0,1,2,3].filter(p=>p<pi).map(p=>(f0+p)%4).filter(x=>G.ps[x])}
 function qNext(){
  if(!G.bq.length){G.nq=1;G.ph='b';bid(G.sb,'s');G.nq=0;return}
  G.cs=G.bq.shift();changed();botTurn()}
 function ansQ(c,y){
  if(G.ph!='q'||G.cs!=c)return;
  if(y){say(c,'قبلك');G.ph='b';G.nq=1;bid(c,'s');G.nq=0;return}
  const pw=G.rd==1?'بس':'ولا';G.tag[c]=pw;say(c,pw);qNext()}

 // ===== الدبل =====
 function dblStart(){const b=G.buyer%2,o=1-b;G.dst=0;if(hk()||(S[b]>100&&S[o]<=100))dblNext();else startPlay()}
 function dblNext(){
  const b=G.buyer%2,st=G.dst;
  if(st>3||(!hk()&&st>0))return startPlay();
  G.q=st==0?[0,1,2,3].map(k=>(G.buyer+1+k)%4).filter(x=>x%2!=b):st==2?[G.dp]:[G.buyer];askD()}
 function askD(){
  if(!G.q.length){G.cs=-1;return startPlay()}
  G.cs=G.q.shift();changed();botTurn()}
 function ansD(s,y,cl){
  if(G.ph!='d'||G.cs!=s)return;
  if(!y){G.tag[s]='بس';say(s,'بس');return askD()}
  const st=G.dst,two=hk()&&(st==0||st==2);G.dt=s%2;if(st==0)G.dp=s;if(st==3)G.coffee=1;G.m=Math.min(st+2,4);
  if(two)G.cl=cl===undefined?(rnd()<.3?1:0):(cl?1:0);else if(st==1||st==3)G.cl=0;
  {const sb=two?(G.cl?'مقفل':'مفتوح'):'',w=DN[st]+(sb?' '+sb:'');G.tag[s]=w;say(s,w);splash(DN[st]+'!',st+2,sb)}
  G.dst++;dblNext()}
 function startPlay(){G.ph='p';G.tag=['','','',''];G.turn=(G.dealer+1)%4;G.cs=-1;changed();after(next,1500)}

 // ===== اللعب =====
 function next(){
  if(G.ph!='p'||G.t.length==4)return;
  G.cs=G.turn;changed();botTurn()}
 function play(i,c,ak){
  if(G.ph!='p'||G.t.length>3)return;
  const vio=violationOf(G.h[i],i,c);
  if(!G.t.length&&G.n==0)G.ld=i;
  const ann=ak&&!G.t.length&&hk(),bad=ann&&(c.r==7||isT(c)||!isMaster(c));
  if(!G.t.length)G.ann=ann?1:0; // الإكة المعلنة على هذه الأكلة (تعفي الشريك القاطع من الدق)
  G.h[i].splice(G.h[i].indexOf(c),1);
  if(vio){vio.i=i;vio.c=c;G.vio.push(vio)}
  if(bad)G.vio.push({type:'ace',i,c,leg:[]});
  if(G.n==0&&!G.fd[i]){G.fd[i]=1;if(humans[i]&&!G.dc[i])setProj(i,null);if(!humans[i]&&G.pj[i]){G.dd[i]=1;G.tag[i]=pnames(i)}}
  if(hk()&&c.s==G.tr&&(c.r==5||c.r==6)&&!(G.pj[i]==100&&G.pk[i]%100<10&&(G.pk[i]%10==5||G.pk[i]%10==6))&&G.pl[i].some(x=>x.s==c.s&&(x.r==5||x.r==6)&&x.r!=c.r)){G.bl[i%2]+=20;say(i,'بلوت!');splash('بلوت!',1)}
  G.pl[i].push(c);G.t.push({i,c});
  if(G.n==1&&!G.rv[i]&&G.pv[i].length&&G.pw==i%2)autoLay(i); // لا ينزل مشروعه إلا الفريق الأقوى
  if(ann)say(i,'إكة');
  if(G.t.length==4){G.cs=-1;changed();
   after(()=>{const w=win().i;emit({t:'trickWin',w});after(()=>{emit({t:'sweep',w});after(endTrick,PMS.sweep,1)},PMS.hold,1)},PMS.look,1)}
  else{G.turn=(i+1)%4;next()}}
 function endTrick(){
  if(G.ph!='p')return;
  const w=win(),tm=w.i%2;
  G.last=G.t.slice();G.lw=w.i;const tp=G.t.reduce((a,x)=>a+pts(x.c),0);G.pt[tm]+=tp;G.tk[tm]++;G.n++;G.pile[(w.i+2)%4]++;emit({t:'pop',i:w.i,n:tp});
  if(G.n==1){G.tag=['','','',''];const m=[0,0];for(let i=0;i<4;i++)m[i%2]=Math.max(m[i%2],G.pj[i]?G.pk[i]:0);const mx=Math.max(...m);
   if(mx>0)for(let k=0;k<4;k++){const s=(G.ld+k)%4;if(G.pj[s]&&G.pk[s]==mx){G.pw=s%2;break}}}
  G.tl.push(G.t.slice());G.t=[];
  if(G.n==8){if(qFinal())return;G.pt[tm]+=10;return endWait(endRound)}
  G.turn=w.i;next()}

 // ===== إنزال المشروع =====
 // الإعلان كلامي (يُعرف للجميع)، والإنزال في الأكلة الثانية للفريق الأقوى فقط. اللاعب البشري يختار الأوراق بنفسه (قد يغش)،
 // والبوت ينزل أوراقه الحقيقية. المشروع الكاذب يُحتسب إن لم يُقيَّد، ويُكشف بقيد «مشروع كاذب».
 const needLay=seat=>!!G&&G.ph=='p'&&G.n==1&&G.pw==seat%2&&G.pv[seat].length>0&&!G.rv[seat]&&humans[seat]&&G.turn==seat&&G.t.length<4&&!G.qa;
 function layShow(i){G.rv[i]=1;emit({t:'proj',i,names:pnames(i),cards:G.pcd[i].flat().map(c=>({s:c.s,r:c.r}))});changed()}
 function autoLay(i){if(G.pcd[i].length)layShow(i);else{G.pv[i]=[];G.pk[i]=0;G.pj[i]=0}}
 function lay(seat,ids){
  if(!live(seat)||!needLay(seat)||!Array.isArray(ids)||ids.length>8)return false;
  if(!ids.length){G.pv[seat]=[];G.pcd[seat]=[];G.pk[seat]=0;G.pj[seat]=0;changed();return true} // لا ينزل: يُلغى مشروعه
  const pool=[...G.h[seat],...G.pl[seat]],cs=[];
  for(const id of ids){if(!Number.isInteger(id)||id<0||id>31)return false;const c=pool.find(x=>idc(x)==id);if(!c||cs.includes(c))return false;cs.push(c)}
  const key=a=>a.slice().sort((x,y)=>x-y).join();
  const o=projOptions(cs).find(x=>key(x.items.map(y=>y.v))==key(G.pv[seat]));
  if(o)G.pcd[seat]=o.items.map(x=>x.cards);
  else{G.pcd[seat]=[cs];G.vio.push({type:'proj',i:seat,c:null,leg:[]})}
  layShow(seat);return true}
 function sawa(seat){
  if(G.ph!='p'||G.turn!=seat||G.t.length||G.n<1||G.qa||needLay(seat))return false;
  const ok=sawaOK(seat),tm=seat%2;
  if(qFinal())return true;
  if(!ok){say(seat,'سوا');qaidAuto({type:'sawa',p:seat,pid:-1,rid:-1},by=>qaidEnd(1-tm,{k:'qaid',type:'sawa',p:seat,by,pid:-1,rid:-1,valid:1,auto:1}));return true}
  G.pt[tm]+=G.h.flat().reduce((a,c)=>a+pts(c),0)+10;G.tk[tm]+=G.h[seat].length;G.n=8;
  say(seat,'سوا');splash('سوا!',1);emit({t:'sawa',seat,ok:true});
  G.rev=G.h.map(h=>h.slice());G.h=[[],[],[],[]];G.cs=-1;changed();endWait(endRound);return true}

 // ===== انتظار النتيجة ونهاية الجولة =====
 function endWait(cb){G.ph='x';G.cs=-1;W={n:7,cb,t0:now()};wtick()}
 function wtick(){
  if(!W)return;
  if(W.n<=0)return skipWait();
  emit({t:'wait',n:W.n});W.n--;after(wtick,1000,1)}
 function skipWait(){const w=W;if(!w)return;W=null;emit({t:'waitEnd'});w.cb()}
 function endRound(){
  const m=G.m,b=G.buyer%2,eb=m>1?G.dt:b,o=1-eb,k=hk()?10:5,pp=[0,0],pa=[0,0],bl=[G.bl[0]/10,G.bl[1]/10];
  for(let i=0;i<4;i++){const x=pjP(i);pa[i%2]+=x;if(i%2==G.pw)pp[G.pw]+=x}
  const raw=[0,1].map(t=>G.pt[t]+(pp[t]+bl[t])*k),kb=G.tk[0]==8?0:G.tk[1]==8?1:-1;
  const pot=hk()?16:26,cp=[0,0];cp[o]=rp(G.pt[o]);cp[eb]=pot-cp[o];G.det={raw:[G.pt[0],G.pt[1]],cp,pp:[pp[0],pp[1]],bl:[bl[0],bl[1]],m};
  let q=[0,0],info=null,w;
  if(kb>=0){w=kb;q[w]=(hk()?25:44)+pa[w]+bl[w];info={k:'kaboot',w}}
  else{
   const win=m>1?raw[eb]>raw[o]:(raw[eb]>raw[o]||(raw[eb]==raw[o]&&!(hk()&&pp[o]>0)));w=win?eb:o;
   if(m>1||!win){q[w]=m*(hk()?16:26)+(m==2?2:1)*(pp[0]+pp[1])+bl[0]+bl[1];
    info=m>1?{k:'dbl',m,coffee:G.coffee,w}:{k:'lost',b}}
   else q=[cp[0]+pp[0]+bl[0],cp[1]+pp[1]+bl[1]]}
  fin(q,info,w)}
 // info: وصف منظَّم لسبب النتيجة (kaboot / dbl / lost / qaid) تصيغه الواجهة نصًّا حسب منظور كل لاعب.
 function fin(p,info,cw=-1){
  G.ph='e';G.cs=-1;S[0]+=p[0];S[1]+=p[1];if(G.coffee&&cw>=0)S[cw]=Math.max(152,S[1-cw]+1,S[cw]);
  HIST.push({n:RN,mode:G.mode?(hk()?'حكم '+SU[G.tr]:'صن'):'—',m:G.m,p:[p[0],p[1]]});
  D=(D+1)%4;
  const end=(S[0]>=152||S[1]>=152)&&S[0]!=S[1];
  G.res={p:[p[0],p[1]],info,cw,end,det:G.det||null,S:[S[0],S[1]]};
  changed();emit(Object.assign({t:'roundEnd'},G.res));
  if(!end)after(()=>{if(G.ph=='e')deal()},5000,1)}

 // ===== القيد: الجلسة والحساب =====
 // G.qa: نافذة القيد المفتوحة (تُوقف اللعب عند الجميع). {by المقعد المقيِّد, auto: كشفه بوت, t النوع, pc الورقة المغشوش بها, rq الورقة المفروضة, p المتهم}
 // ـ طلب بشري: qaidOpen ثم qaidSet (الاختيارات) ثم qaidConfirm. يصحّ القيد إن طابق مخالفة مسجَّلة وإلا انقلب على صاحبه (falseFlip).
 // ـ كشف البوت: بعد اللعب تكشف البوتات مخالفات البشر (qaidAuto) وتظهر النافذة لغير المقيِّد حتى يضغط «متابعة» (qaidAck).
 function qaidEnd(t,info){
  if(G.ph!='p')return;
  const m=G.m,p=[0,0],pa=[0,0],bl=[G.bl[0]/10,G.bl[1]/10];
  for(let i=0;i<4;i++)pa[i%2]+=pjP(i);
  p[t]=(hk()?16:26)*m+(m==2?2:1)*pa[t]+bl[t];
  splash('قيد!',3);fin(p,info,t)}
 function qaidAuto(o,cb){
  const bots=[(o.p+1)%4,(o.p+3)%4].filter(x=>!humans[x]),by=bots.length?bots[rnd()*bots.length|0]:(o.p+1)%4;
  G.qa={by,auto:1,t:o.type,pc:o.pid,rq:o.rid===undefined?-1:o.rid,p:o.p};
  QK=()=>cb(by);paused=1;G.cs=-1;changed();
  // بلا لاعبين بشر (اختبار) أو مع مهلة: يتابع تلقائيًا
  if(ACK_MS>0||!humans.some(Boolean))free(()=>qaidAck(),ACK_MS||500)}
 // يكشف البوت مخالفة لاعب بشري فيُحسب القيد عليه. يعيد true إن بدأ كشفًا (ويتوقف المنادي).
 function qFinal(){
  const v=G.vio.find(x=>!x.done&&humans[x.i]&&[(x.i+1)%4,(x.i+3)%4].some(j=>!humans[j]));
  if(!v)return false;
  v.done=1;const pid=v.c?idc(v.c):-1,fd=v.leg.find(id=>G.pl[v.i].some(x=>idc(x)==id)),rid=fd===undefined?v.leg[0]:fd;
  qaidAuto({type:v.type,p:v.i,pid,rid},by=>qaidEnd(1-v.i%2,{k:'qaid',type:v.type,p:v.i,by,pid,rid,valid:1,auto:1}));
  return true}
 function qaidOpen(seat){
  if(!G||!humans[seat]||G.ph!='p'||G.qa)return false;
  if(![(seat+1)%4,(seat+3)%4].some(j=>G.pl[j].length)){say(-1,'لم يلعب الخصم أي ورقة بعد');return false}
  G.qa={by:seat,auto:0,t:'',pc:-1,rq:-1,p:-1};paused=1;G.cs=-1;changed();return true}
 const okId=x=>Number.isInteger(x)&&x>=-1&&x<32;
 function qaidSet(seat,sel){
  const q=G&&G.qa;if(!q||q.auto||q.by!=seat||!sel)return false;
  if(sel.t!==undefined){if(sel.t!==''&&!VT[sel.t])return false;q.t=sel.t}
  if(sel.pc!==undefined){if(!okId(sel.pc))return false;q.pc=sel.pc}
  if(sel.rq!==undefined){if(!okId(sel.rq))return false;q.rq=sel.rq}
  changed();return true}
 function qaidConfirm(seat){
  const q=G&&G.qa;if(!q||q.auto||q.by!=seat||!humans[seat])return false;
  const noCard=q.t=='sawa'||q.t=='proj',nr=q.t&&q.t!='ace'&&!noCard;
  if(!(noCard||(q.t&&q.pc>=0&&(!nr||q.rq>=0))))return false;
  const pv=q.t=='proj'?G.vio.find(x=>x.type=='proj'&&!x.done&&x.i%2!=seat%2):null;
  const p=q.t=='sawa'?(seat+1)%4:q.t=='proj'?(pv?pv.i:(seat+1)%4):G.pl.findIndex(l=>l.some(c=>idc(c)==q.pc));
  if(p<0||p%2==seat%2)return false;
  const type=q.t,pid=noCard?-1:q.pc,rid=noCard?-1:q.rq;
  const v=type=='proj'?pv:G.vio.find(x=>x.i==p&&x.type==type&&!x.done&&idc(x.c)==pid&&(type=='ace'||x.leg.includes(rid)));
  const info=ok=>({k:'qaid',type,p,by:seat,pid,rid,valid:ok,auto:0});
  G.qa=null;
  if(v){v.done=1;resume(1);qaidEnd(seat%2,info(1));return true}
  if(FLIP){resume(1);qaidEnd(1-seat%2,info(0));return true}
  say(-1,'القيد لم يثبت');resume(0);return true}
 function qaidAck(seat){
  const q=G&&G.qa;if(!q||!q.auto)return false;
  if(seat!=null&&!humans[seat])return false;
  const k=QK;QK=null;G.qa=null;resume(1);if(k)k();return true}

 // ===== لاعبو الحاسوب =====
 function botBid(i){
  if(G.ph!='b'||G.turn!=i)return;
  const h=G.h[i],f=G.fl.s,sn=h.reduce((a,c)=>a+(c.r==7?3:c.r==3?1:0),0);let bs=-1,bv=0;
  for(let s=0;s<4;s++){if(G.rd==1&&s!=f||G.rd==2&&s==f)continue;const v=hs(G.rd==1?[...h,G.fl]:h,s);if(v>bv){bv=v;bs=s}}
  if(G.rd==1&&(i==G.dealer||i==(G.dealer+3)%4)&&sn>=5&&sn<7&&bv<6)bid(i,'a');
  else if(sn>=7)bid(i,'s');else if(bv>=(G.rd==1?6:5))bid(i,'h',bs);else bid(i,'p');
 }
 // لعب البوت: يرى كل الأوراق ويبحث عن أفضل لعبة (أكبر فرق أبناط لفريقه).
 // بحث ألفا-بيتا على الأكلات المتبقية، مع جدول للحالات المكررة، واختصار الأوراق المتكافئة، وعمق متدرج بمهلة زمنية.
 function solvePlay(i){
  const mode=hk(),tr=G.tr,me=i%2,cl=G.cl;
  const SU_=c=>c>>3,RK_=c=>c&7,TRM=c=>mode&&SU_(c)==tr;
  const stg=c=>TRM(c)?10+ST[RK_(c)]:SN[RK_(c)],pt=c=>TRM(c)?PT[RK_(c)]:PN[RK_(c)];
  const vl=(c,L)=>TRM(c)?10+ST[RK_(c)]:SU_(c)==L?SN[RK_(c)]:-1;
  const id=idc;
  const hm=[0,0,0,0];for(let j=0;j<4;j++)for(const c of G.h[j])hm[j]|=1<<id(c);
  const tcards=G.t.map(x=>id(x.c)),tpl=G.t.map(x=>x.i);
  const lead=G.t.length?tpl[0]:i;
  const bits=m=>{const o=[];for(let b=0;b<32;b++)if(m>>>b&1)o.push(b);return o};
  let nodes=0,deadline=0,TT=new Map();const ABORT={};
  const trickWin=(tc,tp)=>{const L=SU_(tc[0]);let w=0,bv=vl(tc[0],L);for(let k=1;k<tc.length;k++){const v=vl(tc[k],L);if(v>bv){bv=v;w=k}}return tp[w]};
  // ann: هل أُعلنت إكة على الأكلة الجارية؟ في أكلة الجذر نعرفها فعلًا، وفي الأكلات المتخيَّلة نفترض أن البوت يعلنها متى كانت ورقته القائدة أعلى ما بقي.
  const isMasterS=(c0,all)=>{for(let b=0;b<32;b++)if(all>>>b&1&&SU_(b)==SU_(c0)&&SN[RK_(b)]>SN[RK_(c0)])return false;return true};
  function legalS(hand,p,tc,tp,all){
   const h=bits(hand);
   if(!tc.length){if(cl&&mode){const nt=h.filter(c=>SU_(c)!=tr);if(nt.length)return nt}return h}
   const L=SU_(tc[0]),same=h.filter(c=>SU_(c)==L);
   if(same.length){
    if(mode&&L==tr){let mx=-1;for(const c of tc)if(SU_(c)==L)mx=Math.max(mx,ST[RK_(c)]);const up=same.filter(c=>ST[RK_(c)]>mx);return up.length?up:same}
    return same}
   if(mode){const t=h.filter(c=>SU_(c)==tr);
    const wp=trickWin(tc,tp);
    const need=wp%2!=p%2||(wp==tp[0]&&RK_(tc[0])!=7&&!(tc[0]===tcards[0]&&tp[0]===tpl[0]&&tcards.length?!!G.ann:isMasterS(tc[0],all)));
    if(t.length&&need){let mx=-1;for(const c of tc)if(SU_(c)==tr)mx=Math.max(mx,ST[RK_(c)]);const up=t.filter(c=>ST[RK_(c)]>mx);return up.length?up:t}}
   return h}
  // اختصار: ورقتان متجاورتان في القوة (لا ورقة غير ملعوبة بينهما) ولهما الأبناط نفسها متكافئتان
  function reduce(ms,all){
   if(ms.length<2)return ms;const out=[];
   const sorted=ms.slice().sort((a,b)=>SU_(a)-SU_(b)||stg(a)-stg(b));
   for(let k=0;k<sorted.length;k++){const c=sorted[k],n=sorted[k+1];
    if(n!==undefined&&SU_(n)==SU_(c)&&pt(n)==pt(c)){
     let between=false;for(let b=0;b<32;b++)if(all>>>b&1&&SU_(b)==SU_(c)&&stg(b)>stg(c)&&stg(b)<stg(n)){between=true;break}
     if(!between)continue}
    out.push(c)}
   return out}
  const team=p=>p%2;
  function solve(h,ld,a,b,depth,last){
   if(!(h[0]|h[1]|h[2]|h[3]))return 0;
   if(depth<=0)return 0;
   const key=h[0]+','+h[1]+','+h[2]+','+h[3]+','+ld,e=TT.get(key);
   if(e){if(e.lo>=b)return e.lo;if(e.hi<=a)return e.hi;a=Math.max(a,e.lo);b=Math.min(b,e.hi);if(a>=b)return e.lo}
   const a0=a,b0=b;
   const v=rec(0,[],[],h,ld,a,b,depth,last);
   const ne=e||{lo:-1e9,hi:1e9};
   if(v<=a0)ne.hi=v;else if(v>=b0)ne.lo=v;else{ne.lo=v;ne.hi=v}
   TT.set(key,ne);return v}
  function rec(pos,tc,tp,h,ld,a,b,depth,last){
   nodes++;if(nodes>NODE_CAP||((nodes&1023)==0&&Date.now()>deadline))throw ABORT;
   const p=(ld+pos)%4,mx=team(p)==me;
   const all=h[0]|h[1]|h[2]|h[3]|tc.reduce((m,c)=>m|1<<c,0);
   const ms=reduce(legalS(h[p],p,tc,tp,all),all);
   let best=mx?-1e9:1e9;
   for(const c of ms){
    const nh=h.slice();nh[p]&=~(1<<c);const ntc=tc.concat(c),ntp=tp.concat(p);let v;
    if(pos==3){
     const w=trickWin(ntc,ntp),sg=team(w)==me?1:-1;
     let tpt=0;for(const x of ntc)tpt+=pt(x);if(!(nh[0]|nh[1]|nh[2]|nh[3]))tpt+=10;
     v=sg*tpt+solve(nh,w,a-sg*tpt,b-sg*tpt,depth-1)}
    else v=rec(pos+1,ntc,ntp,nh,ld,a,b,depth,last);
    if(mx){if(v>best)best=v;if(best>a)a=best}else{if(v<best)best=v;if(best<b)b=best}
    if(a>=b)break}
   return best}
  // الجذر: نجرّب كل الأوراق القانونية بعمق متدرج حتى تنتهي المهلة
  const allRoot=hm[0]|hm[1]|hm[2]|hm[3]|tcards.reduce((m,c)=>m|1<<c,0);
  const legalNow=legalS(hm[i],i,tcards,tpl,allRoot);if(legalNow.length==1)return legalNow[0];
  const maxD=Math.max(1,G.h[i].length);
  let bestMove=null;deadline=Date.now()+SOLVE_MS;
  for(let d=1;d<=maxD;d++){
   TT=new Map();let res=[];
   try{
    for(const c of legalNow){
     const nh=hm.slice();nh[i]&=~(1<<c);const ntc=tcards.concat(c),ntp=tpl.concat(i);let v;
     const pos=tcards.length;
     if(pos==3){const w=trickWin(ntc,ntp),sg=team(w)==me?1:-1;let tpt=0;for(const x of ntc)tpt+=pt(x);if(!(nh[0]|nh[1]|nh[2]|nh[3]))tpt+=10;v=sg*tpt+solve(nh,w,-1e9,1e9,d-1)}
     else v=rec(pos+1,ntc,ntp,nh,lead,-1e9,1e9,d,0);
     res.push([c,v])}
   }catch(e){if(e!==ABORT)throw e;break}
   res.sort((x,y)=>y[1]-x[1]||(pt(x[0])*100+stg(x[0]))-(pt(y[0])*100+stg(y[0])));
   bestMove=res[0][0];
   if(d>=maxD)break}
  return bestMove==null?legalNow.slice().sort((x,y)=>pt(x)*100+stg(x)-pt(y)*100-stg(y))[0]:bestMove}
 function botPlay(i){
  if(G.ph!='p'||G.turn!=i||G.t.length>3)return;
  const h=G.h[i];let c;
  try{const id=solvePlay(i);c=h.find(x=>idc(x)==id)}catch(e){c=null}
  if(!c){const L=legal(h,i);c=L[0]}
  play(i,c,hk()&&!G.t.length&&!isT(c)&&c.r!=7&&isMaster(c))}

 // ===== واجهة المحرك العامة =====
 const live=seat=>G&&!G.qa&&humans[seat];
 // القرار الذي ينتظره المحرك من هذا المقعد البشري الآن (أو null)
 function pending(seat){
  if(!G||G.qa||!humans[seat])return null;
  if(G.ph=='b'&&G.turn==seat)return {k:'bid',rd:G.rd,flip:G.fl.s,canAsh:G.rd==1&&(seat==G.dealer||seat==(G.dealer+3)%4)};
  if(G.ph=='q'&&G.cs==seat)return {k:'before',rd:G.rd};
  if(G.ph=='f'&&G.cs==seat)return {k:'flip'};
  if(G.ph=='d'&&G.cs==seat){const st=G.dst;return {k:'double',st,n:DN[st],two:hk()&&(st==0||st==2)}}
  if(needLay(seat))return {k:'lay',want:G.pv[seat].slice()};
  if(G.ph=='p'&&G.turn==seat&&G.t.length<4)return {k:'play',legal:legal(G.h[seat],seat).map(idc)};
  return null}
 return {
  get G(){return G},get S(){return S},get D(){return D},get RN(){return RN},HIST,
  humans,isHuman:i=>humans[i],pending,
  // يحوّل مقعدًا بين بشري وبوت (مثلًا خروج لاعب أو جلوس مشاهد). يُلغي قرار البوت المجدول ويعيد جدولته إن لزم.
  setHuman(i,b){humans[i]=!!b;if(G){G.sq++;botTurn()}},
  deal,newGame(){S[0]=0;S[1]=0;HIST.length=0;deal()},
  nextRound(){if(G&&G.ph=='e'&&G.res&&!G.res.end){deal();return true}return false},
  waiting(){return !!W},
  skip(){if(!W||now()-W.t0<600)return false;skipWait();return true},
  // الأفعال البشرية
  bid(seat,k,s){
   if(!live(seat)||G.ph!='b'||G.turn!=seat)return false;
   if(k=='p'||k=='s'){}
   else if(k=='a'){if(!(G.rd==1&&(seat==G.dealer||seat==(G.dealer+3)%4)))return false}
   else if(k=='h'){if(!Number.isInteger(s)||s<0||s>3||(G.rd==1?s!=G.fl.s:s==G.fl.s))return false}
   else return false;
   bid(seat,k,s);return true},
  answerBefore(seat,y){if(!live(seat)||G.ph!='q'||G.cs!=seat)return false;ansQ(seat,!!y);return true},
  answerFlip(seat,y){if(!live(seat)||G.ph!='f'||G.cs!=seat)return false;ansF(seat,!!y);return true},
  answerDouble(seat,y,cl){if(!live(seat)||G.ph!='d'||G.cs!=seat)return false;ansD(seat,y?1:0,cl);return true},
  play(seat,id,ak){
   if(!live(seat)||G.ph!='p'||G.turn!=seat||G.t.length>3||needLay(seat))return false;
   const c=G.h[seat].find(x=>idc(x)==id);if(!c)return false;
   play(seat,c,!!ak);return true},
  // want: قيم المشاريع المعلنة من [20,50,100,400]. الإعلان حر (قد يكون كاذبًا)، قبل لعب أول ورقة فقط، ويظهر للجميع وسمًا كبيرًا عند مقعدك.
  // الأقوى إعلانًا يُنزل في الأكلة الثانية (lay)، وإن لم تطابق الأوراق المنزَّلة الإعلان فهو مخالفة تُكشف بالقيد.
  project(seat,want){
   if(!live(seat)||G.ph!='p'||G.n!=0||G.fd[seat]||G.dc[seat]||!Array.isArray(want)||!want.length||want.length>4||want.some(v=>!PV.includes(v)))return false;
   const key=a=>a.slice().sort((x,y)=>x-y).join();
   const o=G.po[seat].filter(x=>key(x.items.map(y=>y.v))==key(want)).sort((a,b)=>b.k-a.k)[0];
   G.dc[seat]=1;G.dd[seat]=1;
   G.pv[seat]=want.slice().sort((a,b)=>b-a);G.pcd[seat]=o?o.items.map(x=>x.cards):[];
   G.pk[seat]=o?o.k:Math.max(...want)*100;G.pj[seat]=Math.floor(G.pk[seat]/100);
   G.tag[seat]=pnames(seat);changed();return true},
  lay,
  sawa(seat){return live(seat)?sawa(seat):false},
  qaidOpen,qaidSet,qaidConfirm,qaidAck,
  // ===== للخادم =====
  // ينفّذ قرار بوت عن مقعد بشري ينتظره المحرك (مهلة الدور). يعيد true إن نفّذ.
  botAct(seat){
   if(!G||G.qa||paused||!humans[seat]||!pending(seat))return false;
   if(needLay(seat)){autoLay(seat);changed();return true}
   G.sq++;botDecide(seat);return true},
  // قيد يدوي طال انتظاره: يُعدّ قيدًا غير ثابت فينقلب على صاحبه (كما لو أكّد قيدًا خاطئًا)
  qaidForfeit(){
   const q=G&&G.qa;if(!q||q.auto)return false;
   const seat=q.by;G.qa=null;resume(1);
   qaidEnd(1-seat%2,{k:'qaid',type:q.t||'cut',p:(seat+1)%4,by:seat,pid:q.pc,rid:q.rq,valid:0,auto:0,forfeit:1});return true},
  // يوقف كل المؤقتات (الغرفة فارغة). لا يمسح الحالة.
  stop(){RT++;paused=0;PQ=[];W=null;QK=null;if(G)G.sq++},
  // مساعدات للواجهة
  hk,isT,val,pts,legal,pnames,sawaOK,
  _t:{endRound,violationOf,projOptions,isMaster}  // للاختبارات فقط
 }
}

const API={create,data:{SU,RK,SN,ST,PN,PT,PJ,PV,DN,VT}};
root.BalootEngine=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:self);
