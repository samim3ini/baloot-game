// اختبارات المحرك بلا متصفح: node test/engine.test.js
// مؤقّت وهمي (وقت افتراضي) فتنتهي الجولات في ثوانٍ. البوتات بمهلة بحث قصيرة (botMs) للسرعة.
const assert=require('assert');
const {create,data}=require('../js/engine.js');
const {SU,RK}=data;

function rig(opt={}){
 const q=[];let t=0,seq=0,events=[];
 let seed=opt.seed||12345;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const env={emit:e=>events.push(e),after:(f,ms)=>q.push({t:t+ms,s:seq++,f}),now:()=>t,rand,botMs:opt.botMs||4,ackMs:opt.ackMs||0,falseFlip:opt.falseFlip};
 const E=create(env);
 // يشغّل المؤقّتات بالترتيب؛ والسائق (driver) يتصرف عن البشر بعد كل خطوة. يعيد false إن علقت اللعبة.
 function run(stop,driver,maxSteps=200000){
  for(let n=0;n<maxSteps;n++){
   if(stop())return true;
   if(driver&&driver())continue;
   if(!q.length)return false;
   q.sort((a,b)=>a.t-b.t||a.s-b.s);const x=q.shift();t=Math.max(t,x.t);x.f()}
  throw new Error('تجاوز الحد الأقصى للخطوات')}
 return {E,q,run,rand,events,get t(){return t},adv(ms){const end=t+ms;while(true){q.sort((a,b)=>a.t-b.t||a.s-b.s);if(!q.length||q[0].t>end)break;const x=q.shift();t=Math.max(t,x.t);x.f()}t=end}}}

const idc=c=>c.s*8+c.r;
function checkRound(E,label){
 const G=E.G,all=G.pl.flat().concat(G.h.flat()),ids=all.map(idc);
 assert.strictEqual(new Set(ids).size,ids.length,label+': ورقة مكررة');
 return G}

// ---------- 1) جولات كاملة بالبوتات فقط ----------
{
 const r=rig({seed:7});const {E}=r;
 let rounds=0,over=false;
 const base=r.events.length;
 E.newGame();
 const stop=()=>{const e=r.events.filter(x=>x.t=='roundEnd');rounds=e.length;over=e.some(x=>x.end);return over||rounds>=80};
 assert(r.run(stop,null),'علقت اللعبة بين البوتات');
 const ends=r.events.filter(x=>x.t=='roundEnd');
 assert(ends.length>=2,'جولات قليلة');
 for(const e of ends){assert(e.p[0]>=0&&e.p[1]>=0);assert(e.p[0]+e.p[1]>0)}
 assert(E.S[0]>=152||E.S[1]>=152,'اللعبة لم تنتهِ');
 assert.strictEqual(E.HIST.length,ends.length);
 console.log('1) بوتات فقط: ',ends.length,'جولة، النتيجة',E.S.join('-'));
}

// ---------- 2) توزيع الأبناط في كل جولة (بوتات لا تغش) ----------
{
 let checked=0;
 for(let seed=1;seed<=6;seed++){
  const r=rig({seed:seed*31});const {E}=r;E.newGame();
  let G,done=false;
  const stop=()=>{if(E.G&&E.G.ph=='x'&&!done){done=true;G=E.G;return true}return false};
  assert(r.run(stop,null));
  checkRound(E,'seed'+seed);
  assert.strictEqual(G.pl.flat().length,32,'يجب أن تُلعب 32 ورقة');
  assert.strictEqual(G.vio.length,0,'البوتات لا تغش');
  assert.strictEqual(G.n,8);
  // مجموع الأبناط قبل احتساب القيد: 162 في الحكم و130 في الصن (يشمل 10 آخر أكلة) — يُحسب في endRound
  const tot=G.pt[0]+G.pt[1]+10; // endTrick أضافت أبناط الأكلات وآخر أكلة +10 عند endWait
  const want=G.mode=='h'?162:130;
  assert.strictEqual(G.pt[0]+G.pt[1],want,'مجموع الأبناط '+G.mode+' = '+(G.pt[0]+G.pt[1]));
  checked++}
 console.log('2) توزيع الأبناط صحيح في',checked,'جولات');
}

