import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseTimelineView } from './base-timeline-view.js';

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

            const step = Math.ceil(this.buffer.length / ttlPxWidth);

            // below approach adapted from https://github.com/meandavejustice/draw-wave/blob/master/index.js
            const firstChannel = source[0];
            let lastDrawnAmplitude;
            for (let i = 0; i < ttlPxWidth; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = firstChannel[(i * step) + j] || 0;
                    if (datum < min)
                        min = datum;
                    if (datum > max)
                        max = datum;
                }

                if (!lastDrawnAmplitude) {
                    lastDrawnAmplitude = Math.min(1, max - min * this.ampScale);
                }

                //console.log('min', min, 'max', max, 'lastDrawnAmplitude', lastDrawnAmplitude);
                const amp = Math.max(Math.min(Math.min(1, max - min * this.ampScale), lastDrawnAmplitude * (1 + (1 - this.smoothing))), lastDrawnAmplitude * (1 - (1 - this.smoothing)));
                if (amp > 0) {
                    lastDrawnAmplitude = amp;
                    ctx?.fillRect(i, height - amp * height, 1, amp * height);
                }
            }
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