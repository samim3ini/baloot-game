// الواجهة: الرسم والأصوات وتغيير شكل الأوراق والمساعدة
function log(){}
const BIDW=/^(بس|ولا|صن|حكم|أشكل|قبلك|دبل|ثري|فور|قهوة)/;
function say(i,m){
 if(i>=0&&BIDW.test(m))return;
 const e=$('msg');e.textContent=(i>=0?NM[i]+': ':'')+m;e.classList.add('show');clearTimeout(mt);mt=setTimeout(()=>e.classList.remove('show'),1800)}
const SKIN={},ck=c=>RK[c.r]+SUL[c.s];let UP={};
function card(c,k='',st=''){if(!c)return `<div class="cd bkcard ${k}" style="${st}"></div>`;const r=c.r,s=SU[c.s],u=SKIN[ck(c)];
 if(u)return `<div class="cd sk ${k}" style="background-image:url('${u}');${st}"></div>`;
 const cr=`<i>${RK[r]}</i><b>${s}</b>`;
 return `<div class="cd ${RED(c)?'rd':''} ${k}" style="${st}"><span class="cr">${cr}</span><span class="cr b">${cr}</span><span class="cm"><i>${RK[r]}</i><b>${s}</b></span></div>`}
const RUGSVG=`<svg viewBox="0 0 400 240" preserveAspectRatio="none"><defs><pattern id="dt" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#e9cf96"/><circle cx="8" cy="8" r="4.6" fill="#cf3a24"/><circle cx="8" cy="8" r="1.8" fill="#f3dca4"/></pattern><pattern id="zg" width="36" height="22" patternUnits="userSpaceOnUse"><rect width="36" height="22" fill="#b3302b"/><path d="M0 22L18 3L36 22Z" fill="#d89a2b"/><path d="M0 0L18 19L36 0Z" fill="#2f7a5a"/></pattern><pattern id="sp" width="8" height="40" patternUnits="userSpaceOnUse"><rect width="8" height="40" fill="#b3302b"/><rect y="6" width="8" height="2" fill="#e0574c"/><rect y="20" width="8" height="3" fill="#4b3a86"/><circle cx="4" cy="33" r="1.4" fill="#2f7a5a"/></pattern></defs><rect width="400" height="240" fill="url(#dt)"/><rect x="14" y="14" width="372" height="212" fill="#7d221f"/><rect x="18" y="18" width="364" height="204" fill="url(#sp)"/><rect x="18" y="50" width="364" height="22" fill="url(#zg)"/><rect x="18" y="168" width="364" height="22" fill="url(#zg)"/><rect x="18" y="108" width="364" height="22" fill="url(#zg)" opacity=".85"/></svg>`;
function applySkin(){
 document.documentElement.style.setProperty('--back',SKIN.back?`url('${SKIN.back}')`:'none');
 $('rug').innerHTML=SKIN.rug?`<img src="${SKIN.rug}" alt="">`:RUGSVG;
 $('stage').style.backgroundImage=SKIN.table?`url('${SKIN.table}')`:'';
 if(G)render()}
const idb=(m,v)=>new Promise(res=>{try{const q=indexedDB.open('baloot-skin',1);q.onupgradeneeded=()=>q.result.createObjectStore('f');q.onsuccess=()=>{const st=q.result.transaction('f',m=='get'?'readonly':'readwrite').objectStore('f'),r=m=='get'?st.get('skin'):m=='set'?st.put(v,'skin'):st.delete('skin');r.onsuccess=()=>res(r.result);r.onerror=()=>res()};q.onerror=()=>res()}catch(e){res()}});
function loadSkin(){
 ALLK.forEach(k=>{const t=n=>{const im=new Image();im.onload=()=>{if(!UP[k]){SKIN[k]=im.src;applySkin()}};if(n<1)im.onerror=()=>t(n+1);im.src=CARD_DIR+(n?k.toLowerCase():k)+'.'+CARD_EXT};t(0)});
 idb('get').then(o=>{if(o){UP=o;Object.assign(SKIN,o);applySkin()}})}