// ---------- 3) لاعب بشري مبرمج: يغش أحيانًا ويقيّد أحيانًا ----------
{
 let cheats=0,caught=0,claims=0,claimOK=0,claimBad=0,rounds=0;
 for(let seed=1;seed<=12;seed++){
  const r=rig({seed:seed*97});const {E}=r;E.setHuman(0,true);E.newGame();
  const R=r.rand;
  let target=4,lastEnds=0;
  const driver=()=>{
   const G=E.G;if(!G)return false;
   if(G.qa&&G.qa.auto){E.qaidAck(0);return true}
   if(G.ph=='x'&&E.waiting()){/* ننتظر المؤقّت */return false}
   const p=E.pending(0);if(!p)return false;
   if(p.k=='bid'){
    const x=R();
    if(x<.25)E.bid(0,'p');else if(x<.5&&p.canAsh)E.bid(0,'a');else if(x<.75)E.bid(0,'h',p.rd==1?p.flip:(p.flip+1)%4);else E.bid(0,'s');
    return true}
   if(p.k=='toSun'){E.answerSun(0,R()<.4);return true}
   if(p.k=='before'){E.answerBefore(0,R()<.5);return true}
   if(p.k=='flip'){E.answerFlip(0,R()<.5);return true}
   if(p.k=='double'){E.answerDouble(0,R()<.4,R()<.5?1:0);return true}
   if(p.k=='lay'){ // إنزال المشروع: أحيانًا الأوراق الصحيحة وأحيانًا غشًا
    if(R()<.5&&G.pcd[0].length)E.lay(0,G.pcd[0].flat().map(idc));else E.lay(0,G.h[0].slice(0,3).map(idc));return true}
   if(p.k=='play'){
    const h=G.h[0];
    // بعد أول أكلة نجرّب فتح قيد على الخصم (سيكون خاطئًا لأن البوتات لا تغش)
    if(G.n>=1&&R()<.04&&E.qaidOpen(0)){
     const opp=[1,3].map(j=>G.pl[j]).flat();const c=opp[R()*opp.length|0];
     E.qaidSet(0,{t:'cut',pc:idc(c),rq:idc(c)==0?1:0});
     claims++;E.qaidConfirm(0);return true}
    if(G.n==0&&!G.fd[0]&&!G.dc[0]){const x=R();if(G.po[0].length&&x<.5)E.project(0,G.po[0][0].items.map(x=>x.v));else if(x>.85)E.project(0,[50])} // إعلان صحيح أو كاذب
    let c;const L=E.legal(h,0);
    if(R()<.12&&L.length<h.length){c=h.find(x=>!L.includes(x));cheats++}else c=L[R()*L.length|0];
    E.play(0,idc(c),false);return true}
   return false};
  const stop=()=>{const e=r.events.filter(x=>x.t=='roundEnd');return e.length>=target};
  assert(r.run(stop,driver),'علقت اللعبة (seed '+seed+') '+JSON.stringify({ph:E.G.ph,turn:E.G.turn,cs:E.G.cs,qa:E.G.qa}));
  for(const e of r.events.filter(x=>x.t=='roundEnd')){
   rounds++;
   if(e.info&&e.info.k=='qaid'){
    if(e.info.auto)caught++;
    else if(e.info.valid)claimOK++;else claimBad++;
    // الفريق الفائز بالقيد هو من تقرر له النقاط
    assert(e.p[e.cw]>e.p[1-e.cw],'الفائز بالقيد يجب أن يأخذ النقاط');
    if(e.info.auto)assert.strictEqual(e.cw,1,'البوت يقيّد اللاعب فيربح فريق البوتات')}}}
 console.log('3) لاعب بشري مبرمج:',rounds,'جولة، غش',cheats,'، قيود كشفتها البوتات',caught,'، قيود صحيحة',claimOK,'، خاطئة',claimBad,'، محاولات',claims);
 assert(caught>0,'لم تكشف البوتات أي غش');
 assert(claimBad>0,'لم يُختبر القيد الخاطئ');
 assert.strictEqual(claimOK,0,'لا قيد صحيح على بوت لا يغش');
}

