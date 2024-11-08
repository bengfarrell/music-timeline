var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { style } from './timeline-view.css';
import { Timeline } from '../timeline';
export class TimelineEvent extends Event {
    constructor(type, args, eventInitDict) {
        super(type, eventInitDict);
        this.time = args.time;
        this.range = args.range;
    }
}
TimelineEvent.NOTE_HOVER = 'notehover';
TimelineEvent.SEEK = 'seek';
TimelineEvent.RANGE_SELECT = 'rangeselect';
let TimelineView = class TimelineView extends LitElement {
    set sequence(data) {
        this._notes = data;
        this.duration = data.reduce((max, note) => Math.max(max, note.time + note.duration), 0);
        this.requestUpdate();
    }
    constructor() {
        super();
        this.pixelsPerBeat = 0;
        this.currentTime = 0;
        this.beatsPerMeasure = 0;
        this.numBeats = 0;
        this.noteMin = 0;
        this.noteMax = 0;
        this.noteHeight = 0;
        this.duration = 0;
        this._notes = [];
        this.isSelecting = false;
        this.selectionRange = [undefined, undefined];
        this.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.addEventListener('pointermove', this.onPointerMove.bind(this));
        document.body.addEventListener('pointerup', () => {
            if (this.isSelecting && this.selectionRange && !this.pendingSeek) {
                this.selectionRange = this.selectionRange.sort((a, b) => a - b);
                this.dispatchEvent(new TimelineEvent(TimelineEvent.RANGE_SELECT, { time: this.selectionRange[0], range: this.selectionRange }, { bubbles: true, composed: true }));
            }
            else if (this.pendingSeek) {
                this.dispatchEvent(new TimelineEvent(TimelineEvent.SEEK, { time: this.pendingSeek }, { bubbles: true, composed: true }));
                this.pendingSeek = undefined;
            }
            this.isSelecting = false;
            this.markerDragging = undefined;
        });
    }
    onPointerDown(e) {
        this.markerDragging = undefined;
        this.isSelecting = true;
        this.bounds = this.getBoundingClientRect();
        const x = e.clientX - (this.bounds?.left || 0) + this.scrollLeft;
        const beat = Math.floor(x / this.pixelsPerBeat);
        this.pendingSeek = beat;
        this.selectionRange = [beat, undefined];
        this.requestUpdate();
    }
    onPointerMove(e) {
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
        if (this.isSelecting && this.selectionRange) {
            this.selectionRange[1] = Math.floor(x / this.pixelsPerBeat);
            this.pendingSeek = undefined;
            this.requestUpdate();
        }
    }
    handleMarkerDown(e) {
        switch (e.target.id) {
            case 'start-range':
                this.markerDragging = this.selectionRange[1] > this.selectionRange[0] ? 'start' : 'end';
                break;
            case 'end-range':
                this.markerDragging = this.selectionRange[1] > this.selectionRange[0] ? 'end' : 'start';
                break;
            case 'playback':
                this.markerDragging = 'playback';
                break;
        }
        e.preventDefault();
        e.stopPropagation();
    }
    render() {
        const range = this.selectionRange.slice().sort((a, b) => a - b);
        const drawRange = range[0] !== undefined && range[1] !== undefined && range[0] !== range[1];
        return html `
            <div>${this.renderNoteRows()}</div>
            <div id="selection-box" 
                 style="left: ${drawRange ? range[0] * this.pixelsPerBeat : -100}px;
                        width: ${drawRange ? (range[1] - range[0]) * this.pixelsPerBeat : -100}px"
            ></div>
            ${this.renderGrid()}
            <div @pointermove=${(e) => {
            const note = Number(e.target.dataset.noteIndex);
            if (note !== undefined) {
                this.dispatchEvent(new TimelineEvent(TimelineEvent.NOTE_HOVER, { time: this._notes[note].time, note: this._notes[note] }, { bubbles: true, composed: true }));
            }
        }}>
                ${this._notes.map((event, index) => {
            return html `${this.renderNote(event, index)}`;
        })}
            </div>
            ${this._notes.length > 0 ? html `<div id="playback-line" style="left: ${this.currentTime * this.pixelsPerBeat}px"></div>
            <div class="marker playhead" id="playback" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${this.currentTime * this.pixelsPerBeat - 3}px"></div>
            <div class="marker" id="start-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[0] * this.pixelsPerBeat - 3 : -100}px"></div>
            <div class="marker" id="end-range" @pointerdown=${this.handleMarkerDown.bind(this)} style="left: ${drawRange ? range[1] * this.pixelsPerBeat - 3 : -100}px"></div>` : undefined}`;
    }
    renderNote(note, index) {
        return html `<div class="noteblock" data-note-index="${index}"
                     style="left: ${note.time * this.pixelsPerBeat}px;
                     top: ${(this.noteMax - note.note - 2) * this.noteHeight + 2 + this.noteHeight + Timeline.TOP_GUTTER - 1}px; 
                     height: ${this.noteHeight - 3}px;
                     width: ${note.duration * this.pixelsPerBeat}px;"></div>`;
    }
    renderNoteRows() {
        const rows = [];
        for (let c = this.noteMin; c < this.noteMax; c++) {
            rows.push(html `<div class="noterow" data-note=${c} style="
                width: ${this.duration * this.pixelsPerBeat + this.pixelsPerBeat}px;
                height: ${this.noteHeight}px; 
                top: ${(c - this.noteMin) * this.noteHeight + Timeline.TOP_GUTTER}px"></div>`);
        }
        return rows;
    }
    renderGrid() {
        const ticks = [];
        for (let c = 0; c < Math.ceil(this.numBeats) + 1; c++) {
            const time = c * this.pixelsPerBeat;
            const isHardTick = c % this.beatsPerMeasure === 0;
            if (isHardTick) {
                ticks.push(html `
                    <div class="hardTick" style="left: ${time}px"></div>`);
            }
            else {
                ticks.push(html `
                    <div class="softTick" style="left: ${time}px"></div>`);
            }
        }
        return ticks;
    }
};
TimelineView.styles = style;
TimelineView.topGutter = 25;
__decorate([
    property({ type: Number })
], TimelineView.prototype, "pixelsPerBeat", void 0);
__decorate([
    property({ type: Number })
], TimelineView.prototype, "currentTime", void 0);
__decorate([
    property({ type: Number })
], TimelineView.prototype, "beatsPerMeasure", void 0);
__decorate([
    property({ type: Number })
], TimelineView.prototype, "numBeats", void 0);
__decorate([
    property({ type: Number })
], TimelineView.prototype, "noteMin", void 0);
__decorate([
    property({ type: Number })
], TimelineView.prototype, "noteMax", void 0);
__decorate([
    property({ type: Number })
], TimelineView.prototype, "noteHeight", void 0);
TimelineView = __decorate([
    customElement('ms-timeline-view')
], TimelineView);
export { TimelineView };
//# sourceMappingURL=timeline-view.js.map