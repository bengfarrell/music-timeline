import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { style } from './timeline-view.css';
import { NoteEvent } from '../utils';
import { MIDITimeline } from '../timeline';
import { BaseTimelineView } from './base-timeline-view';
import { TimelineEvent } from './timelineevent';

@customElement('mt-midi-view')
export class MIDITimelineView extends BaseTimelineView {
    static styles = style;

    static topGutter = 25;

    @property({ type: Number })
    noteMin = 0;

    @property({ type: Number })
    noteMax = 0;

    @property({ type: Number })
    noteHeight = 0;

    protected markerDragging?: 'start' | 'end' | 'playback';

    _notes: NoteEvent[] = [];

    bounds?: DOMRect;

    isSelecting: boolean = false;
    pendingSeek?: number;
    selectionRange: [number | undefined, number | undefined] = [ undefined, undefined ];

    set data(data: NoteEvent[]) {
        this._notes = data;
        this.requestUpdate();
    }

    get duration() {
        return this._notes.reduce((max, note) => Math.max(max, note.time + note.duration), 0);
    }

    protected render() {
        const range = this.selectionRange.slice().sort((a, b) => a! - b!);
        const drawRange = range[0] !== undefined && range[1] !== undefined && range[0] !== range[1];
        return html`
            <div>${this.renderNoteRows()}</div>
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
            ${this._notes.length > 0 ? html`<div id="playback-line" style="left: ${this.currentTime * this.pixelsPerSecond}px"></div>
            <div class="marker playhead" id="playback" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${this.currentTime * this.pixelsPerSecond - 3}px"></div>
            <div class="marker" id="start-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[0]! * this.pixelsPerSecond - 3 : -100}px"></div>
            <div class="marker" id="end-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[1]! * this.pixelsPerSecond - 3 : -100}px"></div>` : undefined}
            ${this.renderDecorators()}`;
    }

    protected renderNote(note: NoteEvent, index: number) {
        return html`<div class="noteblock" data-note-index="${index}"
                     style="left: ${note.time * this.pixelsPerSecond}px;
                     top: ${(this.noteMax - note.note! - 2) * this.noteHeight + 2 + this.noteHeight + MIDITimeline.TOP_GUTTER - 1}px; 
                     height: ${this.noteHeight -3}px;
                     width: ${note.duration * this.pixelsPerSecond}px;"></div>`;
    }

    protected renderNoteRows() {
        const rows = [];
        for (let c = this.noteMin; c < this.noteMax; c++) {
            rows.push(html`<div class="noterow" data-note=${c} style="
                width: ${this.duration * this.pixelsPerSecond + this.pixelsPerSecond}px;
                height: ${this.noteHeight}px; 
                top: ${(c - this.noteMin) * this.noteHeight + MIDITimeline.TOP_GUTTER}px"></div>`);
        }
        return rows;
    }
}