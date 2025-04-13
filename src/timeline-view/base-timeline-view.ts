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

    @property({ type: Boolean })
    followPlayback = false;

    @property({ type: Boolean })
    isPlaying = false;

    @property({ type: Number })
    set currentTime(value: number) {
        this._currentTime = value;
        if (this.followPlayback && this.isPlaying) {
            const width = this.getBoundingClientRect().width;
            if (this._currentTime * this.pixelsPerSecond >= this.scrollLeft + width || this._currentTime * this.pixelsPerSecond < this.scrollLeft) {
                this.scrollLeft = this._currentTime * this.pixelsPerSecond;
            }
        }
    }

    get currentTime(): number {
        return this._currentTime;
    }

    protected markerDragging?: 'start' | 'end' | 'playback';

    protected _notes: NoteEvent[] = [];

    protected bounds?: DOMRect;

    protected _currentTime: number = 0;

    protected _highlightTimeout?: number;

    protected isSelecting: boolean = false;
    protected pendingSeek?: number;
    selectionRange: [number | undefined, number | undefined] = [ undefined, undefined ];

    highlightBeat(beat: number) {
        this.shadowRoot!.getElementById('highlight-tick')!.style.left = this.shadowRoot!.getElementById('beat-' + beat)!.style.left;
        this.shadowRoot!.getElementById('highlight-tick')!.style.display = 'block';
        clearTimeout(this._highlightTimeout);
        this._highlightTimeout = window.setTimeout(() => {
            this.shadowRoot!.getElementById('highlight-tick')!.style.display = 'none';
        }, 750);
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

    protected nearestBeat(seconds: number) {
        const secondsPerBeat = 1 / (this.beatsPerMinute / 60);
        const beatNum = Math.round(seconds / secondsPerBeat);
        return beatNum * secondsPerBeat + this.beatOffsetSeconds;
    }

    protected onPointerDown(e: PointerEvent) {
        this.markerDragging = undefined;
        this.isSelecting = true;
        this.bounds = this.getBoundingClientRect();
        const x = e.clientX - (this.bounds?.left || 0) + this.scrollLeft;
        const time = x / this.pixelsPerSecond - this.beatOffsetSeconds;
        this.pendingSeek = this.nearestBeat(time);

        if (this.selectionRange[0] !== undefined && this.selectionRange[1] !== undefined) {
            this.dispatchEvent(new RangeSelectEvent(undefined, this.beatsPerMinute / 60, { bubbles: true, composed: true }));
        }
        this.selectionRange = [this.pendingSeek, undefined];
        this.requestUpdate();
    }

    protected onPointerMove(e: PointerEvent) {
        this.bounds = this.getBoundingClientRect();
        const x = e.clientX - (this.bounds?.left || 0) + this.scrollLeft;
        const time = x / this.pixelsPerSecond - this.beatOffsetSeconds;
        const nearestBeatTime = this.nearestBeat(time);
        if (this.markerDragging) {
            switch (this.markerDragging) {
                case 'start':
                    this.selectionRange[0] = nearestBeatTime;
                    break;
                case 'end':
                    this.selectionRange[1] = nearestBeatTime;
                    break;
                case 'playback':
                    this.pendingSeek = nearestBeatTime;
                    break;
            }
            this.requestUpdate();
            return;
        }

        if (this.isSelecting && this.selectionRange && this.selectionRange[0] !== nearestBeatTime) {
            this.selectionRange[1] = nearestBeatTime;
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
                    <div class="hard tick" @mouseleave=${() => this.hoverBeat(false, time)} @mouseover=${() => this.hoverBeat(true, time)} id="beat-${c}" style="left: ${time * this.pixelsPerSecond}px"></div>`);
            } else {
                ticks.push(html`
                    <div class="soft tick" @mouseleave=${() => this.hoverBeat(false, time)} @mouseover=${() => this.hoverBeat(true, time)} id="beat-${c}" style="left: ${time * this.pixelsPerSecond}px"></div>`);
            }
        }
        ticks.push(html`<div class="highlight tick" id="highlight-tick"></div>`);
        ticks.push(html`<div id="beat-time"></div>`);
        return ticks;
    }

    protected formatTime(seconds: number) {
        const hundredthsSeconds = Math.floor((seconds - Math.floor(seconds)) * 10);
        const dateObj = new Date(seconds * 1000);
        const minutes = dateObj.getUTCMinutes();
        seconds = dateObj.getSeconds();

        return minutes.toString().padStart(2, '0')
            + ':' + seconds.toString().padStart(2, '0')
            + '.' + hundredthsSeconds.toString().padStart(2, '0');
    }

    protected hoverBeat(hovered: boolean, time: number) {
        if (hovered) {
            this.shadowRoot!.getElementById('beat-time')!.style.left = (time * this.pixelsPerSecond) + 'px';
            this.shadowRoot!.getElementById('beat-time')!.style.display = 'block';
            this.shadowRoot!.getElementById('beat-time')!.innerText = `${this.formatTime(time)}`;
        } else {
            this.shadowRoot!.getElementById('beat-time')!.style.display = 'none';
        }
    }
}