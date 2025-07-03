import { MODULE_NAME } from '../../consts.mjs';
import { keyValueSelect } from "../../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from '../../util/array-intersects.mjs';
import { getIdsFromActor } from '../../util/get-id-array-from-flag.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { SpecificBonus } from '../_specific-bonus.mjs';

class BaseSpellFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#spell-focus'; }

    /**
     * @param { ActorPF } actor
     * @returns {string[]}
     */
    static getFocusedSchools(actor) {
        return getIdsFromActor(actor, this.key);
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {SpellSchool} school
     * @returns {Promise<void>}
     */
    static async configure(item, school) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: school, } },
        });
    }
}

export class SpellFocus extends BaseSpellFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'spell-focus'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'V2zY7BltkpSXwejy',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                const { spellSchools } = pf1.config;
                const current = item.getFlag(MODULE_NAME, this.key);
                const choices = Object.entries(spellSchools)
                    .map(([key, label]) => ({ key, label }));

                keyValueSelect({
                    choices,
                    current,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const school = item.actor?.itemTypes.spell[0]?.system.school || Object.keys(pf1.config.spellSchools)[0];
                    return { [this.key]: school, };
                }
            }
        };
    }
}
export class SpellFocusGreater extends BaseSpellFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'spell-focus-greater'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'LSykiaxYWzva2boF',
            isItemMatchFunc: (name) => name.includes(Settings.name) && name.includes(LanguageSettings.greater),
            showInputsFunc: (item, html, isEditable) => {
                const baseFocused = item.actor ? SpellFocus.getFocusedSchools(item.actor) : [];
                const { spellSchools } = pf1.config;
                const current = item.getFlag(MODULE_NAME, this.key);
                const choices = Object.entries(spellSchools)
                    .filter(([key]) => baseFocused.includes(key))
                    .map(([key, label]) => ({ key, label }));

                keyValueSelect({
                    choices,
                    current,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const school = item.actor && SpellFocus.getFocusedSchools(item.actor)[0];
                    return { [this.key]: school };
                }
            },
        };
    }

    /** @inheritdoc @override */
    static get parent() { return SpellFocus.key; }
}
export class SpellFocusMythic extends BaseSpellFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'spell-focus-mythic'; }

    /** @inheritdoc @override */
    static get parent() { return SpellFocus.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'TOMEhAeZsgGHrSH6',
            isItemMatchFunc: (name) => name.includes(Settings.name) && name.includes(LanguageSettings.mythic),
            showInputsFunc: (item, html, isEditable) => {
                const baseFocused = item.actor ? SpellFocus.getFocusedSchools(item.actor) : [];
                const { spellSchools } = pf1.config;
                const current = item.getFlag(MODULE_NAME, this.key);
                const choices = Object.entries(spellSchools)
                    .filter(([key]) => baseFocused.includes(key))
                    .map(([key, label]) => ({ key, label }));

                keyValueSelect({
                    choices,
                    current,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const school = item.actor && SpellFocus.getFocusedSchools(item.actor)[0];
                    return { [this.key]: school };
                }
            },
        };
    }
}

const allKeys = [SpellFocus.key, SpellFocusGreater.key, SpellFocusMythic.key];

class Settings {
    static get name() { return LanguageSettings.getTranslation(SpellFocus.key); }

    static {
        LanguageSettings.registerItemNameTranslation(SpellFocus.key);
    }
}

// add Info to chat card
Hooks.on(customGlobalHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    const action = item.defaultAction;
    if (!action) {
        return;
    }

    const isFocused = intersects(item.system.school, SpellFocus.getFocusedSchools(actor));
    const isGreater = intersects(item.system.school, SpellFocusGreater.getFocusedSchools(actor));
    const isMythic = intersects(item.system.school, SpellFocusMythic.getFocusedSchools(actor));

    if (isFocused || isGreater || isMythic) {
        let bonus = 0;
        if (isFocused) bonus += 1;
        if (isGreater) bonus += 1;
        if (isMythic) bonus *= 2;
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localizeBonusLabel(SpellFocus.key) }));
    }
});

// register hint on focused spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF) || !actor) {
        return;
    }

    const isFocused = intersects(item.system.school, SpellFocus.getFocusedSchools(actor));
    const isGreater = intersects(item.system.school, SpellFocusGreater.getFocusedSchools(actor));
    const isMythic = intersects(item.system.school, SpellFocusMythic.getFocusedSchools(actor));

    if (isFocused || isGreater || isMythic) {
        const tips = []
        let bonus = 0;
        if (isFocused) {
            tips.push(SpellFocus.label);
            bonus += 1;
        }
        if (isGreater) {
            tips.push(SpellFocusGreater.label);
            bonus += 1;
        }
        if (isMythic) {
            tips.push(SpellFocusMythic.label);
            bonus *= 2;
        }
        tips.push(localize('dc-mod', { mod: signed(bonus) }));
        return hintcls.create('', [], { icon: 'fas fa-book', hint: tips.join('\n') });
    }
});

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const key = allKeys.find((k) => !!item.hasItemBooleanFlag(k));
    if (!key) {
        return;
    }

    const currentSchool = /** @type {SpellSchool} */ (item.getFlag(MODULE_NAME, key));
    if (!currentSchool) {
        return;
    }

    const label = pf1.config.spellSchools[currentSchool] ?? currentSchool;

    const hint = hintcls.create(label, [], { hint: localizeBonusTooltip(key) });
    return hint;
});

/**
 * @param {ItemAction} action
 * @returns {number}
 */
function getDcBonus(action) {
    if (!(action instanceof pf1.components.ItemAction)) {
        return 0;
    }

    const { actor, item } = action;
    if (!actor || !(item instanceof pf1.documents.item.ItemSpellPF)) {
        return 0;
    }

    const hasMythicFocus = intersects(item.system.school, SpellFocusMythic.getFocusedSchools(actor));

    let bonus = 0;
    const handleFocus = ( /** @type {typeof SpellFocus | typeof SpellFocusGreater} */ specific) => {
        const hasFocus = intersects(item.system.school, specific.getFocusedSchools(actor));
        if (hasFocus) {
            bonus += 1;

            if (hasMythicFocus) {
                bonus += 1;
            }
        }
    }

    handleFocus(SpellFocus);
    handleFocus(SpellFocusGreater);

    return bonus;
}

Hooks.on('pf1GetRollData', (
        /** @type {ItemAction} */ action,
        /** @type {RollData} */ rollData
) => {
    const bonus = getDcBonus(action);
    rollData.dcBonus ||= 0;
    rollData.dcBonus += bonus;
});
