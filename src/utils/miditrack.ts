export interface NoteEvent {
    delta?: number,
    note: number;
    channel?: number;
    velocity: number;
    duration: number;
    time: number;
}

export interface TimeSignature {
    numerator: number;
    denominator: number;
    metronome?: number;
    thirtyseconds?: number;
}

export class MIDITrack {
    events: NoteEvent[] = [];
    name: string = '';
    timeSignature?: TimeSignature;
    division: number = 0;
    duration: number = 0;
    noteRange: [number, number] = [0, 0];
    beatRange: [number, number] = [0, 0];

    get timeSignatureString(): string {
        return this.timeSignature?.numerator + '/' + this.timeSignature?.denominator;
    }

    static fromNoteEvents(events: NoteEvent[], timeSignature: TimeSignature, division: number): MIDITrack {
        const t = new MIDITrack(division);
        t.events = events;
        t.duration = events[events.length -1].time;
        t.timeSignature = timeSignature;
        t.generateMetadata();
        return t;
    }

    static fromMIDI(events: any[], division: number): MIDITrack {
        const t = new MIDITrack(division);
        t.parseMIDI(events, division);
        return t;
    }

    parseMIDI(events: any, division: number) {
        let absTime = 0;
        const downNotes: NoteEvent[] = [];
        events.forEach((event: any) => {
            if (event.trackName) {
                this.name = event.trackName;
            }
            if (event.timeSignature) {
                this.timeSignature = Object.assign({}, event.timeSignature);
            }
            if (event.noteOn) {
                const noteEvent = {
                    time: absTime / division,
                    duration: 0,
                    delta: event.delta,
                    note: event.noteOn.noteNumber,
                    channel: event.noteOn.channel,
                    velocity: event.noteOn.velocity
                };
                this.events.push(noteEvent);
                downNotes.push(noteEvent);
            }
            if (event.noteOff) {
                const indx = downNotes.findIndex((note) => note.note === event.noteOff.noteNumber);
                if (indx !== -1) {
                    const noteEvent = downNotes.splice(indx, 1)[0];
                    noteEvent.duration = (absTime + event.delta) / division - noteEvent.time;
                }
            }
            absTime += event.delta;
        });
        this.duration = absTime / division;
        this.generateMetadata();
    }

    generateMetadata() {
        this.noteRange[0] = this.events.reduce((acc, event) => { return Math.min ((event as NoteEvent).note || acc, acc); }, Infinity);
        this.noteRange[1] = this.events.reduce((acc, event) => { return Math.max ((event as NoteEvent).note || acc, acc); }, 0) + 1;
        this.beatRange[0] = 0;
        this.beatRange[1] = Math.ceil(this.duration);
    }

    constructor(division: number) {
        this.division = division;
    }
}