import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { style } from './timeline-view.css';
import { NoteEvent } from '../utils';
import { RangeSelectEvent, TimelineEvent } from './timelineevent';

export class BaseTimelineView extends LitElement {
    static styles = style;

    static topGutter = 25;

    @property({ type: Number })
    pixelsPerSecond: number = 0;

    @property({ type: Number })
    beatsPerMinute: number = 120;

    @property({ type: Number })
    beatsPerMeasure: number = 0;

    @property({ type: Number })
    beatOffsetSeconds = 0;

    @property({ type: Number })
    currentTime: number = 0;

    protected markerDragging?: 'start' | 'end' | 'playback';

    _notes: NoteEvent[] = [];

    bounds?: DOMRect;

    isSelecting: boolean = false;
    pendingSeek?: number;
    selectionRange: [number | undefined, number | undefined] = [ undefined, undefined ];

    highlightBeat(beat: number) {
        this.shadowRoot!.getElementById('highlight-tick')!.style.left = this.shadowRoot!.getElementById('beat-' + beat)!.style.left;
    }

    get duration() { return 0; }

    refresh() { this.requestUpdate(); }

    constructor() {
        super();
        this.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.addEventListener('pointermove', this.onPointerMove.bind(this));
        document.body.addEventListener('pointerup', () => {
            const range = this.selectionRange.sort((a, b) => a! - b!);
            if (this.isSelecting && range && range[0] !== range[1] && !this.pendingSeek) {
                this.dispatchEvent(new RangeSelectEvent(range as [number, number], this.beatsPerMinute / 60, { bubbles: true, composed: true }));
            } else if (this.pendingSeek){
                this.currentTime = this.pendingSeek;
                this.dispatchEvent(new TimelineEvent(TimelineEvent.SEEK, { time: this.pendingSeek }, { bubbles: true, composed: true }));
                this.pendingSeek = undefined;
            }
            this.isSelecting = false;
            this.markerDragging = undefined;
        });
    }

    protected onPointerDown(e: PointerEvent) {
        this.markerDragging = undefined;
        this.isSelecting = true;
        this.bounds = this.getBoundingClientRect();
        const x = e.clientX - (this.bounds?.left || 0) + this.scrollLeft;
        const beat = Math.floor(x / this.pixelsPerSecond);
        this.pendingSeek = beat;

        if (this.selectionRange[0] !== undefined && this.selectionRange[1] !== undefined) {
            this.dispatchEvent(new RangeSelectEvent(undefined, this.beatsPerMinute / 60, { bubbles: true, composed: true }));
        }
        this.selectionRange = [beat, undefined];
        this.requestUpdate();
    }

    protected onPointerMove(e: PointerEvent) {
        const x = e.clientX - (this.bounds?.left || 0) + this.scrollLeft;
        if (this.markerDragging) {
            switch (this.markerDragging) {
                case 'start':
                    this.selectionRange[0] = Math.floor(x / this.pixelsPerSecond);
                    break;
                case 'end':
                    this.selectionRange[1] = Math.floor(x / this.pixelsPerSecond);
                    break;
                case 'playback':
                    this.pendingSeek = x / this.pixelsPerSecond;
                    break;
            }
            this.requestUpdate();
            return;
        }
        if (this.isSelecting && this.selectionRange && this.selectionRange[0] !== Math.floor(x / this.pixelsPerSecond)) {
            this.selectionRange[1] = Math.floor(x / this.pixelsPerSecond);
            this.pendingSeek = undefined;
            this.requestUpdate();
        }
    }

    protected handleMarkerDown(e: PointerEvent) {
        switch ((e.target as HTMLElement).id) {
            case 'start-range':
                this.markerDragging = this.selectionRange[1]! > this.selectionRange[0]! ? 'start' : 'end';
                break;
            case 'end-range':
                this.markerDragging = this.selectionRange[1]! > this.selectionRange[0]! ? 'end' : 'start';
                break;
            case 'playback':
                this.markerDragging = 'playback';
                break;
        }
        e.preventDefault();
        e.stopPropagation();
    }

    protected render() {
        return html``;
    }

    protected renderGrid() {
        const ticks = [];
        const secondsPerBeat = 1 / (this.beatsPerMinute / 60);
        const numBeats = Math.ceil(this.duration / secondsPerBeat);
        for (let c = 0; c < numBeats + 1; c++) {
            const time = c * secondsPerBeat + this.beatOffsetSeconds % secondsPerBeat;
            const isHardTick = c % this.beatsPerMeasure === 0;
            if (isHardTick) {
                ticks.push(html`
                    <div class="hard tick" id="beat-${c}" style="left: ${time * this.pixelsPerSecond}px"></div>`);
            } else {
                ticks.push(html`
                    <div class="soft tick" id="beat-${c}" style="left: ${time * this.pixelsPerSecond}px"></div>`);
            }
        }
        ticks.push(html`<div class="highlight tick" id="highlight-tick"></div>`)
        return ticks;
    }
}