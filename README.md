# GLRecorder
H5录音器 支持mp3 wave格式的录音

浏览器环境下使用

## npm
```
npm i glrecorder

import GLRecorder from 'glrecorder';
```

## script
```
<script type="text/javascript" src="GLRecorder.min.js"></script>
```

## 使用

### 初始化
```
let recorder = new GLRecorder({
    // 声道数 （1， 2） 默认 2
    numChannels: 2,
    // 采样率 （8000， 11025， 16000， 22050， 44100， 48000） 默认 麦克风默认采样率
    sampleRate: 16000,
    // 比特率 （8， 16， 32） 默认 16 (目前仅支持16)
    bitRate: 16,
});
```

### 属性
> data 录音数据

    recorder.data 

    { 
        blob: 录音数据Blob, 
        type: 录音格式（"audio/mp3, audio/wav"）, 
        size: 录音大小（b）, 
        duration: 录音时长（ms） 
    }

> recording 是否正在录音

    recorder.recording

    true / false

> ready 是否已经初始化

    recorder.ready

    true / false

### 方法
> init() 初始化录音器（唤起用户授权弹窗）
```
recorder.init()
    .then(code => console.log(code))
    .catch(err => console.log(err));
```

> start(mime) 开始录音

 mime 录制格式：

    'mp3' 录制MP3格式
    'wave' 录制WAVE格式（默认）
```
recorder.start('mp3')
    .then(data => console.log('开始录制MP3'))
    .catch(err => console.log(err));

recorder.start()
    .then(data => console.log('开始录制WAVE'))
    .catch(err => console.log(err));
```

> stop() 停止录音
```
recorder.stop()
    .then(data => console.log('录音数据：', data)
    .catch(err => console.log(err));
```

> clear() 清空录音数据
```
recorder.clear()
    .then(data => console.log('清空录音数据'));
    .catch(err => console.log(err));
```

> upload( url, extra ) 上传录音数据

    url 上传录音地址
    extra 上传录音额外参数
```
recorder.upload('/upload', { a: 1, b: 2, c: 3 })
    .then(res => res.json().then(data => console.log('上传成功：', data)))
    .catch(err => console.log('上传失败：', err))
```
> save() 保存录音数据
```
recorder.save()
    .then(data => console.log('保存成功：', data))
    .catch(err => console.log('保存失败：', err))
```

### 静态方法
> support() 浏览器是否支持录音功能

    GLRecorder.support();

    true / false