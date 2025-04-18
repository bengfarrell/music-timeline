import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { AudioTimelineView, MIDITimelineView } from '../timeline-view';

export class BaseTimeline extends LitElement {
    static TOP_GUTTER = 15;

    @property({ type: String })
    src = '';

    @property({ type: Number })
    currentTime = 0;

    @property({ type: Number })
    beatsPerMinute = 120;

    @property({ type: Number })
    beatsPerMeasure = 4;

    @property({ type: Number })
    beatOffsetSeconds = 0;

    @property({ type: Number })
    zoomPercent = 100;

    @property({ type: Boolean })
    scrollFollowPlayback = true;

    @property({ type: Boolean })
    isPlaying = false;

    timelineView?: AudioTimelineView | MIDITimelineView;

    protected bounds?: DOMRect;

    get pixelsPerSecond(): number {
        return 0;
    }

    get contentWidth() {
        this.bounds = this.getBoundingClientRect();
        return Math.max((this.bounds?.width || 0) - 7, 0);
    }

    highlightBeat(beat: number) {
        this.timelineView?.highlightBeat(beat);
    }

    clearSelectionRange() {
        if (this.timelineView) {
            this.timelineView.selectionRange = [ undefined, undefined ];
        }
    }

    zoomTo(percentage: number, pivotTime?: number) {
        if (!pivotTime) {
            pivotTime = this.currentTime;
        }
        const prevPivotPx = pivotTime * this.pixelsPerSecond;
        this.zoomPercent = percentage;
        const nextPivotPx = pivotTime * this.pixelsPerSecond;
        if (this.timelineView) {
            this.timelineView.scrollLeft += nextPivotPx - prevPivotPx;
        }
    }

    zoomIn(percentage: number) { this.zoomTo(this.zoomPercent + percentage); }
    zoomOut(percentage: number) { this.zoomTo(this.zoomPercent - percentage); }

    constructor() {
        super();
        this.addEventListener('wheel', this.onHostWheel.bind(this));
    }

    protected onHostWheel = (event: WheelEvent) => {
        if (event.ctrlKey || event.metaKey) {
            const deltaScale = 1 - (2 * event.deltaY) / window.innerHeight;
            this.zoomIn(-(Math.abs(event.deltaY) / event.deltaY) * deltaScale);
            event.preventDefault();
            event.stopPropagation();
        }
    };

    connectedCallback() {
        super.connectedCallback();
        this.bounds = this.getBoundingClientRect();
    }


}