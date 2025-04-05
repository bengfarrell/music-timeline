import { NoteEvent } from '../utils';

export class RangeSelectEvent extends Event {
    static type = 'rangeselect';

    constructor(public range: [number, number] | undefined, public beatsPerSecond: number , eventInitDict?: EventInit) {
        super(RangeSelectEvent.type, eventInitDict);
    }

    get rangeAsMeasures() {
        if (this.range && this.beatsPerSecond) {
            return [this.range[0] / this.beatsPerSecond, this.range[1] / this.beatsPerSecond];
        }
        return undefined;
    }
}

export class TimelineEvent extends Event {
    static NOTE_HOVER = 'notehover';
    static SEEK = 'seek';

    public time: number;
    public note?: NoteEvent;

    constructor(type: string, args: { time: number, note?: NoteEvent }, eventInitDict?: EventInit) {
        super(type, eventInitDict);
        this.time = args.time;
    }
}
