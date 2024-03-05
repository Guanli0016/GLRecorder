let currentSrc: string | undefined = document.currentScript?.src;

let root: string = '';
if ( !!currentSrc ) {
    root = './';
} else {
    root = "/node_modules/glrecorder/dist/";
}

export default root;
