import { html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { style } from './timeline.css.js';
import '../timeline-view/midi-timeline-view.js';
import '../notetray/notetray.js';
import { AudioTimelineView, TimelineEvent } from '../timeline-view';
import { AudioFile } from '../utils/audiofile.js';
import { BaseTimeline } from './base-timeline.js';

@customElement('mt-audio')
export class AudioTimeline extends BaseTimeline {
    static styles = style;

    @query('mt-audio-view')
    timelineView?: AudioTimelineView;

    @property({ type: String })
    waveformColor = 'white';

    protected _buffer?: AudioBuffer;

    set buffer(data: AudioBuffer | undefined) {
        this._buffer = data;
        this.dispatchEvent(new Event('loaded', { bubbles: true, composed: true }));
        this.requestUpdate();
    }

    get buffer() {
        return this._buffer;
    }

    get pixelsPerSecond(): number {
        return this.contentWidth / (this._buffer?.duration || 0) * (this.zoomPercent/100);
    }

    /**
     * TODO: We're assuming x/4 timing when passing beats per second - make this more robust in the future
     */
    render() {
        if (!this.buffer) return undefined;
        return html`
            <mt-audio-view style="height: ${this.bounds?.height}px"
                @seek=${(e: TimelineEvent) => this.currentTime = e.time }
               .buffer=${this.buffer}
                waveformColor=${this.waveformColor}
                currenttime=${this.currentTime}
                scrollfollowplayback=${this.scrollFollowPlayback}
                isplaying=${this.isPlaying}
                pixelspersecond=${this.pixelsPerSecond}
                beatsperminute=${this.beatsPerMinute}
                beatoffsetseconds=${this.beatOffsetSeconds}
                beatspermeasure=${this.beatsPerMeasure}>
            </mt-audio-view>`;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (this.timelineView) {
            this.timelineView.buffer = this._buffer;
        }
        this.requestUpdate();
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