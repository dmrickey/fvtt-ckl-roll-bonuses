import { MODULE_NAME } from '../../consts.mjs';
import { textInputAndKeyValueSelect } from "../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { intersection } from "../../util/array-intersects.mjs";
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { getActionDamageTypes } from '../../util/get-damage-types.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { uniqueArray } from '../../util/unique-array.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';

const damageElements = /** @type {const} */ ([
    'acid',
    'cold',
    'electric',
    'fire'
]);

class BaseElemental extends SpecificBonus {
    static get formulaKey() { return `${this.key}-formula`; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} formula
     * @param {typeof damageElements[number]} element
     * @returns {Promise<void>}
     */
    static async configure(item, formula, element) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: element,
                    [this.formulaKey]: formula + '',
                },
            },
        });
    }

    /** @inheritdoc @override @returns {JustRender} */
    static get configuration() {
        return {
            type: 'just-render',
            showInputsFunc: (item, html, isEditable) => {
                const current = item.getFlag(MODULE_NAME, this.key);
                const choices = damageElements
                    .map(element => ({ key: element, label: pf1.registry.damageTypes.get(element)?.name || element }));
                const currentText = item.getFlag(MODULE_NAME, this.formulaKey) || '';

                textInputAndKeyValueSelect({
                    item,
                    journal: this.journal,
                    parent: html,
                    select: { current, choices, key: this.key },
                    text: { current: currentText, key: this.formulaKey },
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}

export class ElementalCl extends BaseElemental {
    /** @inheritdoc @override */
    static get sourceKey() { return 'elemental-cl'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#modify-elemental-spell-caster-level'; }

    /** @returns {'cl'} */
    static get rollVariableProp() { return 'cl'; }
    static get partial() { return 'cl'; }
}

export class ElementalDc extends BaseElemental {
    /** @inheritdoc @override */
    static get sourceKey() { return 'elemental-dc'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#modify-elemental-spell-dc'; }

    /** @returns {'dcBonus'} */
    static get rollVariableProp() { return 'dcBonus'; }
    static get partial() { return 'dc'; }
}

/**
 * @param {ItemSpellPF} item
 * @returns {string[]}
 */
const getSpellDescriptors = (item) =>
    uniqueArray([...(item?.system.descriptors?.total ?? [])].flatMap((c) =>
        c?.split(/,|\bor\b/).map((type) => {
            /** @type {string} */
            let typeString = type.trim();
            if (typeString.includes("see text")) return "see text";
            // @ts-ignore
            if (typeString.startsWith("or")) typeString = typeString.replace("or").trim();
            return typeString;
        })
    ));

/**
 * @param {typeof ElementalCl | typeof ElementalDc} bonus
 */
export function createElementalClOrDc(bonus) {
    FormulaCacheHelper.registerModuleFlag(bonus.formulaKey);

    /**
     * @param {ItemPF} item
     * @param {ItemAction?} action
     * @returns {undefined | { offset: number, elements: string[]}}
     */
    function getBonusesForItem(
        item,
        action = null,
    ) {
        if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
            return;
        }

        const { actor } = item;
        if (!actor) {
            return;
        }

        action ||= item?.defaultAction;
        if (!action) {
            return;
        }

        const damageTypes = getActionDamageTypes(action);
        const types = getSpellDescriptors(item);
        const domains = Object.keys(item.learnedAt?.domain || []).map((x) => x.toLowerCase());

        const comparators = damageElements.flatMap((element) => [element, pf1.registry.damageTypes.get(element)?.name?.toLowerCase() || element]);
        const toFind = intersection([...damageTypes, ...types, ...domains], comparators);

        const matches = getCachedBonuses(actor, bonus.key)
            .filter((x) => toFind.includes(x.getFlag(MODULE_NAME, bonus.key)));
        const offset = matches
            .reduce((acc, item) => acc + FormulaCacheHelper.getModuleFlagValue(item, bonus.formulaKey), 0);
        if (offset) {
            const elements = matches
                .map((item) => item.getFlag(MODULE_NAME, bonus.key))
                .map((value) => pf1.registry.damageTypes.get(`${value}`)?.name ?? value);
            return { offset, elements };
        }
    }

    // add info to chat card
    Hooks.on(customGlobalHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ rollData,
    ) => {
        const actionId = rollData.action?._id;
        if (!actionId
            || !(item instanceof pf1.documents.item.ItemSpellPF)
        ) {
            return;
        }

        const action = item.actions.get(actionId);
        if (!action) {
            return;
        }

        const found = getBonusesForItem(item, action);

        if (found?.offset) {
            props.push(localize(`${bonus.partial}-label-mod`, { mod: signed(found.offset), label: found.elements.join(', ') }));
        }
    });

    // register hint on affected spell
    registerItemHint((hintcls, _actor, item, _data) => {
        if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
            return;
        }

        const found = getBonusesForItem(item);

        if (found?.offset) {
            const label = localize(`${bonus.partial}-label-mod`, { mod: signed(found.offset), label: found.elements.join(', ') });
            const hint = hintcls.create(label, [], { hint: localizeBonusLabel(bonus.key) });
            return hint;
        }
    });

    // register hint on source
    registerItemHint((hintcls, _actor, item, _data) => {
        const has = item.hasItemBooleanFlag(bonus.key);
        if (!has) {
            return;
        }

        const currentElement = item.getFlag(MODULE_NAME, bonus.key);
        if (!currentElement) {
            return;
        }

        const total = FormulaCacheHelper.getModuleFlagValue(item, bonus.formulaKey);
        if (!total) {
            return;
        }

        const mod = signed(total);
        const element = pf1.registry.damageTypes.get(`${currentElement}`)?.name ?? currentElement;
        const label = localize(`${bonus.partial}-label-mod`, { mod, label: element });

        const hint = hintcls.create(label, [], { hint: bonus.label });
        return hint;
    });

    Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
    ) => {
        if (!(action instanceof pf1.components.ItemAction)) {
            return;
        }

        const item = action?.item;
        if (!(item instanceof pf1.documents.item.ItemSpellPF) || item?.type !== 'spell' || !rollData) {
            return;
        }

        const found = getBonusesForItem(item, action);
        if (found?.offset) {
            rollData[bonus.rollVariableProp] = (rollData[bonus.rollVariableProp] || 0) + found.offset;
        }
    });

    if (bonus.partial === 'cl') {
        /**
         * @param {ActorPF} actor
         * @param {{messageId?: string, parts?: string[]}} rollOptions
         * @param {string} bookId
         */
        const onActorRollCL = (actor, rollOptions, bookId) => {
            if (!rollOptions.messageId || !rollOptions.parts?.length) return;

            const action = game.messages.get(rollOptions.messageId)?.actionSource;
            if (!action) return;

            const found = getBonusesForItem(action.item, action);

            if (found?.offset) {
                const label = localize(`${bonus.partial}-label`, { label: found.elements.join(', ') });
                rollOptions.parts?.push(`${found.offset}[${label}]`);
            }
        };
        Hooks.on('pf1PreActorRollCl', onActorRollCL);
    }
}
