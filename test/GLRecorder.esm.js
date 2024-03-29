var Samples;
(function (Samples) {
    Samples[Samples["SAMPLE_8"] = 8000] = "SAMPLE_8";
    Samples[Samples["SAMPLE_11"] = 11025] = "SAMPLE_11";
    Samples[Samples["SAMPLE_16"] = 16000] = "SAMPLE_16";
    Samples[Samples["SAMPLE_22"] = 22050] = "SAMPLE_22";
    Samples[Samples["SAMPLE_44"] = 44100] = "SAMPLE_44";
    Samples[Samples["SAMPLE_48"] = 48000] = "SAMPLE_48";
})(Samples || (Samples = {}));
var Bits;
(function (Bits) {
    Bits[Bits["BIT_8"] = 8] = "BIT_8";
    Bits[Bits["BIT_16"] = 16] = "BIT_16";
    Bits[Bits["BIT_32"] = 32] = "BIT_32";
})(Bits || (Bits = {}));
var Channels;
(function (Channels) {
    Channels[Channels["CHANNELS_1"] = 1] = "CHANNELS_1";
    Channels[Channels["CHANNELS_2"] = 2] = "CHANNELS_2";
})(Channels || (Channels = {}));
var Mime;
(function (Mime) {
    Mime["WAVE"] = "wave";
    Mime["MP3"] = "mp3";
})(Mime || (Mime = {}));
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["SUCCESS"] = 0] = "SUCCESS";
    StatusCode[StatusCode["NOT_SUPPORT"] = -1] = "NOT_SUPPORT";
    StatusCode[StatusCode["NOT_FOUNDED"] = -2] = "NOT_FOUNDED";
    StatusCode[StatusCode["NOT_ALLOWED"] = -3] = "NOT_ALLOWED";
    StatusCode[StatusCode["ERROR"] = -9] = "ERROR";
})(StatusCode || (StatusCode = {}));
var StatusMessage;
(function (StatusMessage) {
    StatusMessage["SUCCESS"] = "\u6253\u5F00\u9EA6\u514B\u98CE\u6210\u529F";
    StatusMessage["NOT_SUPPORT"] = "\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u5F55\u97F3\u529F\u80FD";
    StatusMessage["NOT_FOUNDED"] = "\u627E\u4E0D\u5230\u9EA6\u514B\u98CE";
    StatusMessage["NOT_ALLOWED"] = "\u9EA6\u514B\u98CE\u88AB\u7981\u6B62\u4F7F\u7528";
    StatusMessage["ERROR"] = "\u6253\u5F00\u9EA6\u514B\u98CE\u51FA\u73B0\u5F02\u5E38";
})(StatusMessage || (StatusMessage = {}));

const enumValues = (data) => {
    return Object.values(data).filter((value) => typeof value === 'number');
};

class RecorderConfig {
    constructor(defaultSR, options) {
        let config = options;
        if (!!(config === null || config === void 0 ? void 0 : config.sampleRate) && !(config.sampleRate in Samples)) {
            throw new Error(`参数config.sampleRate的值不支持，支持的值有${enumValues(Samples).join(', ')}`);
        }
        if (!!(config === null || config === void 0 ? void 0 : config.bitRate) && !(config.bitRate in Bits)) {
            throw new Error(`参数config.bitRate的值不支持，支持的值有${enumValues(Bits).join(', ')} (目前仅支持16)`);
        }
        if (!!(config === null || config === void 0 ? void 0 : config.numChannels) && !(config.numChannels in Channels)) {
            throw new Error(`参数config.numChannels的值不支持，支持的值有${enumValues(Channels).join(', ')}`);
        }
        let defaultBitRate = 16;
        let defaultNumChannels = 2;
        this._bufferSize = 4096;
        this._defaultSampleRate = defaultSR;
        this._sampleRate = (config === null || config === void 0 ? void 0 : config.sampleRate) || this._defaultSampleRate;
        this._bitRate = (config === null || config === void 0 ? void 0 : config.bitRate) || defaultBitRate;
        this._numChannels = (config === null || config === void 0 ? void 0 : config.numChannels) || defaultNumChannels;
        this._kbps = this._sampleRate * this._bitRate * this._numChannels / 1000;
        this.object = {
            kbps: this._kbps,
            bufferSize: this._bufferSize,
            sampleRate: this._sampleRate,
            bitRate: this._bitRate,
            numChannels: this._numChannels,
            defaultSampleRate: this._defaultSampleRate,
        };
    }
    get kbps() {
        return this._kbps;
    }
    get bufferSize() {
        return this._bufferSize;
    }
    get sampleRate() {
        return this._sampleRate;
    }
    get bitRate() {
        return this._bitRate;
    }
    get numChannels() {
        return this._numChannels;
    }
    get defaultSampleRate() {
        return this._defaultSampleRate;
    }
}

