import { ReactiveController, ReactiveElement } from 'lit';
import { NoteEvent, EventEmitter } from '../utils';

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

    protected _isPlaying = false;
    protected _isPaused = false;
    protected _isLooping = false;

    protected _loopStart?: number;
    protected _loopEnd?: number;

    attachHost(host: ReactiveElement) {
        host.addController(this);
        this.hosts.push(host);
        return this;
    }

    hostConnected() {}

    hostDisconnected() {}

    set data(_events: NoteEvent[] | AudioBuffer) {}

    refresh() {}

    get duration() {
        return 0;
    }

    play() {}

    seek(_time: number) {}

    async pause() {
        this._isPaused = true;
        this._isPlaying = false;
        this.hosts.forEach(host => host.requestUpdate());
        this.dispatchEvent(new PlayStateChangeEvent());
    }

    async stop() {
        this._isPaused = false;
        this._isPlaying = false;
        this.playbackRate = 1;
        this.clearLoopRange();
        this.dispatchEvent(new PlayStateChangeEvent());
    }

    get currentTime() {
        return 0;
    }

    set rate(val: number) {
        this.playbackRate = val;
        this.hosts.forEach(host => {
            host.requestUpdate();
        });
    }

    get rate() { return this.playbackRate; }

    loop(start?: number, end?: number) {
        this._loopEnd = end;
        this._loopStart = start;
        this._isLooping = true;
        if (start !== undefined) {
            this.seek(start);
        }
    }

    clearLoopRange() {
        this._loopStart = undefined;
        this._loopEnd = undefined;
    }

    set isLooping(val: boolean) {
        this._isLooping = val;
    }

    get isPlaying() { return this._isPlaying; }
    get isPaused() { return this._isPaused; }
    get isLooping() { return this._isLooping; }
}