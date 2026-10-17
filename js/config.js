// بيانات الواجهة وإعدادات الصور. بيانات اللعب نفسها (الأوراق والأبناط والمشاريع) في engine.js وتُقرأ منه.
const {SU,RK,PJ,PV,DN,VT,SN,ST,PN,PT}=BalootEngine.data;
const NM=['أنت','bot1','bot2','bot3'];
const CARD_DIR='cards/',CARD_EXT='png';
const SUL=['S','H','C','D'],ALLK=[...RK.flatMap(r=>SUL.map(x=>r+x)),'back','rug','table'];
// سرعة اللعب (بالمللي ثانية). bot = تأخير إنزال ورقة البوت، ويُضرب في معامل زر السرعة (بطيء 1.1 / عادي 0.7 / سريع 0.4)، فعلى «عادي» ≈ 500. زد الرقم لتبطئ البوتات.
const PLAY_MS={bot:720,look:450,hold:300,sweep:250};
// مهلة دور اللاعب الحقيقي بالثواني للعب الجماعي لاحقًا (0 = بلا مهلة). عند انتهائها يلعب البوت عنه. غير مستخدمة بعد.
const TURN_SECS={normal:30,fast:10,none:0};
// عنوان خادم اللعب الجماعي (ثابت، لا يدخله اللاعبون). للتجربة المحلية فقط: افتح الصفحة من localhost بـ ?server=http://localhost:8787
const SERVER_URL='https://baloot-server.sjm111cia.workers.dev';
