import { defaultTimeMeta, TimeMeta } from './midifile.js';
import { NoteEvent } from './noteevent.js';

export function MIDITicksToSecs(ticks: number, mcspq: number, division: number) {
    return ticks * mcspq / division / 1000000;
}

export class MIDITrack {
    timeMeta: TimeMeta = Object.assign({}, defaultTimeMeta);

    uuid = crypto.randomUUID();

    events: NoteEvent[] = [];
    name: string = '';
    noteRange: [number, number] = [0, 0];
    channels: number[] = [];
    rendered: string = '';

    static clone(track: MIDITrack, fallbackName?: string) {
        const t = new MIDITrack();
        t.events = track.events.map(e => Object.assign({}, e));
        t.timeMeta = Object.assign({}, track.timeMeta);
        t.name = track.name ? track.name : fallbackName || '';
        t.noteRange = [track.noteRange[0], track.noteRange[1]];
        return t;
    }

    static isolateChannelsFromTrack(track: MIDITrack, channels: number | number[]) {
        if (!Array.isArray(channels)) {
            channels = [channels];
        }
        const clone = MIDITrack.clone(track, track.name + ' - Channel ' + channels.join(', '));
        clone.events = clone.events.slice().filter(e => e.channel && (channels as number[]).indexOf(e.channel) !== -1);
        clone.processTrack();
        return clone;
    }

    static fromMIDI(events: any[], time: TimeMeta): MIDITrack {
        const t = new MIDITrack();
        t.parseMIDI(events);
        if (time.division && !t.timeMeta.division) t.timeMeta.division = time.division;
        if (time.tempo && !t.timeMeta.tempo) t.timeMeta.tempo = time.tempo;
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

    get sequence() { return this.sequenceAtTempo(this.timeMeta.tempo, this.timeMeta.division); }

    get duration() { return (this.timeMeta.duration || 0) / this.timeMeta.tempo }

    sequenceAtTempo(tempo: number, division: number) {
        // TODO: may have a sequence of tempos, even in the first track as a data track to be applied here?
        return this.events.slice().map(e => {
            return {
                time: MIDITicksToSecs(e.time, tempo, division),
                note: e.note,
                channel: e.channel,
                duration: MIDITicksToSecs(e.duration, tempo, division),
                velocity: e.velocity } as NoteEvent; });
    }

    get timeSignature() {
        return this.timeMeta.timeSignature;
    }

    get beatRange() { return [ 0, Math.ceil(this.timeMeta.duration || 0) ]; }

    clone(fallbackName?: string) { return MIDITrack.clone(this, fallbackName); }

    isolateChannelsFromTrack(channels: number | number[]) { MIDITrack.isolateChannelsFromTrack(this, channels); }

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

    async renderTrackAsBitmap(width: number, height: number, color: string) {
        const c = new OffscreenCanvas(width, height);
        const ctx = c.getContext('2d');
        if (ctx) {
            ctx.fillStyle = color;
            this.events.forEach((e) => {
                ctx.beginPath();
                ctx.roundRect(e.time / 10,  e.note - this.noteRange[0], e.duration / 10, 2, 5);
                ctx.fill();
            });
        }
        this.rendered = URL.createObjectURL(await c.convertToBlob());
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
                    channel: event.channel,
                    velocity: event.noteOn.velocity
                };
                if (this.channels.indexOf(event.channel) === -1) {
                    this.channels.push(event.channel);
                    this.channels.sort((a, b) => a - b);
                }
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

    protected processTrack() {
        this.noteRange[0] = this.events.reduce((acc, event) => { return Math.min ((event as NoteEvent).note || acc, acc); }, Infinity);
        this.noteRange[1] = this.events.reduce((acc, event) => { return Math.max ((event as NoteEvent).note || acc, acc); }, 0) + 1;
    }
}