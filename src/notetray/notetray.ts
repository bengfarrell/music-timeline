import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { style } from './notetray.css.js';
import { getNotations } from '../utils/music.js';
import { MIDITimeline } from '../timeline/midi-timeline.js';

@customElement('mt-note-tray')
export class NoteTray extends LitElement {
    static styles = style;

    @property({ type: Number })
    noteHeight = 0;

    @property({ type: Number })
    noteMin = 0;

    @property({ type: Number })
    noteMax = 0;

    noteLabels: string[] = [];

    constructor() {
        super();
        this.style.setProperty('--top-gutter', `${MIDITimeline.TOP_GUTTER}px`);
    }

    protected render() {
        return html`<ul>
            ${this.noteLabels.reverse().map((label: string) => {
                return html`<li class="${label.indexOf('#') !== -1 ? 'sharp' : 'natural'}" style="height: ${this.noteHeight - 1}px"><span>${label}</span></li>`;
            })}
        </ul>`;
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        super.attributeChangedCallback(name, _old, value);
        if ((name === 'notemin' || name === 'notemax') && value) {
            this.noteLabels = getNotations(this.noteMin, this.noteMax);
        }
    }



}