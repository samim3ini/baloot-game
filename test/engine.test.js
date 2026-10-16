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
   if(p.k=='before'){E.answerBefore(0,R()<.5);return true}
   if(p.k=='flip'){E.answerFlip(0,R()<.5);return true}
   if(p.k=='double'){E.answerDouble(0,R()<.4,R()<.5?1:0);return true}
   if(p.k=='play'){
    const h=G.h[0];
    // بعد أول أكلة نجرّب فتح قيد على الخصم (سيكون خاطئًا لأن البوتات لا تغش)
    if(G.n>=1&&R()<.04&&E.qaidOpen(0)){
     const opp=[1,3].map(j=>G.pl[j]).flat();const c=opp[R()*opp.length|0];
     E.qaidSet(0,{t:'cut',pc:idc(c),rq:idc(c)==0?1:0});
     claims++;E.qaidConfirm(0);return true}
    if(G.n==0&&!G.fd[0]&&G.po[0].length&&R()<.5){E.project(0,G.po[0][0].items.map(x=>x.v))}
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
console.log('\nكل اختبارات المحرك نجحت');
