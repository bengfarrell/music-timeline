/**
 * Trying to work with Part for Tone.js sequencing
 * This is still a work in progress, and I'll probably bail on it
 * because this isn't a solution I want to use
 *
 * But I did want to show different playback options especially
 * since playback isn't the point of this library and the component doesn't
 * force a solution
 */
import * as Tone from 'tone';
import { NoteEvent, getNotation } from '../utils';
import { Part } from 'tone';
import { BasePlayback } from './baseplayback';

export class PartPlayback extends BasePlayback {
    protected part?: Part;

    set sequence(events: NoteEvent[]) {
        this._sequence = events;
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.part = new Tone.Part((time, value) => {
            this._currentTime = this._start + this.duration * this.part!.progress;
            this.synth?.triggerAttackRelease(
                getNotation(value.note),
                value.duration, time,
                value.velocity / 127);
        }, events);
        this.part.loopStart = 0;
        this.part.loopEnd = this._end || this.duration;
        this.part.loop = 2;
    }

    get currentTime() {
        console.log(this.part!.progress)
        return this._start + this.duration * this.part!.progress;
    }

    play() {
        if (!this.isPlaying && !this.isPaused) {
            Tone.getTransport().start();
            this.part?.start();
        } else if (this.isPaused) {
            Tone.getTransport().start();
        }
    }

    seek(time: number) {
        Tone.getTransport().seconds = time;
        super.seek(time);
    }

    async pause() {
        Tone.getTransport().pause();
        await super.pause();
    }

    async stop() {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        this.part?.stop();
        this.part?.cancel();
        this.synth?.releaseAll();
    }

    set rate(val: number) {
        if (this.part) {
            this.part.playbackRate = val;
        }
        super.rate = val;
    }

   loop(start: number, end: number) {
        if (this.part) {
            this.part.loopStart = start;
            this.part.loopEnd = end;
            this.part.loop = true;
        }
        super.loop(start, end);
    }
}

export const Playback = new PartPlayback();