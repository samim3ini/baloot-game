// سير اللعبة: التوزيع والمزايدة والدبل واللعب ونهاية الجولة
function deal(){
 RT++;RN++;RESULT=false;
 const dk=[];for(let s=0;s<4;s++)for(let r=0;r<8;r++)dk.push({s,r});
 for(let i=dk.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[dk[i],dk[j]]=[dk[j],dk[i]]}
 G={h:[0,1,2,3].map(()=>dk.splice(0,5)),fl:dk.pop(),dk,t:[],pt:[0,0],tk:[0,0],tr:-1,mode:'',n:0,pj:[0,0,0,0],pl:[[],[],[],[]],bl:[0,0],pw:-1,buyer:-1,rd:1,turn:(D+1)%4,cnt:0,ph:'b',fd:{},dc:0,tag:['','','',''],ash:0,pk:[0,0,0,0],dealer:D,fresh:1,ak:0,pile:[0,0,0,0],nf:0,m:1,dt:-1,coffee:0,cl:0,dst:0,q:[],po:[[],[],[],[]],pv:[[],[],[],[]],pcd:[[],[],[],[]],ps:[0,0,0,0],nq:0,bq:[],sb:-1,rv:{},pm:0,vio:[],tl:[]};
 G.h.forEach(sortH);log(-1,'الموزع: '+NM[D]);$('ov').style.display='none';$('pmenu').style.display='none';$('wait').style.display='none';render();bidStep();
}
function bidStep(){render();if(G.turn==0)showBid();else{$('act').innerHTML=[G.rd==1?'بس':'ولا','أشكل','حكم','صن'].map(t=>`<button disabled>${t}</button>`).join('');T(()=>botBid(G.turn),1500)}}
function showBid(){
 const f=G.fl.s,ok=G.rd==1&&(0==G.dealer||0==(G.dealer+3)%4);
 $('act').innerHTML=`<button class="bp" onclick="hb('p')">${G.rd==1?'بس':'ولا'}</button><button class="ba" ${ok?'':'disabled'} onclick="hb('a')">أشكل</button>`+(G.rd==1?`<button class="bh" onclick="hb('h',${f})">حكم <b class="${f%2?'rd':''}">${SU[f]}</b></button>`:`<button class="bh" onclick="pickS()">حكم</button>`)+`<button class="bn" onclick="hb('s')">صن ☀</button>`}
function pickS(){const f=G.fl.s;$('act').innerHTML=[0,1,2,3].filter(s=>s!=f).map(s=>`<button class="${s%2?'r':''}" onclick="hb('h',${s})">${SU[s]}</button>`).join('')+`<button onclick="showBid()">رجوع</button>`}
function hb(k,s){if(G.ph=='b'&&G.turn==0){$('act').innerHTML='';bid(0,k,s)}}
function bid(i,k,s){
 if(k=='p'){const pw=G.rd==1?'بس':'ولا';G.tag[i]=pw;G.ps[i]=1;say(i,pw);G.turn=(G.turn+1)%4;
  if(++G.cnt==4){if(G.rd==1){G.rd=2;G.cnt=0;G.tag=['','','',''];G.ps=[0,0,0,0]}else{say(-1,'الكل بس — إعادة التوزيع');D=(D+1)%4;return T(deal,2400)}}
  return bidStep()}
 if(k=='s'&&!G.nq){const qc=beforeCands(i);if(qc.length){G.sb=i;G.bq=qc;G.ph='q';G.tag[i]='صن';render();return qNext()}}
 if(k=='h'&&!G.nf){const c=flipCands(i);if(c.length){G.fb={i,s};G.fq=c;G.ph='f';G.tag[i]='حكم '+SU[s];render();return flipNext()}}
 const b=i,fb=k=='a'?(i+2)%4:i,lb=k=='h'?'حكم '+SU[s]:k=='a'?'أشكل':'صن';
 G.mode=k=='h'?'h':'s';G.tr=k=='h'?s:-1;G.buyer=b;G.ph='d';G.ash=k=='a';
 G.tag=['','','',''];say(i,lb);
 for(let j=0;j<4;j++)G.h[j].push(...G.dk.splice(0,j==fb?2:3));
 G.h[fb].push(G.fl);G.h.forEach(sortH);
 for(let j=0;j<4;j++){G.po[j]=projOptions(G.h[j]);setProj(j,j&&G.po[j].length?G.po[j][0]:null)}
 G.turn=(D+1)%4;G.fresh=1;G.fly=fb;render();T(()=>{G.fly=null;render()},1500);T(dblStart,2800);
}
function dblStart(){const b=G.buyer%2,o=1-b;G.dst=0;if(hk()||(S[b]>100&&S[o]<=100))dblNext();else startPlay()}
function startPlay(){G.ph='p';G.tag=['','','',''];$('act').innerHTML='';G.turn=(D+1)%4;render();T(next,1500)}
function dblNext(){
 const b=G.buyer%2,st=G.dst;
 if(st>3||(!hk()&&st>0))return startPlay();
 G.q=st==0?[0,1,2,3].map(k=>(G.buyer+1+k)%4).filter(x=>x%2!=b):st==2?[G.dp]:[G.buyer];askD()}
