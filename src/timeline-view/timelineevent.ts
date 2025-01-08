import { NoteEvent } from '../utils';

export class TimelineEvent extends Event {
    static NOTE_HOVER = 'notehover';
    static SEEK = 'seek';
    static RANGE_SELECT = 'rangeselect';

    public time: number;
    public note?: NoteEvent;
    public range?: [number, number];

    constructor(type: string, args: { time: number, note?: NoteEvent, range?: [number, number] }, eventInitDict?: EventInit) {
        super(type, eventInitDict);
        this.time = args.time;
        this.range = args.range;
    }
}
