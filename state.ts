import { BotDefinition } from './bots_types.js';

export class AppState {
    handSize = 9;
    choiceIndex = 0;
    mode = '';
    hitback = false;
    desperate = false;

    chosenBotID: number | undefined = undefined;
    chosenBot: BotDefinition | undefined = undefined;
    showPicker = true;
    showAbout  = false;
    showHelp   = false;
    showRoll   = false;
}
