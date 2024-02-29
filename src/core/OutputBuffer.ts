import { Mime } from "../defined/Preset";
import Mp3Encoder from "../encoder/MP3Encoder";
import WaveEncoder from "../encoder/WaveEncoder";
import IEncoder from "../interfaces/IEncoder";
import { IRecorderConfig, IRecorderOutputBuffer } from "../interfaces/IRecorder";

class OutputBuffer implements IRecorderOutputBuffer {

    private size: number = 0;
    private mime: Mime = Mime.WAVE;
    private buffer: any;
    private lame: lamejs.Mp3Encoder;
    private config: IRecorderConfig;
    private encoder?: IEncoder;

    constructor( lame: lamejs.Mp3Encoder, config: IRecorderConfig ) {
        this.lame = lame;
        this.config = config;
    }

    init( mime: Mime = Mime.WAVE ): void {
        this.size = 0;
        this.mime = mime;
        this.buffer = this.createBuffer( this.mime );
        this.encoder = this.createEncoder( this.mime );
    }

    write( buffers: Float32Array[] ): void {
        this.mime === Mime.MP3 
        ? this.writeMp3( buffers ) 
        : this.writeWave( buffers );
    }

    finish(): Blob {
        if ( this.mime === Mime.MP3 ) {
            this.buffer.push( new Int8Array( this.lame.flush() ) );
            return new Blob( this.buffer, { type: 'audio/mp3' } );
        } else {
            let view: DataView = this.encoder?.encode( this.buffer, this.size );
            return new Blob( [ view ], { type: 'audio/wav' } );
        }
    }

    private writeMp3( buffers: Float32Array[] ): void {
        this.encoder?.encode( this.buffer, buffers );
    }

    private writeWave( buffers: Float32Array[] ): void {
        for ( let channel = 0; channel < this.config.numChannels; channel++ ) {
            this.buffer[ channel ].push( buffers[ channel ] );
        }
        this.size += buffers[ 0 ].length;
    }

    private createEncoder( mime: Mime = Mime.WAVE ): IEncoder {
        if ( mime === Mime.MP3 ) {
            return new Mp3Encoder( this.lame, this.config );
        } else {
            return new WaveEncoder( this.config );
        }
    }

    private createBuffer( mime: Mime = Mime.WAVE ): any {
        if ( mime === Mime.MP3 ) {
            let buffers: Float32Array[] = new Array<Float32Array>();
            return buffers;
        } else {
            let buffers: Float32Array[][] = new Array<Float32Array[]>( this.config.numChannels );
            for ( let channel: number = 0; channel < this.config.numChannels; channel++ ) {
                let buffer: Float32Array[] = new Array<Float32Array>();
                buffers[ channel ] = buffer;
            }
            return buffers;
        }
    }
}

export default OutputBuffer;