var _a;
let currentSrc = (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.src;
let root = '';
if (!!currentSrc) {
    root = currentSrc.substring(0, currentSrc.lastIndexOf('/') + 1);
}
else {
    root = "/node_modules/glrecorder/dist/";
}
var root$1 = root;

const appendToFormData = (formdata, obj) => {
    if (!obj)
        return;
    Object.keys(obj).forEach((key) => {
        formdata.append(key, obj[key]);
    });
};

class GLRecorder {
    constructor(options) {
        this._data = null;
        this._ready = false;
        this._recording = false;
        this.startTime = 0;
        this.endTime = 0;
        this.options = options;
        this.worker = new Worker(root$1 + "recorder-worker.js");
    }
    /**
     * 录音数据
     */
    get data() {
        return this._data;
    }
    /**
     * 录音器初始化状态
     */
    get ready() {
        return this._ready;
    }
    /**
     * 录音器是否正在录制中
     */
    get recording() {
        return this._recording;
    }
    /**
     * 初始化录音器（唤起用户授权弹窗）
     * @returns 录音器初始化状态
     */
    init() {
        return new Promise((resolve, reject) => {
            if (!GLRecorder.support()) {
                reject({ code: StatusCode.NOT_SUPPORT, message: StatusMessage.NOT_SUPPORT });
                return;
            }
            this.context = new AudioContext();
            this.config = new RecorderConfig(this.context.sampleRate, this.options);
            navigator.mediaDevices.getUserMedia({ audio: true }).then((micstream) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                this.inputAudio = (_a = this.context) === null || _a === void 0 ? void 0 : _a.createMediaStreamSource(micstream);
                let volume = (_b = this.context) === null || _b === void 0 ? void 0 : _b.createGain();
                (_c = this.inputAudio) === null || _c === void 0 ? void 0 : _c.connect(volume);
                this.processor = (_d = this.context) === null || _d === void 0 ? void 0 : _d.createScriptProcessor((_e = this.config) === null || _e === void 0 ? void 0 : _e.bufferSize, (_f = this.config) === null || _f === void 0 ? void 0 : _f.numChannels, (_g = this.config) === null || _g === void 0 ? void 0 : _g.numChannels);
                (_h = this.inputAudio) === null || _h === void 0 ? void 0 : _h.connect(this.processor);
                (_j = this.processor) === null || _j === void 0 ? void 0 : _j.addEventListener('audioprocess', (evt) => {
                    this.onAudioProcess(evt);
                });
                this._ready = true;
                this.worker.postMessage({ cmd: 'init', config: this.config });
                resolve({ code: StatusCode.SUCCESS, message: StatusMessage.SUCCESS });
            }).catch((error) => {
                switch (error.name || error.code) {
                    case 'NotFoundError':
                        reject({ code: StatusCode.NOT_FOUNDED, message: StatusMessage.NOT_FOUNDED });
                        break;
                    case 'PermissionDeniedError':
                    case 'NotAllowedError':
                        reject({ code: StatusCode.NOT_ALLOWED, message: StatusMessage.NOT_ALLOWED });
                        break;
                    default:
                        reject({ code: StatusCode.ERROR, message: StatusMessage.ERROR });
                        break;
                }
            });
        });
    }
    /**
     * 开始录音
     * @param mime 录音格式 'mp3' 录制MP3格式的录音 'wave'（默认） 录制WAVE格式的录音
     * @returns
     */
    start(mime = Mime.WAVE) {
        return new Promise((resolve, reject) => {
            var _a;
            if (this._recording) {
                reject('正在录音中，不能执行此操作');
                return;
            }
            if (!this._ready) {
                reject('GLRecorder未初始化，请先调用GLRecorder.init()');
                return;
            }
            (_a = this.processor) === null || _a === void 0 ? void 0 : _a.connect(this.context.destination);
            this.startTime = Date.now();
            this.worker.postMessage({ cmd: 'start', mime: mime });
            this._recording = true;
            resolve();
        });
    }
    /**
     * 停止录音
     * @returns 录音数据
     */
    stop() {
        return new Promise((resolve, reject) => {
            var _a;
            if (!this._recording) {
                reject('录音未开启，不能执行此操作');
                return;
            }
            this._recording = false;
            this.worker.addEventListener('message', (evt) => {
                if (evt.data.cmd === 'finished') {
                    this._data = {
                        blob: evt.data.blob,
                        size: evt.data.blob.size,
                        type: evt.data.blob.type,
                        duration: this.endTime - this.startTime
                    };
                    resolve(this._data);
                }
            });
            this.worker.postMessage({ cmd: 'stop' });
            this.endTime = Date.now();
            (_a = this.processor) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
    }
    /**
     * 清空录音数据
     * @returns
     */
    clear() {
        return new Promise((resolve, reject) => {
            if (this._recording) {
                reject('正在录音中，不能执行此操作');
                return;
            }
            this._data = null;
            this.startTime = 0;
            this.endTime = 0;
            resolve();
        });
    }
    /**
     * 上传录音数据到指定地址
     * @param url 需要上传的接口地址
     * @param extra 附加的额外参数 { a: 1, b: 2, c: 3 }
     * @returns 接口响应数据
     */
    upload(url, extra) {
        return new Promise((resolve, reject) => {
            if (!this._data || !this._data.blob) {
                reject('目标文件不存在，请先录音');
                return;
            }
            let formdata = new FormData();
            formdata.append('file', this._data.blob);
            appendToFormData(formdata, extra);
            fetch(url, {
                method: "POST",
                body: formdata
            })
                .then((response) => response)
                .then((data) => resolve(data))
                .catch((error) => reject(error));
        });
    }
    /**
     * 把录音数据保存到本地
     * @param name 要保存的文件名 默认 'audio'
     * @returns 录音缓存文件地址
     */
    save(name = 'audio') {
        return new Promise((resolve, reject) => {
            if (!this._data || !this._data.blob) {
                reject('没有可保存的录音');
                return;
            }
            let url = URL.createObjectURL(this._data.blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = this._data.blob.type.replace(/audio\//, name + '.');
            a.click();
            resolve(url);
        });
    }
    /**
     * GLRecorder.support()
     * 判断浏览器是否支持录音功能
     * @returns true 支持录音 false 不支持录音
     */
    static support() {
        return !!navigator.mediaDevices && !!AudioContext;
    }
    /** 采集麦克风数据 */
    onAudioProcess(evt) {
        var channelDatas = [];
        for (let channel = 0; channel < this.config.numChannels; channel++) {
            let buffer = evt.inputBuffer.getChannelData(channel);
            channelDatas.push(buffer);
        }
        this.worker.postMessage({ cmd: "encode", datas: channelDatas });
    }
}

export { GLRecorder as default };
