import { BasePlayback, PlayStateChangeEvent } from './baseplayback';

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
        if (this.isLooping) return (this._loopEnd - this._loopStart);
        return (this.buffer?.duration || 0);
    }

    set rate(val: number) {
        super.rate = val;
        if (this.audioSource) this.audioSource.playbackRate.value = val;
    }

    async play() {
        if (!this.isPlaying && !this.isPaused) {
            await this.startPlayback(this.pendingSeek || 0);
            this._isPlaying = true;
            this._isPaused = false;
        } else if (this.isPaused) {
            await this.context?.resume();
            this._isPaused = false;
            this._isPlaying = true;
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
                this.audioSource.loopStart = this._loopStart;
                this.audioSource.loopEnd = this._loopEnd;
            }
            this.audioSource.buffer = this.buffer
            this.audioSource.connect(this.context.destination);

            if (this.isLooping) {
                this.audioSource?.start(0, this._loopStart);
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
        return ((this.context?.currentTime || 0) * this.playbackRate) % this.duration + this.offsetStart;
    }

    async pause() {
        await super.pause();
        await this.context?.suspend();
    }

    async stop() {
        await this.context?.close();
        this.context = undefined;
        await super.stop();
    }

    cancelLoop() {
        super.cancelLoop();
        if (this.isPlaying) {
            this.seek(this.currentTime);
        }
    }
}

export const Playback = new AudioPlayback();