import { MODULE_NAME } from '../consts.mjs';
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { hasAnyBFlag } from '../util/flag-helpers.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../util/hooks.mjs';
import { isActorInCombat } from '../util/is-actor-in-combat.mjs';
import { localizeBonusLabel } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const furiousFocus = 'furious-focus';
const furiousFocusTimestamp = 'furious-focus-timestamp';
const compendiumId = 'UcEIgufLJlIfhHmu';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#furious-focus';

Hooks.once('ready', () =>
    SpecificBonuses.registerSpecificBonus({
        journal,
        key: furiousFocus,
        type: 'boolean',
    })
);

class Settings {
    static get furiousFocus() { return LanguageSettings.getTranslation(furiousFocus); }

    static {
        LanguageSettings.registerItemNameTranslation(furiousFocus);
    }
}

/** @returns {string} */
const label = () => { return localizeBonusLabel(furiousFocus); }

/**
 * @param {ActionUse<ItemWeaponPF>} actionUse
 * @param {ConditionalPartsResults} result
 * @param {object} atk - The attack used.
 * @param {number} index - The index of the attack, in order of enabled attacks.
 */
function getConditionalParts(actionUse, result, atk, index) {
    const { actor, shared } = actionUse;
    if (index !== 0 || !actor || !shared) {
        return;
    }

    const hasFocus = () => hasAnyBFlag(actor, furiousFocus);
    const penalty = shared.rollData.powerAttackPenalty || 0;
    const hasUsed = hasUsedFF(actor);
    if (shared.powerAttack && hasFocus() && penalty && !hasUsed) {
        result['attack.normal'].push(`${penalty * -1}[${label()}]`);
        setUsedFF(actor);
    }
}
Hooks.on(customGlobalHooks.getConditionalParts, getConditionalParts);

/**
 * @param {ChatAttack} chatAttack
 */
async function addEffectNotes(chatAttack) {
    const { attack, effectNotes } = chatAttack;
    if (attack?.terms.some((x) => x.options?.flavor === label())) {
        effectNotes.push(label());
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackEffectNotes, addEffectNotes);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.system.flags.boolean?.hasOwnProperty(furiousFocus);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? '';
        const sourceId = item?.flags.core?.sourceId ?? '';
        if (name === Settings.furiousFocus || sourceId.includes(compendiumId)) {
            item.update({ [`system.flags.boolean.${furiousFocus}`]: true });
        }
        return;
    }

    showEnabledLabel({
        journal,
        key: furiousFocus,
        item,
        parent: html,
    }, {
        canEdit: isEditable,
    });
});

/** @param {ActorPF} actor */
const hasUsedFF = (actor) => isActorInCombat(actor) && actor.getFlag(MODULE_NAME, furiousFocusTimestamp) === game.time.worldTime;
/** @param {ActorPF} actor */
const setUsedFF = (actor) => isActorInCombat(actor)
    ? actor.setFlag(MODULE_NAME, furiousFocusTimestamp, game.time.worldTime)
    : actor.setFlag(MODULE_NAME, furiousFocusTimestamp, null);
