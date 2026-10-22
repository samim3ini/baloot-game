// واجهة بلوت بـReact (بلا أدوات بناء): React وhtm من CDN، والمحرك engine.js كما هو لم يتغير.
// المحرك يملك الحالة G ويبثّ أحداثًا؛ هذا الملف يعرضها ويحوّل نقرات اللاعب إلى أفعال للمحرك.
const {useState,useReducer,useRef}=React;
const html=htm.bind(React.createElement);
const {SU,RK,PJ,PV,DN,VT}=BalootEngine.data;
const NM=['أنت','سعود','خالد','فهد'];            // 0 أنت، 1 يمينك، 2 شريكك، 3 يسارك
const SP=[1.1,.7,.4],SPN=['بطيء','عادي','سريع'];
const BIDW=/^(بس|ولا|صن|حكم|أشكل|قبلك|دبل|ثري|فور|قهوة)/;
const cid=c=>c.s*8+c.r,tx=id=>RK[id&7]+SU[id>>3];

function Card({c,cls='',style,onClick}){
 if(!c)return html`<div className=${'cd back '+cls} style=${style}/>`;
 return html`<div className=${'cd '+(c.s%2?'rd ':'')+cls} style=${style} onClick=${onClick}><span className="cr">${RK[c.r]}<b>${SU[c.s]}</b></span><span className="cm">${SU[c.s]}</span></div>`}

function Seat({i,G}){
 const n=G.h[i].length,act=G.ph!='e'&&G.t.length<4;
 const on=act&&(G.ph=='p'?G.turn==i:G.cs>=0?G.cs==i:G.ph=='b'&&G.turn==i),by=G.mode&&G.buyer==i;
 return html`<div className=${'seat s'+i+(on?' on':'')+(i%2?' opp':' us')}>
  ${i?html`<div className="bks">${Array.from({length:n},(_,k)=>html`<u key=${k} style=${{'--r':((k-(n-1)/2)*7)+'deg'}}/>`)}</div>`:null}
  <div className="av">${NM[i][0]}${i==G.dealer?html`<i className="dl">م</i>`:null}</div>
  <div className="nm">${NM[i]}${i==2?' · شريكك':''}</div>
  ${G.tag[i]?html`<div className="tag">${G.tag[i]}</div>`:null}
  ${by?html`<div className="buy">${G.mode=='s'?'صن ☀':html`حكم <b className=${G.tr%2?'rd':''}>${SU[G.tr]}</b>`}</div>`:null}
  ${G.pile[i]?html`<div className="pile">${G.pile[i]}</div>`:null}
 </div>`}

function Actions({e,G,ak,setAk,setMenu,cak}){
 const [pick,setPick]=useState(0);
 const p=e.pending(0),ph=G.ph;
 const B=(l,f,c='',d)=>html`<button key=${l} className=${'ab '+c} disabled=${!!d} onClick=${f}>${l}</button>`;
 if(G.qa)return null;
 const kaw=ph=='b'&&G.h[0].length==5&&G.h[0].every(c=>c&&c.r<=2)?B('كوشة',()=>e.kawsh(0),'gold'):null;
 if(ph=='b'){
  if(!p)return html`${kaw}<span className="hint">دور ${NM[G.turn]}…</span>`;
  if(pick)return html`${[0,1,2,3].filter(s=>s!=p.flip).map(s=>B(SU[s],()=>{setPick(0);e.bid(0,'h',s)},s%2?'red':''))}${B('رجوع',()=>setPick(0))}`;
  return html`${kaw}${B(p.rd==1?'بس':'ولا',()=>e.bid(0,'p'),'mute')}${B('أشكل',()=>e.bid(0,'a'),'',!p.canAsh)}${p.rd==1?B('حكم '+SU[p.flip],()=>e.bid(0,'h',p.flip),p.flip%2?'red':''):B('حكم ثاني',()=>setPick(1))}${B('صن ☀',()=>e.bid(0,'s'),'gold')}`}
 if(ph=='q'&&p)return html`${B('قبلك',()=>e.answerBefore(0,1),'gold')}${B(p.rd==1?'بس':'ولا',()=>e.answerBefore(0,0),'mute')}`;
 if(ph=='f'&&p)return html`${B('صن ☀',()=>e.answerFlip(0,1),'gold')}${B('بس',()=>e.answerFlip(0,0),'mute')}`;
 if(p&&p.k=='double')return html`${p.two?html`${B(p.n+' مفتوح',()=>e.answerDouble(0,1,0),'gold')}${B(p.n+' مقفل',()=>e.answerDouble(0,1,1),'red')}`:B(p.n,()=>e.answerDouble(0,1,0),'gold')}${B('بس',()=>e.answerDouble(0,0),'mute')}`;
 if(p&&p.k=='toSun')return html`${B('اقلب صن ☀',()=>e.answerSun(0,1),'gold')}${B('تأكيد الحكم',()=>e.answerSun(0,0))}`;
 const q=B('قيد',()=>e.qaidOpen(0),'red');
 if(ph=='x')return q;
 if(ph=='p'){
  const dcl=G.n==0&&!G.dc[0]&&!G.fd[0];
  return html`${q}${dcl?B('المشاريع',()=>setMenu('proj')):null}${G.mode=='h'?B('إكة',()=>setAk(!ak),ak?'gold':'',!cak):null}${B('سوا',()=>e.sawa(0),'',!(G.turn==0&&!G.t.length&&G.n>=1))}`}
 return null}

