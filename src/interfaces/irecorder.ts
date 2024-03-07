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
    upload( url: string, extra: { [ key: string ]: any } ): Promise<any>
    save( name: string ): Promise<any>
    
}

export interface IRecorderOption {

    bitRate?: number
    sampleRate?: number
    numChannels?: number
    
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

    init( mime: Mime ): void
    write( buffers: Float32Array[] ): void
    finish(): Blob

}

