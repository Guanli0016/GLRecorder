import { Mime, StatusCode, StatusMessage } from "../defined/Preset";
import { RecorderData } from "../defined/Types";

export interface IRecorder {

    get data(): RecorderData | null
    get ready(): boolean
    get recording(): boolean

    init(): Promise<IRecorderStatus>
    start( mime: Mime ): Promise<void>
    stop(): Promise<RecorderData>
    clear(): Promise<void>
    upload(): Promise<any>
    save(): Promise<any>
    
}

export interface IRecorderOption {

    config?: {
        bitRate?: number
        sampleRate?: number
        numChannels?: number
    }

    upload?: {
        url: string
        data: () => ({ [ key: string ]: any })
        auto: boolean
    }

    skin?: {
        url: string
    }

}

export interface IRecorderConfig {

    get kbps(): number
    get bufferSize(): number
    get sampleRate(): number
    get bitRate(): number
    get numChannels(): number
    get defaultSampleRate(): number

}

export interface IRecorderStatus {

    code: StatusCode
    message: StatusMessage

}

export interface IRecorderOutputBuffer {

    get size(): number

    init( mime: Mime ): void
    write( buffers: Float32Array[] ): void
    finish(): Blob

}