let OVP=null;
function ovOpen(h){OVP=$('ov').style.display=='flex'?$('ovb').innerHTML:null;$('ovb').innerHTML=h;$('ov').style.display='flex'}
function ovClose(){if(OVP){$('ovb').innerHTML=OVP;OVP=null}else $('ov').style.display='none'}
function skinUI(){const n=ALLK.filter(k=>SKIN[k]).length;
 ovOpen(`<h2>تغيير شكل الأوراق</h2><ul><li>اختر صور الأوراق دفعة واحدة. اسم الملف هو رمز الورقة ثم النوع، مثل AS (آس البستوني) و10H (عشرة القلب) وKC وQD وJS.</li><li>الأنواع: S بستوني، H قلب، C سباتي، D ديناري.</li><li>ملفات اختيارية: back (ظهر الورقة) وrug (السجادة) وtable (خلفية الطاولة).</li><li>أي ورقة بلا صورة تظهر بشكلها الافتراضي.</li><li>الصور تُحفظ في متصفحك فقط. وإن حمّلت الصفحة إلى جهازك فضع الصور في مجلد cards بجانبها وتُقرأ تلقائيًا.</li></ul><p>الصور المفعّلة الآن: ${n} من ${ALLK.length}</p><input type="file" id="fi" accept="image/*" multiple><br><br><button onclick="skinGo()">تطبيق</button> <button onclick="skinReset()">الشكل الافتراضي</button> <button onclick="ovClose()">إغلاق</button>`)}
function skinGo(){const fs=[...$('fi').files],m={};ALLK.forEach(k=>m[k.toLowerCase()]=k);
 Promise.all(fs.map(f=>{const k=m[f.name.replace(/\.[^.]*$/,'').toLowerCase()];return k?new Promise(r=>{const fr=new FileReader();fr.onload=()=>r([k,fr.result]);fr.onerror=()=>r(null);fr.readAsDataURL(f)}):null})).then(async a=>{const o={...UP};a.filter(Boolean).forEach(([k,v])=>o[k]=v);UP=o;await idb('set',o);Object.assign(SKIN,o);applySkin();OVP=null;$('ov').style.display='none';skinUI()})}
function skinReset(){UP={};idb('del');ALLK.forEach(k=>delete SKIN[k]);applySkin();loadSkin();OVP=null;$('ov').style.display='none';skinUI()}

function share(){if(navigator.share)navigator.share({title:'بلوت',url:location.href}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(()=>say(-1,'تم نسخ الرابط')).catch(()=>{})}
function splash(t,lv,sb){const e=document.createElement('div');e.className='splash lv'+lv;e.innerHTML=t+(sb?`<small>${sb}</small>`:'');$('stage').appendChild(e);if(lv>=3){$('stage').classList.add('shake');setTimeout(()=>$('stage').classList.remove('shake'),600)}setTimeout(()=>{if(e.remove)e.remove()},1700)}
function confetti(n=44){const b=document.body;if(!b)return;const c=['#d9ae4a','#7db4ff','#ff9f86','#6fc263','#fff'];for(let i=0;i<n;i++){const e=document.createElement('div');e.className='cf';e.style.left=(Math.random()*100)+'vw';e.style.background=c[i%5];e.style.animationDelay=(Math.random()*.6)+'s';e.style.setProperty('--dx',((Math.random()-.5)*200)+'px');b.appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},3600)}}
function setScore(id,v){const e=$(id);if(e.textContent==String(v))return;e.textContent=v;e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')}
// أوراق السوا/نهاية الجولة: متناثرة قليلًا ومتقاربة (إزاحة ودوران ثابتان لكل ورقة حتى لا تتحرك عند إعادة الرسم)
const jit=(c,n)=>{const x=Math.sin((c.s*8+c.r+1)*(n+3.7))*10000;return x-Math.floor(x)};
function revealHtml(){return G.rev.map((h,i)=>h.length?`<div class="rv rv${R(i)}">${h.map(c=>card(c,'',`--rr:${((jit(c,1)-.5)*26).toFixed(1)}deg;--rx:${((jit(c,2)-.5)*10).toFixed(1)}px;--ry:${((jit(c,3)-.5)*12).toFixed(1)}px`)).join('')}</div>`:'').join('')}
function showProj(i){
 const rem=G.pcd[i].flat().filter(c=>!G.pl[i].includes(c));if(!rem.length)return;
 const e=document.createElement('div');e.className='pjr p'+R(i);
 e.innerHTML='<span>'+pnames(i)+'</span><div class="row">'+rem.map(c=>card(c)).join('')+'</div>';
 $('stage').appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},4500)}

