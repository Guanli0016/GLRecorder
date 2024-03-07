let currentSrc: string | undefined = document.currentScript?.src;

let root: string = '';
if ( !!currentSrc ) {
    root = currentSrc.substring( 0, currentSrc.lastIndexOf( '/' ) + 1 );
} else {
    root = "/node_modules/glrecorder/dist/";
}

export default root;
