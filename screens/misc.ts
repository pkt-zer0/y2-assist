import { BotDefinition } from '../bots_types.js';
import { starsFor } from './common.js';

function link(url: string, text: string) {
    return `<a href="${url}" target="_blank">${text}</a>`;
}
export function renderAbout() {
    const yomi2    = `https://www.sirlingames.com/yomi2`;
    const handmade = `https://hero.handmade.network/`;
    const source   = `https://github.com/pkt-zer0/y2-assist`;

    return `
        <div class="screen about">
            <div class="controls">
                <button data-action="about">Close</button>
            </div>
            <p>
                Unofficial solo mode assistant for <br>
                Yomi 2 from ${link(yomi2, `Sirlin Games`)}.
            </p>
            <p>
                Lovingly ${link(handmade, `handmade`)} by<br>
                <b>Kovács "pkt" György</b>.
            </p>
            <p>${link(source, `Source code`)}<br> also available for the curious.</p>
        </div>    
    `;

}

export function renderPicker(bots: BotDefinition[]) {
    return `
        <div class="screen picker">
            ${bots.map((b, index) => `
                <button data-action="pick" data-char="${index}">
                    ${b.name} <br>
                    ${starsFor(b.difficulty)}
                </button>            
            `).join('\n')}
        </div>    
    `;
}