function pop(i,n){const e=document.createElement('div');e.className='pop p'+R(i);e.textContent='+'+n;$('stage').appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},1400)}
// كومة الأكلات الرابحة لمقعد i: أوراق أفقية متراكمة (حتى 8 طبقات) وعدد الأكلات فوقها
function pileHtml(i){const n=G.pile[i];if(!n)return'';const L=Math.min(n,8);return `<div class="pile" style="--n:${L}">${Array.from({length:L},(_,k)=>`<u style="--k:${k}"></u>`).join('')}<b>${n}</b></div>`}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DLR='<div class="dlr" title="الموزع"><i></i><span>موزع</span></div>';
function render(){
 const us=ME%2,them=1-us;setScore('s0',S[us]);setScore('s1',S[them]);$('streak').textContent=STREAK>=2?'🔥 '+STREAK+' جولات متتالية':'';
 $('hist').innerHTML=HIST.map(h=>`<tr><td>${h.n}</td><td>${h.mode}${h.m>1?' ×'+h.m:''}</td><td class="a">${h.p[us]}</td><td class="b">${h.p[them]}</td></tr>`).join('');{const hs=$('hsc');hs.scrollTop=hs.scrollHeight}
 {const tot=hk()?162:130,x=G.pt[us],y=G.pt[them];$('live').innerHTML=G.mode&&G.ph!='e'?`<div class="lb"><b class="a">${x}</b><div class="bar"><i class="a" style="width:${x/tot*100}%"></i><i class="b" style="width:${y/tot*100}%"></i><u></u></div><b class="b">${y}</b></div><small>أبناط الجولة من ${tot}</small>`:''}$('rn').textContent='الجولة '+RN;
 function bdg(i){if(!G.mode||G.buyer!=i)return'';return G.mode=='s'?(G.ash?'أشكل · صن':'صن'):`حكم <b class="${G.tr%2?'rd':''}">${SU[G.tr]}</b>`}
 $('info').innerHTML=(G.mode?(G.mode=='s'?'<span class="bg">صن</span>':`<span class="bg ${G.tr%2?'rd':''}">${SU[G.tr]}</span> حكم`)+'<br><small>المشتري: '+esc(NM[G.buyer])+(G.ash?' (أشكل)':'')+(G.m>1?' — '+DN[G.m-2]:'')+(G.coffee?' — قهوة':'')+(G.cl?' (مقفل)':'')+'</small>':'<small>المزايدة</small>');
 const act=G.ph!='e'&&G.t.length<4;
 for(let r=1;r<4;r++){const i=(ME+r)%4,e=$('p'+r),hd=G.h[i],n=hd.length,real=n&&hd[0];e.className='seat tm'+(r%2)+(act?(G.turn==i?' on':' dim'):'')+(G.mode&&G.buyer==i?' buyer':'');
  e.innerHTML=(real?`<div class="bk fc">${hd.map(c=>card(c)).join('')}</div>`:`<div class="bk">${Array.from({length:n},(_,k)=>`<u style="--r:${((k-(n-1)/2)*8).toFixed(1)}deg"></u>`).join('')}</div>`)+`<div class="av"></div><div class="pl"><b class="nm">${esc(NM[i])}</b></div>${i==G.dealer?DLR:''}${G.mode&&G.buyer==i?`<div class="by">${bdg(i)}</div>`:''}${G.tag[i]?`<div class="bb">${G.tag[i]}</div>`:''}${pileHtml(i)}`}
 const nw=G.t.length>(UI.rn||0);$('mid').className='';$('mid').innerHTML=(G.ph=='b'||G.ph=='f'||G.ph=='q'||G.fly!=null?`<div class="fl${G.fly!=null?' fly'+R(G.fly):''}">${card(G.fl)}</div>`:'')+G.t.map((x,k)=>card(x.c,'pc pc'+R(x.i)+(nw&&k==G.t.length-1?' pin':''))).join('')+(G.rev?revealHtml():'');UI.rn=G.t.length;
 const my=G.ph=='p'&&G.turn==ME&&G.t.length<4,n0=G.h[ME].length,cak=my&&hk()&&!G.t.length;if(!cak)UI.ak=0;
 $('hand').innerHTML='';
 G.h[ME].forEach((c,k)=>{const d=document.createElement('div');d.innerHTML=card(c,(my?'ok':'')+(FRESH?' dlv':''));const e=d.firstChild;if(FRESH)e.style.animationDelay=(k*60)+'ms';
  e.style.setProperty('--r',((k-(n0-1)/2)*4)+'deg');e.style.setProperty('--y0',(Math.abs(k-(n0-1)/2)*3)+'px');
  if(my)e.onclick=()=>hp(c);$('hand').appendChild(e)});FRESH=0;
 document.querySelector('.me').className='me tm0'+(act?(G.turn==ME?' on':' dim'):'')+(G.mode&&G.buyer==ME?' buyer':'');document.querySelector('.me .nm').textContent=SPEC?'مشاهد · مقعد '+(ME+1):'أنت';
 $('dl0').style.display=G.dealer==ME?'':'none';$('pl0').innerHTML=pileHtml(ME);$('stage').classList.toggle('myturn',!!my);const bd=G.ph=='b'||G.ph=='f'||G.ph=='q';$('rdn').style.display=bd?'':'none';$('rdn').innerHTML=bd?`<span class="${G.rd==1?'on':''}">الدور الأول</span><span class="${G.rd==2?'on':''}">الدور الثاني</span>`:'';
 $('dblb').innerHTML=G.m>1||G.coffee?`<div class="r lv${G.coffee?5:G.m}"><b>${G.coffee?'☕':'×'+G.m}</b><span>${G.coffee?'قهوة':DN[G.m-2]+(hk()&&(G.m==2||G.m==4)?(G.cl?' مقفل':' مفتوح'):'')}</span></div>`:'';$('by0').innerHTML=bdg(ME);$('by0').style.display=G.mode&&G.buyer==ME?'':'none';
 $('trp').style.display=G.mode?'':'none';$('trp').innerHTML=G.mode?(G.mode=='s'?'<b class="sn">صن</b>':`<b class="${G.tr%2?'rd':''}">${SU[G.tr]}</b><small>حكم</small>`)+(G.ash?'<small>أشكل</small>':''):'';
 renderAct(cak);qaidSync()
}

