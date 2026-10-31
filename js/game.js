// ربط المحرك بالصفحة: يستقبل أحداث المحرك فيرسمها، ويحوّل نقرات اللاعب إلى أفعال للمحرك.
// قواعد اللعب نفسها في engine.js. هذا الملف للواجهة فقط (اللعب الفردي: أنت المقعد 0 والباقون بوتات).
const $=id=>document.getElementById(id),RED=c=>c.s%2==1;
const SPEEDS=[1.1,.7,.4];let SPD=1,STREAK=0,RESULT=false,FRESH=0,mt;
let ME=0,SPEC=false,SPECSEAT=0,NETON=false; // ME: مقعدك (اللعب الفردي 0، والجماعي من الخادم). SPEC: مشاهد، يرى من زاوية SPECSEAT.
const R=i=>(i-ME+4)%4; // موضع المقعد على الشاشة بالنسبة لمقعدك: 0 أسفل، 1 يمين، 2 أمام (شريكك)، 3 يسار
const UI={ak:0,pm:0,sel:[0,0,0,0],pick:0,rn:0,act:null}; // حالة الواجهة وحدها (لا يعرفها المحرك)
const LOCAL=BalootEngine.create({emit:onEvent,after:(f,ms,raw)=>setTimeout(f,raw?ms:ms*SPEEDS[SPD]),playMs:PLAY_MS});
LOCAL.setHuman(0,true);
let ENG=LOCAL; // المحرك المحلي (لعب فردي) أو REMOTE (لعب جماعي، في net.js)
// حالة المحرك تُقرأ منه مباشرة (للقراءة فقط)
for(const k of ['G','S','D','RN','HIST'])Object.defineProperty(globalThis,k,{get:()=>ENG[k],configurable:true});
const hk=()=>G.mode=='h',isT=c=>hk()&&c.s==G.tr,val=(c,L)=>ENG.val(c,L),pnames=i=>ENG.pnames(i);

function onEvent(ev){
 switch(ev.t){
  case 'state':render();break;
  case 'deal':$('ov').style.display='none';$('pmenu').style.display='none';$('wait').style.display='none';UI.ak=0;UI.pm=0;UI.pick=0;UI.act=null;break;
  case 'fresh':FRESH=1;break;
  case 'say':say(ev.i,ev.m);break;
  case 'splash':splash(ev.text,ev.lv,ev.sub);break;
  case 'proj':showProj(ev);break;
  case 'trickWin':{const el=document.querySelector('.pc'+R(ev.w));if(el)el.classList.add('wn');break}
  case 'sweep':$('mid').className='sw'+R((ev.w+2)%4);break;
  case 'sawa':say(-1,'سوا صحيحة: '+(ev.seat%2==ME%2?'أخذتم':'أخذوا')+' باقي الأكلات');break;
  case 'wait':$('wait').style.display='flex';$('wt').textContent='النتيجة بعد '+ev.n+' — اضغط في أي مكان';break;
  case 'waitEnd':$('wait').style.display='none';break;
  case 'roundEnd':showResult(ev);break}}