function askD(){
 if(!G.q.length)return startPlay();
 const s=G.q.shift(),st=G.dst;
 if(s==0){const two=hk()&&(st==0||st==2),n=DN[st];
  $('act').innerHTML=(two?`<button class="bh" onclick="ansD(0,1,0)">${n} مفتوح</button><button class="ba" onclick="ansD(0,1,1)">${n} مقفل</button>`:`<button class="bh" onclick="ansD(0,1,0)">${n}</button>`)+`<button class="bp" onclick="ansD(0,0)">بس</button>`;return}
 T(()=>{const h=G.h[s],base=hk()?hs(h,G.tr)/12:h.reduce((a,c)=>a+(c.r==7?3:c.r==3?1:0),0)/10;ansD(s,Math.random()<base*[.9,.5,.3,.2][st]?1:0)},1500)}
function ansD(s,y,cl){
 if(G.ph!='d')return;$('act').innerHTML='';
 if(!y){G.tag[s]='بس';say(s,'بس');return askD()}
 const st=G.dst,two=hk()&&(st==0||st==2);G.dt=s%2;if(st==0)G.dp=s;if(st==3)G.coffee=1;G.m=Math.min(st+2,4);
 if(two)G.cl=cl===undefined?(Math.random()<.3?1:0):cl;else if(st==1||st==3)G.cl=0;
 {const sb=two?(G.cl?'مقفل':'مفتوح'):'',w=DN[st]+(sb?' '+sb:'');G.tag[s]=w;say(s,w);splash(DN[st]+'!',st+2,sb)}
 G.dst++;dblNext()}

function tkToggle(){G.ak=!G.ak;render()}
function hp(c){if(G.ak&&(isT(c)||c.r==7)){say(-1,isT(c)?'لا تصح الإكة على ورقة الحكم':'لا حاجة للإكة على الآس');return}if(G.pm)commitP();const a=G.ak;G.ak=0;play(0,c,a)}
function next(){
 if(G.ph!='p'||G.t.length==4)return;render();
 if(G.turn!=0)T(()=>botPlay(G.turn),PLAY_MS.bot)}
