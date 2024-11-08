const defaultTimeSignature = { numerator: 4, denominator: 4 };
const defaultBPM = 120;
export class MIDITrack {
    constructor() {
        this.timeMeta = {};
        this.events = [];
        this.name = '';
        this.noteRange = [0, 0];
    }
    static fromMIDI(events) {
        const t = new MIDITrack();
        t.parseMIDI(events);
        return t;
    }
    static fromNoteEvents(events, time) {
        const t = new MIDITrack();
        t.events = events;
        t.timeMeta.duration = events[events.length - 1].time;
        t.timeMeta.timeSignature = time.timeSignature;
        t.processTrack();
        return t;
    }
    get hasTimingInfo() {
        return this.timeMeta.tempo !== undefined || this.timeMeta.timeSignature !== undefined;
    }
    get sequence() { return this.sequenceAtBPM(this.BPM); }
    get duration() { return (this.timeMeta.duration || 0) / this.BPM; }
    sequenceAtBPM(bpm) {
        return this.events.map(e => {
            return {
                time: e.time / bpm,
                note: e.note,
                duration: e.duration / bpm,
                velocity: e.velocity
            };
        });
    }
    get BPM() {
        if (this.timeMeta.tempo && this.timeMeta.division) {
            return this.timeMeta.division / (this.timeMeta.tempo / 1000000);
        }
        if (this.timeMeta.division) {
            return this.timeMeta.division;
        }
        return defaultBPM;
    }
    get tempo() { return this.timeMeta.tempo; }
    set tempo(val) { this.timeMeta.tempo = val; }
    get timeSignature() {
        return this.timeMeta.timeSignature || defaultTimeSignature;
    }
    get beatRange() { return [0, Math.ceil(this.timeMeta.duration || 0)]; }
    parseMIDI(events) {
        let absTime = 0;
        const downNotes = [];
        events.forEach((event) => {
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
    populateMissingTimeData(time) {
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
    processTrack() {
        this.noteRange[0] = this.events.reduce((acc, event) => { return Math.min(event.note || acc, acc); }, Infinity);
        this.noteRange[1] = this.events.reduce((acc, event) => { return Math.max(event.note || acc, acc); }, 0) + 1;
    }
}
//# sourceMappingURL=miditrack.js.map