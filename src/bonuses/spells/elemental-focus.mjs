import { MODULE_NAME } from '../../consts.mjs';
import { keyValueSelect } from "../../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { api } from '../../util/api.mjs';
import { intersects } from "../../util/array-intersects.mjs";
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { getActionDamageTypes } from '../../util/get-damage-types.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from '../../util/unique-array.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';

class BaseFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#elemental-focus'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {typeof damageElements[number]} element
     * @returns {Promise<void>}
     */
    static async configure(item, element) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: element,
                },
            },
        });
    }
}

export class ElementalFocus extends BaseFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'elemental-focus'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: '1frgqDSnQFiTq0MC',
            ignoreFunc: (item) => item.type !== 'feat' || item.subType !== 'feat',
            isItemMatchFunc: (name) => name === Settings.elementalFocus,
            showInputsFunc: (item, html, isEditable) => {
                const elements = Object.fromEntries(damageElements.map(k => [k, pf1.registry.damageTypes.get(k)]));
                const choices = Object.keys(elements).map((key) => ({ key, label: elements[key]?.name ?? '' }));

                keyValueSelect({
                    choices,
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
                defaultFlagValuesFunc: () => ({ [this.key]: damageElements[0] }),
            }
        };
    }
}
export class ElementalFocusGreater extends BaseFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'elemental-focus-greater'; }

    /** @inheritdoc @override */
    static get parent() { return ElementalFocus.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'l4yE4RGFbORuDfp7',
            isItemMatchFunc: (name) => name.includes(Settings.elementalFocus) && name.includes(LanguageSettings.greater),
            showInputsFunc: (item, html, isEditable) => {
                /** @type {{key: string, label: string}[]} */
                let choices = [];
                const actor = item.actor;
                if (isEditable && actor) {
                    /** @type {{ [k: string]: DamageType | undefined }} */
                    const elements = {};
                    const existingElementalFocuses = getFocusedElements(actor, ElementalFocus.key);
                    existingElementalFocuses.forEach((focus) => {
                        elements[focus] = pf1.registry.damageTypes.get(focus);
                    });
                    choices = Object.keys(elements).map((key) => ({ key, label: elements[key]?.name ?? '' }));
                }

                keyValueSelect({
                    choices,
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
                defaultFlagValuesFunc: (item) => ({ [this.key]: item.actor && getFocusedElements(item.actor, ElementalFocus.key)[0] || damageElements[0] }),
            }
        };
    }
}
export class ElementalFocusMythic extends BaseFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'elemental-focus-mythic'; }

    /** @inheritdoc @override */
    static get parent() { return ElementalFocus.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'yelJyBhjWtiIMgci',
            isItemMatchFunc: (name) => name.includes(Settings.elementalFocus) && name.includes(LanguageSettings.mythic),
            showInputsFunc: (item, html, isEditable) => {
                /** @type {{key: string, label: string}[]} */
                let choices = [];
                const actor = item.actor;
                if (isEditable && actor) {
                    /** @type {{ [k: string]: DamageType | undefined }} */
                    const elements = {};
                    const existingElementalFocuses = getFocusedElements(actor, ElementalFocus.key);
                    existingElementalFocuses.forEach((focus) => {
                        elements[focus] = pf1.registry.damageTypes.get(focus);
                    });
                    choices = Object.keys(elements).map((key) => ({ key, label: elements[key]?.name ?? '' }));
                }

                keyValueSelect({
                    choices,
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
                defaultFlagValuesFunc: (item) => ({ [this.key]: item.actor && getFocusedElements(item.actor, ElementalFocus.key)[0] || damageElements[0] }),
            }
        };
    }
}

const allKeys = [ElementalFocus.key, ElementalFocusGreater.key, ElementalFocusMythic.key];