const EMO=['👍','👏','😂','😎','😡','😭','🔥','🤝'];
function emoTray(){const e=$('emt');if(e.style.display=='flex'){e.style.display='none';return}e.innerHTML=EMO.map(x=>`<button onclick="emote(0,'${x}');$('emt').style.display='none'">${x}</button>`).join('');e.style.display='flex'}
function emote(i,x){const e=document.createElement('div');e.className='emo e'+i;e.textContent=x;$('stage').appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},2400);
 if(i==0&&Math.random()<.6)setTimeout(()=>emote(2,['👍','😂','🔥'][Math.random()*3|0]),900+Math.random()*700)}
function botReact(our,info){
 const e=(i,x,ms)=>setTimeout(()=>emote(i,x),ms);
 if(info&&info.k=='kaboot'){e(1,'🤯',500);e(3,'🤯',900);return}
 if(our>0){e(1+2*(Math.random()<.5?1:0),'😭',700);e(2,'👏',1100)}else if(our<0){e(1+2*(Math.random()<.5?1:0),'😎',700);e(2,'😅',1100)}}
function showLast(){
 if(!G||!G.last||!G.last.length)return;
 const e=document.createElement('div');e.className='pjr lastt';
 e.innerHTML='<span>آخر أكلة — فاز بها '+NM[G.lw]+'</span><div class="row">'+G.last.map(x=>`<div class="lc${x.i==G.lw?' w':''}">${card(x.c)}<small>${NM[x.i]}</small></div>`).join('')+'</div>';
 $('stage').appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},3500)}
