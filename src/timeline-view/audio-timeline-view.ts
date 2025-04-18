import { html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseTimelineView } from './base-timeline-view.js';
import { renderWaveform } from '../utils/renderwaveform.js';

@customElement('mt-audio-view')
export class AudioTimelineView extends BaseTimelineView {
    @query('#rendered')
    rendered?: HTMLCanvasElement;

    protected _buffer?: AudioBuffer;

    protected smoothing = 0.94;

    protected waveformRendered = false;

    @property({ type: String })
    waveformColor = 'white';

    set buffer(data: AudioBuffer | undefined) {
        this._buffer = data;
        this.waveformRendered = false;
        if (!this.waveformRendered) this.renderWaveform();
    }

    get buffer() {
        return this._buffer;
    }

    get duration() {
        return this._buffer ? this._buffer.duration : 0;
    }

    async renderWaveform() {
        if (this._buffer && this.rendered) {
            const source = [];
            for (let i = 0; i < this._buffer.numberOfChannels; i++) {
                source.push(this._buffer.getChannelData(i));
            }
            this.bounds = this.getBoundingClientRect();
            const height = this.bounds.height;
            const ttlPxWidth = this._buffer.duration * this.pixelsPerSecond;
            this.rendered.width = ttlPxWidth;
            this.rendered.style.width = `${ttlPxWidth}px`;
            this.rendered.height = height;
            const ctx = this.rendered.getContext('2d') as CanvasRenderingContext2D;
            ctx.fillStyle = this.waveformColor;
            renderWaveform(ctx, ttlPxWidth, height, source, this.smoothing);
            this.waveformRendered = true;
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (!this.waveformRendered) this.renderWaveform();
    }

    protected render() {
        return html`
            <canvas id="rendered"></canvas>
            ${this.renderGrid()}
            ${this.renderDecorators()}`
    }
}