import { NoteEvent, getNotation } from '../utils';
import * as Tone from 'tone';
import { BasePlayback, PlayStateChangeEvent } from './baseplayback';
import { Sampler } from 'tone';

/**
 * Playback controller for MIDI playback
 * This controller is offered as a possible MIDI player, but is not
 * explicitly tied to the midi-sequence-timeline implementation
 * Users of the midi-sequence-timeline library can use this controller or use a different one for playback
 */
export class MIDIPlayback extends BasePlayback {
    static LOOKAHEAD = 0.2;
    protected _lastTick = 0;
    protected _currentTime = 0;
    protected _transpose = 0;

    protected _noteBuffer: NoteEvent[] = [];

    protected _synth?: Tone.PolySynth | Sampler;

    protected _data: NoteEvent[] = [];

    set data(events: NoteEvent[]) {
        this._data = events;
        this._noteBuffer = [];
    }

    set synth(synth: Tone.PolySynth | string) {
        if (typeof synth === 'string') {
            switch (synth) {
                case 'poly-synth':
                    this._synth = new Tone.PolySynth(Tone.Synth).toDestination();
                    break;
                case 'sampled-piano':
                    this._synth = new Tone.Sampler({
                        urls: {
                            C4: "C4.mp3",
                            "D#4": "Ds4.mp3",
                            "F#4": "Fs4.mp3",
                            A4: "A4.mp3",
                        },
                        release: 1,
                        baseUrl: "https://tonejs.github.io/audio/salamander/",
                    }).toDestination();
                    break;
                case 'piano':
                    this._synth = new Tone.PolySynth(Tone.FMSynth, {
                        harmonicity: 3,
                        modulationIndex: 10,
                        detune: 0,
                        oscillator: {
                            type: 'sine'
                        },
                        envelope: {
                            attack: 0.01,
                            decay: 0.2,
                            sustain: 0.2,
                            release: 0.2
                        },
                        modulation: {
                            type: 'sine'
                        },
                        modulationEnvelope: {
                            attack: 0.01,
                            decay: 0.2,
                            sustain: 0.2,
                            release: 0.2
                        }
                    }).toDestination();
                    break;
            }
        } else {
            this._synth = synth;
        }
    }

    refresh() {
        super.refresh();
        this._noteBuffer = [];
    }

    get duration() {
        if (this.isLooping && this._loopStart && this._loopEnd) return (this._loopEnd - this._loopStart);
        return Math.ceil(this._data[this._data.length - 1].time + this._data[this._data.length - 1].duration) || 0;
    }

    get currentTime() {
        return this._currentTime;
    }

    play() {
        if (!this.synth) this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        if (this._noteBuffer.length === 0) this._noteBuffer = this._data.filter(e => e.time >= this._currentTime && e.time <= (this._loopStart || 0) + this.duration);

        if (!this.isPlaying && !this.isPaused) {
            this._lastTick = Tone.now();
            requestAnimationFrame(() => this.tick());
            this._isPlaying = true;
            this._isPaused = false;
        } else if (this.isPaused) {
            this._lastTick = Tone.now();
            requestAnimationFrame(() => this.tick());
            this._isPaused = false;
            this._isPlaying = true;
        }

        this.hosts.forEach(host => {
            host.requestUpdate();
        });
        this.dispatchEvent(new PlayStateChangeEvent());
    }

    seek(time: number) {
        this._noteBuffer = this._data.filter(e => e.time >= time && e.time <= (this._loopStart || 0) + this.duration);
        this._currentTime = time;
        super.seek(time);
    }

    tick() {
        const delta = Tone.now() - this._lastTick;
        this._lastTick = Tone.now();
        const next = this._noteBuffer[0];
        this._currentTime += delta * this.playbackRate;
        if (next && this._currentTime >= next.time - MIDIPlayback.LOOKAHEAD) {
            const event = this._noteBuffer.shift();
            if (event) {
                const now = Tone.now();
                this._synth?.triggerAttackRelease(
                    getNotation(event.note + this._transpose),
                    event.duration, now + Math.max(0, next.time - this._currentTime),
                    event.velocity / 127);
            }
        }
        if (this._currentTime >= (this._loopStart || 0) + this.duration) {
            if (this.isLooping) {
                this.seek(this._loopStart || 0);
            } else {
                this._isPlaying = false;
            }
        }

        this.hosts.forEach(host => {
            host.requestUpdate();
        });

        if (this.isPlaying) {
            requestAnimationFrame(() => this.tick());
        }
    }
}

export const Playback = new MIDIPlayback();