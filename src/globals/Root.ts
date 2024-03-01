let currentSrc: string | undefined = document.currentScript?.src;

let root: string = '';
if ( !currentSrc ) {
    root = './';
} else {
    root = currentSrc?.substring( 0, currentSrc.lastIndexOf( '/' ) + 1 );
}

export default root;
