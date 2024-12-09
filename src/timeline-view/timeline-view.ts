import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { style } from './timeline-view.css';
import { NoteEvent } from '../utils';
import { Timeline } from '../timeline';

/**
 * TODO: Evaluate if this component needs to know BPM. Also if component should render timeline that is BPM independent.
 */

export class TimelineEvent extends Event {
    static NOTE_HOVER = 'notehover';
    static SEEK = 'seek';
    static RANGE_SELECT = 'rangeselect';

    public time: number;
    public note?: NoteEvent;
    public range?: [number, number];

    constructor(type: string, args: { time: number, note?: NoteEvent, range?: [number, number] }, eventInitDict?: EventInit) {
        super(type, eventInitDict);
        this.time = args.time;
        this.range = args.range;
    }
}

@customElement('ms-timeline-view')
export class TimelineView extends LitElement {
    static styles = style;

    static topGutter = 25;

    @property({ type: Number })
    pixelsPerBeat: number = 0;

    @property({ type: Number })
    currentTime: number = 0;

    @property({ type: Number })
    beatsPerMeasure: number = 0;

    @property({ type: Number })
    numBeats: number = 0;

    @property({ type: Number })
    noteMin = 0;

    @property({ type: Number })
    noteMax = 0;

    @property({ type: Number })
    noteHeight = 0;

    protected duration = 0;

    protected markerDragging?: 'start' | 'end' | 'playback';

    _notes: NoteEvent[] = [];

    bounds?: DOMRect;

    isSelecting: boolean = false;
    pendingSeek?: number;
    selectionRange: [number | undefined, number | undefined] = [ undefined, undefined ];

    set sequence(data: NoteEvent[]) {
        this.currentTime = 0;
        this.selectionRange = [undefined, undefined];
        this.dispatchEvent(new TimelineEvent(TimelineEvent.RANGE_SELECT, { time: 0, range: undefined }, { bubbles: true, composed: true }));
        this._notes = data;
        this.duration = data.reduce((max, note) => Math.max(max, note.time + note.duration), 0);
        this.requestUpdate();
    }
    constructor() {
        super();
        this.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.addEventListener('pointermove', this.onPointerMove.bind(this));
        document.body.addEventListener('pointerup', () => {
            const range = this.selectionRange.sort((a, b) => a! - b!);
            if (this.isSelecting && range && range[0] !== range[1] && !this.pendingSeek) {
                this.dispatchEvent(new TimelineEvent(TimelineEvent.RANGE_SELECT, { time: range[0]!, range: range as [number, number] }, { bubbles: true, composed: true }));
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
        const beat = Math.floor(x / this.pixelsPerBeat);
        this.pendingSeek = beat;

        if (this.selectionRange[0] !== undefined && this.selectionRange[1] !== undefined) {
            this.dispatchEvent(new TimelineEvent(TimelineEvent.RANGE_SELECT, { time: 0, range: undefined }, { bubbles: true, composed: true }));
        }
        this.selectionRange = [beat, undefined];
        this.requestUpdate();
    }

    protected onPointerMove(e: PointerEvent) {
        const x = e.clientX - (this.bounds?.left || 0) + this.scrollLeft;
        if (this.markerDragging) {
            switch (this.markerDragging) {
                case 'start':
                    this.selectionRange[0] = Math.floor(x / this.pixelsPerBeat);
                    break;
                case 'end':
                    this.selectionRange[1] = Math.floor(x / this.pixelsPerBeat);
                    break;
                case 'playback':
                    this.pendingSeek = x / this.pixelsPerBeat;
                    break;
            }
            this.requestUpdate();
            return;
        }
        if (this.isSelecting && this.selectionRange && this.selectionRange[0] !== Math.floor(x / this.pixelsPerBeat)) {
            this.selectionRange[1] = Math.floor(x / this.pixelsPerBeat);
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
        const range = this.selectionRange.slice().sort((a, b) => a! - b!);
        const drawRange = range[0] !== undefined && range[1] !== undefined && range[0] !== range[1];
        return html`
            <div>${this.renderNoteRows()}</div>
            <div id="selection-box" 
                 style="left: ${drawRange ? range[0]! * this.pixelsPerBeat : -100}px;
                        width: ${drawRange ? (range[1]! - range[0]!) * this.pixelsPerBeat : -100}px"
            ></div>
            ${this.renderGrid()}
            <div @pointermove=${(e: PointerEvent) => {
                const note = Number((e.target as HTMLDivElement).dataset.noteIndex);
                if (note !== undefined) {
                    this.dispatchEvent(new TimelineEvent(TimelineEvent.NOTE_HOVER, 
                    { time: this._notes[note].time, note: this._notes[note] }, { bubbles: true, composed: true }));
                }
            }}>
                ${this._notes.map((event: NoteEvent, index) => {
                    return html`${this.renderNote(event, index)}`;
                })}
            </div>
            ${this._notes.length > 0 ? html`<div id="playback-line" style="left: ${this.currentTime * this.pixelsPerBeat}px"></div>
            <div class="marker playhead" id="playback" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${this.currentTime * this.pixelsPerBeat - 3}px"></div>
            <div class="marker" id="start-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[0]! * this.pixelsPerBeat - 3 : -100}px"></div>
            <div class="marker" id="end-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[1]! * this.pixelsPerBeat - 3 : -100}px"></div>` : undefined}`;
    }

    protected renderNote(note: NoteEvent, index: number) {
        return html`<div class="noteblock" data-note-index="${index}"
                     style="left: ${note.time * this.pixelsPerBeat}px;
                     top: ${(this.noteMax - note.note! - 2) * this.noteHeight + 2 + this.noteHeight + Timeline.TOP_GUTTER - 1}px; 
                     height: ${this.noteHeight -3}px;
                     width: ${note.duration * this.pixelsPerBeat}px;"></div>`;
    }

    protected renderNoteRows() {
        const rows = [];
        for (let c = this.noteMin; c < this.noteMax; c++) {
            rows.push(html`<div class="noterow" data-note=${c} style="
                width: ${this.duration * this.pixelsPerBeat + this.pixelsPerBeat}px;
                height: ${this.noteHeight}px; 
                top: ${(c - this.noteMin) * this.noteHeight + Timeline.TOP_GUTTER}px"></div>`);
        }
        return rows;
    }

    protected renderGrid() {
        const ticks = [];

        for (let c = 0; c < Math.ceil(this.numBeats) + 1; c++) {
            const time = c * this.pixelsPerBeat;
            const isHardTick = c % this.beatsPerMeasure === 0;
            if (isHardTick) {
                ticks.push(html`
                    <div class="hardTick" style="left: ${time}px"></div>`);
            } else {
                ticks.push(html`
                    <div class="softTick" style="left: ${time}px"></div>`);
            }
        }
        return ticks;
    }
}