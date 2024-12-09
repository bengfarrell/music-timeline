import { ReactiveController, ReactiveElement } from 'lit';
import { NoteEvent, EventEmitter } from '../utils';
import * as Tone from 'tone';

export class PlayStateChangeEvent extends Event {
    static readonly type = 'playstatechange';
    constructor() {
        super(PlayStateChangeEvent.type);
    }
}

/**
 * Playback controller for MIDI playback
 * This controller is offered as a possible MIDI player, but is not
 * explicitly tied to the midi-sequence-timeline implementation
 * Users of the midi-sequence-timeline library can use this controller or use a different one for playback
 */
export class BasePlayback extends EventEmitter implements ReactiveController {
    protected hosts: ReactiveElement[] = [];

    protected playbackRate = 1;
    protected _currentTime = 0;

    protected _isPlaying = false;
    protected _isPaused = false;
    protected _isLooping = false;

    protected _start = 0;
    protected _end?: number;

    protected synth?: Tone.PolySynth;
    protected _sequence: NoteEvent[] = [];

    attachHost(host: ReactiveElement) {
        host.addController(this);
        this.hosts.push(host);
        return this;
    }

    hostConnected() {}

    hostDisconnected() {}

    set sequence(events: NoteEvent[]) {
        this._sequence = events;
    }

    get duration() {
        if (this._end) return this._end - this._start;
        return Math.ceil(this._sequence[this._sequence.length - 1].time + this._sequence[this._sequence.length - 1].duration) || 0;
    }

    play() {}

    seek(time: number) {
        this._currentTime = time;
    }

    async pause() {
        this._isPaused = true;
        this._isPlaying = false;
        this.hosts.forEach(host => host.requestUpdate());
        this.dispatchEvent(new PlayStateChangeEvent());
    }

    async stop() {
        this._isPaused = false;
        this._isPlaying = false;
        this.dispatchEvent(new PlayStateChangeEvent());
    }

    get currentTime() {
        return this._currentTime;
    }

    set rate(val: number) {
        this.playbackRate = val;
        this.hosts.forEach(host => {
            host.requestUpdate();
        });
    }

    get rate() { return this.playbackRate; }

    loop(start: number, end: number) {
        this._end = end;
        this._start = start;
        this._isLooping = true;
        this.seek(start);
    }

    cancelLoop() {
        this._isLooping = false;
        this._end = undefined;
        this._start = 0;
    }

    get isPlaying() { return this._isPlaying; }
    get isPaused() { return this._isPaused; }
    get isLooping() { return this._isLooping; }
}