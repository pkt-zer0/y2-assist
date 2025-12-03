import { BotDefinition, ChoiceRow, OverrideRow } from '../bots_types.js';
import {
    ALL_FLAG_DEFS,
    ALL_FLAG_NAMES,
    ArmorType,
    Choice,
    FLAG_NAMES,
    UsedFlagNames,
} from '../types.js';
import { starsFor } from './common.js';

function possibleChoices(bot: BotDefinition): Choice[] {
    // Various helpers to flatten the structure
    function toSingleton(optional: Choice | null | undefined): Choice[] {
        if (optional) {
            return [optional];
        }
        return [];
    }
    function choicesFromRow(row?: ChoiceRow): Choice[] {
        if (!row) {
            return [];
        }
        return [
            ...row.choices.flatMap(toSingleton),
            ...toSingleton(row.hitback),
        ];

    }
    function choicesFromOverride(override?: OverrideRow): Choice[] {
        if (!override) {
            return [];
        }
        return [
            ...override.choices.flatMap(toSingleton),
            ...toSingleton(override.hitback),
        ];
    }

    // Iterate over all possible choices
    return [
        ...bot.normal.flatMap(c => choicesFromRow(c)),
        ...choicesFromRow(bot.knockdown),
        ...choicesFromOverride(bot.desperate),
        ...choicesFromRow(bot.wakeup),
        ...choicesFromRow(bot.dragon),
    ];
}

function flagsUsed(bot: BotDefinition): UsedFlagNames[] {
    const usedFlags = new Set<UsedFlagNames>();
    for (const choice of possibleChoices(bot)) {
        for (const flag of FLAG_NAMES) {
            if (!!choice[flag]) {
                usedFlags.add(flag);
            }
        }

        if (choice.armor === ArmorType.Light)  { usedFlags.add('armorL'); }
        if (choice.armor === ArmorType.Medium) { usedFlags.add('armorM'); }
        if (choice.armor === ArmorType.Heavy)  { usedFlags.add('armorH'); }

        if (choice.selfDamage) { usedFlags.add('selfDamage'); }
        if (choice.selfHeal)   { usedFlags.add('selfHeal'); }
    }

    return ALL_FLAG_NAMES.filter(flag => {
        return usedFlags.has(flag);
    });
}

export function renderHelp(chosenBot: BotDefinition | undefined) {

    if (!chosenBot) {
        throw Error('Invalid state: Help screen should only be openable after choosing a bot.');
    }

    return `
        <div class="screen help">
            <div class="controls">
                <button data-action="help">Close</button>
            </div>
            <div class="charinfo">
                <div class="name">
                    ${chosenBot.name} <br>
                    ${starsFor(chosenBot.difficulty)}                
                </div>
                <div class="health"> ❤ ${chosenBot.health} </div>
            </div>
            <div class="content">            
                <div class="abilities">
                    ${chosenBot.abilities.map(ability => `
                        <article>
                            <h4>${ability.name}</h4>
                            <p>${ability.description}</p>
                        </article>
                    `).join('\n')}
                </div>
                <div class="splitter">
                    Trait shorthands
                </div>
                ${flagsUsed(chosenBot).map(flag => {
        const def = ALL_FLAG_DEFS[flag];
        return `
                    <article>
                        <h4>
                            ${def.icon} <code>[${flag}]</code> 
                        </h4>
                        <p>${def.desc}</p>
                    </article>`;
    }).join('\n')}
            </div>
        </div>    
    `;
}
