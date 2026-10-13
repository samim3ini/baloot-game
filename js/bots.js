// لاعبو الحاسوب
function botBid(i){
 if(G.ph!='b')return;
 const h=G.h[i],f=G.fl.s,sn=h.reduce((a,c)=>a+(c.r==7?3:c.r==3?1:0),0);let bs=-1,bv=0;
 for(let s=0;s<4;s++){if(G.rd==1&&s!=f||G.rd==2&&s==f)continue;const v=hs(G.rd==1?[...h,G.fl]:h,s);if(v>bv){bv=v;bs=s}}
 if(G.rd==1&&(i==G.dealer||i==(G.dealer+3)%4)&&sn>=5&&sn<7&&bv<6)bid(i,'a');
 else if(sn>=7)bid(i,'s');else if(bv>=(G.rd==1?6:5))bid(i,'h',bs);else bid(i,'p');
}
// ===== لعب البوت: يرى كل الأوراق ويبحث عن أفضل لعبة (أكبر فرق أبناط لفريقه) =====
// بحث ألفا-بيتا على الأكلات المتبقية، مع جدول للحالات المكررة، واختصار الأوراق المتكافئة، وعمق متدرج بمهلة زمنية.
// لأنه يرى الأوراق كلها فلا حاجة للتهريب: يكبّر لشريكه ويصغّر للخصم ويمسك اللعب حين يفيد.
let SOLVE_MS=250;
function solvePlay(i){
 const mode=hk(),tr=G.tr,me=i%2,cl=G.cl;
 const SU_=c=>c>>3,RK_=c=>c&7,TRM=c=>mode&&SU_(c)==tr;
 const stg=c=>TRM(c)?10+ST[RK_(c)]:SN[RK_(c)],pt=c=>TRM(c)?PT[RK_(c)]:PN[RK_(c)];
 const vl=(c,L)=>TRM(c)?10+ST[RK_(c)]:SU_(c)==L?SN[RK_(c)]:-1;
 const id=c=>c.s*8+c.r;
 const hm=[0,0,0,0];for(let j=0;j<4;j++)for(const c of G.h[j])hm[j]|=1<<id(c);
 const tcards=G.t.map(x=>id(x.c)),tpl=G.t.map(x=>x.i);
 const lead=G.t.length?tpl[0]:i;
 const bits=m=>{const o=[];for(let b=0;b<32;b++)if(m>>>b&1)o.push(b);return o};
 let nodes=0,deadline=0,TT=new Map();const ABORT={};
 const trickWin=(tc,tp)=>{const L=SU_(tc[0]);let w=0,bv=vl(tc[0],L);for(let k=1;k<tc.length;k++){const v=vl(tc[k],L);if(v>bv){bv=v;w=k}}return tp[w]};
 function legalS(hand,p,tc,tp){
  const h=bits(hand);
  if(!tc.length){if(cl&&mode){const nt=h.filter(c=>SU_(c)!=tr);if(nt.length)return nt}return h}
  const L=SU_(tc[0]),same=h.filter(c=>SU_(c)==L);
  if(same.length){
   if(mode&&L==tr){let mx=-1;for(const c of tc)if(SU_(c)==L)mx=Math.max(mx,ST[RK_(c)]);const up=same.filter(c=>ST[RK_(c)]>mx);return up.length?up:same}
   return same}
  if(mode){const t=h.filter(c=>SU_(c)==tr);
   if(t.length&&trickWin(tc,tp)%2!=p%2){let mx=-1;for(const c of tc)if(SU_(c)==tr)mx=Math.max(mx,ST[RK_(c)]);const up=t.filter(c=>ST[RK_(c)]>mx);return up.length?up:t}}
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
  if((++nodes&1023)==0&&Date.now()>deadline)throw ABORT;
  const p=(ld+pos)%4,mx=team(p)==me;
  const all=h[0]|h[1]|h[2]|h[3]|tc.reduce((m,c)=>m|1<<c,0);
  const ms=reduce(legalS(h[p],p,tc,tp),all);
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
 const legalNow=legalS(hm[i],i,tcards,tpl);if(legalNow.length==1)return legalNow[0];
 const left=G.h[i].length+(G.t.some(x=>x.i==i)?1:0),maxD=Math.max(1,G.h[i].length);
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
 if(G.ph!='p')return;
 const h=G.h[i];let c;
 try{const id=solvePlay(i);c=h.find(x=>x.s*8+x.r==id)}catch(e){c=null}
 if(!c){const L=legal(h,i);c=L[0]}
 play(i,c,hk()&&!G.t.length&&!isT(c)&&c.r!=7&&isMaster(c))}
