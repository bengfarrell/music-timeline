import { html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseTimelineView } from './base-timeline-view.js';
import { renderWaveform } from '../utils/renderwaveform.js';

@customElement('mt-audio-view')
export class AudioTimelineView extends BaseTimelineView {
    @query('#rendered')
    rendered?: HTMLCanvasElement;

    protected _buffer?: AudioBuffer;

    protected smoothing = 0.9;

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
        const range = this.selectionRange.slice().sort((a, b) => a! - b!);
        const drawRange = range[0] !== undefined && range[1] !== undefined && range[0] !== range[1];
        return html`
            <canvas id="rendered"></canvas>
            <div id="selection-box" 
                 style="left: ${drawRange ? range[0]! * this.pixelsPerSecond : -100}px;
                        width: ${drawRange ? (range[1]! - range[0]!) * this.pixelsPerSecond : -100}px"
            ></div>
            ${this.renderGrid()}
            ${this._buffer ? html`<div id="playback-line" style="left: ${this.currentTime * this.pixelsPerSecond}px"></div>
            <div class="marker playhead" id="playback" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${this.currentTime * this.pixelsPerSecond - 3}px"></div>
            <div class="marker" id="start-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[0]! * this.pixelsPerSecond - 3 : -100}px"></div>
            <div class="marker" id="end-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[1]! * this.pixelsPerSecond - 3 : -100}px"></div>` : undefined}`;
    }
}