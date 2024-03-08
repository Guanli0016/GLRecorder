var e,t,i,s,n,a;!function(e){e[e.SAMPLE_8=8e3]="SAMPLE_8",e[e.SAMPLE_11=11025]="SAMPLE_11",e[e.SAMPLE_16=16e3]="SAMPLE_16",e[e.SAMPLE_22=22050]="SAMPLE_22",e[e.SAMPLE_44=44100]="SAMPLE_44",e[e.SAMPLE_48=48e3]="SAMPLE_48"}(e||(e={})),function(e){e[e.BIT_8=8]="BIT_8",e[e.BIT_16=16]="BIT_16",e[e.BIT_32=32]="BIT_32"}(t||(t={})),function(e){e[e.CHANNELS_1=1]="CHANNELS_1",e[e.CHANNELS_2=2]="CHANNELS_2"}(i||(i={})),function(e){e.WAVE="wave",e.MP3="mp3"}(s||(s={})),function(e){e[e.SUCCESS=0]="SUCCESS",e[e.NOT_SUPPORT=-1]="NOT_SUPPORT",e[e.NOT_FOUNDED=-2]="NOT_FOUNDED",e[e.NOT_ALLOWED=-3]="NOT_ALLOWED",e[e.ERROR=-9]="ERROR"}(n||(n={})),function(e){e.SUCCESS="打开麦克风成功",e.NOT_SUPPORT="浏览器不支持录音功能",e.NOT_FOUNDED="找不到麦克风",e.NOT_ALLOWED="麦克风被禁止使用",e.ERROR="打开麦克风出现异常"}(a||(a={}));const r=e=>Object.values(e).filter((e=>"number"==typeof e));class o{constructor(s,n){let a=n;if((null==a?void 0:a.sampleRate)&&!(a.sampleRate in e))throw new Error(`参数config.sampleRate的值不支持，支持的值有${r(e).join(", ")}`);if((null==a?void 0:a.bitRate)&&!(a.bitRate in t))throw new Error(`参数config.bitRate的值不支持，支持的值有${r(t).join(", ")} (目前仅支持16)`);if((null==a?void 0:a.numChannels)&&!(a.numChannels in i))throw new Error(`参数config.numChannels的值不支持，支持的值有${r(i).join(", ")}`);this._bufferSize=4096,this._defaultSampleRate=s,this._sampleRate=(null==a?void 0:a.sampleRate)||this._defaultSampleRate,this._bitRate=(null==a?void 0:a.bitRate)||16,this._numChannels=(null==a?void 0:a.numChannels)||2,this._kbps=this._sampleRate*this._bitRate*this._numChannels/1e3,this.object={kbps:this._kbps,bufferSize:this._bufferSize,sampleRate:this._sampleRate,bitRate:this._bitRate,numChannels:this._numChannels,defaultSampleRate:this._defaultSampleRate}}get kbps(){return this._kbps}get bufferSize(){return this._bufferSize}get sampleRate(){return this._sampleRate}get bitRate(){return this._bitRate}get numChannels(){return this._numChannels}get defaultSampleRate(){return this._defaultSampleRate}}var d;let h=null===(d=document.currentScript)||void 0===d?void 0:d.src,l="";l=h?h.substring(0,h.lastIndexOf("/")+1):"/node_modules/glrecorder/dist/";var c=l;class u{constructor(e){this._data=null,this._ready=!1,this._recording=!1,this.startTime=0,this.endTime=0,this.options=e,this.worker=new Worker(c+"recorder-worker.js")}get data(){return this._data}get ready(){return this._ready}get recording(){return this._recording}init(){return new Promise(((e,t)=>{u.support()?(this.context=new AudioContext,this.config=new o(this.context.sampleRate,this.options),navigator.mediaDevices.getUserMedia({audio:!0}).then((t=>{var i,s,r,o,d,h,l,c,u;this.inputAudio=null===(i=this.context)||void 0===i?void 0:i.createMediaStreamSource(t);let _=null===(s=this.context)||void 0===s?void 0:s.createGain();null===(r=this.inputAudio)||void 0===r||r.connect(_),this.processor=null===(o=this.context)||void 0===o?void 0:o.createScriptProcessor(null===(d=this.config)||void 0===d?void 0:d.bufferSize,null===(h=this.config)||void 0===h?void 0:h.numChannels,null===(l=this.config)||void 0===l?void 0:l.numChannels),null===(c=this.inputAudio)||void 0===c||c.connect(this.processor),null===(u=this.processor)||void 0===u||u.addEventListener("audioprocess",(e=>{this.onAudioProcess(e)})),this._ready=!0,this.worker.postMessage({cmd:"init",config:this.config}),e({code:n.SUCCESS,message:a.SUCCESS})})).catch((e=>{switch(e.name||e.code){case"NotFoundError":t({code:n.NOT_FOUNDED,message:a.NOT_FOUNDED});break;case"PermissionDeniedError":case"NotAllowedError":t({code:n.NOT_ALLOWED,message:a.NOT_ALLOWED});break;default:t({code:n.ERROR,message:a.ERROR})}}))):t({code:n.NOT_SUPPORT,message:a.NOT_SUPPORT})}))}start(e=s.WAVE){return new Promise(((t,i)=>{var s;this._recording?i("正在录音中，不能执行此操作"):this._ready?(null===(s=this.processor)||void 0===s||s.connect(this.context.destination),this.startTime=Date.now(),this.worker.postMessage({cmd:"start",mime:e}),this._recording=!0,t()):i("GLRecorder未初始化，请先调用GLRecorder.init()")}))}stop(){return new Promise(((e,t)=>{var i;this._recording?(this._recording=!1,this.worker.addEventListener("message",(t=>{"finished"===t.data.cmd&&(this._data={blob:t.data.blob,size:t.data.blob.size,type:t.data.blob.type,duration:this.endTime-this.startTime},e(this._data))})),this.worker.postMessage({cmd:"stop"}),this.endTime=Date.now(),null===(i=this.processor)||void 0===i||i.disconnect()):t("录音未开启，不能执行此操作")}))}clear(){return new Promise(((e,t)=>{this._recording?t("正在录音中，不能执行此操作"):(this._data=null,this.startTime=0,this.endTime=0,e())}))}upload(e,t){return new Promise(((i,s)=>{if(!this._data||!this._data.blob)return void s("目标文件不存在，请先录音");let n=new FormData;n.append("file",this._data.blob),((e,t)=>{t&&Object.keys(t).forEach((i=>{e.append(i,t[i])}))})(n,t),fetch(e,{method:"POST",body:n}).then((e=>e)).then((e=>i(e))).catch((e=>s(e)))}))}save(e="audio"){return new Promise(((t,i)=>{if(!this._data||!this._data.blob)return void i("没有可保存的录音");let s=URL.createObjectURL(this._data.blob),n=document.createElement("a");n.href=s,n.download=this._data.blob.type.replace(/audio\//,e+"."),n.click(),t(s)}))}static support(){return!!navigator.mediaDevices&&!!AudioContext}onAudioProcess(e){var t=[];for(let i=0;i<this.config.numChannels;i++){let s=e.inputBuffer.getChannelData(i);t.push(s)}this.worker.postMessage({cmd:"encode",datas:t})}}export{u as default};