function pnames(i){return G.pv[i].map(v=>PJ[v]).join(' + ')}
// المشاريع يدوية: اختر نوع مشروعك بالنقر عليه (يمكن أكثر من واحد)، ثم المس أي مكان لإعلانه.
// إن كان في يدك أُعلن، وإن لم يكن صحيحًا لا يُحتسب. والنقر خارج القائمة دون اختيار يغلقها فقط.
const PV=[20,50,100,400];
function projMenu(){G.pm=1;G.sel=[0,0,0,0];showPM()}
function showPM(){
 const tx=G.sel.map((n,j)=>n?PJ[PV[j]]+(n>1?' ×'+n:''):'').filter(Boolean).join(' + ');
 $('pmenu').innerHTML=`<div class="pt">${tx||'اختر مشروعك'}</div><div class="pr">${PV.map((v,j)=>`<button class="${G.sel[j]?'on':''}" ${v==400&&hk()?'disabled':''} onclick="selP(${j})">${PJ[v]}${G.sel[j]?' <b>×'+G.sel[j]+'</b>':''}</button>`).join('')}</div><div class="ph">${tx?'المس أي مكان لإعلانه':'اضغط المشروع ثم المس أي مكان'}</div>`;
 $('pmenu').style.display='block'}
function selP(j){const mx=j==0?2:1;G.sel[j]=G.sel[j]>=mx?0:G.sel[j]+1;showPM()}
function closePM(){G.pm=0;$('pmenu').style.display='none';render()}
function commitP(){
 const want=[];G.sel.forEach((n,j)=>{for(let k=0;k<n;k++)want.push(PV[j])});
 const key=a=>a.slice().sort((x,y)=>x-y).join();
 G.pm=0;$('pmenu').style.display='none';
 if(!want.length||G.ph!='p'||G.n!=0)return render();
 const o=G.po[0].filter(x=>key(x.items.map(y=>y.v))==key(want)).sort((a,b)=>b.k-a.k)[0];
 G.dc=1;setProj(0,o||null);say(0,want.map(v=>PJ[v]).join(' + '));
 if(!o)say(-1,'المشروع غير صحيح ولا يُحتسب');
 render()}
document.addEventListener('click',e=>{if(!G||!G.pm)return;const path=e.composedPath?e.composedPath():[];if(!path.some(n=>n.id=='pmenu'||n.id=='pjb'))commitP()});

function play(i,c,ak){
 if(G.ph!='p'||G.t.length>3)return;
 const vio=violationOf(G.h[i],i,c);
 if(!G.t.length&&G.n==0)G.ld=i;
 const ann=ak&&!G.t.length&&hk()&&!isT(c)&&c.r!=7,bad=ann&&!isMaster(c);
 G.h[i].splice(G.h[i].indexOf(c),1);
 if(vio){vio.i=i;vio.c=c;G.vio.push(vio)}
 if(bad)G.vio.push({type:'ace',i,c,leg:[]});
 if(G.n==0&&!G.fd[i]){G.fd[i]=1;if(i==0){G.pm=0;$('pmenu').style.display='none'}if(i==0&&!G.dc)setProj(0,null);if(i&&G.pj[i])say(i,pnames(i))}
 if(hk()&&c.s==G.tr&&(c.r==5||c.r==6)&&!(G.pj[i]==100&&G.pk[i]%100<10&&(G.pk[i]%10==5||G.pk[i]%10==6))&&G.pl[i].some(x=>x.s==c.s&&(x.r==5||x.r==6)&&x.r!=c.r)){G.bl[i%2]+=20;say(i,'بلوت!');splash('بلوت!',1)}
 G.pl[i].push(c);G.t.push({i,c});
 if(G.n==1&&!G.rv[i]&&G.pv[i].length){G.rv[i]=1;showProj(i)}
 if(ann)say(i,'إكة');
 if(G.t.length==4){render();T(()=>{const w=win().i,el=document.querySelector('.pc'+w);if(el)el.classList.add('wn');T(()=>{$('mid').className='sw'+((w+2)%4);T(endTrick,PLAY_MS.sweep,1)},PLAY_MS.hold,1)},PLAY_MS.look,1)}else{G.turn=(i+1)%4;next()}
}
function endTrick(){
 if(G.ph!='p')return;
 const w=win(),tm=w.i%2;
 G.last=G.t.slice();G.lw=w.i;const tp=G.t.reduce((a,x)=>a+pts(x.c),0);G.pt[tm]+=tp;G.tk[tm]++;G.n++;G.pile[(w.i+2)%4]++;pop(w.i,tp);
 if(G.n==1){const m=[0,0];for(let i=0;i<4;i++)m[i%2]=Math.max(m[i%2],G.pj[i]?G.pk[i]:0);const mx=Math.max(...m);
  if(mx>0)for(let k=0;k<4;k++){const s=(G.ld+k)%4;if(G.pj[s]&&G.pk[s]==mx){G.pw=s%2;break}}}
 G.tl.push(G.t.slice());G.t=[];
 if(G.n==8){if(qFinal())return;G.pt[tm]+=10;return endWait(endRound)}
 G.turn=w.i;next()}
