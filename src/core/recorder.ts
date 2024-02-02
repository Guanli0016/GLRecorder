import { Mime, StatusCode, StatusMessage } from "../configs/preset-enum";
import { IRecorder, IRecorderOption, IRecorderStatus } from "../interfaces/irecorder";
import RecorderConfig from "./recorder-config";
import { root } from "../globals/root-path";

class GLRecorder implements IRecorder {

    blob: Blob | null = null;
    ready: boolean = false;
    duration: number = 0;
    recording: boolean = false;

    private context: AudioContext;
    private config: RecorderConfig;

    private worker: Worker;

    constructor( options?: IRecorderOption ) {
        this.worker = new Worker( root + "recorder-worker.js" );
        this.context = new AudioContext();
        this.config = new RecorderConfig( this.context.sampleRate, options );
    }

    init(): Promise<IRecorderStatus> {
        return new Promise<IRecorderStatus>((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(( micstream: MediaStream ) => {
                if ( this.ready ) {
                    resolve({ code: StatusCode.SUCCESS, message: StatusMessage.SUCCESS });
                }

                let inputAudio: MediaStreamAudioSourceNode = this.context.createMediaStreamSource( micstream ) as MediaStreamAudioSourceNode;
                inputAudio.connect( this.context.createGain() as GainNode );

                // let processor = this.context.createScriptProcessor.call()

            })
        });
    }
    start( mime: Mime = Mime.WAVE ): void {

    }
    stop(): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            
        });
    }
    clear(): void {

    }
    upload( url: string, params?: object ): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            
        });
    }
    save(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            
        });
    }
    
    static support(): boolean {
        return !!AudioContext;
    }
}

export default GLRecorder;