function showTracker(){
 if(!G)return;const pl=G.pl.flat();
 const rows=[0,1,2,3].map(s=>`<div class="trr ${s%2?'rd':''}"><b>${SU[s]}</b>${[7,3,6,5,4,2,1,0].map(r=>`<span class="${pl.some(c=>c.s==s&&c.r==r)?'x':G.h[0].some(c=>c.s==s&&c.r==r)?'m':''}">${RK[r]}</span>`).join('')}</div>`).join('');
 ovOpen(`<h2>الأوراق الخارجة</h2><div class="trk">${rows}</div><p class="lg2"><span class="x">خرجت</span> <span class="m">في يدك</span> <span>لم تخرج</span></p><button onclick="ovClose()">إغلاق</button>`)}
const SPNAME=['بطيء','عادي','سريع'],SPICO=['🐢','🐇','⚡'];
function cycSpeed(){SPD=(SPD+1)%3;$('spi').textContent=SPICO[SPD];$('spt').textContent=SPNAME[SPD]}

// ===== القيد: الواجهة (على نمط كملنا) =====
// تُرسم النافذة من حالة المحرك G.qa. أنت المقيِّد إن كان by==ME ولم يكن كشفًا من بوت، وإلا فأنت غير مقيِّد (مشاهد).
// كل نقرة ترسل اختيارها للمحرك (qaidSet) ثم تُعاد الرسم من حالته. اللعب متوقف خلف النافذة عند الجميع.
// نافذة المقيِّد لا تُغلق حتى يُحدَّد القيد ويُؤكَّد، فاحذر من القيد الخاطئ: ينقلب عليك.
const qId=c=>c.s*8+c.r,qCard=id=>({s:id>>3,r:id&7}),qOwn=id=>[0,1,2,3].find(j=>G.pl[j].some(c=>qId(c)==id));
const qNeedR=t=>!!t&&t!='ace'&&t!='sawa';
const qReady=q=>q.t=='sawa'||(!!q.t&&q.pc>=0&&(!qNeedR(q.t)||q.rq>=0));
const qMine=q=>!!q&&!q.auto&&q.by==ME;
function qDots(i){const k=['b','r','t','l'][(i-ME+4)%4];return `<span class="qdots">${['t','r','b','l'].map(x=>`<i class="${x==k?'y':''}"></i>`).join('')}</span>`}
function qSlot(c,cls,fn,lbl){return `<div class="qc ${cls}"${fn?` onclick="${fn}"`:''} style="--rr:${((jit(c,1)-.5)*7).toFixed(1)}deg">${card(c)}${lbl?`<small>${lbl}</small>`:''}</div>`}
// هل تُنقر هذه الورقة الآن (وضع المقيِّد)؟ الورقة المحددة تُنقر لإلغائها. اليد المتبقية لا تُنقر إلا لاختيار «الورقة المفروضة» من يد المتهم.
function qCan(id,o,hand){
 const q=G.qa;if(!qMine(q)||q.t=='sawa'||o%2==ME%2)return false;
 if(id==q.pc||id==q.rq)return true;
 if(hand)return q.pc>=0&&qNeedR(q.t)&&o==qOwn(q.pc);
 return true}
function qSt(id,o,hand){
 const q=G.qa;let c=id==q.pc?'bad ':id==q.rq?'ok ':'';
 if(!qMine(q))return c;
 if(qCan(id,o,hand))c+='pk ';
 else if(hand?(q.pc>=0&&qNeedR(q.t)&&o!=qOwn(q.pc)):true)c+='dm ';
 return c}
function qPick(id,o,hand){
 const q=G.qa;if(!qMine(q)||!qCan(id,o,hand))return;
 let pc=q.pc,rq=q.rq;
 if(id==pc){pc=-1;rq=-1}
 else if(id==rq)rq=-1;
 else if(pc<0)pc=id;
 else if(o!=qOwn(pc)){pc=id;rq=-1}
 else if(qNeedR(q.t))rq=id;
 else pc=id;
 ENG.qaidSet(ME,{pc,rq})}
function qType(t){
 const q=G.qa;if(!qMine(q))return;
 ENG.qaidSet(ME,q.t==t?{t:'',rq:-1}:t=='sawa'?{t,rq:-1,pc:-1}:{t,rq:-1})}
