export enum Samples {
    SAMPLE_8 = 8000,
    SAMPLE_11 = 11025,
    SAMPLE_16 = 16000,
    SAMPLE_22 = 22050,
    SAMPLE_44 = 44100,
    SAMPLE_48 = 48000,
}

export enum Bits {
    BIT_8 = 8,
    BIT_16 = 16,
    BIT_32 = 32,
}

export enum Channels {
    CHANNELS_1 = 1,
    CHANNELS_2 = 2,
}

export enum Mime {
    WAVE = 'wave',
    MP3 = 'mp3'
}

export enum StatusCode {

    SUCCESS = 0,
    NOT_SUPPORT = -1,
    NOT_FOUNDED = -2,
    NOT_ALLOWED = -3,
    ERROR = -9,
    
}
export enum StatusMessage {

    SUCCESS = '打开麦克风成功',
    NOT_SUPPORT = '浏览器不支持录音功能',
    NOT_FOUNDED = '找不到麦克风',
    NOT_ALLOWED = '麦克风被禁止使用',
    ERROR = '打开麦克风出现异常',
    
}