import { Mime, StatusCode, StatusMessage } from "../defined/Preset";
import { IRecorder, IRecorderConfig, IRecorderOption, IRecorderStatus } from "../interfaces/IRecorder";
import RecorderConfig from "./Config";
import root from "../globals/Root";
import { RecorderData } from "../defined/Types";
import { appendToFormData } from "../utils/Format";

class GLRecorder implements IRecorder {

    private _data: RecorderData | null = null;
    private _ready: boolean = false;
    private _recording: boolean = false;

    private options: IRecorderOption | undefined;
    private context?: AudioContext;
    private config?: IRecorderConfig;
    private worker: Worker;

    private startTime: number = 0;
    private endTime: number = 0;

    private inputAudio?: MediaStreamAudioSourceNode;
    private processor?: ScriptProcessorNode;

    constructor( options?: IRecorderOption ) {
        this.options = options;
        this.worker = new Worker( root + "recorder-worker.js" );
    }

    /**
     * 录音数据
     */
    get data(): RecorderData | null {
        return this._data;
    }

    /**
     * 录音器初始化状态
     */
    get ready(): boolean {
        return this._ready;
    }

    /**
     * 录音器是否正在录制中
     */
    get recording(): boolean {
        return this._recording;
    }

    /**
     * 初始化录音器（唤起用户授权弹窗）
     * @returns 录音器初始化状态
     */
    init(): Promise<IRecorderStatus> {

        return new Promise<IRecorderStatus>(( resolve, reject ) => {

            if ( !GLRecorder.support() ) {
                reject({ code: StatusCode.NOT_SUPPORT, message: StatusMessage.NOT_SUPPORT });
                return;
            }

            this.context = new AudioContext();
            this.config = new RecorderConfig( this.context.sampleRate, this.options );

            navigator.mediaDevices.getUserMedia({ audio: true }).then(( micstream: MediaStream ) => {

                if ( this.ready ) {
                    resolve({ code: StatusCode.SUCCESS, message: StatusMessage.SUCCESS });
                    return;
                }

                this.inputAudio = this.context?.createMediaStreamSource( micstream );

                let volume: GainNode | undefined = this.context?.createGain();
                this.inputAudio?.connect( volume as GainNode );

                this.processor = this.context?.createScriptProcessor( this.config?.bufferSize, this.config?.numChannels, this.config?.numChannels );
                this.inputAudio?.connect( this.processor as ScriptProcessorNode );

                this.processor?.addEventListener( 'audioprocess', ( evt: AudioProcessingEvent ) => {
                    this.onAudioProcess( evt );
                });
                
                this._ready = true;

                this.worker.postMessage({ cmd: 'init', config: this.config });

                resolve({ code: StatusCode.SUCCESS, message: StatusMessage.SUCCESS })

            }).catch(( error: any ) => {

                switch( error.name || error.code ) {
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
    start( mime: Mime = Mime.WAVE ): Promise<void> {

        return new Promise<void>(( resolve, reject ) => {

            if ( this._recording ) {
                return;
            }

            if ( !this._ready ) {
                reject( 'GLRecorder未初始化，请先调用GLRecorder.init()' );
                return;
            }
            
            this.processor?.connect(( this.context as AudioContext ).destination );

            this.startTime = Date.now();
            this.worker.postMessage({ cmd: 'start', mime: mime });
            this._recording = true;

            resolve();

        })

    }

    /**
     * 停止录音
     * @returns 录音数据
     */
    stop(): Promise<RecorderData> {

        return new Promise<RecorderData>(( resolve ) => {

            if ( !this._recording ) {
                return;
            }

            this._recording = false;
            this.worker.addEventListener( 'message', ( evt: MessageEvent ) => {

                if ( evt.data.cmd === 'finished' ) {
                    this._data = {
                        blob: evt.data.blob,
                        size: evt.data.blob.size,
                        type: evt.data.blob.type,
                        duration: this.endTime - this.startTime
                    };
                    resolve( this._data );
                }

            });
            this.worker.postMessage({ cmd: 'stop' });
            this.endTime = Date.now();
            this.processor?.disconnect();

        });

    }

    /**
     * 清空录音数据
     * @returns 
     */
    clear(): Promise<void> {

        return new Promise<void>(( resolve, reject ) => {

            if ( this._recording ) {
                reject( '正在录音中，不能执行此操作' );
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
    upload( url: string, extra: { [ key: string ]: any } ): Promise<any> {
        return new Promise<any>(( resolve, reject ) => {

            if ( !this._data || !this._data.blob ) {
                reject( '目标文件不存在，请先录音' );
                return;
            }

            let formdata: FormData = new FormData();
            formdata.append( 'file', this._data.blob as Blob );

            appendToFormData( formdata, extra );

            fetch( url, {
                method: "POST",
                body: formdata
            })
            .then(( response: Response ) => response )
            .then(( data: any ) => resolve( data ))
            .catch(( error: any ) => reject( error ));
        });
    }

    /**
     * 把录音数据保存到本地
     * @param name 要保存的文件名 默认 'audio'
     * @returns 录音缓存文件地址
     */
    save( name: string = 'audio' ): Promise<any> {
        return new Promise<any>(( resolve, reject ) => {
            if ( !this._data || !this._data.blob ) {
                reject( '没有可保存的录音' );
                return;
            }
            
            let url = URL.createObjectURL( this._data.blob );
            let a = document.createElement( 'a' );
            a.href = url;
            a.download = this._data.blob.type.replace( /audio\//, name + '.' );
            a.click();
            resolve( url );
        });
    }
    
    /**
     * GLRecorder.support()
     * 判断浏览器是否支持录音功能
     * @returns true 支持录音 false 不支持录音
     */
    static support(): boolean {
        return !!AudioContext;
    }

    private onAudioProcess( evt: AudioProcessingEvent ) {
        var channelDatas: Float32Array[] = [];
        for ( let channel = 0; channel < ( this.config as IRecorderConfig ).numChannels; channel++ ) {
            let buffer: Float32Array = evt.inputBuffer.getChannelData( channel );
            channelDatas.push( buffer );
        }
        this.worker.postMessage({ cmd: "encode", datas: channelDatas });
    }
}

export default GLRecorder;