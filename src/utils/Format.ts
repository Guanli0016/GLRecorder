export const appendToFormData = ( formdata: FormData, obj: {[ key: string ]: any} ) => {
    if ( !obj ) return;
    Object.keys( obj ).forEach(( key: string ) => {
        formdata.append( key, obj[ key ] );
    });
}