// ===== الأزرار السفلية: تُبنى من القرار الذي ينتظره المحرك منك =====
function renderAct(cak){
 $('kawb').classList.toggle('show',!SPEC&&G.ph=='b'&&G.h[ME].length==5&&G.h[ME].every(c=>c&&c.r<=2)); // «كوشة»: أوراقك الخمس كلها 7 و8 و9
 const p=ENG.pending(ME),ph=G.ph;
 if(SPEC){const h='<button onclick="specTurn()">↻ زاوية المشاهدة</button>';if(UI.act!==h){UI.act=h;$('act').innerHTML=h}return}
 if(p&&p.k=='lay'){layUI(p);UI.layOn=1;if(UI.act!==''){UI.act='';$('act').innerHTML=''}return} // إنزال المشروع: اختيار الأوراق
 if(UI.layOn){UI.layOn=0;UI.ls=[];$('pmenu').style.display='none'}
 if(ph=='p'&&UI.pm)return; // قائمة المشاريع مفتوحة: لا نمسّ الأزرار
 let h='';
 if(G.qa)h='';
 else if(ph=='b'){
  if(p&&p.k=='bid'){
   if(UI.pick)h=[0,1,2,3].filter(s=>s!=p.flip).map(s=>`<button class="${s%2?'r':''}" onclick="hb('h',${s})">${SU[s]}</button>`).join('')+`<button onclick="UI.pick=0;render()">رجوع</button>`;
   else h=`<button class="bp" onclick="hb('p')">${p.rd==1?'بس':'ولا'}</button><button class="ba" ${p.canAsh?'':'disabled'} onclick="hb('a')">أشكل</button>`+(p.rd==1?`<button class="bh" onclick="hb('h',${p.flip})">حكم <b class="${p.flip%2?'rd':''}">${SU[p.flip]}</b></button>`:`<button class="bh" onclick="hb('h',0)">حكم ثاني</button>`)+`<button class="bn" onclick="hb('s')">صن ☀</button>`}
  else h=[G.rd==1?'بس':'ولا','أشكل','حكم','صن'].map(t=>`<button disabled>${t}</button>`).join('')}
 else if(ph=='q'&&p)h=`<button class="bp" onclick="aQ(0)">${p.rd==1?'بس':'ولا'}</button><button class="bn" onclick="aQ(1)">قبلك</button>`;
 else if(ph=='f'&&p)h=`<button class="bp" onclick="aF(0)">بس</button>${p.canAsh?`<button class="ba" onclick="aF(1,1)">أشكل</button>`:''}<button class="bn" onclick="aF(1)">صن ☀</button>`;
 else if((ph=='d'||ph=='v')&&p&&p.k=='double'){const n=p.n;h=`<button class="bp" onclick="aD(0)">بس</button>`+(p.two?`<button class="bh" onclick="aD(1,0)">${n} مفتوح</button><button class="ba" onclick="aD(1,1)">${n} مقفل</button>`:`<button class="bh" onclick="aD(1,0)">${n}</button>`)}
 else if(ph=='v'&&p&&p.k=='toSun')h=`<button class="bp" onclick="aW(0)">تأكيد الحكم</button><button class="bn" onclick="aW(1)">اقلب صن ☀</button>`;
 else if(ph=='n'&&p&&p.k=='name')h=[0,1,2,3].filter(s=>s!=p.flip).map(s=>`<button class="${s%2?'r':''}" onclick="aN(${s})">${SU[s]}</button>`).join(''); // تسمية الحكم الثاني بعد قرار الخصم
 else if(ph=='x')h=`<button id="qb" onclick="qaidUI()">قيد</button>`; // يمكن القيد أثناء انتظار النتيجة
 else if(ph=='p'){
  const dcl=G.n==0&&!G.dc[ME]&&!G.fd[ME]; // الزر ثابت دائمًا قبل لعب أول ورقة (فلا يكشف أن معك مشروعًا)
  h=`<button id="qb" onclick="qaidUI()">قيد</button>`+(dcl?`<button id="pjb" class="on" onclick="projMenu()">المشاريع</button>`:'')+(hk()?`<button class="${UI.ak?'on':''}" ${cak?'':'disabled'} onclick="tkToggle()">إكة</button>`:'')+`<button id="bs" onclick="sawa()" ${G.turn==ME&&!G.t.length&&G.n>=1?'':'disabled'}>سوا</button>`}
 if(UI.act!==h){UI.act=h;$('act').innerHTML=h}}

// ===== أفعال اللاعب (تُرسل للمحرك، وهو من يقرر) =====
function hb(k,s){UI.pick=0;ENG.bid(ME,k,s)}
function aQ(y){ENG.answerBefore(ME,y)}
function aF(y,a){ENG.answerFlip(ME,y,a)}
function aD(y,cl){ENG.answerDouble(ME,y,cl)}
function aW(y){ENG.answerSun(ME,y)}
function aN(s){ENG.nameSuit(ME,s)}
function tkToggle(){UI.ak=!UI.ak;render()}
function hp(c){
 if(UI.pm)commitP();
 const id=c.s*8+c.r;
 if(UI.sel!==id){UI.sel=id;render();return} // لمسة أولى: تحديد الورقة، ولمسة ثانية عليها: إنزالها
 UI.sel=-1;const a=UI.ak;UI.ak=0;ENG.play(ME,id,!!a)}
