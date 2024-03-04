declare module 'glrecorder' {
    
    enum Mime {
        WAVE = "wave",
        MP3 = "mp3"
    }
    enum StatusCode {
        SUCCESS = 0,
        NOT_SUPPORT = -1,
        NOT_FOUNDED = -2,
        NOT_ALLOWED = -3,
        ERROR = -9
    }
    enum StatusMessage {
        SUCCESS = "\u6253\u5F00\u9EA6\u514B\u98CE\u6210\u529F",
        NOT_SUPPORT = "\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u5F55\u97F3\u529F\u80FD",
        NOT_FOUNDED = "\u627E\u4E0D\u5230\u9EA6\u514B\u98CE",
        NOT_ALLOWED = "\u9EA6\u514B\u98CE\u88AB\u7981\u6B62\u4F7F\u7528",
        ERROR = "\u6253\u5F00\u9EA6\u514B\u98CE\u51FA\u73B0\u5F02\u5E38"
    }
    type RecorderData = {
        blob: Blob | null;
        size: number;
        type: string;
        duration: number;
    };
    interface IRecorder {
        get data(): RecorderData | null;
        get ready(): boolean;
        get recording(): boolean;
        init(): Promise<IRecorderStatus>;
        start(mime: Mime): Promise<void>;
        stop(): Promise<RecorderData>;
        clear(): Promise<void>;
        upload(url: string, extra: {
            [key: string]: any;
        }): Promise<any>;
        save(name: string): Promise<any>;
    }
    interface IRecorderOption {
        bitRate?: number;
        sampleRate?: number;
        numChannels?: number;
    }
    interface IRecorderStatus {
        code: StatusCode;
        message: StatusMessage;
    }
    class GLRecorder implements IRecorder {
        
        constructor(options?: IRecorderOption);
        /**
         * 录音数据
         */
        get data(): RecorderData | null;
        /**
         * 录音器初始化状态
         */
        get ready(): boolean;
        /**
         * 录音器是否正在录制中
         */
        get recording(): boolean;
        /**
         * 初始化录音器（唤起用户授权弹窗）
         * @returns 录音器初始化状态
         */
        init(): Promise<IRecorderStatus>;
        /**
         * 开始录音
         * @param mime 录音格式 'mp3' 录制MP3格式的录音 'wave'（默认） 录制WAVE格式的录音
         * @returns
         */
        start(mime?: Mime): Promise<void>;
        /**
         * 停止录音
         * @returns 录音数据
         */
        stop(): Promise<RecorderData>;
        /**
         * 清空录音数据
         * @returns
         */
        clear(): Promise<void>;
        /**
         * 上传录音数据到指定地址
         * @param url 需要上传的接口地址
         * @param extra 附加的额外参数 { a: 1, b: 2, c: 3 }
         * @returns 接口响应数据
         */
        upload(url: string, extra: {
            [key: string]: any;
        }): Promise<any>;
        /**
         * 把录音数据保存到本地
         * @param name 要保存的文件名 默认 'audio'
         * @returns 录音缓存文件地址
         */
        save(name?: string): Promise<any>;
        /**
         * GLRecorder.support()
         * 判断浏览器是否支持录音功能
         * @returns true 支持录音 false 不支持录音
         */
        static support(): boolean;
    }

    export default GLRecorder;
}