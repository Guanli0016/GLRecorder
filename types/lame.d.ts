declare namespace lamejs {
    export class Mp3Encoder {
        constructor( numChannel: number, sampleRate: number, kbps: number )
        flush(): any;
        encodeBuffer( left: Int16Array, right: Int16Array | null ): any;
    }
}