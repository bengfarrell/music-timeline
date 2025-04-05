import { BasePlayback, PlayStateChangeEvent } from './baseplayback';
import { guess } from 'web-audio-beat-detector';

/**
 * Playback controller for Audio playback
 */
export class AudioPlayback extends BasePlayback {
    protected context?: AudioContext;

    protected audioSource?: AudioBufferSourceNode;

    protected buffer?: AudioBuffer;

    protected offsetStart = 0;

    protected pendingSeek?: number;

    set data(buffer: AudioBuffer) {
        this.buffer = buffer;
    }

    get duration() {
        if (this.isLooping && this._loopStart !== undefined && this._loopEnd) return (this._loopEnd - this._loopStart);
        return (this.buffer?.duration || 0);
    }

    set rate(val: number) {
        super.rate = val;
        if (this.audioSource) this.audioSource.playbackRate.value = val;
    }

    calculateBPM() {
        return new Promise<{ bpm: number, offset: number} | undefined>((resolve, reject) =>
        {
            if (this.buffer) {
                guess(this.buffer)
                    .then(({ bpm, offset }) => {
                        resolve({ bpm, offset });
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(undefined);
                    });
            }
        });
    }

    async play() {
        if (!this.isPlaying && !this.isPaused) {
            this._isPlaying = true;
            this._isPaused = false;
            await this.startPlayback(this.pendingSeek || 0);
        } else if (this.isPaused) {
            this._isPaused = false;
            this._isPlaying = true;
            await this.context?.resume();
        }

        this.hosts.forEach(host => {
            host.requestUpdate();
        });
        this.dispatchEvent(new PlayStateChangeEvent());
    }

    protected async startPlayback(time = 0) {
        if (this.buffer) {
            if (this.context) {
                await this.context.close();
                this.context = undefined;
            }
            this.context = new AudioContext();
            this.audioSource = this.context.createBufferSource();
            this.audioSource.loop = this.isLooping;
            this.audioSource.playbackRate.value = this.playbackRate;
            this.offsetStart = time;
            if (this.isLooping) {
                this.audioSource.loopStart = this._loopStart || 0;
                this.audioSource.loopEnd = this._loopEnd || this.duration;
            }
            this.audioSource.buffer = this.buffer
            this.audioSource.connect(this.context.destination);

            if (this.isLooping) {
                this.audioSource?.start(0, this._loopStart || this.offsetStart);
            } else {
                this.audioSource?.start(0, this.offsetStart, this.duration);
            }
        }
    }

    async seek(time: number) {
        if (this.buffer && this.isPlaying) {
            await this.startPlayback(time);
        } else {
            this.pendingSeek = time;
        }
    }

    get currentTime() {
        return ((this.context?.currentTime || 0) * this.playbackRate
            + (this._loopStart ? 0 : this.offsetStart)) % this.duration + (this._loopStart || 0);
    }

    async pause() {
        await super.pause();
        await this.context?.suspend();
        this.dispatchEvent(new PlayStateChangeEvent());
    }

    async stop() {
        await this.context?.close();
        this.context = undefined;
        this.buffer = undefined;
        this.offsetStart = 0;
        this.pendingSeek = 0;
        this.audioSource?.stop();
        this.audioSource = undefined;
        await super.stop();
        this.dispatchEvent(new PlayStateChangeEvent());
    }
}

export const Playback = new AudioPlayback();