function ProjMenu({e,close}){
 const [sel,setSel]=useState([0,0,0,0]);
 const want=[];sel.forEach((n,j)=>{for(let k=0;k<n;k++)want.push(PV[j])});
 const tog=j=>setSel(s=>s.map((n,k)=>k!=j?n:n>=(j==3?1:2)?0:n+1));
 return html`<div className="ov" onClick=${close}><div className="dlg noskip" onClick=${x=>x.stopPropagation()}>
  <h3>أعلن مشروعك</h3><div className="chips">${PV.map((v,j)=>html`<button key=${v} className=${'chip'+(sel[j]?' on':'')} onClick=${()=>tog(j)}>${PJ[v]}${sel[j]>1?' ×'+sel[j]:''}</button>`)}</div>
  <p className="sub">الإعلان حر وقد لا يطابق يدك، لكن الخصم قد يقيّده.</p>
  <div className="row"><button className="ab gold" disabled=${!want.length} onClick=${()=>{e.project(0,want);close()}}>إعلان</button><button className="ab mute" onClick=${close}>إلغاء</button></div></div></div>`}

function LayMenu({e,G,p}){
 const [sel,setSel]=useState([]);
 const pool=[...G.h[0],...G.pl[0]].sort((a,b)=>a.s-b.s||b.r-a.r);
 return html`<div className="ov"><div className="dlg wide noskip"><h3>أنزل مشروعك: ${p.want.map(v=>PJ[v]).join(' + ')}</h3>
  <div className="cards">${pool.map(c=>{const id=cid(c);return html`<${Card} key=${id} c=${c} cls=${'sm'+(sel.includes(id)?' pk':'')} onClick=${()=>setSel(s=>s.includes(id)?s.filter(x=>x!=id):[...s,id])}/>`})}</div>
  <div className="row"><button className="ab gold" disabled=${!sel.length} onClick=${()=>e.lay(0,sel)}>تنزيل (${sel.length})</button><button className="ab mute" onClick=${()=>e.lay(0,[])}>لا أنزل</button></div></div></div>`}

