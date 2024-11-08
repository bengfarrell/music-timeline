/**
 * Trying to work with Part for Tone.js sequencing
 */
import { ReactiveController, ReactiveElement } from 'lit';
import * as Tone from 'tone';
import { NoteEvent } from '../utils/noteevent';
import { Part } from 'tone';
export declare class PlaybackToneSeq implements ReactiveController {
    static hosts: ReactiveElement[];
    protected static synth?: Tone.PolySynth;
    protected static playbackRate: number;
    protected static duration: number;
    protected static loopStart?: number;
    protected static loopEnd?: number;
    protected static part?: Part;
    protected static isPlaying: boolean;
    protected static isPaused: boolean;
    constructor(host: ReactiveElement);
    hostConnected(): void;
    hostDisconnected(): void;
    static set sequence(events: NoteEvent[]);
    static play(): void;
    play(): void;
    static seek(time: number): void;
    seek(time: number): void;
    static pause(): void;
    pause(): void;
    static stop(): void;
    static get currentTime(): number;
    static set rate(val: number);
    static get rate(): number;
    get rate(): number;
    set rate(val: number);
    static loop(start: number, end: number): void;
    loop(start: number, end: number): void;
}
//# sourceMappingURL=playback-tone-seq.d.ts.map