function qaidDlg(){
 const q=G.qa,mine=qMine(q),V=!mine,old=document.querySelector('#qvb .qbody'),sc=old?old.scrollTop:0,nr=qNeedR(q.t),ready=qReady(q);
 const types=['cut',...(hk()&&G.cl?['open']:[]),...(hk()?['nobig','nodq','ace']:[]),'sawa'];
 const ins=q.pc<0&&q.t!='sawa'?'اختر الورقة التي <b class="qr">تم الغش بها</b>':!q.t?'اختر <b class="qy">نوع القيد</b>':(nr&&q.rq<0)?'اختر الورقة التي <b class="qg">كان يجب لعبها</b>':'اضغط «قيدها» للتأكيد';
 const head=V?`<div class="qh"><div class="qins">نوع القيد : <b class="qy">${q.t?VT[q.t]:'...'}</b></div></div>`
  :`<div class="qh"><div class="qhr"><div class="qtab">نوع القيد</div><div class="qins">${ins}</div></div><div class="qty">${types.map(t=>`<button class="${q.t==t?'on':''}" onclick="qType('${t}')">${VT[t]}</button>`).join('')}</div></div>`;
 const pair=V?`<div class="qpair">${q.pc>=0?`<div class="qps">${qSlot(qCard(q.pc),'bad')}<small>الورقة التي غُشّ بها</small></div>`:''}${nr&&q.rq>=0?`<div class="qps">${qSlot(qCard(q.rq),'ok')}<small>كان يجب لعبها</small></div>`:''}${q.t=='sawa'?`<p class="qnote">${q.p==ME?'أعلنتَ سوا وبقيت أكلات لا تكسبها':esc(NM[q.p])+' أعلن سوا وبقيت أكلات لا يكسبها'}</p>`:''}</div>`:'';
 const wn=t=>t.reduce((a,b)=>val(b.c,t[0].c.s)>val(a.c,t[0].c.s)?b:a).i,tr=[...G.tl,...(G.t.length?[G.t]:[])];
 const trh=tr.length?tr.map((t,k)=>{const w=t.length==4?wn(t):-1;
  return `<div class="qt"><h3>الأكلة ${k+1}</h3><div class="qtb">${t.map(x=>{const id=qId(x.c);return qSlot(x.c,qSt(id,x.i,0),qCan(id,x.i,0)?`qPick(${id},${x.i},0)`:'',(x.i==w?'★ ':'')+esc(NM[x.i]))}).join('')}</div></div>`}).join(''):'<p class="qemp">لم تُلعب أي أكلة بعد</p>';
 const team=q.auto&&q.p>=0?[q.p,(q.p+2)%4]:[(q.by+1)%4,(q.by+3)%4];
 const hh=team.some(j=>G.h[j].length)?`<div class="qhands">${team.map(j=>`<div class="qhb"><div class="qhh"><span>${esc(NM[j])}</span>${qDots(j)}</div><div class="qhg">${G.h[j].length?G.h[j].map(c=>{const id=qId(c);return qSlot(c,qSt(id,j,1),qCan(id,j,1)?`qPick(${id},${j},1)`:'')}).join(''):'<p class="qemp">لا أوراق</p>'}</div></div>`).join('')}</div>`:'';
 const ft=mine?`<div class="qf"><div class="qwho">المقيد: <b>${esc(NM[q.by])}</b></div><button class="${ready?'go':''}" ${ready?'':'disabled'} onclick="qConfirm()">قيدها</button></div>`
  :`<div class="qf"><div class="qwho">المقيد: <b>${esc(NM[q.by])}</b></div>${q.auto?'<button class="go" onclick="qCont()">متابعة</button>':'<div class="qwho">أنت مشاهد</div>'}</div>`;
 $('qvb').innerHTML=head+`<div class="qbody">${pair}<p class="qhint">${V?'':'اضغط الورقة المحددة مرة ثانية لإلغائها · '}★ أخذ الأكلة</p>${trh}${hh}</div>`+ft;
 $('qv').style.display='flex';document.querySelector('#qvb .qbody').scrollTop=sc}
function qaidSync(){
 if(G.qa)qaidDlg();
 else if($('qv').style.display!='none'){$('qv').style.display='none';$('qvb').innerHTML=''}}
function qaidUI(){ENG.qaidOpen(ME)}
function qConfirm(){ENG.qaidConfirm(ME)}
function qCont(){ENG.qaidAck(ME)}
