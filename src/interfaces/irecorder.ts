import { Mime, StatusCode, StatusMessage } from "../configs/preset-enum";

export interface IRecorder {

    blob: Blob | null;
    ready: boolean;
    duration: number;
    recording: boolean;

    init(): Promise<IRecorderStatus>;
    start( mime: Mime ): void;
    stop(): Promise<Blob>;
    clear(): void;
    upload( url: string, params?: object ): Promise<any>;
    save(): Promise<any>;

}

export interface IRecorderOption {
    bitRate?: number;
    sampleRate?: number;
    numChannels?: number;
}

export interface IRecorderConfig {
    kbps: number;
    bufferSize: number;
    sampleRate: number;
    bitRate: number;
    numChannels: number;
    defaultSampleRate: number;
}

export interface IRecorderStatus {
    code: StatusCode;
    message: StatusMessage;
}