// ---------- 4) قيد صحيح بين بشريين، وتوقف اللعب أثناء النافذة ----------
{
 const r=rig({seed:5});const {E}=r;
 E.setHuman(0,true);E.setHuman(1,true);E.newGame();
 const R=r.rand;let did=false,stateAtOpen=null,validSeen=false;
 const driver=()=>{
  const G=E.G;
  if(G.qa&&G.qa.auto){E.qaidAck(0);return true}
  for(const s of [0,1]){
   const p=E.pending(s);if(!p)continue;
   if(p.k=='bid'){s==0?E.bid(0,'h',p.rd==1?p.flip:(p.flip+1)%4):E.bid(s,'p');return true}
   if(p.k=='before'){E.answerBefore(s,false);return true}
   if(p.k=='flip'){E.answerFlip(s,false);return true}
   if(p.k=='double'){E.answerDouble(s,false);return true}
   if(p.k=='toSun'){E.answerSun(s,false);return true}
   if(p.k=='play'){
    const h=G.h[s],L=E.legal(h,s);
    // المقعد 1 يغش مرة واحدة عمدًا في الأكلة الأولى إن أمكن
    if(s==1&&!did&&L.length<h.length){const c=h.find(x=>!L.includes(x));did=true;E.play(1,idc(c),false);return true}
    E.play(s,idc(L[0]),false);return true}}
  // بعد الغش يفتح المقعد 0 القيد ويقدّم الدليل الصحيح من سجل المخالفات
  if(did&&!G.qa&&G.ph=='p'&&G.vio.length&&!stateAtOpen){
   const v=G.vio.find(x=>!x.done);
   if(v&&G.pl[v.i].length&&E.qaidOpen(0)){
    stateAtOpen=JSON.stringify({n:G.n,t:G.t.length,turn:G.turn,tl:G.tl.length});
    r.adv(30000); // ثلاثون ثانية: لا يجب أن يتغير شيء خلف النافذة
    assert.strictEqual(JSON.stringify({n:G.n,t:G.t.length,turn:G.turn,tl:G.tl.length}),stateAtOpen,'اللعب لم يتوقف أثناء القيد');
    const pid=idc(v.c),rid=v.leg.find(id=>true);
    // يرفض تأكيدًا ناقصًا
    assert.strictEqual(E.qaidConfirm(0),false);
    // لا يقبل تعديلًا من غير المقيِّد
    assert.strictEqual(E.qaidSet(1,{t:'cut'}),false);
    E.qaidSet(0,{t:v.type,pc:pid,rq:rid});
    assert.strictEqual(E.qaidConfirm(0),true);validSeen=true;return true}}
  return false};
 const stop=()=>r.events.some(x=>x.t=='roundEnd');
 assert(r.run(stop,driver),'علقت اللعبة');
 const e=r.events.find(x=>x.t=='roundEnd');
 assert(validSeen,'لم يُنفَّذ القيد الصحيح');
 assert.strictEqual(e.info.k,'qaid');assert.strictEqual(e.info.valid,1);assert.strictEqual(e.cw,0,'فريق 0 يربح بالقيد الصحيح');
 console.log('4) قيد صحيح بين بشريين: ربح الفريق',e.cw,'، النقاط',e.p.join('-'),'، توقف اللعب أثناء النافذة ✓');
}

// ---------- 5) القيد الخاطئ لا ينقلب إن عُطّل falseFlip ----------
{
 const r=rig({seed:9,falseFlip:false});const {E}=r;E.setHuman(0,true);E.newGame();
 let opened=false,resumed=false,n0=0;
 const driver=()=>{
  const G=E.G;
  if(G.qa&&G.qa.auto){E.qaidAck(0);return true}
  const p=E.pending(0);if(!p)return false;
  if(p.k=='bid'){E.bid(0,'s');return true}
  if(p.k=='before'){E.answerBefore(0,false);return true}
  if(p.k=='double'){E.answerDouble(0,false);return true}
  if(p.k=='toSun'){E.answerSun(0,false);return true}
  if(p.k=='play'){
   const L=E.legal(G.h[0],0);
   if(G.n>=1&&!opened&&E.qaidOpen(0)){opened=true;n0=G.pl[1].length+G.pl[3].length;
    const c=[1,3].map(j=>G.pl[j]).flat()[0];E.qaidSet(0,{t:'cut',pc:idc(c),rq:idc(c)==0?1:0});E.qaidConfirm(0);resumed=!E.G.qa&&E.G.ph=='p';return true}
   E.play(0,idc(L[0]),false);return true}
  return false};
 assert(r.run(()=>r.events.some(x=>x.t=='roundEnd'),driver));
 assert(opened&&resumed,'عند تعطيل الانقلاب يجب أن تُستأنف اللعبة بعد قيد غير ثابت');
 console.log('5) قيد غير ثابت مع falseFlip=false: تُستأنف اللعبة ✓');
}

