const {contextBridge,ipcRenderer}=require('electron');
const call=async(name,...args)=>{const result=await ipcRenderer.invoke(name,...args);if(!result.ok)throw Error(result.error);return result.value;};
const listen=(name,fn)=>{const handler=(_event,value)=>fn(value);ipcRenderer.on(name,handler);return ()=>ipcRenderer.removeListener(name,handler);};
contextBridge.exposeInMainWorld('cheer',{
 state:()=>call('get-state'),preview:config=>call('preview',config),save:config=>call('save',config),cancel:()=>call('cancel'),command:name=>call('command',name),nextWish:()=>call('next-wish'),setWish:id=>call('set-wish',id),
 saveKey:key=>call('save-key',key),clearKey:()=>call('clear-key'),prepareVoice:()=>call('prepare-voice'),testVoice:()=>call('test-voice'),testClip:id=>call('test-clip',id),generateClip:id=>call('generate-clip',id),audioEnded:failed=>call('audio-ended',failed),estimate:name=>call('estimate',name),searchPrice:name=>call('search-price',name),
 onState:fn=>listen('state',fn),onNotice:fn=>listen('notice',fn),onAudio:fn=>listen('audio',fn),onStopAudio:fn=>listen('stop-audio',fn),onTab:fn=>listen('tab',fn),onCelebrate:fn=>listen('celebrate',fn)
});
