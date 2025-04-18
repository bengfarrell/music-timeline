import { css } from 'lit';

export const style = css`
    :host {
        width: 100%;
        overflow-x: auto;
        position: relative;
        display: inline-block;

        --range-highlight-color: white;
        --range-highlight-opacity: 0.1;
        --range-select-marker-color: #95b4e8;
        
        --playback-marker-color: #ff9701;
        --playback-marker-shadow: 0 0 4px 0 rgb(250, 255, 0);
        
        --midi-note-row-hover-color: #444;
        --midi-note-color: #9fd7a6;
        --midi-note-outline-color: #6b9c7f;
        --midi-note-outline-shadow: 0 0 4px 0 rgba(255, 255, 255, .5);
        
        --beat-line-highlight-color: #e8e52a;
        --measure-line-color: #8a8a8a;
        --measure-line-hover-color: #c5c5c5;
        --beat-line-color: #5e5e5e;
        
        --beat-time-flag-border-color: #c5c5c5;
        --beat-time-flag-background-color: #2a2a2a;
        --beat-time-flag-text-color: #cacaca;
    }

    #rendered {
        display: inline-block;
        background-repeat: no-repeat;
        width: 100%;
        height: calc(100% - 16px);
    }

    #selection-box {
        position: absolute;
        pointer-events: none;
        background-color: var(--range-highlight-color);
        opacity: var(--range-highlight-opacity);
        height: 100%;
    }

    #playback-line {
        position: absolute;
        background-color: var(--playback-marker-color);
        pointer-events: none;
        width: 1px;
        height: calc(100% - 5px);
        top: 5px;
        box-shadow: var(--playback-marker-shadow);
    }

    .noterow {
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
    }

    .noterow:hover {
        background-color: var(--midi-note-row-hover-color);
    }

    .noteblock {
        position: absolute;
        border-radius: 3px;
        background-color: var(--midi-note-color);
        box-shadow: var(--midi-note-outline-shadow);
        border-width: 1px;
        border-style: solid;
        border-color: var(--midi-note-outline-color);
    }

    .tick {
        position: absolute;
        top: 2px;
        bottom: 0;
        width: 4px;
        background-color: transparent;
        border-left: 1px solid;
    }

    .highlight.tick {
        border-left-color: var(--beat-line-highlight-color);
        display: none;
    }

    .hard.tick {
        border-left-color: var(--measure-line-color);
    }

    .hard.tick:hover,
    .soft.tick:hover
    :host([griddragmode]) .hard.tick,
    :host([griddragmode]) .soft.tick {
        border-left-color: var(--measure-line-hover-color);
    }

    .soft.tick {
        border-left-color: var(--beat-line-color);
    }

    .marker.playhead:before, .marker.playhead:after {
        background: var(--playback-marker-color);
    }

    .marker:before, .marker:after {
        background: var(--range-select-marker-color);
    }

    .marker, .marker:before, .marker:after {
        width: 13px;
        height: 13px;
    }

    .marker {
        overflow: hidden;
        position: absolute;
        top: -3px;
        border-radius: 20%;
        transform: translateY(5%) rotate(-30deg) skewY(30deg) scaleX(.866);
        cursor: pointer;
        pointer-events: none;
    }

    .marker:before, .marker:after {
        position: absolute;
        pointer-events: auto;
        content: '';
    }

    .marker:before {
        border-radius: 20% 20% 20% 53%;
        transform: scaleX(1.155) skewY(-30deg) rotate(-30deg) translateY(-42.3%) skewX(30deg) scaleY(.866) translateX(-24%);
    }

    .marker:after {
        border-radius: 20% 20% 53% 20%;
        transform: scaleX(1.155) skewY(-30deg) rotate(-30deg) translateY(-42.3%) skewX(-30deg) scaleY(.866) translateX(24%);
    }
    
    #beat-time {
        position: absolute;
        border-width: 1px;
        border-style: solid;
        border-color: var(--beat-time-flag-border-color);
        background-color: var(--beat-time-flag-background-color);
        color: var(--beat-time-flag-text-color);
        font-size: 10px;
        font-family: sans-serif;
        padding: 4px;
        top: 20px;
        pointer-events: none;
        border-bottom-right-radius: 8px;
        border-top-right-radius: 8px;
    }
`;