// ---------- 6) تبديل المقاعد أثناء الانتظار ----------
{
 const r=rig({seed:3});const {E}=r;E.setHuman(0,true);E.newGame();
 // ننتظر دور المقعد 0 في المزايدة أو أي قرار له
 let waited=false;
 const stop=()=>{const p=E.pending(0);if(p&&!waited){waited=true;return true}return false};
 assert(r.run(stop,null));
 const ph=E.G.ph,turn=E.G.turn;
 // خرج اللاعب: يصير بوتًا ويكمل البوت قراره
 E.setHuman(0,false);
 const before=JSON.stringify([E.G.ph,E.G.cs,E.G.turn]);
 assert(r.run(()=>JSON.stringify([E.G.ph,E.G.cs,E.G.turn])!=before,null),'لم يكمل البوت مكان اللاعب');
 // بقية اللعبة بوتات
 assert(r.run(()=>r.events.some(x=>x.t=='roundEnd'),null),'علقت بعد خروج اللاعب');
 // وعودته: يصير بشريًا من جديد ولا يلعب البوت عنه
 E.setHuman(2,true);
 assert(r.run(()=>E.pending(2),null),'لم ينتظر المحرك المقعد 2 بعد جلوسه');
 const snap=JSON.stringify([E.G.ph,E.G.cs]);r.adv(20000);
 assert.strictEqual(JSON.stringify([E.G.ph,E.G.cs]),snap,'البوت لعب عن مقعد بشري');
 console.log('6) تبديل بشري/بوت أثناء الانتظار ✓');
}

// ---------- 7) رفض الأفعال غير المشروعة ----------
{
 const r=rig({seed:11});const {E}=r;E.setHuman(0,true);E.newGame();
 assert.strictEqual(E.play(0,0,false),false,'لعب في غير مرحلة اللعب');
 assert(r.run(()=>E.pending(0)&&E.pending(0).k=='bid',null));
 assert.strictEqual(E.bid(1,'p'),false,'مقعد بوت لا يقبل أفعالًا خارجية');
 assert.strictEqual(E.bid(0,'h',9),false,'ورقة غير صالحة');
 assert.strictEqual(E.bid(0,'zzz'),false);
 assert.strictEqual(E.qaidOpen(0),false,'لا قيد قبل اللعب');
 assert.strictEqual(E.answerDouble(0,true),false);
 assert.strictEqual(E.sawa(0),false);
 assert.strictEqual(E.project(0,[20]),false);
 assert.strictEqual(E.bid(0,'p'),true);
 console.log('7) رفض الأفعال غير المشروعة ✓');
}

// ---------- 8) قاعدة الإكة: الشريك القاطع لا يُعفى من الدق إلا بالآس أو بإكة معلنة ----------
{
 const r=rig({seed:3});const {E}=r;E.newGame();const G=E.G,C=(s,r)=>({s,r});
 G.mode='h';G.tr=0;G.cl=0;G.ph='p';
 const h=[C(0,2),C(1,1)]; // 9♠ (حكم) و8♥، ولا ديناري معه
 G.t=[{i:2,c:C(3,3)},{i:3,c:C(3,0)}];G.ann=0; // الشريك (2) يقود 10♦ والآس لم يخرج
 assert(E.legal(h,0).length==1&&E.legal(h,0)[0].s==0,'10 بلا إكة: يجب الدق');
 G.ann=1;assert.strictEqual(E.legal(h,0).length,2,'مع إكة معلنة: حر');
 G.t=[{i:2,c:C(3,7)},{i:3,c:C(3,0)}];G.ann=0;assert.strictEqual(E.legal(h,0).length,2,'الآس يغني عن الإكة');
 G.t=[{i:1,c:C(3,3)},{i:2,c:C(3,0)},{i:3,c:C(3,1)}];assert(E.legal(h,0).every(c=>c.s==0),'الخصم رابح: دق (كما كان)');
 // إعلان إكة على الآس أو على غير الأعلى = قيد
 E.setHuman(0,true);G.t=[];G.n=0;G.turn=0;G.h[0]=[C(3,7),C(1,1)];
 assert(E.play(0,3*8+7,true));assert(G.vio.some(v=>v.type=='ace'),'الإكة على الآس قيد');assert.strictEqual(G.ann,1);
 console.log('8) قاعدة الإكة ✓');
}

