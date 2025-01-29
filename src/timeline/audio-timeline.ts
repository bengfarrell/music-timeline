import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { style } from './timeline.css.js';
import '../timeline-view/midi-timeline-view.js';
import '../notetray/notetray.js';
import { AudioTimelineView } from '../timeline-view';
import { AudioFile } from '../utils/audiofile.js';

@customElement('mt-audio')
export class AudioTimeline extends LitElement {
    static TOP_GUTTER = 15;

    static styles = style;

    @query('mt-audio-view')
    timelineView?: AudioTimelineView;

    @property({ type: String })
    src = '';

    @property({ type: String })
    waveformColor = 'white';

    @property({ type: Number })
    currentTime = 0;

    @property({ type: Number })
    pixelsPerSecond = 20;

    @property({ type: Number })
    beatsPerSecond = 1;

    @property({ type: Number })
    beatsPerMeasure = 4;

    @property({ type: Number })
    beatOffsetSeconds = 0;

    bounds?: DOMRect;

    _buffer?: AudioBuffer;

    set buffer(data: AudioBuffer | undefined) {
        this._buffer = data;
        this.requestUpdate();
    }

    get buffer() {
        return this._buffer;
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
            this.timelineView.buffer = this._buffer;
        }
        this.requestUpdate();
    }

    /**
     * TODO: We're assuming x/4 timing when passing beats per second - make this more robust in the future
     */
    render() {
        if (!this.buffer) return undefined;
        return html`
            <mt-audio-view style="height: ${this.bounds?.height}px"
               .buffer=${this.buffer}
                waveformColor=${this.waveformColor}
                currenttime=${this.currentTime}
                pixelspersecond=${this.pixelsPerSecond}
                beatspersecond=${this.beatsPerSecond}
                beatoffsetseconds=${this.beatOffsetSeconds}
                beatspermeasure=${this.beatsPerMeasure}>
            </mt-audio-view>`;
    }


    protected async load(uri: string) {
        this.buffer = (await AudioFile.Load(uri))?.buffer;
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        super.attributeChangedCallback(name, _old, value);
        if (name === 'src' && value) {
            this.load(value);
        }
    }
}