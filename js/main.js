// نقطة البداية: شاشة الدخول (لعب فردي أو غرفة). الرابط ?room=CODE يدخل الغرفة مباشرة إن كان اسمك محفوظًا.
applySkin();loadSkin();
document.addEventListener('click',()=>{if(ENG.waiting())ENG.skip()});
lobbyShow();
{const rc=(new URLSearchParams(location.search).get('room')||'').toUpperCase();
 if(/^[A-Z0-9]{5}$/.test(rc)){$('lcode').value=rc;if(lsGet('baloot_name'))lobbyJoin(rc);else lmsg('اكتب اسمك ثم اضغط «دخول»')}}