function sawa(){
 if(G.ph!='p'||G.turn||G.t.length||G.n<1)return;
 const ok=sawaOK(),tm=ok?0:1;
 if(qFinal())return;
 if(!ok){say(0,'سوا');return qaidEnd(1,'قيد سوا خاطئ عليك: أعلنت سوا وبقيت أكلات لا تكسبها')}
 G.pt[tm]+=G.h.flat().reduce((a,c)=>a+pts(c),0)+10;G.tk[tm]+=G.h[0].length;G.n=8;
 say(0,'سوا');splash('سوا!',1);say(-1,ok?'سوا صحيحة: أخذتم باقي الأكلات':'سوا خاطئة: ذهبت باقي الأكلات للخصم');
 G.rev=G.h.map(h=>h.slice());G.h=[[],[],[],[]];render();endWait(endRound)}
function ruleEnd(w,m,k){const p=[0,0];p[w]=(k||(hk()?16:26))*G.m;fin(p,m,w)}
function endRound(){
 const m=G.m,b=G.buyer%2,eb=m>1?G.dt:b,o=1-eb,k=hk()?10:5,pp=[0,0],pa=[0,0],bl=[G.bl[0]/10,G.bl[1]/10];
 for(let i=0;i<4;i++){const x=pjP(i);pa[i%2]+=x;if(i%2==G.pw)pp[G.pw]+=x}
 const raw=[0,1].map(t=>G.pt[t]+(pp[t]+bl[t])*k),kb=G.tk[0]==8?0:G.tk[1]==8?1:-1;
 const pot=hk()?16:26,cp=[0,0];cp[o]=rp(G.pt[o]);cp[eb]=pot-cp[o];G.det={raw:[G.pt[0],G.pt[1]],cp,pp:[pp[0],pp[1]],bl:[bl[0],bl[1]],m};
 let q=[0,0],msg='',w;
 if(kb>=0){w=kb;q[w]=(hk()?25:44)+pa[w]+bl[w];msg='كبوت!'}
 else{
  const win=m>1?raw[eb]>raw[o]:(raw[eb]>raw[o]||(raw[eb]==raw[o]&&!(hk()&&pp[o]>0)));w=win?eb:o;
  if(m>1||!win){q[w]=m*(hk()?16:26)+(m==2?2:1)*(pp[0]+pp[1])+bl[0]+bl[1];
   msg=m>1?DN[m-2]+(G.coffee?' وقهوة':'')+': '+(w?'لهم':'لنا')+' يربحون الجولة':(b?'لهم':'لنا')+': المشتري خسر الجولة'}
  else q=[cp[0]+pp[0]+bl[0],cp[1]+pp[1]+bl[1]]}
 fin(q,msg,w)}