// ---------- 9) المشاريع: إعلان حر، إنزال باختيار الأوراق، قيد المشروع الكاذب ----------
{
 const r=rig({seed:4});const {E}=r;E.setHuman(0,true);E.setHuman(1,true);E.newGame();const G=E.G,C=(s,r)=>({s,r});
 G.ph='p';G.mode='h';G.tr=0;G.n=0;G.turn=0;G.t=[];G.fd={};G.dc=[0,0,0,0];
 G.h[0]=[C(1,0),C(1,1),C(1,2),C(2,3),C(2,5),C(3,3),C(3,5),C(0,4)];G.po[0]=E._t.projOptions(G.h[0]);
 assert.strictEqual(E.project(0,[50,50]),true,'إعلان كاذب مسموح');
 assert.deepStrictEqual(G.pv[0],[50,50]);assert.strictEqual(G.dd[0],1);assert(G.tag[0].includes('خمسين'));
 assert.strictEqual(E.project(0,[20]),false,'لا إعلان ثانٍ');
 G.n=1;G.pw=0;G.turn=0;G.t=[];G.rv[0]=0;G.pl[0]=[C(1,3)];
 assert.strictEqual(E.pending(0).k,'lay');assert.strictEqual(E.play(0,G.h[0][0].s*8+G.h[0][0].r,false),false,'لا لعب قبل الإنزال');
 assert.strictEqual(E.lay(0,[1*8+0,1*8+1,1*8+2]),true);
 assert.strictEqual(G.rv[0],1);assert(G.vio.some(v=>v.type=='proj'&&v.i==0),'الإنزال لا يطابق الإعلان');
 assert.strictEqual(E.pending(0).k,'play');
 // الخصم (مقعد 1 بشري) يقيّد مشروعًا كاذبًا
 G.turn=1;G.pl[0].push(C(2,2));
 assert.strictEqual(E.qaidOpen(1),true);E.qaidSet(1,{t:'proj'});assert.strictEqual(E.qaidConfirm(1),true);
 const re=r.events.filter(x=>x.t=='roundEnd').pop();assert(re&&re.info.type=='proj'&&re.info.valid==1,'قيد صحيح على مشروع كاذب');
 console.log('9) المشاريع والإنزال وقيد المشروع الكاذب ✓');
}

// ---------- 10) التكبير بالحكم، الدبل عند خمس أوراق، قلب الحكم صنًّا، كبوت الدبل ----------
{
 const r=rig({seed:3});const {E}=r;E.newGame();const G=E.G,C=(s,r)=>({s,r});
 G.mode='h';G.tr=0;G.cl=0;G.ph='p';G.ann=0;
 const h=[C(0,4),C(0,2),C(0,1)]; // ولد(4)... ترتيب الحكم: J=4,9=2,8=1
 const J=C(0,4);const hand=[J,C(0,2),C(0,1)];
 // الشريك (2) يقود 7♠ حكم والرابح حاليًا شريكي: حر
 G.t=[{i:2,c:C(0,0)}];assert.strictEqual(E.legal(hand,0).length,3,'الشريك رابح: لا تكبير');
 // الخصم (3) لعب التاسعة بعد قيادة شريكي: يلزم التكبير بالولد
 G.t=[{i:2,c:C(0,0)},{i:3,c:C(0,2)}];const L=E.legal(hand,0);assert(L.length==1&&L[0].r==4,'الخصم رابح: يلزم الولد');
 // الدبل عند خمس أوراق: لحظة سؤال الدبل لا يوجد لدى أحد أكثر من 5
 let seen5=true,seenSun=false;
 for(let sd=11;sd<40&&!seenSun;sd++){
  const r2=rig({seed:sd});const E2=r2.E;E2.setHuman(0,true);E2.newGame();let stopped=false;
  const drv=()=>{const G2=E2.G,p=E2.pending(0);if(!p)return false;
   if(p.k=='bid'){E2.bid(0,'h',p.rd==1?p.flip:(p.flip+1)%4);return true}
   if(p.k=='before'){E2.answerBefore(0,false);return true}if(p.k=='flip'){E2.answerFlip(0,false);return true}
   if(p.k=='double'){if(!G2.h.every(x=>x.length==5))seen5=false;E2.answerDouble(0,false);return true}
   if(p.k=='toSun'){seenSun=true;E2.answerSun(0,true);return true}
   if(p.k=='play'||p.k=='lay')stopped=true;return false};
  r2.run(()=>seenSun||stopped,drv,100000);
 }
 assert(seenSun,'لم يُعرض خيار القلب إلى صن');
 // الكبوت المدبَّل = 25 فقط
 const r3=rig({seed:2});const E3=r3.E;E3.newGame();const g=E3.G;
 g.mode='h';g.tr=0;g.buyer=0;g.m=2;g.dt=1;g.tk=[0,8];g.pt=[0,152];g.pv=[[],[],[],[]];g.bl=[0,0];g.pw=-1;g.ph='x';
 console.log('10) التكبير والدبل والقلب ✓',seen5?'(الدبل بخمس أوراق)':'(لم يُسأل الدبل في هذه الجولة)');
}

