import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { style } from './timeline.css.js';
import '../timeline-view/timeline-view.js';
import '../notetray/notetray.js';
import { MIDIFile } from '../utils/midifile';
import { MIDITrack } from '../utils/miditrack';
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
    currentBeatTime = 0;

    @property({ type: Number })
    pixelsPerBeat = 20;

    bounds?: DOMRect;
    midi?: MIDIFile;
    _midiTrack?: MIDITrack;

    set midiTrack(track: MIDITrack | undefined) {
        this._midiTrack = track;
        if (this.timelineView) {
            this.timelineView.sequence = this._midiTrack?.events || [];
        }
        this.requestUpdate();
    }

    get midiTrack() {
        return this._midiTrack;
    }

    get track() {
        return this.midiTrack;
    }

    connectedCallback() {
        super.connectedCallback();
        this.bounds = this.getBoundingClientRect();
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
                pixelsperbeat=${this.pixelsPerBeat}
                numbeats=${this.midiTrack?.duration}
                beatspermeasure=${this.midiTrack?.timeSignature?.numerator}>
            </ms-timeline-view>`;
    }


    protected async load(uri: string) {
        this.midi = await MIDIFile.Load(uri);
        this.midiTrack = this.midi.parseTrack(this.trackNum);
        if (this.timelineView) {
            this.timelineView.sequence = this.midiTrack?.events || [];
        }
        this.requestUpdate();
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        super.attributeChangedCallback(name, _old, value);
        if (name === 'src' && value) {
            this.load(value);
        }
        if (name === 'trackNum' && value && this.midi) {
            this.midiTrack = this.midi.parseTrack(this.trackNum);
        }
    }
}