// نافذة القيد: أنت المقيِّد (تختار النوع والورقة المغشوش بها والمفروضة)، أو كشف بوت لمخالفتك فتضغط متابعة
function Qaid({e,G}){
 const q=G.qa,mine=!q.auto&&q.by==0,nr=t=>!!t&&t!='ace'&&t!='sawa'&&t!='proj';
 const own=id=>G.pl.findIndex(l=>l.some(c=>cid(c)==id)),po=q.pc>=0?own(q.pc):-1,set=o=>e.qaidSet(0,o);
 const types=['cut',...(G.mode=='h'&&G.cl?['open']:[]),...(G.mode=='h'?['nobig','nodq','ace']:[]),'sawa','proj'];
 const ready=q.t=='sawa'||q.t=='proj'||(!!q.t&&q.pc>=0&&(!nr(q.t)||q.rq>=0));
 const tr=[...G.tl,...(G.t.length?[G.t]:[])];
 const cls=id=>id==q.pc?' bad':id==q.rq?' ok':'';
 const pickT=x=>{const id=cid(x.c);if(!mine)return;
  if(id==q.pc)return set({pc:-1,rq:-1});if(id==q.rq)return set({rq:-1});
  if(q.pc>=0&&nr(q.t)&&x.i==po)return set({rq:id});
  if(x.i%2==0)return;set({pc:id,rq:-1})};
 const pickH=(j,c)=>{const id=cid(c);if(!mine)return;if(id==q.rq)return set({rq:-1});if(q.pc>=0&&nr(q.t)&&j==po)set({rq:id})};
 const ins=!q.t?'اختر نوع القيد':q.t=='sawa'||q.t=='proj'?'اضغط «قيدها»':q.pc<0?'اختر الورقة التي غُشّ بها':nr(q.t)&&q.rq<0?'اختر الورقة التي كان يجب لعبها':'اضغط «قيدها»';
 return html`<div className="ov"><div className="dlg wide qd noskip">
  ${mine?html`<h3>${ins}</h3><div className="chips">${types.map(t=>html`<button key=${t} className=${'chip'+(q.t==t?' on':'')} onClick=${()=>set(q.t==t?{t:'',rq:-1}:t=='sawa'||t=='proj'?{t,rq:-1,pc:-1}:{t,rq:-1})}>${VT[t]}</button>`)}</div>`
   :html`<h3>كشف ${NM[q.by]} مخالفة ${q.p==0?'عليك':'على '+NM[q.p]}: ${VT[q.t]||''}</h3>`}
  <div className="qb">${tr.length?tr.map((t,k)=>html`<div className="qt" key=${k}><small>الأكلة ${k+1}</small><div className="cards">${t.map(x=>html`<${Card} key=${cid(x.c)} c=${x.c} cls=${'sm'+cls(cid(x.c))} onClick=${()=>pickT(x)}/>`)}</div></div>`):html`<p className="sub">لم تُلعب أي أكلة بعد</p>`}
   ${[1,2,3].filter(j=>G.h[j].length&&G.h[j][0]).map(j=>html`<div className="qt" key=${j}><small>يد ${NM[j]}</small><div className="cards">${G.h[j].map(c=>html`<${Card} key=${cid(c)} c=${c} cls=${'sm'+cls(cid(c))} onClick=${()=>pickH(j,c)}/>`)}</div></div>`)}</div>
  <div className="row">${mine?html`<button className="ab gold" disabled=${!ready} onClick=${()=>e.qaidConfirm(0)}>قيدها</button>`:html`<button className="ab gold" onClick=${()=>e.qaidAck(0)}>متابعة</button>`}</div></div></div>`}

function qMsg(type,p,pid,rid){const w=p==0?'عليك':'على '+NM[p];
 if(type=='proj')return `قيد مشروع كاذب ${w}`;if(type=='sawa')return `قيد سوا خاطئ ${w}`;
 return type=='ace'?`قيد ${VT[type]} ${w}: إكة بورقة ${tx(pid)} وهي ليست الأعلى`:`قيد ${VT[type]} ${w}: لعب ${tx(pid)} وكان مفروضًا ${tx(rid)}`}
function resMsg(i){if(!i)return'';const tn=t=>t==0?'لنا':'لهم';
 switch(i.k){case 'kaboot':return 'كبوت!';
  case 'dbl':return DN[i.m-2]+(i.coffee?' وقهوة':'')+': '+tn(i.w)+' يربحون الجولة';
  case 'lost':return tn(i.b)+': المشتري خسر الجولة';
  case 'qaid':{if(i.forfeit)return 'انتهت مهلة القيد';const m=qMsg(i.type,i.p,i.pid,i.rid);return i.auto?m:(i.valid?'قيد صحيح — ':'قيد خاطئ — ')+m}}
 return ''}

