const enumValues = ( data: any ): unknown[] => {
    return Object.values( data ).filter( ( value: any ) => typeof value === 'number' );
}

enum Samples {
    SAMPLE_8 = 8000,
    SAMPLE_11 = 11025,
    SAMPLE_16 = 16000,
    SAMPLE_22 = 22050,
    SAMPLE_44 = 44100,
    SAMPLE_48 = 48000,
}

console.log( `参数config.sampleRate的值不支持，支持的值有${ enumValues( Samples ).join(', ') }` )