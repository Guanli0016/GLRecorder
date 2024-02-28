export const enumValues = ( data: any ): unknown[] => {
    return Object.values( data ).filter( ( value: any ) => typeof value === 'number' );
}