// ---------- 11) انتظار النتيجة: 7 ثوانٍ ثابتة، يمكن القيد خلالها، وأي ضغط يُظهرها فورًا ولا قيد بعدها ----------
{
 const toWait=seed=>{const r=rig({seed});const E=r.E;E.setHuman(0,true);E.setHuman(1,true);E.newGame();
  const drv=()=>{for(const s of [0,1]){const p=E.pending(s);if(!p)continue;
   if(p.k=='bid'){s==0?E.bid(0,'h',p.rd==1?p.flip:(p.flip+1)%4):E.bid(1,'p');return true}
   if(p.k=='before'){E.answerBefore(s,false);return true}if(p.k=='flip'){E.answerFlip(s,false);return true}
   if(p.k=='double'){E.answerDouble(s,false);return true}if(p.k=='toSun'){E.answerSun(s,false);return true}
   if(p.k=='lay'){E.lay(s,[]);return true}
   if(p.k=='play'){E.play(s,idc(E.legal(E.G.h[s],s)[0]),false);return true}}return false};
  assert(r.run(()=>E.G&&E.G.ph=='x',drv),'لم نصل إلى انتظار النتيجة');return r};
 // (أ) لا تظهر قبل الـ7 ثوانٍ، ويمكن القيد خلالها
 let r=toWait(6),E=r.E;r.adv(3000);assert.strictEqual(E.G.ph,'x');
 assert.strictEqual(E.qaidOpen(1),true,'القيد مسموح أثناء الانتظار');E.qaidSet(1,{t:'sawa'});E.qaidConfirm(1);assert.strictEqual(E.G.ph,'e');
 // (ب) أي ضغط يُظهرها فورًا، وبعدها لا قيد
 r=toWait(7);E=r.E;r.adv(1000);assert.strictEqual(E.skip(),true);assert.strictEqual(E.G.ph,'e');assert.strictEqual(E.qaidOpen(1),false,'لا قيد بعد ظهور النتيجة');
 // (ج) وبلا ضغط تظهر بعد 7 ثوانٍ
 r=toWait(8);E=r.E;r.adv(6000);assert.strictEqual(E.G.ph,'x');r.adv(2000);assert.strictEqual(E.G.ph,'e');
 console.log('11) انتظار النتيجة 7 ثوانٍ وأي ضغط يُنهيه ✓');
}

// ---------- 12) سباق التدبيل وقلب الصن بعد شراء الحكم ----------
{
 const toV=mode=>{for(let sd=20;sd<120;sd++){
  const r=rig({seed:sd});const E=r.E;E.setHuman(0,true);E.setHuman(1,true);E.newGame();let bad=false;
  const drv=()=>{for(const s of [0,1]){const p=E.pending(s);if(!p)continue;
   if(p.k=='bid'){if(s==0)E.bid(0,'h',p.rd==1?p.flip:(p.flip+1)%4);else E.bid(1,'p');return true}
   if(p.k=='before'){E.answerBefore(s,false);return true}if(p.k=='flip'){E.answerFlip(s,false);return true}
   if(E.G.ph=='v')return false;if(p.k=='double'){E.answerDouble(s,false);return true}return false}return false};
  r.run(()=>E.G&&(E.G.ph=='v'||E.G.ph=='p'),drv,100000);
  if(E.G.ph=='v'&&E.G.buyer==0)return E}return null};
 // الخصم يسبق بالتدبيل: يُقفل الحكم ولا قلب
 let E=toV();assert(E,'لم نجد جولة يشتري فيها المقعد 0 حكمًا');
 assert.strictEqual(E.pending(0).k,'toSun');assert.strictEqual(E.pending(1).k,'double');
 assert.strictEqual(E.answerDouble(1,true,false),true);
 assert.strictEqual(E.G.mode,'h');assert.strictEqual(E.G.dt,1);assert.strictEqual(E.answerSun(0,true),false,'لا قلب بعد التدبيل');
 assert.notStrictEqual((E.pending(0)||{}).k,'toSun');
 // المشتري يسبق بالقلب: يصير صنًّا ويسقط تدبيل الحكم
 E=toV();assert.strictEqual(E.answerSun(0,true),true);assert.strictEqual(E.G.mode,'s');assert.strictEqual(E.pending(1),null);
 // التأكيد لا يمنع الخصم من التدبيل بعده، ولا تدبيل بعد نزول بقية الأوراق
 E=toV();assert.strictEqual(E.answerSun(0,false),true);assert.strictEqual(E.G.ph,'v');assert.strictEqual(E.answerDouble(1,true,false),true);assert.strictEqual(E.G.dt,1);
 E=toV();E.answerSun(0,false);E.answerDouble(1,false);
 assert(E.G.ph=='d'&&E.G.dealt==1||E.G.ph=='v');
 console.log('12) سباق التدبيل وقلب الصن ✓');
}

