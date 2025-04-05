import { css } from 'lit';

export const style = css`
    :host {
        width: 100%;
        overflow-x: auto;
        position: relative;
        display: inline-block;
    }

    #rendered {
        display: inline-block;
        background-repeat: no-repeat;
        width: 100%;
        height: 100%;
    }

    #selection-box {
        position: absolute;
        background-color: white;
        opacity: 0.1;
        height: 100%;
    }

    #playback-line {
        position: absolute;
        background-color: #ff9701;
        width: 1px;
        height: calc(100% - 5px);
        top: 5px;
        box-shadow: 0 0 4px 0 rgb(250, 255, 0);
    }

    .noterow {
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
    }

    .noterow:hover {
        background-color: #444;
    }

    .noteblock {
        position: absolute;
        border-radius: 3px;
        background-color: #9fd7a6;
        box-shadow: 0 0 4px 0 rgba(255, 255, 255, .5);
        border: 1px solid #6b9c7f;
    }

    .tick {
        position: absolute;
        top: 2px;
        bottom: 0;
        width: 1px;
    }

    .highlight.tick {
        background-color: #e8e52a;
    }

    .hard.tick {
        background-color: #8a8a8a;
    }

    .hard.tick:hover {
        background-color: #c5c5c5;
    }

    .soft.tick {
        background-color: #5e5e5e;
    }

    .marker.playhead:before, .marker.playhead:after {
        background: #ff9701;
    }

    .marker:before, .marker:after {
        background: #95b4e8;
    }

    .marker, .marker:before, .marker:after {
        width: 13px;
        height: 13px;
    }

    .marker {
        overflow: hidden;
        position: absolute;
        top: 0;
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
`;