// الواجهة: الرسم والأصوات وتغيير شكل الأوراق والمساعدة
function log(){}
const BIDW=/^(بس|ولا|صن|حكم|أشكل|قبلك|دبل|ثري|فور|قهوة)/;
function say(i,m){
 if(i>=0&&BIDW.test(m))return;
 const e=$('msg');e.textContent=(i>=0?NM[i]+': ':'')+m;e.classList.add('show');clearTimeout(mt);mt=setTimeout(()=>e.classList.remove('show'),1800)}
const SKIN={},ck=c=>RK[c.r]+SUL[c.s];let UP={};
<<<<<<< HEAD
function card(c,k='',st=''){const r=c.r,s=SU[c.s],u=SKIN[ck(c)];
 if(u)return `<div class="cd sk ${k}" style="background-image:url('${u}');${st}"></div>`;
 const cr=`<i>${RK[r]}</i><b>${s}</b>`;
 return `<div class="cd ${RED(c)?'rd':''} ${k}" style="${st}"><span class="cr">${cr}</span><span class="cr b">${cr}</span><span class="cm"><i>${RK[r]}</i><b>${s}</b></span></div>`}
=======
function card(c,k=''){const r=c.r,s=SU[c.s],u=SKIN[ck(c)];
 if(u)return `<div class="cd sk ${k}" style="background-image:url('${u}')"></div>`;
 const cr=`<i>${RK[r]}</i><b>${s}</b>`;
 return `<div class="cd ${RED(c)?'rd':''} ${k}"><span class="cr">${cr}</span><span class="cr b">${cr}</span><span class="cm"><i>${RK[r]}</i><b>${s}</b></span></div>`}
>>>>>>> cce7580195d6348c938aac1f92e1fa0f2affe16f
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
<<<<<<< HEAD
// أوراق السوا/نهاية الجولة: متناثرة قليلًا ومتقاربة (إزاحة ودوران ثابتان لكل ورقة حتى لا تتحرك عند إعادة الرسم)
const jit=(c,n)=>{const x=Math.sin((c.s*8+c.r+1)*(n+3.7))*10000;return x-Math.floor(x)};
function revealHtml(){return G.rev.map((h,i)=>h.length?`<div class="rv rv${i}">${h.map(c=>card(c,'',`--rr:${((jit(c,1)-.5)*26).toFixed(1)}deg;--rx:${((jit(c,2)-.5)*10).toFixed(1)}px;--ry:${((jit(c,3)-.5)*12).toFixed(1)}px`)).join('')}</div>`:'').join('')}
=======
function revealHtml(){return G.rev.map((h,i)=>h.length?`<div class="rv rv${i}">${h.map(c=>card(c)).join('')}</div>`:'').join('')}
>>>>>>> cce7580195d6348c938aac1f92e1fa0f2affe16f
function showProj(i){
 const rem=G.pcd[i].flat().filter(c=>!G.pl[i].includes(c));if(!rem.length)return;
 const e=document.createElement('div');e.className='pjr p'+i;
 e.innerHTML='<span>'+pnames(i)+'</span><div class="row">'+rem.map(c=>card(c)).join('')+'</div>';
 $('stage').appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},4500)}