{
    const icons = {
        acid: { icon: 'ra ra-droplet', css: 'ckl-acid-green' },
        cold: { icon: 'far fa-snowflake', css: 'ckl-cold-blue' },
        electric: { icon: 'fas fa-bolt-lightning', css: 'ckl-electric-yellow' },
        fire: { icon: 'fas fa-fire-flame-curved', css: 'ckl-fire-red' },
    };

    const damageElements = /** @type {const} */ ([
        'acid',
        'cold',
        'electric',
        'fire'
    ]);

    api.config.elementalFocus.damageElements = damageElements;
    api.config.elementalFocus.icons = icons;
}

const damageElements = api.config.elementalFocus.damageElements;
const icons = api.config.elementalFocus.icons;

class Settings {
    static get elementalFocus() { return LanguageSettings.getTranslation(ElementalFocus.key); }

    static {
        LanguageSettings.registerItemNameTranslation(ElementalFocus.key);
    }
}

/**
 * @param { ActorPF } actor
 * @param { string } key
 * @returns {damageElements[number][]}
 */
const getFocusedElements = (actor, key) =>
    uniqueArray(getCachedBonuses(actor, key)
        .filter(x => x.hasItemBooleanFlag(key))
        .flatMap(x => x.getFlag(MODULE_NAME, key))
        .filter(truthiness)
    );

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
    if (!action) return;

    const bonus = getDcBonus(action);
    if (bonus) {
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localizeBonusLabel(ElementalFocus.key) }));
    }
});

// register on focused spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF) || !actor) {
        return;
    }

    const action = item.defaultAction;
    if (!action) {
        return;
    }

    const damageTypes = getActionDamageTypes(action);

    const  /** @type {Hint[]} */ hints = [];
    damageTypes.forEach((damageType) => {
        const isFocused = intersects(damageType, getFocusedElements(actor, ElementalFocus.key));
        if (!isFocused) { return; }

        const isGreater = intersects(damageType, getFocusedElements(actor, ElementalFocusGreater.key));
        const isMythic = intersects(damageType, getFocusedElements(actor, ElementalFocusMythic.key));
        const bonus = (1 + Number(isGreater)) * (Number(isMythic) + 1);

        const focuses = [ElementalFocus.key];
        if (isGreater) focuses.push(ElementalFocusGreater.key);
        if (isMythic) focuses.push(ElementalFocusMythic.key);

        // @ts-ignore
        const match = icons[damageType];
        const tooltip = focuses.map((f) => localizeBonusLabel(f)).join('\n') + `\n${localize('dc-mod', { mod: signed(bonus) })}`;
        const hint = hintcls.create('', [match.css], { icon: match.icon, hint: tooltip });
        hints.push(hint);
    });
    return hints;
});

// register on granting ability
registerItemHint((hintcls, _actor, item, _data) => {
    const key = allKeys.find((k) => !!item.hasItemBooleanFlag(k));
    if (!key) {
        return;
    }

    /** @type {damageElements[number]} */
    const currentElement = item.getFlag(MODULE_NAME, key);
    if (!currentElement) {
        return;
    }

    const match = icons[currentElement];
    const label = pf1.registry.damageTypes.get(`${currentElement}`) ?? { name: currentElement };

    const hint = match
        ? hintcls.create('', [match.css], { hint: `${localizeBonusTooltip(key)} (${label.name})`, icon: match.icon })
        : hintcls.create(label.name, [], { hint: localizeBonusTooltip(key) });
    return hint;
});

/**
 * @param {ItemAction} action
 * @returns {number}
 */
function getDcBonus(action) {
    const { item, actor } = action;
    if (item?.type !== 'spell' || !actor) {
        return 0;
    }

    const damageTypes = getActionDamageTypes(action);

    const mythicFocuses = getFocusedElements(actor, ElementalFocusMythic.key);
    const hasMythicFocus = intersects(damageTypes, mythicFocuses);

    let bonus = 0;
    const handleFocus = (/** @type { string } */ key) => {
        const focuses = getFocusedElements(actor, key);
        const hasFocus = intersects(damageTypes, focuses);
        if (hasFocus) {
            bonus += 1;

            if (hasMythicFocus) {
                bonus += 1;
            }
        }
    }

    handleFocus(ElementalFocus.key);
    handleFocus(ElementalFocusGreater.key);

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
