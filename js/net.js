// اللعب الجماعي: الاتصال بالخادم، وكائن REMOTE يحاكي واجهة المحرك المحلي (فتبقى الواجهة كما هي)،
// وشاشة الدخول، والدردشة، ولوحة الغرفة (المقاعد والأعضاء وصلاحيات المالك والإعدادات).
// الرسائل مشروحة في PROTOCOL.md بمشروع الخادم. الخادم هو الحَكَم: هذا الملف يرسل الأفعال ويعرض ما يصله فقط.
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const NET={ws:null,V:null,code:'',closing:false,joined:false,retry:0,wait:false,hb:0,unread:0,chatOpen:false,roomOpen:false,cid:lsGet('baloot_cid'),name:''};
if(!NET.cid){NET.cid=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>(b%36).toString(36)).join('');lsSet('baloot_cid',NET.cid)}
const NM0=['أنت','bot1','bot2','bot3'];
const netOwner=()=>!!(NET.V&&NET.V.you.owner);
// الخادم ثابت (SERVER_URL). يُسمح بتجاوزه بـ?server= في التطوير المحلي فقط، حتى لا يوجّه رابط خبيث لاعبًا إلى خادم غريب.
const DEV=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)||location.protocol=='file:';
const devServer=()=>DEV?new URLSearchParams(location.search).get('server'):null;
const serverBase=()=>(devServer()||SERVER_URL).trim().replace(/\/$/,'');
const netTx=m=>{if(NET.ws&&NET.ws.readyState==1)NET.ws.send(JSON.stringify(m))};
const netAct=(a,...args)=>{netTx({t:'act',a,args});return true};

// ===== يحاكي واجهة المحرك المحلي، فتقرأ الواجهة حالتها من آخر عرض وصلها وترسل أفعالها للخادم =====
const REMOTE={
 get G(){return NET.V?NET.V.G:null},get S(){return NET.V?NET.V.S:[0,0]},get D(){return NET.V?NET.V.D:0},get RN(){return NET.V?NET.V.RN:0},get HIST(){return NET.V?NET.V.HIST:[]},
 pending:()=>NET.V&&NET.V.pend||null,
 val:(c,L)=>(G.mode=='h'&&c.s==G.tr)?10+ST[c.r]:c.s==L?SN[c.r]:-1,
 pnames:i=>G.pv[i].map(v=>PJ[v]).join(' + '),
 bid:(s,k,x)=>netAct('bid',k,x),answerBefore:(s,y)=>netAct('answerBefore',!!y),answerFlip:(s,y)=>netAct('answerFlip',!!y),answerSun:(s,y)=>netAct('answerSun',!!y),answerDouble:(s,y,cl)=>netAct('answerDouble',!!y,cl?1:0),
 play:(s,id,ak)=>netAct('play',id,!!ak),project:(s,want)=>netAct('project',want),lay:(s,ids)=>netAct('lay',ids),sawa:()=>netAct('sawa'),
 qaidOpen:()=>netAct('qaidOpen'),qaidSet:(s,sel)=>netAct('qaidSet',sel),qaidConfirm:()=>netAct('qaidConfirm'),qaidAck:()=>netAct('qaidAck'),
 newGame:()=>{netTx({t:'own',a:'newGame'})},nextRound:()=>netAct('nextRound'),waiting:()=>NET.wait,skip:()=>netAct('skip')
};