function sawa(){ENG.sawa(ME)}
function newGame(){STREAK=0;ENG.newGame()}
function specTurn(){SPECSEAT=(SPECSEAT+1)%4;if(typeof netView=='function')netView();render()}
function ovClick(e){if(RESULT&&G.ph=='e'&&!(e.target.closest&&e.target.closest('button')))ENG.nextRound()}

// المشاريع يدوية: اختر نوع مشروعك بالنقر عليه (يمكن أكثر من واحد)، ثم المس أي مكان لإعلانه.
// إن كان في يدك أُعلن، وإن لم يكن صحيحًا لا يُحتسب. والنقر خارج القائمة دون اختيار يغلقها فقط.
function projMenu(){UI.pm=1;UI.ps=[0,0,0,0];showPM()}
function showPM(){
 const tx=UI.ps.map((n,j)=>n?PJ[PV[j]]+(n>1?' ×'+n:''):'').filter(Boolean).join(' + ');
 $('pmenu').innerHTML=`<div class="pt">${tx||'اختر مشروعك'}</div><div class="pr">${PV.map((v,j)=>`<button class="${UI.ps[j]?'on':''}" onclick="selP(${j})">${PJ[v]}${UI.ps[j]?' <b>×'+UI.ps[j]+'</b>':''}</button>`).join('')}</div><div class="ph">${tx?'المس أي مكان لإعلانه':'اضغط المشروع ثم المس أي مكان'}</div>`;
 $('pmenu').style.display='block'}
function selP(j){const mx=j==3?1:2;UI.ps[j]=UI.ps[j]>=mx?0:UI.ps[j]+1;showPM()}
function closePM(){UI.pm=0;$('pmenu').style.display='none';render()}
function commitP(){
 const want=[];(UI.ps||[]).forEach((n,j)=>{for(let k=0;k<n;k++)want.push(PV[j])});
 UI.pm=0;$('pmenu').style.display='none';
 if(!want.length||!ENG.project(ME,want))render()}
document.addEventListener('click',e=>{if(!UI.pm)return;const path=e.composedPath?e.composedPath():[];if(!path.some(n=>n.id=='pmenu'||n.id=='pjb'))commitP()});

// إنزال المشروع (الأكلة الثانية للفريق الأقوى): تختار الأوراق التي تنزلها بنفسك، وقد تغش فتنزل أوراقًا لا تطابق إعلانك.
const layP=()=>{const p=ENG.pending(ME);return !!p&&p.k=='lay'};
function layUI(p){
 const sel=UI.ls||(UI.ls=[]),pool=sortHand(G.h[ME]); // الأوراق التي في يدك فقط (ما رُمي في الأكلة الأولى لا يظهر)
 $('pmenu').innerHTML=`<div class="pt">أنزل مشروعك: ${p.want.map(v=>PJ[v]).join(' + ')}</div><div class="lyc" style="--n:${pool.length}">${pool.map(c=>{const id=c.s*8+c.r;return `<div class="lyk ${sel.includes(id)?'on':''}" onclick="layPick(${id})">${card(c)}</div>`}).join('')}</div><div class="pr"><button class="bh" onclick="layGo()">تنزيل ${sel.length?'('+sel.length+')':''}</button><button class="bp" onclick="layNo()">لا أنزل</button></div><div class="ph">اختر الأوراق التي تنزلها ثم اضغط تنزيل</div>`;
 $('pmenu').style.display='block'}
function layPick(id){const s=UI.ls||(UI.ls=[]),k=s.indexOf(id);if(k>=0)s.splice(k,1);else s.push(id);render()}
function layGo(){const ids=(UI.ls||[]).slice();if(!ids.length)return;UI.ls=[];ENG.lay(ME,ids)}
function layNo(){UI.ls=[];ENG.lay(ME,[])}

// ===== نتيجة الجولة =====
const cardTx=id=>RK[id%8]+SU[id>>3];
const tn=t=>t==ME%2?'لنا':'لهم';
function qMsg(type,p,pid,rid){
 const who=p==ME?'عليك':'على '+NM[p];
 if(type=='proj')return `قيد مشروع كاذب ${who}: أنزل أوراقًا لا تطابق ما أعلنه`;
 if(type=='sawa')return 'قيد سوا خاطئ: لم يُعلن أحد سوا';
 return type=='ace'?`قيد ${VT[type]} ${who}: أعلن إكة بورقة ${cardTx(pid)} وهي ليست الأعلى`:`قيد ${VT[type]} ${who}: لعب ${cardTx(pid)} وكان مفروضًا يلعب ${cardTx(rid)}`}
