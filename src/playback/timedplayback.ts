import { NoteEvent, getNotation } from '../utils';
import * as Tone from 'tone';
import { BasePlayback, PlayStateChangeEvent } from './baseplayback';

/**
 * Playback controller for MIDI playback
 * This controller is offered as a possible MIDI player, but is not
 * explicitly tied to the midi-sequence-timeline implementation
 * Users of the midi-sequence-timeline library can use this controller or use a different one for playback
 */
export class TimedPlayback extends BasePlayback {
    static LOOKAHEAD = 0.2;

    protected clock?: AudioContext;

    protected _lastTick = 0;
    protected _noteBuffer: NoteEvent[] = [];

    play() {
        if (!this.clock) this.clock = new AudioContext();
        if (!this.synth) this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        if (this._noteBuffer.length === 0) this._noteBuffer = this._sequence.filter(e => e.time >= this._currentTime && e.time <= this._start + this.duration);

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
        this._noteBuffer = this._sequence.filter(e => e.time >= time && e.time <= this._start + this.duration);
        super.seek(time);
    }

    async pause() {
        await super.pause();
        await this.clock?.suspend();
    }

    async stop() {
        await this.clock?.close();
        await super.stop();
    }

    tick() {
        const delta = Tone.now() - this._lastTick;
        this._lastTick = Tone.now();
        const next = this._noteBuffer[0];
        this._currentTime += delta * this.playbackRate;
        if (next && this._currentTime >= next.time - TimedPlayback.LOOKAHEAD) {
            const event = this._noteBuffer.shift();
            if (event) {
                const now = Tone.now();
                this.synth?.triggerAttackRelease(
                    getNotation(event.note),
                    event.duration, now + Math.max(0, next.time - this._currentTime),
                    event.velocity / 127);
            }
        }
        if (this._currentTime >= this._start + this.duration) {
            if (this.isLooping) {
                this.seek(this._start);
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

export const Playback = new TimedPlayback();