// يطبّق آخر عرض: مقعدك وزاوية النظر وأسماء المقاعد
function netView(){
 const v=NET.V;if(!v)return;
 SPEC=v.you.seat<0;ME=SPEC?SPECSEAT:v.you.seat;
 for(let j=0;j<4;j++)NM[j]=!SPEC&&j==ME?'أنت':(v.seats[j].cid?v.seats[j].name:'bot'+j);
}
function onNetMsg(m){
 if(m.t=='welcome'){
  NET.joined=true;NET.retry=0;
  if(ENG!==REMOTE){LOCAL.stop();ENG=REMOTE;NETON=true;STREAK=0;document.body.classList.add('onl')}
  try{history.replaceState(null,'','?room='+m.code+(devServer()?'&server='+encodeURIComponent(devServer()):''))}catch(e){}
 }else if(m.t=='view'){
  NET.V=m.v;netView();$('lobby').style.display='none';
  if(m.v.started&&m.v.G){
   if(NET.waitRoom){NET.waitRoom=false;NET.roomOpen=false;$('rp').style.display='none'} // بدأ اللعب: تُغلق غرفة الانتظار
   render();
  }else if(!m.v.started){ // غرفة الانتظار: المالك يرتّب المقاعد ثم يبدأ، ولا لعب قبل ذلك
   NET.waitRoom=true;NET.roomOpen=true;$('rp').style.display='flex';
   for(const id of ['ov','qv','wait','pmenu'])$(id).style.display='none';
   RESULT=false;NET.wait=false;
  }
  roomRender();netBadges();
 }else if(m.t=='ev'){
  if(m.e.t=='wait')NET.wait=true;else if(m.e.t=='waitEnd'||m.e.t=='deal')NET.wait=false;
  if(NET.V&&NET.V.G)onEvent(m.e);
 }else if(m.t=='chat')chatAdd(m);
 else if(m.t=='err'){if(m.fatal){leaveRoom(m.m)}else netToast(m.m)}
 else if(m.t=='kicked'){leaveRoom(m.reason||'أُخرجت من الغرفة')}
}
function netConnect(code){
 NET.code=code;NET.closing=false;
 const ws=new WebSocket(serverBase().replace(/^http/,'ws')+'/ws/'+code);NET.ws=ws;
 ws.onopen=()=>{ws.send(JSON.stringify({t:'join',cid:NET.cid,name:NET.name}));clearInterval(NET.hb);NET.hb=setInterval(()=>ws.readyState==1&&ws.send('ping'),25000);netBanner('')};
 ws.onmessage=e=>{if(NET.ws!==ws||e.data=='pong')return;let m;try{m=JSON.parse(e.data)}catch(x){return}onNetMsg(m)};
 ws.onclose=()=>{clearInterval(NET.hb);if(NET.ws!==ws||NET.closing)return;
  if(!NET.joined)return leaveRoom('تعذّر الدخول إلى الغرفة. تحقق من الكود وعنوان الخادم.');
  netRetry()};
 ws.onerror=()=>{};
}
function netRetry(){
 NET.retry++;
 if(NET.retry>8)return leaveRoom('انقطع الاتصال بالخادم');
 netBanner('انقطع الاتصال… إعادة المحاولة ('+NET.retry+')');
 setTimeout(()=>{if(!NET.closing)netConnect(NET.code)},Math.min(1000*NET.retry,5000));
}
function leaveRoom(msg){
 NET.closing=true;clearInterval(NET.hb);if(NET.ws){try{if(NET.joined)NET.ws.send(JSON.stringify({t:'bye'}));NET.ws.close()}catch(e){}NET.ws=null}
 NET.V=null;NET.joined=false;NET.wait=false;NET.unread=0;NET.chatOpen=NET.roomOpen=NET.waitRoom=false;
 ENG=LOCAL;NETON=false;SPEC=false;ME=0;for(let j=0;j<4;j++)NM[j]=NM0[j];
 document.body.classList.remove('onl');$('chat').classList.remove('open','pulse');$('rp').style.display='none';$('cl').innerHTML='';$('nbn').style.display='none';
 for(const id of ['ov','qv','wait','pmenu'])$(id).style.display='none';
 try{history.replaceState(null,'',location.pathname)}catch(e){}
 lobbyShow(msg);
}
function netBanner(t){const e=$('nbn');e.textContent=t;e.style.display=t?'block':'none'}
function netToast(t){say(-1,t)}

// ===== شاشة الدخول =====
function lobbyShow(msg){
 $('lobby').style.display='flex';$('lmsg').textContent=msg||'';
 $('lnm').value=lsGet('baloot_name')||$('lnm').value||'';
}
const lmsg=t=>{$('lmsg').textContent=t};
function lobbyPrep(){
 NET.name=$('lnm').value.trim().slice(0,20)||'لاعب';lsSet('baloot_name',NET.name);
 return true;
}
function lobbySolo(){
 $('lobby').style.display='none';ENG=LOCAL;NETON=false;SPEC=false;ME=0;for(let j=0;j<4;j++)NM[j]=NM0[j];STREAK=0;LOCAL.newGame();
}
async function lobbyCreate(){
 if(!lobbyPrep())return;lmsg('جارٍ إنشاء الغرفة…');
 try{const r=await fetch(serverBase()+'/create',{method:'POST'});const j=await r.json();if(!j.code)throw new Error('no code');netConnect(j.code)}
 catch(e){lmsg('تعذّر الاتصال بالخادم. تحقق من العنوان.')}
}
async function lobbyJoin(code){
 if(!lobbyPrep())return;
 code=String(code||$('lcode').value).trim().toUpperCase();if(!/^[A-Z0-9]{5}$/.test(code))return lmsg('الكود خمسة أحرف أو أرقام');
 lmsg('جارٍ الدخول…');
 try{const r=await fetch(serverBase()+'/exists/'+code);const j=await r.json();if(!j.exists)return lmsg('هذه الغرفة غير موجودة');netConnect(code)}
 catch(e){lmsg('تعذّر الاتصال بالخادم. تحقق من العنوان.')}
}