function pop(i,n){const e=document.createElement('div');e.className='pop p'+i;e.textContent='+'+n;$('stage').appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},1400)}
<<<<<<< HEAD
// كومة الأكلات الرابحة لمقعد i: أوراق أفقية متراكمة (حتى 8 طبقات) وعدد الأكلات فوقها
function pileHtml(i){const n=G.pile[i];if(!n)return'';const L=Math.min(n,8);return `<div class="pile" style="--n:${L}">${Array.from({length:L},(_,k)=>`<u style="--k:${k}"></u>`).join('')}<b>${n}</b></div>`}
=======
>>>>>>> cce7580195d6348c938aac1f92e1fa0f2affe16f
const DLR='<div class="dlr" title="الموزع"><i></i><span>موزع</span></div>';
function render(){
 setScore('s0',S[0]);setScore('s1',S[1]);$('streak').textContent=STREAK>=2?'🔥 '+STREAK+' جولات متتالية':'';
 $('hist').innerHTML=HIST.map(h=>`<tr><td>${h.n}</td><td>${h.mode}${h.m>1?' ×'+h.m:''}</td><td class="a">${h.p[0]}</td><td class="b">${h.p[1]}</td></tr>`).join('');{const hs=$('hsc');hs.scrollTop=hs.scrollHeight}
 {const tot=hk()?162:130,x=G.pt[0],y=G.pt[1];$('live').innerHTML=G.mode&&G.ph!='e'?`<div class="lb"><b class="a">${x}</b><div class="bar"><i class="a" style="width:${x/tot*100}%"></i><i class="b" style="width:${y/tot*100}%"></i><u></u></div><b class="b">${y}</b></div><small>أبناط الجولة من ${tot}</small>`:''}$('rn').textContent='الجولة '+RN;
 function bdg(i){if(!G.mode||G.buyer!=i)return'';return G.mode=='s'?(G.ash?'أشكل · صن':'صن'):`حكم <b class="${G.tr%2?'rd':''}">${SU[G.tr]}</b>`}
 $('info').innerHTML=(G.mode?(G.mode=='s'?'<span class="bg">صن</span>':`<span class="bg ${G.tr%2?'rd':''}">${SU[G.tr]}</span> حكم`)+'<br><small>المشتري: '+NM[G.buyer]+(G.ash?' (أشكل)':'')+(G.m>1?' — '+DN[G.m-2]:'')+(G.coffee?' — قهوة':'')+(G.cl?' (مقفل)':'')+'</small>':'<small>المزايدة</small>');
 const act=G.ph!='e'&&G.t.length<4;
 for(let i=1;i<4;i++){const e=$('p'+i),n=G.h[i].length;e.className='seat tm'+(i%2)+(act?(G.turn==i?' on':' dim'):'')+(G.mode&&G.buyer==i?' buyer':'');
<<<<<<< HEAD
  e.innerHTML=`<div class="bk">${Array.from({length:n},(_,k)=>`<u style="--r:${((k-(n-1)/2)*8).toFixed(1)}deg"></u>`).join('')}</div><div class="av"></div><div class="pl"><b class="nm">${NM[i]}</b></div>${i==G.dealer?DLR:''}${G.mode&&G.buyer==i?`<div class="by">${bdg(i)}</div>`:''}${G.tag[i]?`<div class="bb">${G.tag[i]}</div>`:''}${pileHtml(i)}`}
 const nw=G.t.length>(G.rn||0);$('mid').className='';$('mid').innerHTML=(G.ph=='b'||G.ph=='f'||G.ph=='q'||G.fly!=null?`<div class="fl${G.fly!=null?' fly'+G.fly:''}">${card(G.fl)}</div>`:'')+G.t.map((x,k)=>card(x.c,'pc pc'+x.i+(nw&&k==G.t.length-1?' pin':''))).join('')+(G.rev?revealHtml():'');G.rn=G.t.length;
 const my=G.ph=='p'&&G.turn==0&&G.t.length<4,L=my?legal(G.h[0],0):[],n0=G.h[0].length,cak=my&&hk()&&!G.t.length;if(!cak)G.ak=0;
 $('hand').innerHTML='';
 G.h[0].forEach((c,k)=>{const d=document.createElement('div');d.innerHTML=card(c,(my?(L.includes(c)||QAID.on?'ok':'no'):'')+(G.fresh?' dlv':''));const e=d.firstChild;if(G.fresh)e.style.animationDelay=(k*60)+'ms';
  e.style.setProperty('--r',((k-(n0-1)/2)*4)+'deg');e.style.setProperty('--y0',(Math.abs(k-(n0-1)/2)*3)+'px');
  if(my&&(L.includes(c)||QAID.on))e.onclick=()=>hp(c);$('hand').appendChild(e)});G.fresh=0;
 document.querySelector('.me').className='me tm0'+(act?(G.turn==0?' on':' dim'):'')+(G.mode&&G.buyer==0?' buyer':'');
 $('dl0').style.display=G.dealer==0?'':'none';$('pl0').innerHTML=pileHtml(0);$('stage').classList.toggle('myturn',!!my);const bd=G.ph=='b'||G.ph=='f'||G.ph=='q';$('rdn').style.display=bd?'':'none';$('rdn').innerHTML=bd?`<span class="${G.rd==1?'on':''}">الدور الأول</span><span class="${G.rd==2?'on':''}">الدور الثاني</span>`:'';
 $('dblb').innerHTML=G.m>1||G.coffee?`<div class="r lv${G.coffee?5:G.m}"><b>${G.coffee?'☕':'×'+G.m}</b><span>${G.coffee?'قهوة':DN[G.m-2]+(hk()&&(G.m==2||G.m==4)?(G.cl?' مقفل':' مفتوح'):'')}</span></div>`:'';$('by0').innerHTML=bdg(0);$('by0').style.display=G.mode&&G.buyer==0?'':'none';
 $('trp').style.display=G.mode?'':'none';$('trp').innerHTML=G.mode?(G.mode=='s'?'<b class="sn">صن</b>':`<b class="${G.tr%2?'rd':''}">${SU[G.tr]}</b><small>حكم</small>`)+(G.ash?'<small>أشكل</small>':''):'';
 if(G.ph=='p'&&!G.pm){const dcl=G.n==0&&G.po[0].length&&!G.dc&&!G.fd[0];
  $('act').innerHTML=(QAID.on?`<button id="qb" onclick="qaidUI()">قيد</button>`:'')+(dcl?`<button id="pjb" class="on" onclick="projMenu()">المشاريع</button>`:'')+`${hk()?`<button class="${G.ak?'on':''}" ${cak?'':'disabled'} onclick="tkToggle()">إكة</button>`:''}<button id="bs" onclick="sawa()">سوا</button>`;
=======
  e.innerHTML=`<div class="bk">${Array.from({length:n},(_,k)=>`<u style="--r:${((k-(n-1)/2)*8).toFixed(1)}deg"></u>`).join('')}</div><div class="av"></div><div class="pl"><b class="nm">${NM[i]}</b></div>${i==G.dealer?DLR:''}${G.mode&&G.buyer==i?`<div class="by">${bdg(i)}</div>`:''}${G.tag[i]?`<div class="bb">${G.tag[i]}</div>`:''}`}
 const nw=G.t.length>(G.rn||0);$('mid').className='';$('mid').innerHTML=(G.ph=='b'||G.ph=='f'||G.ph=='q'||G.fly!=null?`<div class="fl${G.fly!=null?' fly'+G.fly:''}">${card(G.fl)}</div>`:'')+G.t.map((x,k)=>card(x.c,'pc pc'+x.i+(nw&&k==G.t.length-1?' pin':''))).join('')+(G.rev?revealHtml():'');G.rn=G.t.length;
 const my=G.ph=='p'&&G.turn==0&&G.t.length<4,L=my?legal(G.h[0],0):[],n0=G.h[0].length,cak=my&&hk()&&!G.t.length;if(!cak)G.ak=0;
 $('hand').innerHTML='';
 G.h[0].forEach((c,k)=>{const d=document.createElement('div');d.innerHTML=card(c,(my?(L.includes(c)?'ok':'no'):'')+(G.fresh?' dlv':''));const e=d.firstChild;if(G.fresh)e.style.animationDelay=(k*60)+'ms';
  e.style.setProperty('--r',((k-(n0-1)/2)*4)+'deg');e.style.setProperty('--y0',(Math.abs(k-(n0-1)/2)*3)+'px');
  if(my&&L.includes(c))e.onclick=()=>hp(c);$('hand').appendChild(e)});G.fresh=0;
 document.querySelector('.me').className='me tm0'+(act?(G.turn==0?' on':' dim'):'')+(G.mode&&G.buyer==0?' buyer':'');
 $('dl0').style.display=G.dealer==0?'':'none';$('piles').innerHTML=[0,1,2,3].map(i=>G.pile[i]?`<div class="pile pl${i}" style="--n:${Math.min(G.pile[i],5)}"><b>${G.pile[i]}</b></div>`:'').join('');$('stage').classList.toggle('myturn',!!my);const bd=G.ph=='b'||G.ph=='f'||G.ph=='q';$('rdn').style.display=bd?'':'none';$('rdn').innerHTML=bd?`<span class="${G.rd==1?'on':''}">الدور الأول</span><span class="${G.rd==2?'on':''}">الدور الثاني</span>`:'';
 $('dblb').innerHTML=G.m>1||G.coffee?`<div class="r lv${G.coffee?5:G.m}"><b>${G.coffee?'☕':'×'+G.m}</b><span>${G.coffee?'قهوة':DN[G.m-2]+(hk()&&(G.m==2||G.m==4)?(G.cl?' مقفل':' مفتوح'):'')}</span></div>`:'';$('by0').innerHTML=bdg(0);$('by0').style.display=G.mode&&G.buyer==0?'':'none';
 $('trp').style.display=G.mode?'':'none';$('trp').innerHTML=G.mode?(G.mode=='s'?'<b class="sn">صن</b>':`<b class="${G.tr%2?'rd':''}">${SU[G.tr]}</b><small>حكم</small>`)+(G.ash?'<small>أشكل</small>':''):'';
 if(G.ph=='p'&&!G.pm){const dcl=G.n==0&&G.po[0].length&&!G.dc&&!G.fd[0];
  $('act').innerHTML=(dcl?`<button class="on" onclick="projMenu()">المشاريع</button>`:'')+`${hk()?`<button class="${G.ak?'on':''}" ${cak?'':'disabled'} onclick="tkToggle()">إكة</button>`:''}<button id="bs" onclick="sawa()">سوا</button>`;
>>>>>>> cce7580195d6348c938aac1f92e1fa0f2affe16f
  $('bs').disabled=!(!G.turn&&!G.t.length&&G.n>=1)}
}

