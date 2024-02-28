import { Bits, Channels, Samples } from "../defined/Preset";
import { IRecorderConfig, IRecorderOption } from "../interfaces/IRecorder";
import { enumValues } from "../utils/EnumUtils";

class RecorderConfig implements IRecorderConfig {

    private _kbps: number;
    private _bufferSize: number;
    private _sampleRate: number;
    private _bitRate: number;
    private _numChannels: number;
    private _defaultSampleRate: number;

    constructor( defaultSR: number, options?: IRecorderOption ) {

        let config = options?.config;
        
        if ( !!config?.sampleRate && !( config.sampleRate in Samples ) ) {
            throw new Error( `参数config.sampleRate的值不支持，支持的值有${ enumValues( Samples ).join(', ') }` );
        }

        if ( !!config?.bitRate && !( config.bitRate in Bits ) ) {
            throw new Error( `参数config.bitRate的值不支持，支持的值有${ enumValues( Bits ).join(', ') } (目前仅支持16)` );
        }

        if ( !!config?.numChannels && !( config.numChannels in Channels ) ) {
            throw new Error( `参数config.numChannels的值不支持，支持的值有${ enumValues( Channels ).join(', ') }` );
        }

        let defaultBitRate: number = 16;
        let defaultNumChannels: number = 2;

        this._bufferSize = 4096;
        this._defaultSampleRate = defaultSR;
        this._sampleRate = config?.sampleRate || this._defaultSampleRate;
        this._bitRate = config?.bitRate || defaultBitRate;
        this._numChannels = config?.numChannels || defaultNumChannels;

        // this._kbps = this._sampleRate * this._bitRate * this._numChannels / 1000;
        this._kbps = 128;

        console.log( 'kbps:', this._kbps );
        console.log( 'bufferSize:', this._bufferSize );
        console.log( 'sampleRate:', this._sampleRate );
        console.log( 'bitRate:', this._bitRate );
        console.log( 'numChannels:', this._numChannels );
        console.log( 'defaultSampleRate:', this._defaultSampleRate );

    }

    get kbps(): number {
        return this._kbps;
    }

    get bufferSize(): number{
        return this._bufferSize;
    }

    get sampleRate(): number{
        return this._sampleRate;
    }

    get bitRate(): number{
        return this._bitRate;
    }

    get numChannels(): number{
        return this._numChannels;
    }

    get defaultSampleRate(): number{
        return this._defaultSampleRate;
    }

}

export default RecorderConfig;