// ===== الدردشة =====
function chatToggle(){
 NET.chatOpen=!NET.chatOpen;$('chat').classList.toggle('open',NET.chatOpen);
 if(NET.chatOpen){NET.unread=0;netBadges();$('ct').focus();$('cl').scrollTop=1e9}
}
function chatAdd(m){
 const d=document.createElement('div');d.className=m.sys?'sys':(m.cid==NET.cid?'me':'');
 if(m.sys)d.textContent=m.text;else{const b=document.createElement('b');b.textContent=m.name+(m.seat<0?' (مشاهد)':'')+': ';d.appendChild(b);d.appendChild(document.createTextNode(m.text))}
 const L=$('cl'),down=L.scrollHeight-L.scrollTop-L.clientHeight<40;
 L.appendChild(d);while(L.children.length>150)L.firstChild.remove();
 if(down||m.cid==NET.cid)L.scrollTop=1e9;
 if(!m.sys&&m.cid!=NET.cid){chatNotify(m);if(!chatVisible()){NET.unread++;netBadges()}}
}
// الدردشة ظاهرة دائمًا في الشاشة الكبيرة (تحت النتائج السابقة)، وفي الجوال تُفتح بالزر
const chatVisible=()=>matchMedia('(min-width:821px)').matches||NET.chatOpen;
let chatAC=null,chatT=0;
function chatNotify(m){
 const c=$('chat');c.classList.remove('pulse');void c.offsetWidth;c.classList.add('pulse');
 try{chatAC=chatAC||new(window.AudioContext||window.webkitAudioContext)();const o=chatAC.createOscillator(),g=chatAC.createGain();o.frequency.value=880;g.gain.value=.05;o.connect(g);g.connect(chatAC.destination);o.start();o.stop(chatAC.currentTime+.12)}catch(e){}
 if(!chatVisible()){let t=$('cnt');if(!t){t=document.createElement('div');t.id='cnt';t.onclick=()=>{t.style.display='none';chatToggle()};document.body.appendChild(t)}
  t.textContent='💬 '+m.name+': '+m.text.slice(0,60);t.style.display='block';clearTimeout(chatT);chatT=setTimeout(()=>t.style.display='none',4000)}
 if(document.hidden)document.title='💬 رسالة جديدة'}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)document.title='بلوت'});
function chatSend(){const t=$('ct').value.trim();if(!t)return;netTx({t:'chat',text:t});$('ct').value=''}
function netBadges(){
 $('cbd').textContent=NET.unread?'دردشة ('+NET.unread+')':'دردشة';
 const v=NET.V;$('rcnt').textContent=v?'الغرفة ('+v.members.length+')':'الغرفة';
}