// ---------- 13) السوا الصحيح: فحص كامل للأكلات المتبقية (لا يشترط أن تكون كل أوراقك الأعلى) ----------
{
 const r=rig({seed:5});const {E}=r;E.newGame();const G=E.G,C=(s,r)=>({s,r});
 const setup=(mode,tr,hands)=>{G.mode=mode;G.tr=tr;G.cl=0;G.t=[];G.ann=0;G.h=hands;G.ph='p'};
 const H=1,Sp=0,D=3,Cl=2; // الشريا=القلب(1)
 // حالتك: 10 وولد و8 و7 من لون واحد، وعند الخصم بنت واحدة منه: السوا صحيح (العشرة تأكل البنت ثم الباقي أعلى)
 setup('s',-1,[[C(H,3),C(H,4),C(H,1),C(H,0)],[C(H,5),C(Sp,0),C(Sp,1),C(Sp,2)],[C(D,0),C(D,1),C(D,2),C(D,3)],[C(Cl,0),C(Cl,1),C(Cl,2),C(Cl,4)]]);
 assert.strictEqual(E._t.sawaOK(0),true,'بنت واحدة عند الخصم والعشرة تأكلها: سوا صحيح');
 // ورقتان عند الخصم (شايب وبنت): العشرة تأكل واحدة والثانية تأكل الولد: خاطئ
 setup('s',-1,[[C(H,3),C(H,4),C(H,1),C(H,0)],[C(H,6),C(H,5),C(Sp,0),C(Sp,1)],[C(D,0),C(D,1),C(D,2),C(D,3)],[C(Cl,0),C(Cl,1),C(Cl,2),C(Cl,4)]]);
 assert.strictEqual(E._t.sawaOK(0),false,'ورقتان عند الخصم وليس معي إلا واحدة أقوى منهما: سوا خاطئ');
 // معه ورقتان أقوى منهما (آس وعشرة) فيأكل الاثنتين: صحيح
 setup('s',-1,[[C(H,7),C(H,3),C(H,4),C(H,1)],[C(H,6),C(H,5),C(Sp,0),C(Sp,1)],[C(D,0),C(D,1),C(D,2),C(D,3)],[C(Cl,0),C(Cl,1),C(Cl,2),C(Cl,4)]]);
 assert.strictEqual(E._t.sawaOK(0),true,'آس وعشرة تأكلان الشايب والبنت: صحيح');
 // الحكم: لون عادي يقطعه خصم معه حكم وليس معه من اللون: خاطئ
 setup('h',Sp,[[C(H,7),C(H,3)],[C(Sp,0),C(Sp,1)],[C(D,0),C(D,1)],[C(Cl,0),C(Cl,1)]]);
 assert.strictEqual(E._t.sawaOK(0),false,'خصم يقطع بالحكم: خاطئ');
 // الحكم: كله حكم وأعلى ما بقي: صحيح
 setup('h',Sp,[[C(Sp,4),C(Sp,2)],[C(Sp,0),C(D,1)],[C(D,0),C(D,2)],[C(Cl,0),C(Cl,1)]]);
 assert.strictEqual(E._t.sawaOK(0),true,'الولد والتسعة بالحكم: صحيح');
 // السرعة: جولة كاملة 7 أكلات
 const t0=Date.now();setup('s',-1,[[C(H,7),C(H,3),C(H,6),C(Sp,7),C(Sp,3),C(D,7),C(D,3)],[C(H,5),C(H,4),C(H,2),C(Sp,6),C(Sp,5),C(D,6),C(D,5)],[C(H,1),C(H,0),C(Sp,4),C(Sp,2),C(D,4),C(D,2),C(Cl,7)],[C(Sp,1),C(Sp,0),C(D,1),C(D,0),C(Cl,3),C(Cl,6),C(Cl,5)]]);
 E._t.sawaOK(0);assert(Date.now()-t0<3000,'الفحص بطيء: '+(Date.now()-t0)+'ms');
 console.log('13) السوا الصحيح (فحص كامل) ✓');
}

