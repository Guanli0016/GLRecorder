!function() {
	'use strict';
	
	importScripts('./lame.min.js');
	
	var outputBuffer, mp3Encoder, config;
	
	self.onmessage = function(evt) {
		switch (evt.data.cmd) {
			case "initialize":
				initialize(evt.data.config);
				break;
			case "start":
				start(evt.data.mime);
				break;
			case "encode":
				encode(evt.data.datas);
				break;
			case "stop":
				stop();
				break;
			default:
				break;
		}
	};
	
	function initialize(conf) {
		config = conf;
		outputBuffer = new ArivocRecorderBuffer(config);
		mp3Encoder = new lamejs.Mp3Encoder(config.numChannels, config.sampleRate, config.kbps);
	}
	
	function start(mime) {
		outputBuffer.init(mime);
	}
	
	function encode(datas) {
		outputBuffer.write(datas);
	}
	
	function stop() {
		var audioBlob;
		if (outputBuffer.mime == "mp3") {
			outputBuffer.buffer.push(new Int8Array(mp3Encoder.flush()));
			console.log(outputBuffer.buffer);
			audioBlob = new Blob(outputBuffer.buffer, {type: "audio/mp3"});
		} else {
			var dataview = exportWAV(outputBuffer, config);
			console.log(dataview);
			audioBlob = new Blob([dataview], {type: "audio/wav"});
		}
		self.postMessage({cmd: "finished", blob: audioBlob});
	}
	
	// 编译成MP3
	function encodeMp3(buffers) {
	    var samplesLeft, samplesRight;
	    samplesLeft = convertBuffer(buffers[0]);
	    if (config.numChannels == 2) {
	    	samplesRight = convertBuffer(buffers[1]);
	    }
	    
	    var remaining = samplesLeft.length;
	    var maxSamples = 1152;
	    
	    for (var i = 0; remaining >= 0; i += maxSamples) {
	      	var left = samplesLeft.subarray(i, i + maxSamples);
	      	var right;
	      	if (samplesRight) {
	        	right = samplesRight.subarray(i, i + maxSamples);
	      	}
	      	var mp3buf = mp3Encoder.encodeBuffer(left, right);
	      	outputBuffer.buffer.push(new Int8Array(mp3buf));
	      	remaining -= maxSamples;
	    }
	    
	    function convertBuffer(arrayBuffer){
	    	var data;
	    	
	    	if (config.sampleRate == config.defaultSampleRate) {
		        data = new Float32Array(arrayBuffer);
		    } else {
		    	var compression = config.defaultSampleRate / config.sampleRate;
		    	var length = Math.ceil(arrayBuffer.length / compression);
		    	data = new Float32Array(length);
		    	
		    	for (var index = 0, i = 0; index < length; i += compression) {
		    		data[index++] = arrayBuffer[~~i];
		    	}
		    }
	    	
		    var out = new Int16Array(data.length);
		    floatTo16BitPCM(data, out);
		    return out;
		};
		
		function floatTo16BitPCM(input, output) {
		    for (var i = 0; i < input.length; i++) {
		      var s = Math.max(-1, Math.min(1, input[i]));
		      output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
		    }
		};
	};
	
	// 导出Wave声音
	function exportWAV(outputBuffer, config) {
		
        var buffers = [];
        for (var channel = 0; channel < config.numChannels; channel++) {
            buffers.push(mergeBuffers(outputBuffer.buffer[channel], outputBuffer.size));
        }
        
        var interleaved;
        var compressed;
        if (config.numChannels === 2) {
            interleaved = interleave(buffers[0], buffers[1]);
            compressed = compressBuffer(interleaved, config);
        } else {
            interleaved = buffers[0];
            compressed = compressBuffer(interleaved, config);
        }
        var dataview = encodeWAV(compressed, config);
        
        return dataview;
        
        function mergeBuffers(recBuffers, recLength) {
	        var result = new Float32Array(recLength);
	        var offset = 0;
	        for (var i = 0; i < recBuffers.length; i++) {
	            result.set(recBuffers[i], offset);
	            offset += recBuffers[i].length;
	        }
	        return result;
	    }
	
	    function interleave(inputL, inputR) {
	        var length = inputL.length + inputR.length;
	        var result = new Float32Array(length);
	
	        var index = 0,
	            inputIndex = 0;
	
	        while (index < length) {
	            result[index++] = inputL[inputIndex];
	            result[index++] = inputR[inputIndex];
	            inputIndex++;
	        }
	        return result;
	    }
		
		// 按采样率压缩声音
		function compressBuffer(buffer, config) {
		    if (config.sampleRate == config.defaultSampleRate) {
		        return buffer;
		    }
		    if (config.sampleRate > config.defaultSampleRate) {
		        throw "downsampling rate show be smaller than original sample rate";
		    }
		    var ratio = Math.round(config.defaultSampleRate / config.sampleRate); //计算压缩率
		    var length = Math.round(buffer.length / ratio);
		    var result = new Float32Array(length);
		    var index = 0;
		    var offset = 0;
		    while (index < length) {
		    	var next = (index + 1) * ratio * config.numChannels;
		    	var total = 0;
		    	var count = 0;
		    	for (var i = offset; i < next && i < buffer.length; i+=config.numChannels) {
		    		total += buffer[i];
		    		count ++;
		    	}
		    	result[index*config.numChannels] = total / count;
		    	if (config.numChannels == 2) {
		    		result[index*config.numChannels+1] = total / count;
		    	}
		    	index ++;
		    	offset = next;
		    }
		    return result;
		}

    }

	/*
	 * wav音频头数据
	 */
    function encodeWAV(samples, config) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);

        /* RIFF identifier */
        writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + samples.length * 2, true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, config.numChannels, true);
        /* sample rate */
        view.setUint32(24, config.sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, config.sampleRate * config.numChannels * config.bitRate / 8, true);
//      view.setUint32(28, config.sampleRate * 4, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, config.numChannels * config.bitRate / 8, true);
//      view.setUint16(32, config.numChannels * 2, true);
        /* bits per sample */
        view.setUint16(34, config.bitRate, true);
//      view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);

        floatTo16BitPCM(view, 44, samples);

        return view;
        
        function floatTo16BitPCM(output, offset, input) {
	        for (var i = 0; i < input.length; i++, offset += 2) {
	            var s = Math.max(-1, Math.min(1, input[i]));
	            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
	        }
	    }
	
	    function writeString(view, offset, string) {
	        for (var i = 0; i < string.length; i++) {
	            view.setUint8(offset + i, string.charCodeAt(i));
	        }
	    }
    }
	
	
	// 音频数据缓冲区
	var ArivocRecorderBuffer = function(config) {
		
		this.mime = "wave";
		this.buffer = [];
		this.size = 0;
		
		this.write = function(buffers) {
			this.mime == "mp3" ? this.writeMp3(buffers) : this.writeWave(buffers);
		};
		
		this.writeMp3 = function(buffers) {
			this.size += buffers[0].length;
			encodeMp3(buffers);
		};
		
		this.writeWave = function(buffers) {
			for (var channel = 0; channel < config.numChannels; channel++) {
				this.buffer[channel].push(buffers[channel]);
            }
            this.size += buffers[0].length;
		};
		
		this.init = function(mime) {
			this.mime = (mime == "mp3" || mime == "wave") ? mime : "wave";
			this.buffer = [];
			this.size = 0;
			
			if (this.mime == "mp3") {
				
			} else if (config.numChannels == 1) {
				this.buffer = [[]];
			} else {
				this.buffer = [[], []];
			}
		};
		
		this.init();
	};
	
}();
