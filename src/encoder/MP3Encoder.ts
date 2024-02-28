import IEncoder from "../interfaces/IEncoder";
import { IRecorderConfig } from "../interfaces/IRecorder";

class Mp3Encoder implements IEncoder {

    private lame: lamejs.Mp3Encoder;
    private config: IRecorderConfig;

    constructor( lame: lamejs.Mp3Encoder, config: IRecorderConfig ) {
        this.lame = lame;
        this.config = config;
    }
 
    encode( target: any, buffers: Float32Array[] ): void {

        let samplesLeft: Int16Array, samplesRight: Int16Array | null = null;

        samplesLeft = this.convertBuffer( buffers[0] );
        if ( this.config.numChannels === 2 ) {
            samplesRight = this.convertBuffer( buffers[1] );
        }

        let remaining: number = samplesLeft.length;
        let max: number = 1152;

        for ( let i: number = 0; remaining >= 0; i += max ) {
            let left: Int16Array = samplesLeft.subarray( i, i + max );
            let right: Int16Array | null = null;
            if ( !!samplesRight ) {
                right = samplesRight.subarray( i, i + max );
            }
            let mp3buf: any = this.lame.encodeBuffer( left, right );
            target.push( new Int8Array( mp3buf ) );
            remaining -= max;
        }

    }

    private convertBuffer( buffer: Float32Array ): Int16Array {

        let data: Float32Array;

        if ( this.config.sampleRate === this.config.defaultSampleRate ) {
            data = new Float32Array( buffer );
        } else {
            let compression = this.config.defaultSampleRate / this.config.sampleRate;
            let length = Math.ceil( buffer.length / compression );
            data = new Float32Array( length );

            for ( let index: number = 0, i = 0; index < length; i += compression ) {
                data[ index++ ] = buffer[ ~~i ];
            }

        }

        return this.floatTo16BitPCM( data );
    }

    private floatTo16BitPCM( input: Float32Array ): Int16Array {
        let output: Int16Array = new Int16Array( input.length );
        for ( let i: number = 0; i < input.length; i++ ) {
            let s: number = Math.max( -1, Math.min( 1, input[i] ) );
            output[i] = ( s < 0 ? s * 0x8000 : s * 0x7FFF );
        }
        return output;
    }
}

export default Mp3Encoder;