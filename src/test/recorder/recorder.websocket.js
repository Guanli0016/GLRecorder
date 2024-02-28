var ws; //= new WebSocket("ws://asr.kouyu100.com");


function initWebSocket() {
	ws = new WebSocket("wss://asr.kouyu100.com");
	ws.onopen = function() {};
	ws.onclose = function() {};
	ws.onmessage = function(evt) {
		var received_msg = evt.data;
		var text = resultHandle(received_msg);
		console.log(text);
		hideRecordPopup();
		appendRecordText(text);

		initWebSocket();
		clearTimeout(uploadTimeout);
	};

	ws.onerror = function(evt) {
		showRecordPopup("faile");
	}

}

function uploadWavFileWS(file) {
	//读取文件　　
	var reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onload = function loaded(evt) {
		var binaryString = evt.target.result;
		// Handle UTF-16 file dump
		console.log(binaryString);
		ws.send(binaryString);
		ws.send("{\"eof\" : 1}");
	}
}


function resultHandle(msg) {
	console.log(msg);
	var text = '';
	msg = eval('(' + msg + ')');
	if (msg.result != undefined) {
		var msgArray = msg.result;
		for (var i = 0; i < msgArray.length; i++) {
			var info = msgArray[i];
			var conf = info.conf;
			if (conf >= 0.2) {
				//能量值大于等于0.3才使用，否则答题录音里面的杂音给识别成一些无用的词
				var text_tmp = info.word.trim().toLowerCase();
				text += text_tmp + " ";
			}
		}
	}
	return text;
}
