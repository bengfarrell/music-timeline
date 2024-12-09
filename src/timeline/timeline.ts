import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { style } from './timeline.css.js';
import '../timeline-view/timeline-view.js';
import '../notetray/notetray.js';
import { MIDIFile } from '../utils';
import { MIDITrack } from '../utils';
import { TimelineView } from '../timeline-view';

@customElement('ms-timeline')
export class Timeline extends LitElement {
    static TOP_GUTTER = 15;

    static styles = style;

    @query('ms-timeline-view')
    timelineView?: TimelineView;

    @property({ type: String })
    src = '';

    @property({ type: Number })
    trackNum = 0;

    @property({ type: Number })
    currentTime = 0;

    @property({ type: Number })
    pixelsPerBeat = 20;

    bounds?: DOMRect;
    midi?: MIDIFile;
    protected _midiTrack?: MIDITrack;

    set midiTrack(track: MIDITrack | undefined) {
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

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (this.timelineView) {
            this.timelineView.sequence = this._midiTrack?.sequence || [];
        }

    }

    render() {
        const noteMin = this.midiTrack?.noteRange[0] || 0;
        const noteMax = this.midiTrack?.noteRange[1] || 0;
        const noteRange = noteMax - noteMin + 2
        const noteHeight = Math.ceil(((this.bounds?.height || 0) - Timeline.TOP_GUTTER) / noteRange);
        return html`
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


    protected async load(uri: string) {
        this.midi = await MIDIFile.Load(uri);
        this.midiTrack = this.midi.tracks[this.trackNum];
        if (this.timelineView) {
            this.timelineView.sequence = this.midiTrack?.sequence || [];
        }
        this.requestUpdate();
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        super.attributeChangedCallback(name, _old, value);
        if (name === 'src' && value) {
            this.load(value);
        }
        if (name === 'trackNum' && value && this.midi) {
            this.midiTrack = this.midi.tracks[parseInt(value)];
        }
    }
}