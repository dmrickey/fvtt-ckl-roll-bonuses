import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { itemHasCompendiumId } from '../util/has-compendium-id.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonuses } from './_all-specific-bonuses.mjs';

const fatesFavored = 'fates-favored';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#fates-favored';
const compendiumId = 'Cvgd7Dehxxj6Muup';

SpecificBonuses.registerSpecificBonus({ journal, key: fatesFavored });

class Settings {
    static get fatesFavored() { return LanguageSettings.getTranslation(fatesFavored); }

    static {
        LanguageSettings.registerItemNameTranslation(fatesFavored);
    }
}

/**
 * @param {number | string} value
 * @param {BonusTypes} type
 * @param {Nullable<ActorPF>} actor
 * @returns {number | string}
 */
function patchChangeValue(value, type, actor) {
    value = type === 'luck' && actor?.hasItemBooleanFlag(fatesFavored)
        ? isNaN(+value) ? `${value} + 1` : (+value + 1)
        : value;
    return value;
}
LocalHookHandler.registerHandler(localHooks.patchChangeValue, patchChangeValue);

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(fatesFavored);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', ['ckl-lucky-horseshoe'], { hint: localizeBonusTooltip(fatesFavored), icon: 'ra ra-horseshoe' });
    return hint;
});

/**
 * Increase luck source modifier by 1 for tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    if (!item.hasItemBooleanFlag(fatesFavored)) return sources;

    let /** @type {ModifierSource?} */ fatesFavoredSource = null;
    sources.forEach((source) => {
        if (source.modifier === 'luck') {
            const value = source.value;
            if (isNaN(+value) && `${value}`.endsWith(' + 1')) {
                source.value = `${source.value}`.slice(0, -4);
            }
            else if (!isNaN(+value)) {
                source.value = +value - 1;
            }

            fatesFavoredSource = { name: localizeBonusLabel(fatesFavored), modifier: 'luck', sort: source.sort + 1, value: 1 };
        }
    });

    if (fatesFavoredSource) {
        sources.push(fatesFavoredSource);
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(customGlobalHooks.itemGetAttackSources, getAttackSources);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);

    const hasFlag = item.hasItemBooleanFlag(fatesFavored);
    if (!hasFlag) {
        if (isEditable && (name === Settings.fatesFavored || hasCompendiumId)) {
            item.addItemBooleanFlag(fatesFavored);
        }
        return;
    }

    showEnabledLabel({
        item,
        journal,
        key: fatesFavored,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

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
    const hasBonus = item.hasItemBooleanFlag(fatesFavored);

    if ((name === Settings.fatesFavored || hasCompendiumId) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${fatesFavored}`]: true,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
