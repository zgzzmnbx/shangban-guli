'use strict';
const fs=require('node:fs');const path=require('node:path');
function atomicWrite(file,text){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.tmp';try{fs.writeFileSync(temp,text,{encoding:'utf8',mode:0o600});fs.renameSync(temp,file);}catch(e){try{fs.unlinkSync(temp);}catch{}throw Error('无法保存设置，请检查数据目录的权限或可用空间');}}
function readJson(file,fallback){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return fallback;}}
function createStore(dir,core){const file=path.join(dir,'config.json');let warning='';let conf;try{const raw=JSON.parse(fs.readFileSync(file,'utf8'));conf=core.normalize(raw);}catch(e){if(fs.existsSync(file)){try{fs.copyFileSync(file,file+'.invalid-'+Date.now());}catch{}warning='原设置无法读取，已使用默认值；原文件已尽可能保留。';}conf=core.clone(core.DEFAULTS);}return {get:()=>core.clone(conf),warning,save(next){const valid=core.normalize(next);if(fs.existsSync(file))fs.copyFileSync(file,file+'.bak');atomicWrite(file,JSON.stringify(valid,null,2));conf=valid;return core.clone(conf);},dir};}
module.exports={atomicWrite,readJson,createStore};
