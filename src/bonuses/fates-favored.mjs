import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

export class FatesFavored extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'fates-favored'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#fates-favored'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'Cvgd7Dehxxj6Muup',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                showEnabledLabel({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(FatesFavored.key); }

    static {
        LanguageSettings.registerItemNameTranslation(FatesFavored.key);
    }
}

/**
 * @param {Formula} value
 * @param {BonusTypes} type
 * @param {Nullable<ActorPF>} actor
 * @returns {Formula}
 */
function patchChangeValue(value, type, actor) {
    value = type === 'luck' && actor?.hasItemBooleanFlag(FatesFavored.key)
        ? isNaN(+value) ? `${value} + 1` : (+value + 1)
        : value;
    return value;
}
LocalHookHandler.registerHandler(localHooks.patchChangeValue, patchChangeValue);

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(FatesFavored.key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', ['ckl-lucky-horseshoe'], { hint: localizeBonusTooltip(FatesFavored.key), icon: 'ra ra-horseshoe' });
    return hint;
});

/**
 * Increase luck source modifier by 1 for tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    if (!item.hasItemBooleanFlag(FatesFavored.key)) return sources;

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

            fatesFavoredSource = { name: localizeBonusLabel(FatesFavored.key), modifier: 'luck', sort: source.sort + 1, value: 1 };
        }
    });

    if (fatesFavoredSource) {
        sources.push(fatesFavoredSource);
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(customGlobalHooks.itemGetAttackSources, getAttackSources);
