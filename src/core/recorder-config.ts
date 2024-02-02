import { Bits, Channels, Samples } from "../configs/preset-enum";
import { IRecorderConfig, IRecorderOption } from "../interfaces/irecorder";

class RecorderConfig implements IRecorderConfig {

    kbps: number;
    bufferSize: number;
    sampleRate: number;
    bitRate: number;
    numChannels: number;
    defaultSampleRate: number;

    constructor( defaultSampleRate: number, options?: IRecorderOption ) {

        this.bufferSize = 4096;
        this.defaultSampleRate = defaultSampleRate;

        let defaultBitRate = 16;
        let defaultNumChannels = 2;

        if ( !!options?.sampleRate && !(options.sampleRate in Samples) ) {
            throw new Error("参数sampleRate的值不被支持，支持的值有8000, 11025, 16000, 22050, 44100, 48000");
        }

        if ( !!options?.bitRate && !(options.bitRate in Bits) ) {
            throw new Error("参数bitRate的值不被支持，支持的值有8, 16, 32 (目前仅支持16)");
        }

        if ( !!options?.numChannels && !(options.numChannels in Channels) ) {
            throw new Error("参数numChannels的值不被支持，支持的值有1, 2");
        }

        this.sampleRate = options?.sampleRate || defaultSampleRate;
        this.bitRate = options?.bitRate || defaultBitRate;
        this.numChannels = options?.numChannels || defaultNumChannels;

        this.kbps = this.sampleRate * this.bitRate * this.numChannels / 1000;

    }

}

export default RecorderConfig;