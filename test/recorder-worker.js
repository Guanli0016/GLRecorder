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

class Mp3Encoder {
    constructor(lame, config) {
        this.lame = lame;
        this.config = config;
    }
    encode(target, buffers) {
        let samplesLeft, samplesRight = null;
        samplesLeft = this.convertBuffer(buffers[0]);
        if (this.config.numChannels === 2) {
            samplesRight = this.convertBuffer(buffers[1]);
        }
        let remaining = samplesLeft.length;
        let max = 1152;
        for (let i = 0; remaining >= 0; i += max) {
            let left = samplesLeft.subarray(i, i + max);
            let right = null;
            if (!!samplesRight) {
                right = samplesRight.subarray(i, i + max);
            }
            let mp3buf = this.lame.encodeBuffer(left, right);
            target.push(new Int8Array(mp3buf));
            remaining -= max;
        }
    }
    convertBuffer(buffer) {
        let data;
        if (this.config.sampleRate === this.config.defaultSampleRate) {
            data = new Float32Array(buffer);
        }
        else {
            let compression = this.config.defaultSampleRate / this.config.sampleRate;
            let length = Math.ceil(buffer.length / compression);
            data = new Float32Array(length);
            for (let index = 0, i = 0; index < length; i += compression) {
                data[index++] = buffer[~~i];
            }
        }
        return this.floatTo16BitPCM(data);
    }
    floatTo16BitPCM(input) {
        let output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            let s = Math.max(-1, Math.min(1, input[i]));
            output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
        }
        return output;
    }
}

class WaveEncoder {
    constructor(config) {
        this.config = config;
    }
    encode(buffer, size) {
        let buffers = [];
        for (let channel = 0; channel < this.config.numChannels; channel++) {
            buffers.push(this.mergeBuffers(buffer[channel], size));
        }
        let interleaved;
        if (this.config.numChannels === 2) {
            interleaved = this.interleave(buffers[0], buffers[1]);
        }
        else {
            interleaved = buffers[0];
        }
        let compressed = this.compressBuffer(interleaved);
        let dataview = this.encodeWav(compressed);
        return dataview;
    }
    mergeBuffers(buffer, size) {
        let result = new Float32Array(size);
        let offset = 0;
        for (let i = 0; i < buffer.length; i++) {
            result.set(buffer[i], offset);
            offset += buffer[i].length;
        }
        return result;
    }
    interleave(inputLeft, inputRight) {
        let length = inputLeft.length + inputRight.length;
        let result = new Float32Array(length);
        let index = 0;
        let inputIndex = 0;
        while (index < length) {
            result[index++] = inputLeft[inputIndex];
            result[index++] = inputRight[inputIndex];
            inputIndex++;
        }
        return result;
    }
    compressBuffer(buffer) {
        if (this.config.sampleRate == this.config.defaultSampleRate) {
            return buffer;
        }
        if (this.config.sampleRate > this.config.defaultSampleRate) {
            throw "downsampling rate show be smaller than original sample rate";
        }
        let ratio = Math.round(this.config.defaultSampleRate / this.config.sampleRate); //计算压缩率
        let length = Math.round(buffer.length / ratio);
        let result = new Float32Array(length);
        let index = 0;
        let offset = 0;
        while (index < length) {
            let next = (index + 1) * ratio * this.config.numChannels;
            let total = 0;
            let count = 0;
            for (let i = offset; i < next && i < buffer.length; i += this.config.numChannels) {
                total += buffer[i];
                count++;
            }
            result[index * this.config.numChannels] = total / count;
            if (this.config.numChannels === 2) {
                result[index * this.config.numChannels + 1] = total / count;
            }
            index++;
            offset = next;
        }
        return result;
    }
    encodeWav(samples) {
        let buffer = new ArrayBuffer(44 + samples.length * 2);
        let view = new DataView(buffer);
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, this.config.numChannels, true);
        view.setUint32(24, this.config.sampleRate, true);
        view.setUint32(28, this.config.sampleRate * this.config.numChannels * this.config.bitRate / 8, true);
        view.setUint16(32, this.config.numChannels * this.config.bitRate / 8, true);
        view.setUint16(34, this.config.bitRate, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        this.floatTo16BitPCM(view, 44, samples);
        return view;
    }
    floatTo16BitPCM(view, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

class OutputBuffer {
    constructor(lame, config) {
        this.size = 0;
        this.mime = Mime.WAVE;
        this.lame = lame;
        this.config = config;
    }
    init(mime = Mime.WAVE) {
        this.size = 0;
        this.mime = mime;
        this.buffer = this.createBuffer(this.mime);
        this.encoder = this.createEncoder(this.mime);
    }
    write(buffers) {
        this.mime === Mime.MP3
            ? this.writeMp3(buffers)
            : this.writeWave(buffers);
    }
    finish() {
        var _a;
        if (this.mime === Mime.MP3) {
            this.buffer.push(new Int8Array(this.lame.flush()));
            return new Blob(this.buffer, { type: 'audio/mp3' });
        }
        else {
            let view = (_a = this.encoder) === null || _a === void 0 ? void 0 : _a.encode(this.buffer, this.size);
            return new Blob([view], { type: 'audio/wav' });
        }
    }
    writeMp3(buffers) {
        var _a;
        (_a = this.encoder) === null || _a === void 0 ? void 0 : _a.encode(this.buffer, buffers);
    }
    writeWave(buffers) {
        for (let channel = 0; channel < this.config.numChannels; channel++) {
            this.buffer[channel].push(buffers[channel]);
        }
        this.size += buffers[0].length;
    }
    createEncoder(mime = Mime.WAVE) {
        if (mime === Mime.MP3) {
            return new Mp3Encoder(this.lame, this.config);
        }
        else {
            return new WaveEncoder(this.config);
        }
    }
    createBuffer(mime = Mime.WAVE) {
        if (mime === Mime.MP3) {
            let buffers = new Array();
            return buffers;
        }
        else {
            let buffers = new Array(this.config.numChannels);
            for (let channel = 0; channel < this.config.numChannels; channel++) {
                let buffer = new Array();
                buffers[channel] = buffer;
            }
            return buffers;
        }
    }
}

(function () {
    importScripts('./lame.min.js');
    self.addEventListener('message', (evt) => {
        switch (evt.data.cmd) {
            case 'init':
                init(evt.data.config.object);
                break;
            case 'start':
                start(evt.data.mime);
                break;
            case 'encode':
                encode(evt.data.datas);
                break;
            case 'stop':
                stop();
                break;
        }
    });
    let config;
    let lame;
    let outputBuffer;
    function init(_config) {
        config = _config;
        lame = new lamejs.Mp3Encoder(config.numChannels, config.sampleRate, config.kbps);
        outputBuffer = new OutputBuffer(lame, config);
    }
    function start(mime = Mime.WAVE) {
        outputBuffer.init(mime);
    }
    function encode(datas) {
        outputBuffer.write(datas);
    }
    function stop() {
        let audioBlob = outputBuffer.finish();
        self.postMessage({ cmd: 'finished', blob: audioBlob });
    }
})();
