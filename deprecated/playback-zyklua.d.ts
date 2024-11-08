/**
 * Sample implementation with the Zyklus clock
 * https://github.com/felixroos/zyklus
 */
import { ReactiveController, ReactiveElement } from 'lit';
import { NoteEvent } from '../utils/noteevent';
import './zyklus';
import * as Tone from 'tone';
import { EventBus } from '../utils/eventbus';
export declare class PlayStateChangeEvent extends Event {
    static readonly type = "playstatechange";
    constructor();
}
/**
 * Playback controller for MIDI playback
 * This controller is offered as a possible MIDI player, but is not
 * explicitly tied to the midi-sequence-timeline implementation
 * Users of the midi-sequence-timeline library can use this controller or use a different one for playback
 */
export declare class Playback extends EventBus implements ReactiveController {
    static hosts: ReactiveElement[];
    protected static playbackRate: number;
    protected static _currentTime: number;
    protected static _clockOffset: number;
    protected static isPlaying: boolean;
    protected static isPaused: boolean;
    protected static isLooping: boolean;
    protected static _start: number;
    protected static _end?: number;
    protected static clock?: AudioContext;
    protected static synth?: Tone.PolySynth;
    protected static _sequence: NoteEvent[];
    protected static _notebuffer: NoteEvent[];
    constructor(host: ReactiveElement);
    hostConnected(): void;
    hostDisconnected(): void;
    static set sequence(_events: NoteEvent[]);
    set sequence(_events: NoteEvent[]);
    static get duration(): number;
    get duration(): number;
    static play(): void;
    play(): void;
    static seek(time: number): void;
    seek(time: number): void;
    static pause(): Promise<void>;
    pause(): Promise<void>;
    static stop(): Promise<void>;
    static get currentTime(): number;
    get currentTime(): number;
    static set rate(val: number);
    static get rate(): number;
    get rate(): number;
    set rate(val: number);
    static loop(start: number, end: number): void;
    loop(start: number, end: number): void;
    static tick(_time: number, duration: number, _tick: number): void;
    get isPlaying(): boolean;
    get isPaused(): boolean;
    get isLooping(): boolean;
}
//# sourceMappingURL=playback-zyklua.d.ts.map