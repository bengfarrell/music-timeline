import * as Tone from 'tone';
import { BasePlayback } from './baseplayback';
import { Sampler } from 'tone';

export class MetronomeEvent extends Event {
    static eventName = 'metronome';

    constructor( public beat: number, public measureStart: boolean) {
        super(MetronomeEvent.eventName);
    }
}

/**
 * Playback controller for MIDI playback
 * This controller is offered as a possible MIDI player, but is not
 * explicitly tied to the midi-sequence-timeline implementation
 * Users of the midi-sequence-timeline library can use this controller or use a different one for playback
 */
export class MetronomePlayback extends BasePlayback {
    protected _synth?: Tone.PolySynth | Tone.Synth | Sampler = new Tone.PolySynth(Tone.Synth).toDestination();
    protected _bpm = 120;
    protected _beatOffset: number = 0;
    protected _beatsPerMeasure = 4;

    set synth(synth: Tone.PolySynth | Tone.Sampler) {
        this._synth = synth;
    }

    set BPM(value: number) {
        this._bpm = value;
        Tone.getTransport().bpm.value = value;
    }

    set beatsPerMeasure(value: number) {
        this._beatsPerMeasure = value;
    }

    set beatOffset(value: number) {
        this._beatOffset = value;
        if (this._isPlaying) this.play(value);
    }

    get beatOffset() {
        return this._beatOffset;
    }

    play(delay: number = 0) {
        Tone.getTransport().bpm.value = this._bpm;
        let beatCount = 0;
        let initialDelay = delay;
        Tone.getTransport().scheduleRepeat((time) => {
            const beat = beatCount % this._beatsPerMeasure;
            this._synth?.triggerAttackRelease(beat === 0 ? 880 : 440, 0.1, time + initialDelay);
            this.dispatchEvent(new MetronomeEvent(beat, beat === 0));
            beatCount++;
            initialDelay = delay;
        }, "4n");
        Tone.getTransport().start();
    }

    async stop() {
        Tone.getTransport().stop();
    }
}

export const Playback = new MetronomePlayback();