function fin(p,m,cw=-1){
 G.ph='e';S[0]+=p[0];S[1]+=p[1];if(G.coffee&&cw>=0)S[cw]=Math.max(152,S[1-cw]+1,S[cw]);
 HIST.push({n:RN,mode:G.mode?(hk()?'حكم '+SU[G.tr]:'صن'):'—',m:G.m,p:[p[0],p[1]]});
 D=(D+1)%4;
 const our=p[0]>p[1]?1:p[1]>p[0]?-1:0;STREAK=our>0?STREAK+1:0;
 render();
 const end=(S[0]>=152||S[1]>=152)&&S[0]!=S[1],d=G.det,row=(l,a,b)=>`<tr><td>${l}</td><td>${a}</td><td>${b}</td></tr>`,wn=our>0?0:our<0?1:-1;
 const tot=`<tr class="tot"><td>الجولة${d&&d.m>1?' ×'+d.m:''}</td><td class="${wn==0?'win':''}">${p[0]}</td><td class="${wn==1?'win':''}">${p[1]}</td></tr>`;
 const tb=d?`<table class="rt"><tr><th></th><th class="a">لنا</th><th class="b">لهم</th></tr>${row('الأبناط',d.raw[0],d.raw[1])}${row('نقاط الأوراق',d.cp[0],d.cp[1])}${row('المشاريع',d.pp[0],d.pp[1])}${row('البلوت',d.bl[0],d.bl[1])}${tot}</table>`:`<table class="rt">${tot}</table>`;
 const gw=end?S[0]>S[1]:our>0,hd=end?(gw?'فزتم باللعبة!':'خسرتم اللعبة'):our>0?'كسبتم الجولة':our<0?'خسرتم الجولة':'تعادل';
 $('ovb').className=gw?'win':(our<0||end)?'lose':'';
 $('ovb').innerHTML=`<div class="ico ${gw?'up':(our<0||end)?'dn':''}">${gw?'🏆':(our<0||end)?'💔':'🤝'}</div><h2>${hd}</h2>${STREAK>=2&&!end?`<div class="stk">🔥 ${STREAK} جولات متتالية</div>`:''}${m?`<div class="nt">${m}</div>`:''}${tb}<div class="sum">المجموع: لنا <b class="a">${S[0]}</b> — لهم <b class="b">${S[1]}</b></div>${end?'<button onclick="S=[0,0];HIST.length=0;STREAK=0;deal()">لعبة جديدة</button>':'<div class="cdb"><i></i></div>'}`;
 $('ov').style.display='flex';RESULT=!end;
 const st=$('stage');st.classList.remove('gw','gl');if(our>0)st.classList.add('gw');else if(our<0){st.classList.add('gl','shake');setTimeout(()=>st.classList.remove('shake'),600)}
 if(m&&m.includes('كبوت')){splash('كبوت!',4);confetti(60)}
 else if(our>0)confetti(end?60:18);
 botReact(our,m);
 if(!end)T(()=>{if(G.ph=='e')deal()},5000,1)}
function flipCands(i){const f0=(D+1)%4;if(G.fl.r==7)return i==f0?[]:[f0];const pi=((i-f0)%4+4)%4;return [1,2,3].filter(p=>p>pi).map(p=>(f0+p)%4)}
function flipNext(){
 if(!G.fq.length){G.nf=1;G.ph='b';bid(G.fb.i,'h',G.fb.s);G.nf=0;return}
 const c=G.fq.shift();
 if(c==0){$('act').innerHTML='<button class="bn" onclick="ansF(0,1)">صن ☀</button><button class="bp" onclick="ansF(0,0)">بس</button>';return}
 T(()=>ansF(c,G.h[c].reduce((a,x)=>a+(x.r==7?3:x.r==3?1:0),0)>=7),1500)}
function ansF(c,y){
 if(G.ph!='f')return;$('act').innerHTML='';
 if(y){log(-1,'قُلب الحكم إلى صن');G.ph='b';return bid(c,'s')}
 {G.tag[c]='بس';G.ps[c]=1;say(c,'بس');flipNext()}}
