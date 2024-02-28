# ArivocRecorder H5录音器

> 支持mp3、wave格式的录音，可指定采样率，声道数等

> 需引入：

> **arivoc.recorder.js**

> 类名 **ArivocRecorder**

### initialize

``` bash
var recorder = new ArivocRecorder({
	sampleRate: 48000,
	numChannels: 2
});

# 初始化参数：
sampleRate: 采样率
# 可选值: 8000, 11025, 16000, 22050, 44100, 48000
# 默认值: 设备麦克风默认采样率

numChannels： 声道数
# 可选值: 1, 2
# 默认值: 2


bitRate: 比特率
# 可选值: 8, 16, 32（目前仅支持16）
# 默认值: 16
```

### methods

***initialize(callback)***
``` bash
# 初始化录音器（调出用户授权）
recorder.initialize(function(status) {
	console.log(status.code, status.message);
});

status.code 状态码
# 0: 打开麦克风成功
# -1: 浏览器不支持录音功能
# -2: 找不到麦克风
# -3: 麦克风被禁止使用
# -99: 打开麦克风出现异常

status.message 默认提示文字
```

***start(mime)***
``` bash
# 开始录音
recorder.start();

mime 录音格式
# "wave" 录音输出wave格式
# "mp3" 录音输出mp3格式
# 默认值: "wave"
```

***stop(callback)***
``` bash
# 停止录音
recorder.stop(function(blob) {
});

blob Blob格式录音数据
```

***clear()***
``` bash
# 清空录音数据
recorder.clear();
```

***getDuration()***
``` bash
# 获取录音时长
recorder.getDuration();

单位：毫秒
```

***getReady()***
``` bash
# 获取录音器是否处于可用状态
recorder.getReady();
```

***isRecording()***
``` bash
# 录音器是否正在录音
recorder.isRecording();
```

***onrecording(buffer)***
``` bash
# 录音器录音中回调 
recorder.onrecording = function(buffer) {};

buffer 录音数据
```

### static methods
***isSupport()***
``` bash
# 浏览器是否支持录音
ArivocRecorder.isSupport();
```
