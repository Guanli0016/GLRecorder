import IEncoder from "../interfaces/IEncoder";
import { IRecorderConfig } from "../interfaces/IRecorder";

class WaveEncoder implements IEncoder {

    private config: IRecorderConfig;

    constructor( config: IRecorderConfig ) {
        this.config = config;
    }

    encode( buffer: Float32Array[][], size: number ): DataView {
        let buffers: Float32Array[] = [];
        for ( let channel: number = 0; channel < this.config.numChannels; channel++ ) {
            buffers.push( this.mergeBuffers( buffer[ channel ], size ) );
        }

        let interleaved: Float32Array;

        if ( this.config.numChannels === 2 ) {
            interleaved = this.interleave( buffers[0], buffers[1] );
        } else {
            interleaved = buffers[0];
        }
        let compressed: Float32Array = this.compressBuffer( interleaved );
        let dataview: DataView = this.encodeWav( compressed );
        return dataview;
    }

    private mergeBuffers( buffer: Float32Array[], size: number ): Float32Array {
        let result = new Float32Array( size );
        let offset = 0;
        for ( let i: number = 0; i < buffer.length; i++ ) {
            result.set( buffer[ i ], offset );
            offset += buffer[ i ].length;
        }
        return result;
    }

    private interleave( inputLeft: Float32Array, inputRight: Float32Array ): Float32Array {
        let length: number = inputLeft.length + inputRight.length;
        let result: Float32Array = new Float32Array( length );

        let index = 0;
        let inputIndex = 0;

        while ( index < length ) {
            result[ index++ ] = inputLeft[ inputIndex ];
            result[ index++ ] = inputRight[ inputIndex ];
            inputIndex++;
        }
        return result;
    }

    private compressBuffer( buffer: Float32Array ): Float32Array {
        if ( this.config.sampleRate == this.config.defaultSampleRate ) {
            return buffer;
        }
        if ( this.config.sampleRate > this.config.defaultSampleRate ) {
            throw "downsampling rate show be smaller than original sample rate";
        }

        let ratio: number = Math.round( this.config.defaultSampleRate / this.config.sampleRate ); //计算压缩率
        let length: number = Math.round( buffer.length / ratio );
        let result: Float32Array = new Float32Array( length );
        let index: number = 0;
        let offset: number = 0;
        while ( index < length ) {
            let next: number = ( index + 1 ) * ratio * this.config.numChannels;
            let total: number = 0;
            let count: number = 0;
            for ( let i: number = offset; i < next && i < buffer.length; i += this.config.numChannels ) {
                total += buffer[i];
                count ++;
            }
            result[ index * this.config.numChannels ] = total / count;
            if ( this.config.numChannels === 2 ) {
                result[ index * this.config.numChannels + 1 ] = total / count;
            }
            index ++;
            offset = next;
        }
        return result;
    }

    private encodeWav( samples: Float32Array ): DataView {
        let buffer: ArrayBuffer = new ArrayBuffer( 44 + samples.length * 2 );
        let view: DataView = new DataView( buffer );

        this.writeString( view, 0, 'RIFF' );
        view.setUint32( 4, 36 + samples.length * 2, true );
        this.writeString( view, 8, 'WAVE' );
        this.writeString( view, 12, 'fmt ' );
        view.setUint32( 16, 16, true );
        view.setUint16( 20, 1, true );
        view.setUint16( 22, this.config.numChannels, true );
        view.setUint32( 24, this.config.sampleRate, true );
        view.setUint32( 28, this.config.sampleRate * this.config.numChannels * this.config.bitRate / 8, true );
        view.setUint16( 32, this.config.numChannels * this.config.bitRate / 8, true );
        view.setUint16( 34, this.config.bitRate, true );
        this.writeString( view, 36, 'data' );
        view.setUint32( 40, samples.length * 2, true );

        this.floatTo16BitPCM( view, 44, samples );

        return view;
    }

    private floatTo16BitPCM( view: DataView, offset: number, input: Float32Array ): void {
        for ( let i: number = 0; i < input.length; i++, offset += 2 ) {
            let s = Math.max( -1, Math.min( 1, input[ i ] ) );
            view.setInt16( offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true );
        }
    }

    private writeString( view: DataView, offset: number, string: string ): void {
        for ( let i: number = 0; i < string.length; i++ ) {
            view.setUint8( offset + i, string.charCodeAt( i ) );
        }
    }
}

export default WaveEncoder;