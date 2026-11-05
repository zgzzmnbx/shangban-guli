'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),pkg=require('../package.json');
const electron=path.dirname(require('electron'));
const out=path.resolve(root,'../04-output',`上班鼓励器-Electron-v${pkg.version}-win-x64-【codex】`);
if(fs.existsSync(out)&&fs.readdirSync(out).length)throw Error('交付目录已存在且非空；请先确认现有交付后使用新版本或备份，不自动覆盖');
function copyTree(source,destination){if(fs.statSync(source).isDirectory()){fs.mkdirSync(destination,{recursive:true});for(const name of fs.readdirSync(source))copyTree(path.join(source,name),path.join(destination,name));}else fs.copyFileSync(source,destination);}
copyTree(electron,out);
fs.renameSync(path.join(out,'electron.exe'),path.join(out,'上班鼓励器.exe'));
const app=path.join(out,'resources','app');fs.mkdirSync(app,{recursive:true});
for(const entry of ['main.cjs','preload.cjs','lib','ui','data','assets'])copyTree(path.join(root,entry),path.join(app,entry));
fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({name:pkg.name,productName:pkg.productName,version:pkg.version,main:pkg.main},null,2));
const readme=`上班鼓励器 Electron v${pkg.version}\r\n\r\n双击“上班鼓励器.exe”运行。请保留整个文件夹，不能只复制 EXE。\r\n\r\n右上角：置顶 / 紧凑 / 设置 / 最小化 / 退出。拖动标题区可移动窗口。\r\n右键菜单或系统托盘：恢复窗口、停靠右下角、会议静音、体验涨钱动画。\r\n设置→外观与计薪→金额显示，可在“机械滚轮”和“原版数字”之间切换；保存后记住选择。\r\n底部五色入口切换老钱风、金贵风、高雅、可爱、命令行。\r\n内置 12 段芊悦音色的百炼预录语音，正常播报完全离线，无需填写密钥。设置→金额语音可分别试听每个金额档位及心愿提示。\r\n若更换音色或门槛，在语音设置中用自己的百炼 API Key“补录缺少的语音”；仅明确点击补录或“本次在线生成并试听”时调用服务，生成后保存本地。\r\n金额播报按今日收入跨越设定门槛触发，同一天同档只播一次；不会报时或补播历史金额。\r\n心愿进度为今日收入等值，收入为计薪规则估算，不代表实际到账或储蓄。\r\n默认开启本地金额播报，初始月收入为可修改的示例值，使用前请设为自己的计薪参数。\r\n\r\n配置保存在 %APPDATA%\\WorkCheerWidget\\，密钥使用 Windows 本机加密保护。\r\n设置→外观与计薪可调节窗口不透明度（默认 96%）。升级前先保存并退出旧版，再启动新版。\r\n朋友的原程序及其 %APPDATA%\\上班鼓励器 配置不受影响。\r\n\r\n开发交付未签名；不要绕过系统安全拦截，如被拦截请先核验来源。\r\n`;
fs.writeFileSync(path.join(out,'使用说明-【codex】.txt'),readme,'utf8');
console.log(out);
