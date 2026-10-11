// لاعبو الحاسوب
function botBid(i){
 if(G.ph!='b')return;
 const h=G.h[i],f=G.fl.s,sn=h.reduce((a,c)=>a+(c.r==7?3:c.r==3?1:0),0);let bs=-1,bv=0;
 for(let s=0;s<4;s++){if(G.rd==1&&s!=f||G.rd==2&&s==f)continue;const v=hs(G.rd==1?[...h,G.fl]:h,s);if(v>bv){bv=v;bs=s}}
 if(G.rd==1&&(i==G.dealer||i==(G.dealer+3)%4)&&sn>=5&&sn<7&&bv<6)bid(i,'a');
 else if(sn>=7)bid(i,'s');else if(bv>=(G.rd==1?6:5))bid(i,'h',bs);else bid(i,'p');
}
function botPlay(i){
 if(G.ph!='p')return;
 const h=G.h[i],L=legal(h,i),key=c=>pts(c)*100+str(c),lo=a=>[...a].sort((x,y)=>key(x)-key(y))[0];let c;
 if(!G.t.length){
  c=L.find(x=>x.r==7&&!isT(x))||(hk()&&L.find(x=>!isT(x)&&isMaster(x)))||(hk()&&i%2==G.buyer%2&&L.find(x=>isT(x)&&x.r==4))||lo(L);
 }else{
  const w=win(),ls=G.t[0].c.s,wn=L.filter(x=>val(x,ls)>val(w.c,ls));
  if(w.i%2==i%2)c=G.t.length==3?[...L].sort((x,y)=>pts(y)-pts(x))[0]:lo(L);
  else c=wn.length?[...wn].sort((x,y)=>val(x,ls)-val(y,ls))[0]:lo(L);
 }
  play(i,c,hk()&&!G.t.length&&!isT(c)&&c.r!=7&&isMaster(c))}