function Result({r,e}){
 const pu=r.p[0],pt=r.p[1],our=pu>pt?1:pt>pu?-1:0,d=r.det,end=r.end,gw=end?r.S[0]>r.S[1]:our>0,m=resMsg(r.info);
 const hd=end?(gw?'فزتم باللعبة!':'خسرتم اللعبة'):our>0?'كسبتم الجولة':our<0?'خسرتم الجولة':'تعادل';
 const row=(l,a,b)=>html`<tr key=${l}><td>${l}</td><td>${a}</td><td>${b}</td></tr>`;
 return html`<div className="ov"><div className=${'dlg rc noskip '+(gw?'win':our<0||end?'lose':'')}>
  <div className="ico">${gw?'🏆':our<0||end?'💔':'🤝'}</div><h2>${hd}</h2>${m?html`<p className="nt">${m}</p>`:null}
  <table><tbody><tr><th></th><th>لنا</th><th>لهم</th></tr>${d?[row('الأبناط',d.raw[0],d.raw[1]),row('نقاط الأوراق',d.cp[0],d.cp[1]),row('المشاريع',d.pp[0],d.pp[1]),row('البلوت',d.bl[0],d.bl[1])]:null}
  <tr className="tot"><td>الجولة${d&&d.m>1?' ×'+d.m:''}</td><td className=${our>0?'w':''}>${pu}</td><td className=${our<0?'w':''}>${pt}</td></tr></tbody></table>
  <div className="sum">المجموع: لنا <b>${r.S[0]}</b> — لهم <b>${r.S[1]}</b></div>
  <button className="ab gold" onClick=${()=>end?e.newGame():e.nextRound()}>${end?'لعبة جديدة':'الجولة التالية'}</button></div></div>`}

