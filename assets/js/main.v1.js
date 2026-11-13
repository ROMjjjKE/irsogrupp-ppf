
(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var WA='https://wa.me/375296866517?text=';
/* меню */
var dr=$('drawer'),bg=$('burger'),cl=$('drawerClose'),last=null;
function open(){ if(!dr)return; last=document.activeElement; dr.classList.add('is-open');
 dr.setAttribute('aria-hidden','false'); bg.setAttribute('aria-expanded','true');
 document.body.style.overflow='hidden'; var f=dr.querySelector('a,button'); if(f)f.focus(); }
function close(){ if(!dr)return; dr.classList.remove('is-open'); dr.setAttribute('aria-hidden','true');
 bg.setAttribute('aria-expanded','false'); document.body.style.overflow='';
 if(last&&last.focus)last.focus(); }
if(bg)bg.addEventListener('click',function(){ dr.classList.contains('is-open')?close():open(); });
if(cl)cl.addEventListener('click',close);
if(dr)dr.addEventListener('click',function(e){ if(e.target.tagName==='A')close(); });
document.addEventListener('keydown',function(e){
 if(!dr||!dr.classList.contains('is-open'))return;
 if(e.key==='Escape')close();
 if(e.key==='Tab'){ var f=dr.querySelectorAll('a,button'),a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}
  else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();} }
});

/* ============ РАСКРОЙ ============ */
var ZONES=[
 {id:'kapot', n:'Капот', code:'Л-01', a:1.45, r:1.55},
 {id:'bamper', n:'Передний бампер', code:'Л-02', a:1.50, r:2.20},
 {id:'fary', n:'Фары, пара', code:'Л-03', a:0.45, r:1.90},
 {id:'krylo', n:'Передние крылья', code:'Л-04', a:0.70, r:1.50},
 {id:'stoyki', n:'Стойки A', code:'Л-05', a:0.28, r:3.20},
 {id:'zerkala', n:'Зеркала', code:'Л-06', a:0.14, r:2.40},
 {id:'porogi', n:'Пороги', code:'Л-07', a:0.85, r:4.00},
 {id:'arki', n:'Задние арки', code:'Л-08', a:0.60, r:2.60},
 {id:'zad', n:'Задний бампер', code:'Л-09', a:1.20, r:2.20},
 {id:'ruchki', n:'Чашки ручек', code:'Л-10', a:0.35, r:3.60}
];
var CLASSES=[['sedan','Седан',1.00],['hetch','Хэтчбек',0.93],['crossover','Кроссовер',1.12],
 ['suv','Внедорожник',1.22],['coupe','Купе',0.96],['minivan','Минивэн',1.18]];
var MICRONS={'190':{t:'190 мкм',d:'базовая защита от сколов и песка'},
 '210':{t:'210 мкм',d:'универсальный выбор для города и трассы'},
 '230':{t:'230 мкм',d:'максимальная стойкость к ударам'}};
var ROLL=1.52;

function fmt(x,d){ return (Math.round(x*Math.pow(10,d))/Math.pow(10,d)).toString().replace('.',','); }

function pack(pieces,width){
  var ps=pieces.slice().sort(function(a,b){ return b.h-a.h; });
  var rows=[],x=0,y=0,rh=0,GAP=0.04;
  ps.forEach(function(p){
    if(x+p.w>width){ y+=rh+GAP; x=0; rh=0; }
    p.x=x; p.y=y; x+=p.w+GAP; if(p.h>rh)rh=p.h;
  });
  var len=(ps.length? y+rh : 0);
  return {pieces:ps,len:len};
}