function beforeCands(i){const f0=(G.dealer+1)%4,pi=((i-f0)%4+4)%4;return [0,1,2,3].filter(p=>p<pi).map(p=>(f0+p)%4).filter(x=>G.ps[x])}
function qNext(){
 if(!G.bq.length){G.nq=1;G.ph='b';bid(G.sb,'s');G.nq=0;return}
 const c=G.bq.shift();
 if(c==0){$('act').innerHTML='<button class="bn" onclick="ansQ(0,1)">قبلك</button><button class="bp" onclick="ansQ(0,0)">'+(G.rd==1?'بس':'ولا')+'</button>';return}
 T(()=>ansQ(c,G.h[c].reduce((a,x)=>a+(x.r==7?3:x.r==3?1:0),0)>=5),1500)}
function ansQ(c,y){
 if(G.ph!='q')return;$('act').innerHTML='';
 if(y){say(c,'قبلك');G.ph='b';G.nq=1;bid(c,'s');G.nq=0;return}
 {const pw=G.rd==1?'بس':'ولا';G.tag[c]=pw;say(c,pw);qNext()}}
function endWait(cb){G.ph='x';G.wn=7;G.wcb=cb;G.wt0=Date.now();wtick()}
function wtick(){
 if(!G.wcb)return;
 if(G.wn<=0)return skipWait();
 $('wait').style.display='flex';$('wt').textContent='النتيجة بعد '+G.wn+' — اضغط في أي مكان';G.wn--;T(wtick,1000,1)}
function skipWait(){const cb=G.wcb;if(!cb)return;G.wcb=null;$('wait').style.display='none';cb()}
function ovClick(e){if(RESULT&&G.ph=='e'&&!(e.target.closest&&e.target.closest('button')))deal()}

// ===== القيد: الطلب والحساب =====
// لا يُشترط ظهور دليل قبل الطلب: يُطبَّق القيد صحيحًا كان أو خاطئًا، وطالبه يذكر الورقة المخالفة والمفروضة ونوع القيد.
// البوتات لا تغش، وتكشف مخالفتك فورًا في نهاية الحلة قبل ظهور النتيجة (qFinal).
const cardTx=id=>RK[id%8]+SU[id>>3];
function qMsg(type,p,pid,rid){
 const who=p==0?'عليك':'على '+NM[p];
 return type=='ace'?`قيد ${VT[type]} ${who}: أعلن إكة بورقة ${cardTx(pid)} وهي ليست الأعلى`:`قيد ${VT[type]} ${who}: لعب ${cardTx(pid)} وكان مفروضًا يلعب ${cardTx(rid)}`}
function qFinal(){
 const v=G.vio.find(x=>x.i%2==0&&!x.done);if(!v)return false;
 v.done=1;const pid=v.c.s*8+v.c.r,rid=v.leg.find(id=>G.pl[v.i].some(x=>x.s*8+x.r==id));
 say(1,'قيد!');qaidEnd(1,qMsg(v.type,v.i,pid,rid===undefined?v.leg[0]:rid));return true}
// الحساب: أساس الجولة (26 صن / 16 حكم) مضروبًا في الدبل، مع مشاريع الفريق المستفيد وبلوته.
function qaidEnd(t,msg){
 if(G.ph!='p')return;
 const m=G.m,p=[0,0],pa=[0,0],bl=[G.bl[0]/10,G.bl[1]/10];
 for(let i=0;i<4;i++)pa[i%2]+=pjP(i);
 p[t]=(hk()?16:26)*m+(m==2?2:1)*pa[t]+bl[t];
 splash('قيد!',3);fin(p,msg,t)}
function claimQaid(p,type,pid,rid){
 if(G.ph!='p'){say(-1,'لا يمكن طلب القيد الآن');return}
 $('ov').style.display='none';OVP=null;
 const v=G.vio.find(x=>x.i==p&&x.type==type&&!x.done&&x.c.s*8+x.c.r==pid&&(type=='ace'||x.leg.includes(rid))),tx=qMsg(type,p,pid,rid);
 if(v){v.done=1;return qaidEnd(0,'قيد صحيح — '+tx)}
 if(QAID.falseFlip)qaidEnd(1,'قيد خاطئ — '+tx+' (لم يثبت) فانقلب عليكم');
 else say(-1,'القيد لم يثبت')}
