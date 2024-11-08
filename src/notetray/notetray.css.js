import { css } from 'lit';
export const style = css `
    :host {
        display: flex;
        flex-direction: column;
        width: 50px;
        margin-right: 2px;
        border-right: 1px solid #aaa;
        font-family: Arial, sans-serif;
        font-size: 10px;
        
        --top-gutter: 0px;
    }
    
    ul {
        margin-top: var(--top-gutter);
        padding-left: 0;
    }
    
    li {
        list-style: none;
        display: flex;
        background-color: #666;
        margin-bottom: 1px;
    }
    
    li.sharp {
        background-color: #444;
    }
    
    li span {
        display: inline-block;
        align-self: center;
        margin-left: 3px;
        width: 100%;
        color: #aaa;
    }

`;
//# sourceMappingURL=notetray.css.js.map