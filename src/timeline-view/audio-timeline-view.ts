import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseTimelineView } from './base-timeline-view.js';
import { renderWaveform } from '../utils/renderwaveform.js';

@customElement('mt-audio-view')
export class AudioTimelineView extends BaseTimelineView {
    @query('#rendered')
    rendered?: HTMLCanvasElement;

    buffer?: AudioBuffer;

    protected ampScale = 1;

    protected smoothing = 0.8;

    protected waveformRendered = false;

    @property({ type: String })
    waveformColor = 'white';

    set data(data: AudioBuffer | undefined) {
        super.data = data;
        this.buffer = data as AudioBuffer;
        this.waveformRendered = false;
    }

    get duration() {
        return this.buffer ? this.buffer.duration : 0;
    }

    async renderWaveform() {
        if (this.buffer && this.rendered) {
            const source = [];
            for (let i = 0; i < this.buffer.numberOfChannels; i++) {
                source.push(this.buffer.getChannelData(i));
            }
            this.bounds = this.getBoundingClientRect();
            const height = this.bounds.height;
            const ttlPxWidth = this.buffer.duration * this.pixelsPerSecond;
            this.rendered.width = ttlPxWidth;
            this.rendered.style.width = `${ttlPxWidth}px`;
            this.rendered.height = height;
            const ctx = this.rendered.getContext('2d') as CanvasRenderingContext2D;
            ctx.fillStyle = this.waveformColor;
            renderWaveform(ctx, ttlPxWidth, height, source, this.ampScale, this.smoothing);
            this.waveformRendered = true;
        }
    }

    protected render() {
        if (!this.waveformRendered) this.renderWaveform();

        const range = this.selectionRange.slice().sort((a, b) => a! - b!);
        const drawRange = range[0] !== undefined && range[1] !== undefined && range[0] !== range[1];
        return html`
            <canvas id="rendered"></canvas>
            <div id="selection-box" 
                 style="left: ${drawRange ? range[0]! * this.pixelsPerSecond : -100}px;
                        width: ${drawRange ? (range[1]! - range[0]!) * this.pixelsPerSecond : -100}px"
            ></div>
            ${this.renderGrid()}
            ${this.buffer ? html`<div id="playback-line" style="left: ${this.currentTime * this.pixelsPerSecond}px"></div>
            <div class="marker playhead" id="playback" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${this.currentTime * this.pixelsPerSecond - 3}px"></div>
            <div class="marker" id="start-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[0]! * this.pixelsPerSecond - 3 : -100}px"></div>
            <div class="marker" id="end-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[1]! * this.pixelsPerSecond - 3 : -100}px"></div>` : undefined}`;
    }
}