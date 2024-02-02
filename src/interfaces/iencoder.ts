interface IEncoder {
    write( buffers: number[][] ): void;
    encode( buffers: number[][] ): void;
}

export default IEncoder;