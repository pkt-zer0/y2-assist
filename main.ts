import { BOTS } from './bots.js';
import { initWakeLock } from './wake.js';
import {
    renderAbout,
    renderBot,
    renderHelp,
    renderPicker,
} from './screens/all.js';
import { AppState } from './state.js';

//-- Globals --
let rerender = function() {}; // Hack to allow rendering from various handlers
const S = new AppState(); // Global app state

//-- Utils --
function clamp(value: number, min: number, max: number) {
    if (value < min) { return min; }
    if (value > max) { return max; }
    return value;
}

//-- Actions --

const choiceLeft   = () => { S.choiceIndex = clamp(S.choiceIndex - 1, 0, 7); };
const choiceRight  = () => { S.choiceIndex = clamp(S.choiceIndex + 1, 0, 7); };
const handsizeDown = () => { S.handSize    = clamp(S.handSize - 1, 5, 12); };
const handsizeUp   = () => { S.handSize    = clamp(S.handSize + 1, 5, 12); };

const toggleKnockdown = () => { S.mode      = S.mode ? '' : 'knockdown'; };
const toggleWakeup    = () => { S.mode      = S.mode ? '' : 'wakeup'; };
const toggleHitback   = () => { S.hitback   = !S.hitback; };
const toggleDesperate = () => { S.desperate = !S.desperate; };
const toggleDragon    = () => { S.mode      = S.mode ? '' : 'dragon'; };

const displayAbout    = () => { S.showAbout  = !S.showAbout; };
const displayHelp     = () => { S.showHelp   = !S.showHelp; };
const displayPicker   = () => { S.showPicker = true; };
const changeCharacter = (data: DOMStringMap) => {
    const chosen = data.char;
    if (chosen) {
        S.chosenBotID = parseInt(chosen, 10);
        S.chosenBot = BOTS[S.chosenBotID];
        S.showPicker = false;
        S.showHelp = true;
        save();

        // Reset match state
        S.handSize = 9;
        S.choiceIndex = 0;
        S.mode = '';
        S.hitback = false;
        S.desperate = false;
    }
};
const choiceRandom = () => {
    S.choiceIndex = Math.floor(Math.random() * 8);
    S.showRoll = true;
    setTimeout(() => {
        S.showRoll = false;
        rerender();
    }, 1000);
};

//-- Persistence --

const STORAGE_KEY = 'y2_assist';
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        chosenBotID: S.chosenBotID
    }));
}
function load() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        const data = JSON.parse(rawData);
        S.chosenBotID = data.chosenBotID;

        // Update derived state
        S.chosenBot = BOTS[S.chosenBotID!];
        S.showPicker = !S.chosenBotID;
    }
}

//-- Main --

function renderContent() {
    if (S.showAbout) {
        return renderAbout();
    }
    if (S.showHelp) {
        return renderHelp(S.chosenBot);
    }
    if (S.showPicker) {
        return renderPicker(BOTS);
    } else {
        return renderBot(S.chosenBot, S);
    }
}

type EventHandler<T> = (data: T) => void;

function main() {
    const html = document.documentElement;
    const container = document.querySelector('#main')!;

    const KEY_HANDLERS: Record<string, EventHandler<void>> = {
        "ArrowLeft" : choiceLeft,
        "ArrowRight": choiceRight,
        "ArrowUp"   : handsizeDown,
        "ArrowDown" : handsizeUp,
        "r"         : choiceRandom,
        "k"         : toggleKnockdown,
        "w"         : toggleWakeup,
        "h"         : toggleHitback,
        "d"         : toggleDesperate,
        "t"         : toggleDragon,
    };
    document.addEventListener('keydown', (e) => {
        const handler = KEY_HANDLERS[e.key];
        if (handler) {
            handler();
            render();
        }
    });

    const ACTION_HANDLERS: Record<string, EventHandler<DOMStringMap>> = {
        roll : choiceRandom,
        left : choiceLeft,
        right: choiceRight,
        up   : handsizeUp,
        down : handsizeDown,
        // Toggles
        knockdown : toggleKnockdown,
        wakeup    : toggleWakeup,
        hitback   : toggleHitback,
        desperate : toggleDesperate,
        dragon    : toggleDragon,
        // Character picker
        picker: displayPicker,
        pick  : changeCharacter,
        // Misc
        about: displayAbout,
        help : displayHelp,
    };
    html.addEventListener('click', e => {
        const target = e.target;
        if (target instanceof HTMLButtonElement) {
            const handler = ACTION_HANDLERS['' + target.dataset.action];
            if (handler) {
                handler(target.dataset);
                render();
                // Workaround to ensure init happens in "user interaction"
                initWakeLock().then(); // Background process, ignore return
            }
        }
    });

    function render() {
        container.innerHTML = renderContent();
    }

    // Rerender with initial state
    load();
    render();

    rerender = render; // Expose rendering trigger to animations
}

document.addEventListener('DOMContentLoaded', main);