// ===== لوحة الغرفة =====
function roomToggle(){if(NET.V&&!NET.V.started)return;NET.roomOpen=!NET.roomOpen;$('rp').style.display=NET.roomOpen?'flex':'none';roomRender(true)}
function copyLink(){
 const v=NET.V;if(!v)return;
 const full=location.origin+location.pathname+'?room='+v.room.code+(devServer()?'&server='+encodeURIComponent(devServer()):'');
 if(navigator.clipboard)navigator.clipboard.writeText(full).then(()=>netToast('نُسخ رابط الدعوة'),()=>prompt('انسخ الرابط',full));else prompt('انسخ الرابط',full);
}
const ownTx=(a,o)=>netTx(Object.assign({t:'own',a},o));
function ownSettings(){
 ownTx('settings',{turnSecs:+$('rs-turn').value,speed:+$('rs-speed').value,specSeeAll:$('rs-see').checked,specChat:$('rs-chat').checked});
}
function roomRender(force){
 if(!NET.roomOpen||!NET.V)return;
 const v=NET.V,own=v.you.owner,st=v.room.settings,me=v.you.seat;
 const sig=JSON.stringify([v.members,v.seats,st,v.room.owner,me,v.started]);if(!force&&sig===NET.rsig)return;NET.rsig=sig;
 const seatRow=(s,i)=>{
  const m=s.cid?v.members.find(x=>x.cid==s.cid):null;
  let b='';
  if(!s.cid&&me!=i)b=`<button onclick="netTx({t:'sit',seat:${i}})">اجلس</button>`;
  else if(s.cid==v.you.cid)b=`<button onclick="netTx({t:'stand'})">قم</button>`;
  else if(own&&s.cid)b=`<button onclick="ownTx('unseat',{seat:${i}})">إخراج</button>`;
  return `<div class="rs t${i%2}"><span>مقعد ${i+1}</span><b>${s.cid?esc(s.name)+(s.cid==v.room.owner?' 👑':'')+(m&&!m.online?' (منقطع)':''):'<small>بوت</small>'}</b>${b}</div>`};
 const opts=(sel)=>'<option value="">مقعد…</option>'+[0,1,2,3].map(i=>`<option value="${i}">${i+1}</option>`).join('');
 const mem=v.members.map(m=>{
  const mine=m.cid==v.you.cid;
  const ctl=own&&!mine?`<select onchange="if(this.value!=='')ownTx('seat',{cid:'${m.cid}',seat:+this.value});this.value=''">${opts()}</select><button onclick="ownTx('mute',{cid:'${m.cid}',on:${!m.muted}})">${m.muted?'إلغاء الكتم':'كتم'}</button><button class="warn" onclick="if(confirm('طرد هذا اللاعب؟'))ownTx('kick',{cid:'${m.cid}'})">طرد</button>`:'';
  return `<div class="rm"><span>${esc(m.name)}${mine?' (أنت)':''}${m.cid==v.room.owner?' 👑':''}${m.muted?' 🔇':''}${m.online?'':' (منقطع)'} <small>${m.seat<0?'مشاهد':'مقعد '+(m.seat+1)}</small></span>${ctl}</div>`}).join('');
 const dis=own?'':'disabled';
 const so=(val,list)=>list.map(([x,t])=>`<option value="${x}" ${val==x?'selected':''}>${t}</option>`).join('');
 const wait=!v.started,humans=v.seats.filter(x=>x.cid).length;
 const head=wait?`<h2>غرفة الانتظار <span dir="ltr">${v.room.code}</span></h2><p class="wnote">${own?'رتّب المقاعد (1 و3 فريق، و2 و4 فريق) ثم اضغط «ابدأ اللعب». لا يبدأ اللعب قبل ذلك.':'بانتظار مالك الغرفة ليبدأ اللعب. يمكنك تغيير مقعدك بـ«اجلس» و«قم».'}</p>`
  :`<h2>الغرفة <span dir="ltr">${v.room.code}</span></h2>`;
 const start=wait&&own?`<div class="rrow"><button class="go" ${humans?'':'disabled'} onclick="ownTx('start')">▶ ابدأ اللعب</button></div>`:'';
 $('rpb').innerHTML=head+start+`
 <div class="rrow"><button onclick="copyLink()">نسخ رابط الدعوة</button><button onclick="chatToggle()">💬 دردشة</button><button class="warn" onclick="leaveRoom()">خروج من الغرفة</button>${wait?'':'<button onclick="roomToggle()">إغلاق</button>'}</div>
 <h3>المقاعد <small>(1 و3 فريق، و2 و4 فريق)</small></h3><div class="rseats">${v.seats.map(seatRow).join('')}</div>
 <h3>الأعضاء</h3><div class="rmem">${mem}</div>
 <h3>الإعدادات ${own?'':'<small>(للمالك)</small>'}</h3>
 <div class="rset"><label>مهلة الدور <select id="rs-turn" ${dis} onchange="ownSettings()">${so(st.turnSecs,[[0,'بلا مهلة'],[15,'15 ثانية'],[30,'30 ثانية'],[60,'60 ثانية']])}</select></label>
 <label>السرعة <select id="rs-speed" ${dis} onchange="ownSettings()">${so(st.speed,[[0,'بطيء'],[1,'عادي'],[2,'سريع']])}</select></label>
 <label><input type="checkbox" id="rs-see" ${dis} ${st.specSeeAll?'checked':''} onchange="ownSettings()"> يرى المشاهدون الأوراق</label>
 <label><input type="checkbox" id="rs-chat" ${dis} ${st.specChat?'checked':''} onchange="ownSettings()"> دردشة المشاهدين</label></div>
 ${own&&!wait?`<div class="rrow"><button class="warn" onclick="if(confirm('إنهاء اللعبة والعودة إلى غرفة الانتظار؟'))ownTx('newGame')">لعبة جديدة (غرفة الانتظار)</button></div>`:''}`;
}
