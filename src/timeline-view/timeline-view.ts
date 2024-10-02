import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { style } from './timeline-view.css';
import { NoteEvent } from '../utils/miditrack.js';
import { Playback } from '../utils/playback';
import { Timeline } from '../timeline/timeline.js';

export class TimelineEvent extends Event {
    static NOTE_HOVER = 'onnotehover';

    public note?: NoteEvent;
}

@customElement('ms-timeline-view')
export class TimelineView extends LitElement {
    static styles = style;

    static topGutter = 25;

    @property({ type: Number })
    pixelsPerBeat: number = 0;

    @property({ type: Number })
    currentBeatTime: number = 0;

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
    selectionRange: (number | undefined)[] = [ undefined, undefined];

    set sequence(data: NoteEvent[]) {
        this._notes = data;
        this.duration = data.reduce((max, note) => Math.max(max, note.time + note.duration), 0);
        this.requestUpdate();
    }
    constructor() {
        super();
        this.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.addEventListener('pointermove', this.onPointerMove.bind(this));
        document.body.addEventListener('pointerup', () => {
            this.isSelecting = false;
            this.markerDragging = undefined;
        });

        setInterval(() => {
            this.currentBeatTime = Playback.currentTimeAsBeats;
        }, 100);
    }

    protected onPointerDown(e: PointerEvent) {
        this.markerDragging = undefined;
        this.isSelecting = true;
        this.bounds = this.getBoundingClientRect();
        const x = e.clientX - (this.bounds?.left || 0) + this.scrollLeft;
        const beat = Math.floor(x / this.pixelsPerBeat);
        Playback.currentTime = beat;
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
                    Playback.currentTime = Math.floor(x / this.pixelsPerBeat);
                    break;
            }
            this.requestUpdate();
            return;
        }
        if (this.isSelecting && this.selectionRange) {
            this.selectionRange[1] = Math.floor(x / this.pixelsPerBeat);
            Playback.currentTime = Math.min(this.selectionRange[0]!, this.selectionRange[1]!);
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
                    const event = new TimelineEvent(TimelineEvent.NOTE_HOVER);
                    event.note = this._notes[note];
                    dispatchEvent(event);
                }
            }}>
                ${this._notes.map((event: NoteEvent, index) => {
                    return html`${this.renderNote(event, index)}`;
                })}
            </div>
            <div id="playback-line" style="left: ${this.currentBeatTime * this.pixelsPerBeat}px"></div>
            <div class="marker playhead" id="playback" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${this.currentBeatTime * this.pixelsPerBeat - 3}px"></div>
            <div class="marker" id="start-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[0]! * this.pixelsPerBeat - 3 : -100}px"></div>
            <div class="marker" id="end-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[1]! * this.pixelsPerBeat - 3 : -100}px"></div>`;
    }

    protected renderNote(note: NoteEvent, index: number) {
        return html`<div class="noteblock" data-note-index="${index}"
                     style="left: ${note.time * this.pixelsPerBeat}px;
                     top: ${(this.noteMax - note.note! - 2) * this.noteHeight + 2 + this.noteHeight + Timeline.TOP_GUTTER}px; 
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