var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Timeline_1;
import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { style } from './timeline.css.js';
import '../timeline-view/timeline-view.js';
import '../notetray/notetray.js';
import { MIDIFile } from '../utils';
let MidiTimeline = Timeline_1 = class Timeline extends LitElement {
    constructor() {
        super(...arguments);
        this.src = '';
        this.trackNum = 0;
        this.currentTime = 0;
        this.pixelsPerBeat = 20;
    }
    set midiTrack(track) {
        if (this._midiTrack?.uuid === track?.uuid) {
            return;
        }
        this._midiTrack = track;
        if (this.timelineView) {
            this.timelineView.sequence = this._midiTrack?.sequence || [];
        }
        this.requestUpdate();
    }
    get midiTrack() {
        return this._midiTrack;
    }
    get track() {
        return this.midiTrack;
    }
    get contentWidth() {
        this.bounds = this.getBoundingClientRect();
        return Math.max((this.bounds?.width || 0) - 50, 0);
    }
    connectedCallback() {
        super.connectedCallback();
        this.bounds = this.getBoundingClientRect();
    }
    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        if (this.timelineView) {
            this.timelineView.sequence = this._midiTrack?.sequence || [];
        }
    }
    render() {
        const noteMin = this.midiTrack?.noteRange[0] || 0;
        const noteMax = this.midiTrack?.noteRange[1] || 0;
        const noteRange = noteMax - noteMin + 2;
        const noteHeight = Math.ceil(((this.bounds?.height || 0) - Timeline_1.TOP_GUTTER) / noteRange);
        return html `
            <ms-note-tray 
                noteheight=${noteHeight}
                notemin=${noteMin}
                notemax=${noteMax}>
            </ms-note-tray>
            <ms-timeline-view style="height: ${this.bounds?.height}px"
                noteheight=${noteHeight}
                notemin=${noteMin}
                notemax=${noteMax}
                currenttime=${this.currentTime}
                pixelsperbeat=${this.pixelsPerBeat}
                numbeats=${this.midiTrack?.duration}
                beatspermeasure=${this.midiTrack?.timeSignature?.numerator}>
            </ms-timeline-view>`;
    }
    async load(uri) {
        this.midi = await MIDIFile.Load(uri);
        this.midiTrack = this.midi.tracks[this.trackNum];
        if (this.timelineView) {
            this.timelineView.sequence = this.midiTrack?.sequence || [];
        }
        this.requestUpdate();
    }
    attributeChangedCallback(name, _old, value) {
        super.attributeChangedCallback(name, _old, value);
        if (name === 'src' && value) {
            this.load(value);
        }
        if (name === 'trackNum' && value && this.midi) {
            this.midiTrack = this.midi.tracks[parseInt(value)];
        }
    }
};
Timeline.TOP_GUTTER = 15;
Timeline.styles = style;
__decorate([
    query('ms-timeline-view')
], Timeline.prototype, "timelineView", void 0);
__decorate([
    property({ type: String })
], Timeline.prototype, "src", void 0);
__decorate([
    property({ type: Number })
], Timeline.prototype, "trackNum", void 0);
__decorate([
    property({ type: Number })
], Timeline.prototype, "currentTime", void 0);
__decorate([
    property({ type: Number })
], Timeline.prototype, "pixelsPerBeat", void 0);
Timeline = Timeline_1 = __decorate([
    customElement('ms-timeline')
], Timeline);
export { Timeline };
//# sourceMappingURL=timeline.js.map