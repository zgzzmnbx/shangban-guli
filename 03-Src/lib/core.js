(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.CheerCore=api;})(globalThis,()=>{
  'use strict';
  const THEMES=['老钱风','金贵风','高雅','可爱','命令行'];
  const DEFAULTS={theme:'高雅',gender:'未设置',age:30,monthlyIncome:18000,workdaysPerMonth:22.5,start:'08:30',end:'17:30',lunchStart:'12:00',lunchEnd:'13:00',workdays:[1,2,3,4,5],topmost:true,compact:false,opacity:0.96,moneyStyle:'mechanical',reducedMotion:false,position:null,selectedWishes:['small-headphones','small-coffee','small-book'],activeWish:'small-headphones',customWishes:[],voice:{enabled:true,region:'beijing',voice:'Cherry',volume:0.65,mutedUntil:0,thresholds:[10,50,100,200,500,1000,2000,5000,10000]},reminder:false};
  const SMALL_WISHES=[{id:'small-headphones',name:'一副喜欢很久的耳机',price:1299,icon:'headphones',category:'耳机',gender:'all',band:'all'},{id:'small-coffee',name:'周末请自己喝杯好咖啡',price:38,icon:'coffee',category:'咖啡',gender:'all',band:'all'},{id:'small-book',name:'把书单上的那本带回家',price:88,icon:'book',category:'图书',gender:'all',band:'all'},{id:'small-trip',name:'给自己放一个短假',price:2000,icon:'travel',category:'旅行',gender:'all',band:'all'},{id:'small-plant',name:'桌角添一盆小植物',price:59,icon:'plant',category:'园艺',gender:'all',band:'all'}];
  DEFAULTS.wishOverrides={};
  const clone=x=>JSON.parse(JSON.stringify(x));
  function minutes(s){if(typeof s!=='string'||!/^\d{2}:\d{2}$/.test(s))return NaN;const [h,m]=s.split(':').map(Number);return h<24&&m<60?h*60+m:NaN;}
  function netMinutes(a,b,ls=720,le=780){return Math.max(0,b-a-Math.max(0,Math.min(b,le)-Math.max(a,ls)));}
  function normalize(input={}){const c={...clone(DEFAULTS),...input,voice:{...DEFAULTS.voice,...input.voice}};const start=minutes(c.start),end=minutes(c.end),ls=minutes(c.lunchStart),le=minutes(c.lunchEnd);
    if(!THEMES.includes(c.theme))throw Error('请选择有效的主题');
    if(!['mechanical','classic'].includes(c.moneyStyle))throw Error('请选择有效的金额显示样式');
    for(const [key,label,min,max] of [['monthlyIncome','月收入',0.01,100000000],['workdaysPerMonth','每月计薪天数',1,31],['age','年龄',1,120]]){c[key]=Number(c[key]);if(!Number.isFinite(c[key])||c[key]<min||c[key]>max)throw Error(label+'不在有效范围内');}
    c.opacity=Number(c.opacity);if(!Number.isFinite(c.opacity)||c.opacity<0.6||c.opacity>1)throw Error('窗口不透明度应在 60—100% 之间');
    c.age=Math.floor(c.age);if(!['未设置','男','女'].includes(c.gender))throw Error('请选择有效的性别选项');
    if(![start,end,ls,le].every(Number.isFinite)||end<=start||le<ls||netMinutes(start,end,ls,le)<=0)throw Error('请填写有效的同日上下班与午休时间，净工时须大于零');
    if(!Array.isArray(c.workdays)||!c.workdays.length||c.workdays.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('至少选择一个有效工作日');c.workdays=[...new Set(c.workdays)];
    if(!Array.isArray(c.customWishes)||c.customWishes.length>200)throw Error('自定义心愿过多');
    c.customWishes=c.customWishes.map(w=>{if(typeof w.id!=='string'||!/^custom-[a-zA-Z0-9-]+$/.test(w.id)||typeof w.name!=='string'||!w.name.trim()||w.name.length>60||!Number.isFinite(Number(w.price))||Number(w.price)<=0||Number(w.price)>100000000)throw Error('心愿名称或金额不正确');return {id:w.id,name:w.name.trim(),price:Number(w.price),icon:ICONS.includes(w.icon)?w.icon:'gift',gender:'all',band:'all',category:'自定义'};});
    if(new Set(c.customWishes.map(w=>w.id)).size!==c.customWishes.length)throw Error('心愿编号重复');
    if(!c.wishOverrides||typeof c.wishOverrides!=='object'||Array.isArray(c.wishOverrides))throw Error('心愿预算配置无效');for(const [id,w] of Object.entries(c.wishOverrides)){if(!/^(small-|preset-|custom-)[a-zA-Z0-9-]+$/.test(id)||!w||typeof w.name!=='string'||!w.name.trim()||w.name.length>60||!Number.isFinite(Number(w.price))||Number(w.price)<=0||Number(w.price)>100000000)throw Error('心愿名称或预算无效');c.wishOverrides[id]={name:w.name.trim(),price:Number(w.price)};}
    c.selectedWishes=Array.isArray(c.selectedWishes)?[...new Set(c.selectedWishes.filter(x=>typeof x==='string'))].slice(0,500):[];
    if(!c.selectedWishes.length)throw Error('请至少保留一个轮换心愿');
    c.voice.volume=Number(c.voice.volume);if(!Number.isFinite(c.voice.volume)||c.voice.volume<0||c.voice.volume>1)throw Error('音量应在 0—100% 之间');
    if(!['beijing','singapore'].includes(c.voice.region)||!['Cherry','Serena','Chelsie'].includes(c.voice.voice))throw Error('请选择有效的百炼地域与音色');
    c.voice.mutedUntil=Number(c.voice.mutedUntil)||0;
    c.voice.enabled=Boolean(c.voice.enabled);if(!Array.isArray(c.voice.thresholds)||!c.voice.thresholds.length||c.voice.thresholds.length>30||c.voice.thresholds.some(x=>!Number.isFinite(x)||x<=0||x>100000000))throw Error('金额门槛须为正数，最多 30 个');c.voice.thresholds=[...new Set(c.voice.thresholds)].sort((a,b)=>a-b);
    for(const k of ['topmost','compact','reducedMotion','reminder'])c[k]=Boolean(c[k]);
    c.position=c.position&&Number.isFinite(c.position.x)&&Number.isFinite(c.position.y)?{x:Math.round(c.position.x),y:Math.round(c.position.y)}:null;
    return Object.fromEntries(Object.keys(DEFAULTS).map(k=>[k,c[k]]));
  }
  function snapshot(c,date=new Date()){const start=minutes(c.start),end=minutes(c.end),ls=minutes(c.lunchStart),le=minutes(c.lunchEnd);const span=netMinutes(start,end,ls,le);const minute=date.getHours()*60+date.getMinutes()+date.getSeconds()/60+date.getMilliseconds()/60000;const workday=c.workdays.includes(date.getDay());const state=!workday?'weekend':minute<start?'before':minute>=end?'off':minute>=ls&&minute<le?'lunch':'work';const worked=workday?netMinutes(start,Math.max(start,Math.min(end,minute)),ls,le):0;const daily=c.monthlyIncome/c.workdaysPerMonth,rate=daily/(span*60),earned=daily*worked/span;let prior=0;for(let d=1;d<date.getDate();d++)if(c.workdays.includes(new Date(date.getFullYear(),date.getMonth(),d).getDay()))prior++;const month=prior*daily+earned;return {state,workday,span,worked,daily,rate,earned,month,progress:worked/span,remaining:Math.max(0,(end-minute)*60),untilStart:Math.max(0,(start-minute)*60),untilLunchEnd:Math.max(0,(le-minute)*60),now:date.getTime()};}
  const ICONS=['headphones','coffee','book','camera','laptop','watch','bag','travel','plant','diamond','gift','speaker','drone','home'];
  function guessIcon(category='',name=''){const s=category+name;for(const [pattern,icon] of [[/无人机/,'drone'],[/耳机/,'headphones'],[/相机|富士/,'camera'],[/笔记本|电脑/,'laptop'],[/表/,'watch'],[/咖啡|茶|酒|锅/,'coffee'],[/旅行|短假/,'travel'],[/包|鞋|衣|披肩/,'bag'],[/珠宝|金|水晶|传承/,'diamond'],[/园艺|植物/,'plant'],[/音箱/,'speaker'],[/书|文房|笔/,'book'],[/家电|清洁|按摩|康养/,'home']])if(pattern.test(s))return icon;return 'gift';}
  function catalog(raw,c){return [...SMALL_WISHES,...raw.items.map((w,i)=>({...w,id:'preset-'+i,band:w.age_group,icon:guessIcon(w.category,w.name)})),...c.customWishes].map(w=>({...w,...c.wishOverrides?.[w.id]}));}
  function ageBand(age){return age<30?'20':age<40?'30':age<50?'40':age<60?'50':'60';}
  function recommended(w,age,gender){return w.band==='all'||(String(w.band).startsWith(ageBand(age))&&(gender==='未设置'||w.gender===(gender==='男'?'male':'female')));}
  function selected(c,all){const ids=new Set(c.selectedWishes);const list=all.filter(w=>ids.has(w.id));return list.length?list:all.filter(w=>recommended(w,c.age,c.gender)).slice(0,5);}
  function wishProgress(w,s){const remaining=Math.max(0,w.price-s.earned);return {ratio:Math.min(1,s.earned/w.price),remaining,seconds:remaining/s.rate,done:remaining===0};}
  function duration(seconds){const mins=Math.ceil(Math.max(0,seconds)/60);if(mins<60)return mins+' 分钟';const h=Math.floor(mins/60);return h+' 小时'+(mins%60?' '+mins%60+' 分钟':'');}
  function clock(seconds){seconds=Math.ceil(Math.max(0,seconds));return [Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(x=>String(x).padStart(2,'0')).join(':');}
  function hourKey(date){return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}`;}
  function dayKey(date){return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;}
  function moneyMilestone(c,date,previous,claimed=[]){const s=snapshot(c,date);if(!c.voice.enabled||c.voice.mutedUntil>date.getTime()||s.state!=='work'||!previous||previous.day!==dayKey(date)||date.getTime()-previous.time>30000||date.getTime()<previous.time)return null;const crossed=c.voice.thresholds.filter(n=>previous.earned<n&&s.earned>=n&&!claimed.includes(n));return crossed.length?crossed[crossed.length-1]:null;}
  function milestoneText(amount,w,s){const intros=amount<50?'第一份小小的收获，已经攒起来了。':amount<100?'一杯喜欢的咖啡，今天的努力已经赚出来啦。':amount<200?'破百啦！认真生活的你，值得被好好奖励。':amount<500?'今天的努力，正在变成看得见的小幸福。':amount<1000?'已经很棒了，给努力的自己一个大大的拥抱。':'又跨过了一个大目标，你真的很厉害。';const p=wishProgress(w,s);const tail=p.done?`今日收入等值已经够${w.name}啦，记得给自己留一份奖励。`:p.ratio>=0.8?`离${w.name}只差约${Math.ceil(p.remaining)}元，越来越近了。`:'';return `今天已经赚到${amount}元啦。${intros}${tail}`;}
  function phrase(c,data,index=0){const theme=data[c.theme]||data['高雅'];const band=ageBand(c.age);const pool=theme?.[c.gender==='未设置'?'neutral':c.gender]?.[band]||[];return pool.length?pool[Math.abs(index)%pool.length]:'一步一步来，今天的你已经很认真了。';}
  return {THEMES,DEFAULTS,ICONS,SMALL_WISHES,clone,minutes,netMinutes,normalize,snapshot,catalog,recommended,selected,wishProgress,duration,clock,moneyMilestone,milestoneText,dayKey,hourKey,phrase,guessIcon};
});
