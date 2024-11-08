/**
 * Trying to work with Part for Tone.js sequencing
 */
import * as Tone from 'tone';
import { getNotation } from '../utils/music';
export class PlaybackToneSeq {
    constructor(host) {
        host.addController(this);
        PlaybackToneSeq.hosts.push(host);
    }
    hostConnected() { }
    hostDisconnected() { }
    static set sequence(events) {
        PlaybackToneSeq.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        PlaybackToneSeq.part = new Tone.Part((time, value) => {
            PlaybackToneSeq.synth?.triggerAttackRelease(getNotation(value.note), value.duration, time, value.velocity / 127);
        }, events);
        PlaybackToneSeq.duration = events[events.length - 1].time + events[events.length - 1].duration;
        PlaybackToneSeq.part.loop = true;
        PlaybackToneSeq.part.loopStart = PlaybackToneSeq.loopStart ? PlaybackToneSeq.loopStart : 0;
        PlaybackToneSeq.part.loopEnd = PlaybackToneSeq.loopEnd ? PlaybackToneSeq.loopEnd : PlaybackToneSeq.duration;
    }
    static play() {
        if (!PlaybackToneSeq.isPlaying && !PlaybackToneSeq.isPaused) {
            Tone.getTransport().start();
            PlaybackToneSeq.part?.start();
            PlaybackToneSeq.isPlaying = true;
            PlaybackToneSeq.isPaused = false;
        }
        else if (PlaybackToneSeq.isPaused) {
            Tone.getTransport().start();
            PlaybackToneSeq.isPaused = false;
            PlaybackToneSeq.isPlaying = true;
        }
    }
    play() { PlaybackToneSeq.play(); }
    static seek(time) {
        Tone.getTransport().seconds = time;
    }
    seek(time) { PlaybackToneSeq.seek(time); }
    static pause() {
        Tone.getTransport().pause();
        PlaybackToneSeq.isPaused = true;
        PlaybackToneSeq.isPlaying = false;
    }
    pause() { PlaybackToneSeq.pause(); }
    static stop() {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        PlaybackToneSeq.part?.stop();
        PlaybackToneSeq.part?.cancel();
        PlaybackToneSeq.synth?.releaseAll();
    }
    static get currentTime() {
        if (PlaybackToneSeq.part && PlaybackToneSeq.duration) {
            if (PlaybackToneSeq.loopStart && PlaybackToneSeq.loopEnd) {
                return Tone.getTransport().seconds % (PlaybackToneSeq.loopEnd - PlaybackToneSeq.loopStart);
            }
            else {
                console.log(Tone.getTransport().seconds);
                return Tone.getTransport().seconds;
            }
        }
        return 0;
    }
    static set rate(val) {
        if (PlaybackToneSeq.part) {
            PlaybackToneSeq.part.playbackRate = val;
        }
        PlaybackToneSeq.playbackRate = val;
        PlaybackToneSeq.hosts.forEach(host => {
            host.requestUpdate();
        });
    }
    static get rate() {
        return PlaybackToneSeq.playbackRate;
    }
    get rate() { return PlaybackToneSeq.rate; }
    set rate(val) {
        PlaybackToneSeq.playbackRate = val;
    }
    static loop(start, end) {
        if (PlaybackToneSeq.part) {
            PlaybackToneSeq.part.loopStart = start;
            PlaybackToneSeq.part.loopEnd = end;
        }
        PlaybackToneSeq.loopStart = start;
        PlaybackToneSeq.loopEnd = end;
    }
    loop(start, end) { PlaybackToneSeq.loop(start, end); }
}
PlaybackToneSeq.hosts = [];
PlaybackToneSeq.playbackRate = 1;
PlaybackToneSeq.duration = 0;
PlaybackToneSeq.loopStart = undefined;
PlaybackToneSeq.loopEnd = undefined;
PlaybackToneSeq.isPlaying = false;
PlaybackToneSeq.isPaused = false;
//# sourceMappingURL=playback-tone-seq.js.map