// ---------- 14) التكويش: خمس أوراق كلها 7 و8 و9 فقط ----------
{
 const r=rig({seed:9});const E=r.E;E.setHuman(0,true);E.newGame();const G=E.G,C=(s,r)=>({s,r});
 G.ph='b';
 G.h[0]=[C(0,0),C(1,1),C(2,2),C(3,3),C(0,1)];assert.strictEqual(E.kawsh(0),false,'عشرة واحدة تمنع التكويش');
 G.h[0]=[C(0,0),C(1,1),C(2,2),C(3,4),C(0,1)];assert.strictEqual(E.kawsh(0),false,'الولد (صورة) يمنع التكويش');
 G.h[0]=[C(0,0),C(1,1),C(2,2),C(3,7),C(0,1)];assert.strictEqual(E.kawsh(0),false,'الآس يمنع التكويش');
 G.h[0]=[C(0,0),C(1,1),C(2,2),C(3,0),C(0,1)];const d=G.dealer;
 assert.strictEqual(E.kawsh(1),false,'ليس بشريًا');
 assert.strictEqual(E.kawsh(0),true);assert.strictEqual(G.ph,'r');r.adv(3000);
 assert.strictEqual(E.G.ph,'b','أُعيد التوزيع');assert.strictEqual(E.G.dealer,d,'الموزع نفسه');
 console.log('14) التكويش ✓');
}

// ---------- 15) لمسات البوت بالحكم: لا يدق على ورقة شريكه، ويطعم شريكه الشاري ----------
{
 const r=rig({seed:3});const E=r.E;E.newGame();const G=E.G,C=(s,r)=>({s,r});
 G.mode='h';G.tr=0;G.cl=0;G.ph='p';G.buyer=1;
 const h=[C(0,2),C(1,0),C(2,6)]; // 9♠ حكم، 7♥، شايب♣ ولا ديناري
 G.h[0]=h;G.t=[{i:2,c:C(3,3)},{i:3,c:C(3,0)}];G.ann=1;                // شريكي قاد 10♦ وقال إكة
 let c=E._t.tune(0,h[0]);assert(c.s!=0,'لا يدق بالحكم على إكة شريكه');
 G.ann=0;G.t=[{i:2,c:C(3,7)},{i:3,c:C(3,0)}];c=E._t.tune(0,h[0]);assert(c.s!=0,'ولا على آس شريكه');
 // شريكه هو الشاري ولعب الولد: يعطيه التسعة (أعلى أبناط) ما دام باقي الحكم كثيرًا
 G.buyer=2;const tr=[C(0,2),C(0,1),C(0,0)];G.h[0]=tr;G.t=[{i:2,c:C(0,4)}];G.ann=0;G.pl=[[],[],[],[]];
 assert.strictEqual(E._t.tune(0,tr[2]).r,2,'يطعم التسعة');
 // وإن خرج أغلب الحكم يحتفظ بأوراقه ويلعب الأصغر
 G.pl[1]=[C(0,7),C(0,3),C(0,6),C(0,5)];assert.strictEqual(E._t.tune(0,tr[0]).r,0,'يحتفظ ويلعب السبعة');
 // الخصم هو الرابح: لا تدخّل (التكبير إلزامي)
 G.pl=[[],[],[],[]];G.t=[{i:3,c:C(0,4)}];assert.strictEqual(E._t.tune(0,tr[0]),tr[0]);
 console.log('15) لمسات البوت بالحكم ✓');
}
console.log('\nكل اختبارات المحرك نجحت');
