import { Mime } from "../configs/preset-enum";
import Mp3Encoder from "../encoder/mp3-encoder";
import WaveEncoder from "../encoder/wave-encoder";
import IEncoder from "../interfaces/iencoder";
import { IRecorderConfig } from "../interfaces/irecorder";

(function() {

    importScripts('./lame.min.js');

    self.addEventListener( 'message', ( evt: MessageEvent ) => {
        switch ( evt.data.cmd ) {
            case 'init':
                init( evt.data.config );
                break;
            case 'start':
                start( evt.data.mime );
                break;
            case 'encode':
                encode( evt.data.datas );
                break;
            case 'stop':
                stop();
                break;
            default:
                break;
        }
    });

    let config: IRecorderConfig;
    let lame: any;
    let outputBuffer: OutputBuffer;

    type OTBuffer = Int8Array[];

    function init( _config: IRecorderConfig ) {
        config = _config;
        lame = new lamejs.Mp3Encoder( config.numChannels, config.sampleRate, config.kbps );
        outputBuffer = new OutputBuffer( lame, config );
    }

    function start( mime: Mime = Mime.WAVE ): void {
        outputBuffer.init( mime );
    }

    function encode( datas: any ): void {
        outputBuffer.write( datas );
    }

    function stop(): void {
        let audioBlob: Blob;
        if ( outputBuffer.mime == Mime.MP3 ) {
            outputBuffer.buffer.push( new Int8Array( lame.flush() ) );
            audioBlob = new Blob( outputBuffer.buffer, { type: 'audio/mp3' } );
        } else {
            audioBlob = new Blob( outputBuffer.buffer, { type: 'audio/mp3' } );
        }
        self.postMessage( { cmd: 'finished', blob: audioBlob } );
    }
    
    class OutputBuffer {

        mime: Mime = Mime.WAVE;
        buffer: OTBuffer = [];
        size: number = 0;
        lame: any;
        config: IRecorderConfig;
        encoder?: IEncoder;

        constructor( lame: any, config: IRecorderConfig ) {
            this.lame = lame;
            this.config = config;
        }

        init( mime: Mime = Mime.WAVE ): void {

            this.mime = mime;
            this.encoder = this.createEncoder( mime );
            this.buffer = [];
            this.size = 0;

            if ( mime === Mime.MP3 ) return;

            // for ( let i: number = 0; i < this.config.numChannels; i++ ) {
            //     this.buffer.push([]);
            // }

        }

        write( buffers: number[][] ): void {
            this.size += buffers[ 0 ].length;
            this.encoder?.encode( buffers );
        }

        private createEncoder( mime: Mime = Mime.WAVE ): IEncoder {
            if ( mime === Mime.MP3) {
                return new Mp3Encoder( this.lame, this.buffer, this.config );
            } else {
                return new WaveEncoder();
            }
        }
    }

})();
