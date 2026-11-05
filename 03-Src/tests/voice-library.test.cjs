const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../lib/core.js'),{createCache}=require('../lib/voice-cache.cjs');
const bundle=path.resolve(__dirname,'../assets/voice-cache');
function fixture(){const b=Buffer.alloc(48);b.write('RIFF');b.write('WAVE',8);b.write('fmt ',12);b.writeUInt32LE(16,16);b.write('data',36);b.writeUInt32LE(4,40);return b;}
test('试听清单准确区分预录档位、缺少档位与音色',()=>{const cache=createCache({bundle,local:path.resolve(__dirname,'../../Codex-Temp/library-unit')});const c=C.normalize();assert.equal(cache.list(c).filter(x=>x.amount&&x.ready).length,9);assert.equal(cache.list(c).length,12);const custom=C.normalize({...c,voice:{...c.voice,thresholds:[100,123]}});assert.equal(cache.list(custom).find(x=>x.amount===123).ready,false);assert.equal(cache.list(custom).find(x=>x.amount===100).ready,true);assert.ok(cache.list({...c,voice:{...c.voice,voice:'Serena'}}).every(x=>!x.ready));});
test('明确单档生成调用接口且落盘，之后离线读取不再调用',async()=>{const local=fs.mkdtempSync(path.resolve(__dirname,'../../Codex-Temp/generate-unit-'));const cache=createCache({bundle,local});const c=C.normalize();let calls=0;const fetcher=async(_url,options)=>{calls++;assert.match(JSON.parse(options.body).input.text,/100元/);return {ok:true,json:async()=>({output:{audio:{data:fixture().toString('base64')}}})};};const result=await cache.generateClip(c,'test-only-key','amount-100',fetcher);assert.equal(calls,1);assert.equal(result.audio,cache.read('Cherry',cache.list(c).find(x=>x.id==='amount-100').text));assert.equal(calls,1);assert.equal(fs.readdirSync(local).filter(n=>n.endsWith('.wav')).length,1);await assert.rejects(cache.generateClip(c,'test-only-key','amount-999',fetcher),/有效/);assert.equal(calls,1);await assert.rejects(cache.generateClip(c,'test-only-key','amount-100',async()=>({ok:false,status:401})),/鉴权/);assert.equal(result.audio,cache.read('Cherry',cache.list(c).find(x=>x.id==='amount-100').text));});
test('金额文案去掉重复结尾且旧缓存不会命中新音频',()=>{
 const {amountText,SPECIAL,filename}=require('../lib/voice-cache.cjs');
 const manifest=require('../assets/voice-cache/manifest.json');
 const local=fs.mkdtempSync(path.resolve(__dirname,'../../Codex-Temp/old-voice-unit-'));
 const cache=createCache({bundle,local});
 for(const amount of [10,50,100,123,200,500,1000,2000,5000,10000]){
  const text=amountText(amount);assert.ok(text.startsWith('今天已经赚到'+amount+'元啦。'));
  assert.doesNotMatch(text,/小心愿正在一点点靠近/);
  assert.notEqual(filename('Cherry',text),filename('Cherry',text+'慢慢来，你的小心愿正在一点点靠近。'));
 }
 assert.doesNotMatch(SPECIAL.sample,/小心愿正在一点点靠近/);
 const text=amountText(100),oldText=text+'慢慢来，你的小心愿正在一点点靠近。';
 fs.writeFileSync(path.join(local,filename('Cherry',oldText)),fixture());
 const clip=manifest.clips.find(c=>c.id==='amount-100');
 assert.equal(cache.read('Cherry',text),'data:audio/wav;base64,'+fs.readFileSync(path.join(bundle,clip.file)).toString('base64'));
 assert.ok(cache.list(C.normalize()).every(c=>c.ready&&!c.text.includes('小心愿正在一点点靠近')));
});