function qaidText(i){
 if(i.forfeit)return 'انتهت مهلة القيد فانقلب على '+(i.by==ME?'صاحبه (أنت)':NM[i.by]);
 if(i.type=='sawa'&&i.auto)return `قيد سوا خاطئ ${i.p==ME?'عليك':'على '+NM[i.p]}: ${i.p==ME?'أعلنت':'أعلن'} سوا وبقيت أكلات لا ${i.p==ME?'تكسبها':'يكسبها'}`;
 const tx=qMsg(i.type,i.p,i.pid,i.rid);
 if(i.auto)return tx;
 return i.valid?'قيد صحيح — '+tx:'قيد خاطئ — '+tx+' (لم يثبت) فانقلب '+(i.by==ME?'عليكم':'على '+NM[i.by])}
function resMsg(info){
 if(!info)return '';
 switch(info.k){
  case 'kaboot':return info.qaid?'كبوت — القيد لا يُنقذ الفريق الذي كان سيُكبَّت':'كبوت!';
  case 'dbl':return DN[info.m-2]+(info.coffee?' وقهوة':'')+': '+tn(info.w)+' يربحون الجولة';
  case 'lost':return tn(info.b)+': المشتري خسر الجولة';
  case 'qaid':return qaidText(info)}
 return ''}
function showResult(r){
 const us=ME%2,them=1-us,pu=r.p[us],pt=r.p[them],S_=r.S;
 const our=pu>pt?1:pt>pu?-1:0,end=r.end,d=r.det,m=resMsg(r.info);
 STREAK=our>0?STREAK+1:0;
 const row=(l,a,b)=>`<tr><td>${l}</td><td>${a}</td><td>${b}</td></tr>`,wn=our>0?0:our<0?1:-1;
 const tot=`<tr class="tot"><td>الجولة${d&&d.m>1?' ×'+d.m:''}</td><td class="${wn==0?'win':''}">${pu}</td><td class="${wn==1?'win':''}">${pt}</td></tr>`;
 const tb=d?`<table class="rt"><tr><th></th><th class="a">لنا</th><th class="b">لهم</th></tr>${row('الأبناط',d.raw[us],d.raw[them])}${row('نقاط الأوراق',d.cp[us],d.cp[them])}${row('المشاريع',d.pp[us],d.pp[them])}${row('البلوت',d.bl[us],d.bl[them])}${tot}</table>`:`<table class="rt">${tot}</table>`;
 const gw=!SPEC&&(end?S_[us]>S_[them]:our>0),hd=SPEC?(end?'انتهت اللعبة':'انتهت الجولة'):end?(gw?'فزتم باللعبة!':'خسرتم اللعبة'):our>0?'كسبتم الجولة':our<0?'خسرتم الجولة':'تعادل';
 $('ovb').className=gw?'win':(!SPEC&&(our<0||end))?'lose':'';
 $('ovb').innerHTML=`<div class="ico ${gw?'up':(!SPEC&&(our<0||end))?'dn':''}">${SPEC?'🎴':gw?'🏆':(our<0||end)?'💔':'🤝'}</div><h2>${hd}</h2>${STREAK>=2&&!end?`<div class="stk">🔥 ${STREAK} جولات متتالية</div>`:''}${m?`<div class="nt">${m}</div>`:''}${tb}<div class="sum">المجموع: لنا <b class="a">${S_[us]}</b> — لهم <b class="b">${S_[them]}</b></div>${end?(NETON&&!netOwner()?'<div class="nt">بانتظار مالك الغرفة لبدء لعبة جديدة</div>':'<button onclick="newGame()">لعبة جديدة</button>'):'<div class="cdb"><i></i></div>'}`;
 $('ov').style.display='flex';RESULT=!end;
 const st=$('stage');st.classList.remove('gw','gl');if(SPEC);else if(our>0)st.classList.add('gw');else if(our<0){st.classList.add('gl','shake');setTimeout(()=>st.classList.remove('shake'),600)}
 if(r.info&&r.info.k=='kaboot'){splash('كبوت!',4);confetti(60)}
 else if(our>0&&!SPEC)confetti(end?60:18);
 if(!NETON)botReact(our,r.info)}
