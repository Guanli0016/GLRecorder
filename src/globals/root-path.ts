let currentSrc: string | undefined = document.currentScript?.src;

export let root = currentSrc?.substring( 0, currentSrc.lastIndexOf( '/' ) + 1 );