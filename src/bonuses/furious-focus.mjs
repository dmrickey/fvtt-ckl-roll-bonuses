import { MODULE_NAME } from '../consts.mjs';
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { itemHasCompendiumId } from '../util/has-compendium-id.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../util/hooks.mjs';
import { isActorInCombat } from '../util/is-actor-in-combat.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const furiousFocus = 'furious-focus';
const furiousFocusTimestamp = 'furious-focus-timestamp';
const compendiumId = 'UcEIgufLJlIfhHmu';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#furious-focus';

SpecificBonuses.registerSpecificBonus({ journal, key: furiousFocus, });

class Settings {
    static get furiousFocus() { return LanguageSettings.getTranslation(furiousFocus); }

    static {
        LanguageSettings.registerItemNameTranslation(furiousFocus);
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(furiousFocus);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(furiousFocus), icon: 'fas fa-burst' });
    return hint;
});

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

    const hasFocus = actor.hasItemBooleanFlag(furiousFocus);
    const penalty = shared.rollData.powerAttackPenalty || 0;
    const hasUsed = hasUsedFF(actor);
    if (shared.powerAttack && hasFocus && penalty && !hasUsed) {
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

    const hasFlag = item.hasItemBooleanFlag(furiousFocus);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.furiousFocus || hasCompendiumId)) {
            item.addItemBooleanFlag(furiousFocus);
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
        inputType: 'specific-bonus',
    });
});

/** @param {ActorPF} actor */
const hasUsedFF = (actor) => isActorInCombat(actor) && actor.getFlag(MODULE_NAME, furiousFocusTimestamp) === game.time.worldTime;
/** @param {ActorPF} actor */
const setUsedFF = (actor) => isActorInCombat(actor)
    ? actor.setFlag(MODULE_NAME, furiousFocusTimestamp, game.time.worldTime)
    : actor.setFlag(MODULE_NAME, furiousFocusTimestamp, null);

/**
 * @param {ItemPF} item
 * @param {object} data
 * @param {{temporary: boolean}} param2
 * @param {string} id
 */
const onCreate = (item, data, { temporary }, id) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;
    if (temporary) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
    const hasBonus = item.hasItemBooleanFlag(furiousFocus);

    if ((name === Settings.furiousFocus || hasCompendiumId) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${furiousFocus}`]: true,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
