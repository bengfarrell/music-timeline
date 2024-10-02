import { ReactiveController, ReactiveElement } from 'lit';
import * as Tone from 'tone';
import { MIDITrack, NoteEvent } from './miditrack';
import { getNotation } from './music';

export class Playback implements ReactiveController {
    static hosts: ReactiveElement[] = [];

    static synth?: Tone.PolySynth;

    static _BPM = 120;

    static _playSessionStartTime = 0;

    static _isPlaying = false;

    static lastPlayedNoteIndex = -1;

    static _sequence: MIDITrack;
    static currTime = 0;

    constructor(host: ReactiveElement) {
        host.addController(this);
        Playback.hosts.push(host);
    }

    hostConnected() {}

    hostDisconnected() {}

    static play() {
        if (Playback._sequence) {
            Playback._isPlaying = true;
            Tone.getTransport().bpm.value = Playback.BPM;
            Tone.getTransport().start();
        }
    }

    static pause() {
        Playback._isPlaying = false;
        Tone.getTransport().pause();
    }

    static get currentTime() {
        return Tone.getTransport().seconds
    }

    static set currentTime(val: number) {
        Tone.getTransport().seconds = val;
    }

    static get currentTimeAsBeats() {
        return Tone.getTransport().seconds * Playback.BPM / 120;
    }

    play() { Playback.play(); }

    static set sequence(sequence: MIDITrack) {
        Playback._sequence = sequence;
        Playback.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const synth = Playback.synth;
        new Tone.Part(((time, value: NoteEvent) => {
            synth.triggerAttackRelease(
                getNotation(value.note),
                value.duration, time,
                value.velocity / 127);
        }), Playback._sequence.events).start(0);
    }

    static get sequence() {
        return Playback._sequence;
    }

    set sequence(sequence: MIDITrack) {
        Playback.sequence = sequence;
    }

    static set BPM(bpm: number) {
        Playback._BPM = bpm;
        Tone.getTransport().bpm.value = Playback._BPM;
        Playback.hosts.forEach(host => {
            host.requestUpdate();
        });
    }

    static get BPM() {
        return Playback._BPM;
    }

}