/**
 * Sample implementation with the Zyklus clock
 * https://github.com/felixroos/zyklus
 */

import { ReactiveController, ReactiveElement } from 'lit';
import { NoteEvent } from '../utils/noteevent';
import './zyklus';
import * as Tone from 'tone';
import { getNotation } from '../utils/music';
import { EventBus } from '../utils/eventbus';

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
export class Playback extends EventBus implements ReactiveController {
    static hosts: ReactiveElement[] = [];

    protected static playbackRate = 1;
    protected static _currentTime = 0;
    protected static _clockOffset = 0;

    protected static isPlaying = false;
    protected static isPaused = false;
    protected static isLooping = false;

    protected static _start = 0;
    protected static _end?: number;

    protected static clock?: AudioContext;
    protected static synth?: Tone.PolySynth;
    protected static _sequence: NoteEvent[] = [];
    protected static _notebuffer: NoteEvent[] = [];

    constructor(host: ReactiveElement) {
        super();
        host.addController(this);
        Playback.hosts.push(host);
    }

    hostConnected() {}

    hostDisconnected() {}

    static set sequence(_events: NoteEvent[]) {
        Playback._sequence = _events;
    }

    set sequence(_events: NoteEvent[]) {
        Playback.sequence = _events;
    }

    static get duration() {
        if (Playback._end) return Playback._end - Playback._start;
        return Math.ceil(Playback._sequence[Playback._sequence.length - 1].time + Playback._sequence[Playback._sequence.length - 1].duration) || 0;
    }

    get duration() { return Playback.duration; }

    static play() {
        if (!Playback.clock) Playback.clock = new AudioContext();
        if (!Playback.synth) Playback.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        if (Playback._notebuffer.length === 0) Playback._notebuffer = Playback._sequence.filter(e => e.time >= Playback._currentTime && e.time <= Playback._start + Playback.duration);

        if (!Playback.isPlaying && !Playback.isPaused) {
            // @ts-ignore
            Playback.clock.createClock(Playback.tick, 0.05).start();
            Playback.isPlaying = true;
            Playback.isPaused = false;
        } else if (Playback.isPaused) {
            Playback.clock?.resume();
            Playback.isPaused = false;
            Playback.isPlaying = true;
        }

        this.hosts.forEach(host => {
            host.requestUpdate();
        });
        Playback.dispatchEvent(new PlayStateChangeEvent());
    }

    play() { Playback.play(); }

    static seek(time: number) {
        Playback._notebuffer = Playback._sequence.filter(e => e.time >= time && e.time <= Playback._start + Playback.duration);
        Playback._currentTime = time;
    }

    seek(time: number) { Playback.seek(time); }

    static async pause() {
        await Playback.clock?.suspend();
        Playback.isPaused = true;
        Playback.isPlaying = false;
        this.hosts.forEach(host => host.requestUpdate());
        Playback.dispatchEvent(new PlayStateChangeEvent());
    }

    async pause() { await Playback.pause(); }

    static async stop() {
        await Playback.clock?.close();
        Playback.isPaused = false;
        Playback.isPlaying = false;
        Playback.dispatchEvent(new PlayStateChangeEvent());
    }

    static get currentTime() {
        return Playback._currentTime;
    }

    get currentTime() { return Playback.currentTime; }

    static set rate(val: number) {
        Playback.playbackRate = val;
        Playback.hosts.forEach(host => {
            host.requestUpdate();
        });
    }

    static get rate() {
        return Playback.playbackRate;
    }

    get rate() { return Playback.rate; }

    set rate(val: number) {
        Playback.playbackRate = val;
    }

    static loop(start: number, end: number) {
        Playback._end = end;
        Playback._start = start;
        Playback.isLooping = true;
        Playback.seek(start);
    }

    loop(start: number, end: number) { Playback.loop(start, end); }

    static tick(_time: number, duration: number, _tick: number) {
        const next = Playback._notebuffer[0];
        Playback._currentTime += duration * Playback.playbackRate;
        if (next && Playback._currentTime >= next.time - 0.2) {
            const event = Playback._notebuffer.shift();
            if (event) {
                const now = Tone.now();
                Playback.synth?.triggerAttackRelease(
                    getNotation(event.note),
                    event.duration, now + Math.max(0, next.time - Playback._currentTime),
                    event.velocity / 127);
            }
        }
        if (Playback._currentTime >= Playback._start + Playback.duration) {
            if (Playback.isLooping) {
                Playback.seek(Playback._start);
            } else {
                Playback.clock?.suspend();
                Playback.isPlaying = false;
            }
        }
    }

    get isPlaying() { return Playback.isPlaying; }
    get isPaused() { return Playback.isPaused; }
    get isLooping() { return Playback.isLooping; }
}