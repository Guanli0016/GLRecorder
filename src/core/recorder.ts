import { Mime, StatusCode, StatusMessage } from "../defined/Preset";
import { IRecorder, IRecorderConfig, IRecorderOption, IRecorderStatus } from "../interfaces/IRecorder";
import RecorderConfig from "./Config";
import { root } from "../globals/Root";
import { RecorderData } from "../defined/Types";

class GLRecorder implements IRecorder {

    private _data: RecorderData | null = null;
    private _ready: boolean = false;
    private _recording: boolean = false;

    private options: IRecorderOption | undefined;
    private context: AudioContext;
    private config: IRecorderConfig;
    private worker: Worker;

    private startTime: number = 0;
    private endTime: number = 0;

    constructor( options?: IRecorderOption ) {
        this.options = options;
        this.worker = new Worker( root + "recorder-worker.js" );
        this.context = new AudioContext();
        this.config = new RecorderConfig( this.context.sampleRate, options );
    }

    get data(): RecorderData | null {
        return this._data;
    }

    get ready(): boolean {
        return this._ready;
    }

    get recording(): boolean {
        return this._recording;
    }

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

                let inputAudio: MediaStreamAudioSourceNode = this.context.createMediaStreamSource( micstream );

                let volume: GainNode = this.context.createGain();
                inputAudio.connect( volume );

                let processor: ScriptProcessorNode = this.context.createScriptProcessor( this.config.bufferSize, this.config.numChannels, this.config.numChannels );
                inputAudio.connect( processor );

                processor.addEventListener( 'audioprocess', ( evt: AudioProcessingEvent ) => {
                    this.onAudioProcess( evt );
                });
                
                processor.connect( this.context.destination );

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

    start( mime: Mime = Mime.WAVE ): Promise<void> {

        return new Promise<void>(( resolve, reject ) => {

            if ( this._recording ) {
                return;
            }

            if ( !this._ready ) {
                reject( 'GLRecorder未初始化，请先调用GLRecorder.init()' );
                return;
            }

            this.startTime = Date.now();
            this.worker.postMessage({ cmd: 'start', mime: mime });
            this._recording = true;

            resolve();

        })

    }
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
                        duration: this.endTime - this.startTime
                    };
                    resolve( this._data );
                }

            });
            this.worker.postMessage({ cmd: 'stop' });
            this.endTime = Date.now();

        });

    }
    clear(): Promise<void> {

        return new Promise<void>(( resolve ) => {

            this._data = null;
            this.startTime = 0;
            this.endTime = 0;
            resolve();

        });

    }
    upload(): Promise<any> {
        return new Promise<any>(( resolve, reject ) => {
            
        });
    }
    save(): Promise<any> {
        return new Promise<any>(( resolve, reject ) => {
            
        });
    }
    
    static support(): boolean {
        return !!AudioContext;
    }

    private onAudioProcess( evt: AudioProcessingEvent ) {
        if ( !this._recording ) return;
        var channelDatas: Float32Array[] = [];
        for ( let channel = 0; channel < this.config.numChannels; channel++ ) {
            let buffer: Float32Array = evt.inputBuffer.getChannelData( channel );
            channelDatas.push( buffer );
        }
        this.worker.postMessage({ cmd: "encode", datas: channelDatas });
    }
}

export default GLRecorder;