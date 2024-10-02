import { css } from 'lit';

export const style = css`
    :host {
        width: 100%;
        overflow-x: auto;
        background-color: #333;
        position: relative;
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
        box-shadow: 0 0 4px 0 rgba(0, 255, 0, .5);
    }

    .hardTick {
        position: absolute;
        top: 2px;
        bottom: 0;
        background-color: #8a8a8a;
    }

    .hardTick:hover {
        background-color: #c5c5c5;
    }

    .softTick {
        position: absolute;
        top: 2px;
        bottom: 0;
        background-color: #5e5e5e;
    }

    .hardTick, .softTick {
        position: absolute;
        width: 1px;
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