class RecorderEvent extends Event {

    static START: string = 'GLRecorder_start';

    constructor( type: string ) {
        super( type );
    }
}