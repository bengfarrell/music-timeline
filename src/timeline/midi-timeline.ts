import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { style } from './timeline.css.js';
import '../timeline-view/midi-timeline-view.js';
import '../notetray/notetray.js';
import { MIDIFile } from '../utils';
import { MIDITrack } from '../utils';
import { MIDITimelineView } from '../timeline-view/midi-timeline-view.js';

@customElement('mt-midi')
export class MIDITimeline extends LitElement {
    static TOP_GUTTER = 15;

    static styles = style;

    @query('mt-midi-view')
    timelineView?: MIDITimelineView;

    @property({ type: String })
    src = '';

    @property({ type: Number })
    trackNum = 0;

    @property({ type: Number, attribute: 'channelnum', reflect: true })
    channelNum?: number;

    @property({ type: Number })
    currentTime = 0;

    @property({ type: Number })
    pixelsPerSecond = 20;

    bounds?: DOMRect;
    midi?: MIDIFile;
    protected _midiTrack?: MIDITrack;

    set midiTrack(track: MIDITrack | undefined) {
        if (this._midiTrack?.uuid === track?.uuid) {
            return;
        }
        this._midiTrack = track;
        this.dispatchEvent(new Event('loaded', { bubbles: true, composed: true }));
        this.requestUpdate();
    }

    refresh() {
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

    /**
     * TODO: We're assuming x/4 timing when passing beats per second - make this more robust in the future
     */
    render() {
        const noteMin = this.midiTrack?.noteRange[0] || 0;
        const noteMax = this.midiTrack?.noteRange[1] || 0;
        const noteRange = noteMax - noteMin + 2
        const noteHeight = Math.ceil(((this.bounds?.height || 0) - MIDITimeline.TOP_GUTTER) / noteRange);

        return html`<mt-note-tray 
            noteheight=${noteHeight}
            notemin=${noteMin}
            notemax=${noteMax}>
        </mt-note-tray>
        <mt-midi-view style="height: ${this.bounds?.height}px"
            .data=${this._midiTrack?.sequence || []}
            noteheight=${noteHeight}
            notemin=${noteMin}
            notemax=${noteMax}
            currenttime=${this.currentTime}
            pixelspersecond=${this.pixelsPerSecond}
            beatspersecond=${1 / ((this.midiTrack?.timeMeta.tempo || 1000000) / 1000000)}
            beatspermeasure=${this.midiTrack?.timeSignature?.numerator}>
        </mt-midi-view>`;
    }


    protected async load(uri: string) {
        this.midi = await MIDIFile.Load(uri);

        if (!this.channelNum) {
            this.midiTrack = this.midi.tracks[this.trackNum];
        } else {
            this.midiTrack = MIDITrack.isolateChannelsFromTrack(this.midi.tracks[this.trackNum], this.channelNum);
        }
        this.requestUpdate();
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        super.attributeChangedCallback(name, _old, value);
        if (name === 'src' && value) {
            this.load(value);
        }

        if ((name === 'channelnum' || name === 'tracknum') && this.midi) {
            this.updateCurrentTrack();
            this.requestUpdate();
        }
    }

    updateCurrentTrack() {
        if (this.midi) {
            if (!this.channelNum) {
                this.midiTrack = this.midi.tracks[this.trackNum];
            } else {
                this.midiTrack = MIDITrack.isolateChannelsFromTrack(this.midi.tracks[this.trackNum], this.channelNum);
            }
        }
    }
}