const EMO=['👍','👏','😂','😎','😡','😭','🔥','🤝'];
function emoTray(){const e=$('emt');if(e.style.display=='flex'){e.style.display='none';return}e.innerHTML=EMO.map(x=>`<button onclick="emote(0,'${x}');$('emt').style.display='none'">${x}</button>`).join('');e.style.display='flex'}
function emote(i,x){const e=document.createElement('div');e.className='emo e'+i;e.textContent=x;$('stage').appendChild(e);setTimeout(()=>{if(e.remove)e.remove()},2400);
 if(i==0&&Math.random()<.6)setTimeout(()=>emote(2,['👍','😂','🔥'][Math.random()*3|0]),900+Math.random()*700)}
function botReact(our,m){
 const e=(i,x,ms)=>setTimeout(()=>emote(i,x),ms);
 if(m&&m.includes('كبوت')){e(1,'🤯',500);e(3,'🤯',900);return}
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
<<<<<<< HEAD

// ===== القيد: الواجهة =====
let QS={p:-1,t:'',pc:-1,rq:-1};
const qSet=h=>{if($('ov').style.display=='flex')$('ovb').innerHTML=h;else ovOpen(h)};
const qBtn=(id,fn,on)=>`<button class="${id>>3&1?'rd ':''}${on?'on':''}" onclick="${fn}(${id})">${cardTx(id)}</button>`;
function qs(k,v){if(k=='p'||k=='t'){if(k=='p')QS.t='';QS.pc=-1;QS.rq=-1}QS[k]=v;qaidUI(1)}
function toggleQaid(){QAID.on=!QAID.on;$('qt').textContent=QAID.on?'قيد ✓':'قيد ✗';say(-1,QAID.on?'القيد مفعّل: يمكنك مخالفة القواعد ويمكن تقييدك':'القيد معطّل: تُمنع الأوراق غير النظامية');if(G)render()}
function qaidUI(keep){
 if(!G||G.ph!='p')return;
 if(!keep)QS={p:-1,t:'',pc:-1,rq:-1};
 const types=['cut',...(hk()?['nodq','nobig','ace']:[]),...(hk()&&G.cl?['open']:[])],{p,t,pc,rq}=QS;
 let h=`<h2>طلب قيد</h2><p style="font-size:14px">يُطبَّق القيد فور تأكيده، والقيد الخاطئ ينقلب عليكم. اذكر دليلك: الورقة المخالفة والمفروضة.</p><div class="qrow">${[1,3].map(x=>`<button class="${p==x?'on':''}" onclick="qs('p',${x})">${NM[x]}</button>`).join('')}</div>`;
 if(p>=0)h+=`<div class="qrow">${types.map(x=>`<button class="${t==x?'on':''}" onclick="qs('t','${x}')">${VT[x]}</button>`).join('')}</div>`;
 if(p>=0&&t){
  const pl=G.pl[p].map(c=>c.s*8+c.r);
  h+=`<p class="ql">${t=='ace'?'ورقة الإكة التي لعبها':'الورقة المخالفة التي لعبها'}</p><div class="qrow">${pl.length?pl.map(id=>qBtn(id,'qsP',pc==id)).join(''):'لم يلعب شيئًا بعد'}</div>`;
  if(t!='ace'){
   const out=new Set([...G.h[0],...[0,1,2,3].filter(j=>j!=p).flatMap(j=>G.pl[j])].map(c=>c.s*8+c.r));
   h+=`<p class="ql">الورقة التي كان مفروضًا يلعبها</p>`+[0,1,2,3].map(s=>`<div class="qrow">${[7,3,6,5,4,2,1,0].map(r=>s*8+r).filter(id=>!out.has(id)&&id!=pc).map(id=>qBtn(id,'qsR',rq==id)).join('')}</div>`).join('')}
  h+=`<div class="qrow"><button ${pc>=0&&(t=='ace'||rq>=0)?'':'disabled'} onclick="claimQaid(QS.p,QS.t,QS.pc,QS.rq)">تأكيد القيد</button></div>`}
 h+=`<div class="qrow"><button class="g" onclick="qaidLog()">سجل الأكلات</button><button class="g" onclick="showTracker()">الأوراق الخارجة</button><button class="g" onclick="ovClose()">إغلاق</button></div>`;
 qSet(h)}
function qsP(id){QS.pc=id;QS.rq=-1;qaidUI(1)}
function qsR(id){QS.rq=id;qaidUI(1)}
function qaidLog(){
 const wn=t=>t.reduce((a,b)=>val(b.c,t[0].c.s)>val(a.c,t[0].c.s)?b:a).i;
 const rows=[...G.tl,...(G.t.length?[G.t]:[])].map((t,k)=>{const w=t.length==4&&k<G.tl.length?wn(t):-1;return `<div class="tlr"><b>${k+1}</b>${t.map(x=>`<div class="lc${x.i==w?' w':''}">${card(x.c)}<small>${NM[x.i]}</small></div>`).join('')}</div>`}).join('')||'<p>لا أكلات بعد</p>';
 ovOpen(`<h2>سجل الأكلات</h2><p style="font-size:13px">بترتيب اللعب، وأول ورقة في كل صف هي الافتتاح.</p><div class="tlog">${rows}</div><button onclick="ovClose()">رجوع</button>`)}
=======
>>>>>>> cce7580195d6348c938aac1f92e1fa0f2affe16f
