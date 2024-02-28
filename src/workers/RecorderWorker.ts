import OutputBuffer from "../core/OutputBuffer";
import { Mime } from "../defined/Preset";
import { IRecorderConfig, IRecorderOutputBuffer } from "../interfaces/IRecorder";

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
    let lame: lamejs.Mp3Encoder;
    let outputBuffer: IRecorderOutputBuffer;

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
        let audioBlob: Blob = outputBuffer.finish();
        self.postMessage( { cmd: 'finished', blob: audioBlob } );
    }

})();
