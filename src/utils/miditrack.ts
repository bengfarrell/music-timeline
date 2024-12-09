import { TimeMeta, TimeSignature } from './midifile.js';
import { NoteEvent } from './noteevent.js';

const defaultTimeSignature: TimeSignature = { numerator: 4, denominator: 4 };
const defaultBPM = 120;

export class MIDITrack {
    protected timeMeta: TimeMeta = {};

    uuid = crypto.randomUUID();

    events: NoteEvent[] = [];
    name: string = '';
    noteRange: [number, number] = [0, 0];

    static clone(track: MIDITrack, fallbackName?: string) {
        const t = new MIDITrack();
        t.events = track.events.map(e => Object.assign({}, e));
        t.timeMeta = Object.assign({}, track.timeMeta);
        t.name = track.name ? track.name : fallbackName || '';
        t.noteRange = [track.noteRange[0], track.noteRange[1]];
        return t;
    }

    static fromMIDI(events: any[]): MIDITrack {
        const t = new MIDITrack();
        t.parseMIDI(events);
        return t;
    }

    static fromNoteEvents(events: NoteEvent[], time: TimeMeta): MIDITrack {
        const t = new MIDITrack();
        t.events = events;
        t.timeMeta.duration = events[events.length -1].time;
        t.timeMeta.timeSignature = time.timeSignature;
        t.processTrack();
        return t;
    }

    get hasTimingInfo() {
        return this.timeMeta.tempo !== undefined || this.timeMeta.timeSignature !== undefined;
    }

    get sequence() { return this.sequenceAtBPM(this.BPM); }

    get duration() { return (this.timeMeta.duration || 0) / this.BPM }

    sequenceAtBPM(bpm: number) {
        return this.events.map(e => {
            return {
                time: e.time / bpm,
                note: e.note,
                duration: e.duration / bpm,
                velocity: e.velocity }; });
    }

    get BPM() {
        if (this.timeMeta.tempo && this.timeMeta.division) {
            return this.timeMeta.division / (this.timeMeta.tempo / 1000000);
        }
        if (this.timeMeta.division) {
            return this.timeMeta.division
        }
        return defaultBPM;
    }

    get tempo() { return this.timeMeta.tempo }


    set tempo(val) { this.timeMeta.tempo = val; }

    get timeSignature() {
        return this.timeMeta.timeSignature || defaultTimeSignature;
    }

    get beatRange() { return [ 0, Math.ceil(this.timeMeta.duration || 0) ]; }

    clone(fallbackName?: string) { return MIDITrack.clone(this, fallbackName); }

    trim(start: number, end: number) {
        this.events = this.events.filter(e => e.time >= start && e.time <= end);

        // Adjust the duration of the last event if it extends past the end
        if (this.events[this.events.length - 1].time + this.events[this.events.length - 1].duration > end) {
            this.events[this.events.length - 1].duration = end - this.events[this.events.length - 1].time;
        }

        // Adjust the time of all events to be relative to the start
        this.events.forEach((e) => e.time -= start);

        this.timeMeta.duration = this.events[this.events.length - 1].time + this.events[this.events.length - 1].duration;
        this.processTrack();
    }

    parseMIDI(events: any[]) {
        let absTime = 0;
        const downNotes: NoteEvent[] = [];
        events.forEach((event: any) => {
            if (event.trackName) {
                this.name = event.trackName;
            }
            if (event.timeSignature) {
                this.timeMeta.timeSignature = Object.assign({}, event.timeSignature);
            }
            if (event.setTempo) {
                this.timeMeta.tempo = event.setTempo.microsecondsPerQuarter;
            }
            if (event.noteOn) {
                const noteEvent = {
                    time: absTime,
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
                    noteEvent.duration = (absTime + event.delta) - noteEvent.time;
                }
            }
            absTime += event.delta;
        });
        this.timeMeta.duration = absTime;
        this.processTrack();
    }

    populateMissingTimeData(time: TimeMeta) {
        if (this.timeMeta.division === undefined) {
            this.timeMeta.division = time.division;
        }
        if (this.timeMeta.timeSignature === undefined) {
            this.timeMeta.timeSignature = Object.assign({}, time.timeSignature);
        }
        if (this.timeMeta.tempo === undefined) {
            this.timeMeta.tempo = time.tempo;
        }
    }

    protected processTrack() {
        this.noteRange[0] = this.events.reduce((acc, event) => { return Math.min ((event as NoteEvent).note || acc, acc); }, Infinity);
        this.noteRange[1] = this.events.reduce((acc, event) => { return Math.max ((event as NoteEvent).note || acc, acc); }, 0) + 1;
    }
}