function draw(){
  var cls=$('vclass')?$('vclass').value:'sedan';
  var f=1; CLASSES.forEach(function(c){ if(c[0]===cls)f=c[2]; });
  var mic=document.querySelector('input[name=micron]:checked');
  var picked=[];
  document.querySelectorAll('input[name=zone]').forEach(function(cb){
    if(!cb.checked)return;
    ZONES.forEach(function(z){ if(z.id===cb.value){
      var a=z.a*f, h=Math.sqrt(a/z.r), w=a/h;
      if(w>ROLL){ w=ROLL; h=a/w; }
      picked.push({z:z,a:a,w:w,h:h});
    }});
  });
  var box=$('cutSheet'),sum=$('cutSum'),msg=$('cutMsg'),btn=$('cutBtn');
  if(!picked.length){
    box.innerHTML='<p class="note" style="padding:24px 4px">Отметьте зоны слева — покажу раскладку лекал на плёнке и расход.</p>';
    sum.innerHTML=''; if(msg)msg.textContent='Ни одна зона не выбрана.';
    if(btn)btn.setAttribute('href',WA+encodeURIComponent('Заявка с сайта: нужен расчёт комплекта защиты.'));
    return;
  }
  var res=pack(picked,ROLL);
  var used=0; res.pieces.forEach(function(p){ used+=p.a; });
  var len=Math.ceil(res.len*2)/2;
  var film=ROLL*len;
  var waste=Math.max(0,Math.round((1-used/film)*100));
  var ppm=330/ROLL, pad=26;
  var W=ROLL*ppm+pad*2, H=len*ppm+pad*2;
  var svg=['<svg viewBox="0 0 '+W.toFixed(0)+' '+H.toFixed(0)+'" role="img" aria-label="Раскладка лекал на плёнке">'];
  svg.push('<rect x="0" y="0" width="'+W.toFixed(0)+'" height="'+H.toFixed(0)+'" fill="#F2EFE7"/>');
  svg.push('<rect x="'+pad+'" y="'+pad+'" width="'+(ROLL*ppm).toFixed(1)+'" height="'+(len*ppm).toFixed(1)+
   '" fill="#FBF9F4" stroke="#14161A" stroke-width="1.4"/>');
  for(var m=0.5;m<len;m+=0.5){
    var yy=pad+m*ppm;
    svg.push('<line x1="'+pad+'" y1="'+yy.toFixed(1)+'" x2="'+(pad+ROLL*ppm).toFixed(1)+'" y2="'+yy.toFixed(1)+
     '" stroke="rgba(20,22,26,.12)" stroke-width="1" stroke-dasharray="4 4"/>');
    svg.push('<text x="'+(pad-6)+'" y="'+(yy-3).toFixed(1)+'" text-anchor="end" font-family="Roboto Mono, monospace" font-size="7" fill="#6C7278">'+fmt(m,1)+'</text>');
  }
  res.pieces.forEach(function(p){
    var x=pad+p.x*ppm, y=pad+p.y*ppm, w=p.w*ppm, h=p.h*ppm;
    svg.push('<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+
     '" fill="rgba(27,43,75,.06)" stroke="#1B2B4B" stroke-width="1.3" stroke-dasharray="6 4"/>');
    svg.push('<text x="'+(x+w/2).toFixed(1)+'" y="'+(y+h/2+2).toFixed(1)+'" text-anchor="middle" font-family="Roboto Mono, monospace" font-size="7.5" fill="#1B2B4B">'+p.z.code+'</text>');
    if(w>70&&h>26){ svg.push('<text x="'+(x+w/2).toFixed(1)+'" y="'+(y+h/2+13).toFixed(1)+'" text-anchor="middle" font-family="Inter Tight, sans-serif" font-size="7" fill="#3E4348">'+p.z.n+'</text>'); }
  });
  svg.push('<text x="'+pad+'" y="'+(pad-9)+'" font-family="Roboto Mono, monospace" font-size="7.5" fill="#6C7278">РУЛОН 1,52 М · '+fmt(len,1)+' ПОГ. М</text>');
  svg.push('</svg>');
  box.innerHTML=svg.join('');
  sum.innerHTML='<div><b>'+fmt(used,2)+' м²</b><span>площадь комплекта</span></div>'+
   '<div><b>'+fmt(len,1)+' пог. м</b><span>расход плёнки</span></div>'+
   '<div><b>'+waste+' %</b><span>обрезки при раскрое</span></div>';
  var names=res.pieces.map(function(p){return p.z.n;}).join(', ');
  if(msg)msg.textContent='Лекал в комплекте: '+res.pieces.length+'. '+names+'. Плёнка '+MICRONS[mic?mic.value:'210'].t+'.';
  if(btn)btn.setAttribute('href',WA+encodeURIComponent('Заявка с сайта: комплект защиты.\nАвто: '+
   (CLASSES.filter(function(c){return c[0]===cls;})[0]||['',''])[1]+'\nЗоны: '+names+
   '\nПлёнка Spectroll: '+MICRONS[mic?mic.value:'210'].t+'\nПлощадь по раскрою: '+fmt(used,2)+' м²'));
}

if($('cutSheet')){
  document.addEventListener('change',function(e){
    if(e.target.name==='zone'||e.target.name==='micron')draw();
  });
  var vc=$('vclass'); if(vc)vc.addEventListener('change',draw);
  var allBtn=$('zAll'),noneBtn=$('zNone');
  if(allBtn)allBtn.addEventListener('click',function(e){ e.preventDefault();
    document.querySelectorAll('input[name=zone]').forEach(function(c){c.checked=true;}); draw(); });
  if(noneBtn)noneBtn.addEventListener('click',function(e){ e.preventDefault();
    document.querySelectorAll('input[name=zone]').forEach(function(c){c.checked=false;}); draw(); });
  draw();
}

/* форма */
var form=$('lead-form');
if(form){ form.addEventListener('submit',function(e){
  e.preventDefault();
  var g=function(i){var el=$(i);return el?el.value.trim():''};
  var n=g('lname'),p=g('lphone'),w=g('lwhat'),m=g('lmsg'),ok=$('lead-ok');
  if(!n||!p){ if(ok){ok.textContent='Укажите имя и телефон';ok.classList.add('on');} return; }
  var t='Заявка с сайта\nИмя: '+n+'\nТелефон: '+p+'\nИнтерес: '+w+(m?'\nДетали: '+m:'');
  if(ok){ ok.textContent='Открываем WhatsApp с готовым сообщением…'; ok.classList.add('on'); }
  window.open('https://wa.me/375296866517?text='+encodeURIComponent(t),'_blank');
});}
})();