function App(){
 const [scr,setScr]=useState('lobby'),[spd,setSpd]=useState(1),[sel,setSel]=useState(-1),[ak,setAk]=useState(false),[menu,setMenu]=useState('');
 const [t,setT]=useState({say:null,sp:null,proj:[],wait:0,res:null,win:-1,sw:-1});
 const [,bump]=useReducer(x=>x+1,0),sp=useRef(1),hd=useRef(null),E=useRef(null);sp.current=spd;
 const patch=p=>setT(o=>({...o,...p})),later=(f,ms)=>setTimeout(f,ms);
 hd.current=ev=>{switch(ev.t){
  case 'state':if(E.current.G&&E.current.G.t.length<4)setT(o=>o.win<0&&o.sw<0?o:{...o,win:-1,sw:-1});bump();break;
  case 'deal':setT(o=>({...o,res:null,wait:0,win:-1,sw:-1,proj:[]}));setSel(-1);setAk(false);setMenu('');break;
  case 'say':{if(ev.i>=0&&BIDW.test(ev.m))break;const k=Math.random();patch({say:{i:ev.i,m:ev.m,k}});later(()=>setT(o=>o.say&&o.say.k==k?{...o,say:null}:o),1800);break}
  case 'splash':{const k=Math.random();patch({sp:{...ev,k}});later(()=>setT(o=>o.sp&&o.sp.k==k?{...o,sp:null}:o),1500);break}
  case 'proj':{const k=Math.random();setT(o=>({...o,proj:[...o.proj.filter(x=>x.i!=ev.i),{...ev,k}]}));later(()=>setT(o=>({...o,proj:o.proj.filter(x=>x.k!=k)})),4500);break}
  case 'trickWin':patch({win:ev.w});break;
  case 'sweep':patch({sw:ev.w});break;
  case 'wait':patch({wait:ev.n});break;
  case 'waitEnd':patch({wait:0});break;
  case 'roundEnd':patch({res:ev});break}};
 if(!E.current){E.current=BalootEngine.create({emit:ev=>hd.current(ev),after:(f,ms,raw)=>setTimeout(f,raw?ms:ms*SP[sp.current])});E.current.setHuman(0,true)}
 const e=E.current,G=e.G;
 if(scr=='lobby'||!G)return html`<div className="lobby"><div className="lb"><div className="logo">♠ ♥ ♣ ♦</div><h1>بلوت</h1><p>لعبة الورق السعودية، أربعة لاعبين وفريقان</p>
  <button className="ab gold big" onClick=${()=>{setScr('game');e.newGame()}}>ابدأ اللعب ضد الحاسوب</button><small>الغرف الجماعية والدردشة ستُنقل إلى الواجهة الجديدة في الخطوة التالية</small></div></div>`;
 const p=e.pending(0),my=G.ph=='p'&&G.turn==0&&G.t.length<4&&!(p&&p.k=='lay'),cak=my&&G.mode=='h'&&!G.t.length;
 const hp=c=>{const id=cid(c);if(sel!=id){setSel(id);return}setSel(-1);const a=ak;setAk(false);e.play(0,id,a)};
 const showFl=['b','f','q','v'].includes(G.ph)||(G.ph=='d'&&!G.dealt)||G.fly!=null;
 const n0=G.h[0].length,say=t.say;
 return html`<div className="app" onClick=${x=>{if(t.wait&&!(x.target.closest&&x.target.closest('.noskip')))e.skip()}}>
  <header>
   <div className="sc us"><small>لنا</small><b>${e.S[0]}</b></div>
   <div className="ctr"><span className="rn">الجولة ${e.RN}</span>
    ${G.mode?html`<span className="chipc">${G.mode=='s'?'صن ☀':html`حكم <b className=${G.tr%2?'rd':''}>${SU[G.tr]}</b>`}${G.m>1?' · '+DN[G.m-2]:''}${G.coffee?' · قهوة':''}${G.cl?' · مقفل':''}</span>`:html`<span className="chipc">${G.rd==1?'المزايدة — الدور الأول':'المزايدة — الدور الثاني'}</span>`}</div>
   <div className="sc them"><small>لهم</small><b>${e.S[1]}</b></div>
   <div className="tools noskip"><button onClick=${()=>setMenu('hist')}>السجل</button><button onClick=${()=>setSpd((spd+1)%3)}>${SPN[spd]}</button></div>
  </header>
  <main className="table">
   ${[1,2,3].map(i=>html`<${Seat} key=${i} i=${i} G=${G}/>`)}
   <div className=${'mid'+(t.sw>=0?' sw'+t.sw:'')}>
    ${showFl&&G.fl?html`<${Card} c=${G.fl} cls=${'flc'+(G.fly!=null?' fly'+G.fly:'')}/>`:null}
    ${G.t.map(x=>html`<${Card} key=${cid(x.c)} c=${x.c} cls=${'pc pc'+x.i+(t.win==x.i?' wn':'')}/>`)}
    ${G.rev?html`<div className="rev">${G.rev.map((h,i)=>h.length?html`<div key=${i} className="rvr"><small>${NM[i]}</small>${h.map(c=>html`<${Card} key=${cid(c)} c=${c} cls="xs"/>`)}</div>`:null)}</div>`:null}
   </div>
   ${say?html`<div className=${'bub '+(say.i>=0?'b'+say.i:'bc')} key=${say.k}>${say.m}</div>`:null}
   ${t.sp?html`<div className=${'splash lv'+t.sp.lv} key=${t.sp.k}>${t.sp.text}${t.sp.sub?html`<small>${t.sp.sub}</small>`:null}</div>`:null}
   ${t.proj.map(x=>html`<div className=${'pjr p'+x.i} key=${x.k}><span>${x.names}</span><div className="cards">${x.cards.map(c=>html`<${Card} key=${cid(c)} c=${c} cls="xs"/>`)}</div></div>`)}
   ${t.wait>0?html`<div className="waitb">النتيجة بعد ${t.wait} — اضغط في أي مكان</div>`:null}
  </main>
  <footer className="noskip">
   <${Seat} i=${0} G=${G}/>
   <div className="acts"><${Actions} e=${e} G=${G} ak=${ak} setAk=${setAk} setMenu=${setMenu} cak=${cak}/></div>
   <div className="hand">${G.h[0].map((c,k)=>html`<${Card} key=${cid(c)} c=${c} cls=${(my?'ok ':'')+(sel==cid(c)?'sel':'')} style=${{'--r':((k-(n0-1)/2)*4)+'deg','--y':(Math.abs(k-(n0-1)/2)*3)+'px'}} onClick=${my?()=>hp(c):null}/>`)}</div>
  </footer>
  ${menu=='proj'?html`<${ProjMenu} e=${e} close=${()=>setMenu('')}/>`:null}
  ${menu=='hist'?html`<div className="ov" onClick=${()=>setMenu('')}><div className="dlg noskip" onClick=${x=>x.stopPropagation()}><h3>النتائج السابقة</h3><table><tbody><tr><th>#</th><th>اللعب</th><th>لنا</th><th>لهم</th></tr>${e.HIST.map(h=>html`<tr key=${h.n}><td>${h.n}</td><td>${h.mode}${h.m>1?' ×'+h.m:''}</td><td>${h.p[0]}</td><td>${h.p[1]}</td></tr>`)}</tbody></table></div></div>`:null}
  ${p&&p.k=='lay'?html`<${LayMenu} e=${e} G=${G} p=${p}/>`:null}
  ${G.qa?html`<${Qaid} e=${e} G=${G}/>`:null}
  ${t.res&&!G.qa?html`<${Result} r=${t.res} e=${e}/>`:null}
 </div>`}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);
