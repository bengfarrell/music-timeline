var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { style } from './notetray.css.js';
import { getNotations } from '../utils/music.js';
import { Timeline } from '../timeline/timeline.js';
let NoteTray = class NoteTray extends LitElement {
    constructor() {
        super();
        this.noteHeight = 0;
        this.noteMin = 0;
        this.noteMax = 0;
        this.noteLabels = [];
        this.style.setProperty('--top-gutter', `${Timeline.TOP_GUTTER}px`);
    }
    render() {
        return html `<ul>
            ${this.noteLabels.reverse().map((label) => {
            return html `<li class="${label.indexOf('#') !== -1 ? 'sharp' : 'natural'}" style="height: ${this.noteHeight - 1}px"><span>${label}</span></li>`;
        })}
        </ul>`;
    }
    attributeChangedCallback(name, _old, value) {
        super.attributeChangedCallback(name, _old, value);
        if ((name === 'notemin' || name === 'notemax') && value) {
            this.noteLabels = getNotations(this.noteMin, this.noteMax);
        }
    }
};
NoteTray.styles = style;
__decorate([
    property({ type: Number })
], NoteTray.prototype, "noteHeight", void 0);
__decorate([
    property({ type: Number })
], NoteTray.prototype, "noteMin", void 0);
__decorate([
    property({ type: Number })
], NoteTray.prototype, "noteMax", void 0);
NoteTray = __decorate([
    customElement('ms-note-tray')
], NoteTray);
export { NoteTray };
//# sourceMappingURL=notetray.js.map