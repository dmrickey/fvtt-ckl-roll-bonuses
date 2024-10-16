import { MODULE_NAME } from "../../../consts.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { api } from '../../../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';

/** @returns {ItemConditionalModifierData['targets']} */
function getConditionalTargets() {
    /** @type {ItemConditionalModifierData['targets']} */
    const result = {
        attack: pf1.config.conditionalTargets.attack._label,
        damage: pf1.config.conditionalTargets.damage._label,
        size: pf1.config.conditionalTargets.size._label,
        effect: pf1.config.conditionalTargets.effect._label,
    };

    // Only add Misc target if subTargets are available
    if (Object.keys(getConditionalSubTargets("misc")).length) {
        result.misc = game.i18n.localize(pf1.config.conditionalTargets.misc._label);
    }
    return result;
}

/**
 * Generates lists of conditional subtargets this attack can have.
 *
 * @param {keyof typeof pf1.config.conditionalTargets} target - The target key, as defined in PF1.conditionTargets.
 * @returns {{[key: string]: string}} A list of conditionals
 */
function getConditionalSubTargets(target) {
    /** @type {{[key: string]: string}} */
    const result = {};
    // Add static targets
    if (hasProperty(pf1.config.conditionalTargets, target)) {
        for (const [k, v] of Object.entries(pf1.config.conditionalTargets[target])) {
            if (!k.startsWith("_") && !k.startsWith("~")) result[k] = v;
        }
    }
    // Add subtargets depending on attacks
    if (["attack", "damage"].includes(target)) {
        // Add specific attacks
        result["attack_0"] = `${game.i18n.localize("PF1.Attack")} 1`;
        // for (const [k, v] of Object.entries(this.data.attackParts)) {
        //   result[`attack_${Number(k) + 1}`] = v[1];
        // }
    }
    // Add subtargets affecting effects
    if (target === "effect") {
        result["dc"] = game.i18n.localize("PF1.DC");
        result["cl"] = game.i18n.localize("PF1.CasterLevelAbbr");
    }
    // Add misc subtargets
    if (target === "misc") {
        // Add charges subTarget with specific label
        result["charges"] = game.i18n.localize("PF1.ChargeCost");
    }
    return result;
}

/**
 * Generates lists of conditional modifier bonus types applicable to a formula.
 * @param {string} target - The target key as defined in PF1.conditionTargets.
 * @returns {{[key: string]: string}} A list of bonus types.
 */
function getConditionalModifierTypes(target) {
    /** @type {{[key: string]: string}} */
    const result = {};
    if (target === "attack" || target === "damage") {
        // Add bonusTypes from pf1.config.bonusTypes
        for (const [k, v] of Object.entries(pf1.config.bonusTypes)) {
            result[k] = v;
        }
    }
    if (target === "damage") {
        for (const damageType of pf1.registry.damageTypes) {
            result[damageType.id] = damageType.name;
        }
    }
    return result;
}

/**
 * Generates a list of critical applications for a given formula target.
 * @param {string} target - The target key as defined in PF1.conditionalTargets.
 * @returns {{[key: string]: string}} A list of critical applications.
 */
function getConditionalCritical(target) {
    /** @type {{[key: string]: string}} */
    let result = {};
    // Attack bonuses can only apply as critical confirm bonus
    if (target === "attack") {
        result = { ...result, normal: "PF1.Normal", crit: "PF1.CriticalConfirmBonus" };
    }
    // Damage bonuses can be multiplied or not
    if (target === "damage") {
        result = {
            ...result,
            normal: "PF1.Normal",
            crit: "PF1.OnCritBonusFormula", // TODO
            nonCrit: "PF1.NonMultBonusFormula", // TODO
        };
    }
    return result;
}

/**
 * @param {ItemPF} item
 * @param {string} key
 * @returns
 */
function createId(item, key) {
    return `${item.id}-${key}`;
}

/**
 * @param {ItemPF} item
 * @param {string} key
 * @return {ItemConditional[]}
 */
export const loadConditionals = (item, key) => {
    /** @type {ItemConditionalData[]} */
    const flags = item.getFlag(MODULE_NAME, key) || [];
    const conditionals = flags.map((d) => new pf1.components.ItemConditional(d));
    return conditionals;
}

/**
 * Roll Bonus wrapper around system's Conditionals input
 *
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} args.journal
 * @param {HTMLElement} args.parentElement
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function modifiersInput({
    item,
    key,
    journal,
    parentElement,
    label = '',
    tooltip = '',
}, {
    canEdit,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    /** @type {ItemConditional[]} */
    let conditionals = loadConditionals(item, key);
    // Prepare stuff for actions with conditionals

    const createConditionalTemplateData = () => {
        /** @type {ItemConditionalData[]} */
        const conditionalData = deepClone(conditionals.map((c) => c.data));
        for (const conditional of conditionalData) {
            for (const modifier of conditional.modifiers) {
                modifier.targets = getConditionalTargets();
                modifier.subTargets = getConditionalSubTargets(modifier.target);
                modifier.conditionalModifierTypes = getConditionalModifierTypes(modifier.target);
                modifier.conditionalCritical = getConditionalCritical(modifier.target);
            }
        }
        return conditionalData;
    }

    const templateData = {
        label,
        journal,
        tooltip,
        damageTypes: pf1.registry.damageTypes.toObject(),
        data: {
            conditionals: createConditionalTemplateData(),
        }
    };

    const div = createTemplate(templates.conditionalsInput, templateData);
    // div.classList.add('pf1', 'sheet', 'action');
    div.setAttribute('id', createId(item, key));

    // todo make sure "defaults" are saved when swapping to a new 'type'
    setTimeout(() => {
        const conditionalInput = document.querySelector(`#${createId(item, key)}`);
        // @ts-ignore
        const jq = $(conditionalInput);
        // jq.find('.conditional.flexrow')?.hide();
        jq.find('.conditional-header')?.hide();
    });

    async function updateItem() {
        const sanitized = conditionals.map((c) => c.data);
        // debugger;
        // await item.unsetFlag(MODULE_NAME, key);
        await item.setFlag(MODULE_NAME, key, sanitized);
        // can't do this without rehooking up bindings and adding
        // await item.update({ flags: { [MODULE_NAME]: { [key]: sanitized } } }, { render: false });
    }

    // remove system's name property so it doesn't save automatically
    const named = div.querySelectorAll('[name]');
    named.forEach((elem) => elem.removeAttribute('name'));

    div.querySelectorAll('.conditional-default').forEach((element) => {
        element.addEventListener('change', async (event) => {
            const a = event.currentTarget;

            if (!a || !(a instanceof Element)) return;

            /** @type {HTMLDataListElement | null} */
            let li;

            // handle default toggle
            if (a.classList.contains('conditional-default')) {
                li = a.closest(".conditional");
                if (!(li instanceof Element)) return;
                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;

                const checkbox = /** @type {HTMLInputElement} */ (a);
                conditional.data.default = checkbox.checked;
                await updateItem();
            }
        });
    });

    div.querySelectorAll('.conditional-control').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            const a = event.currentTarget;

            if (!a || !(a instanceof Element)) return;

            // Add new conditional
            if (a.classList.contains("add-conditional")) {
                conditionals.push(new pf1.components.ItemConditional(pf1.components.ItemConditional.defaultData));
                await updateItem();
            }

            /** @type {HTMLDataListElement | null} */
            let li;

            // Remove a conditional
            if (a.classList.contains("delete-conditional")) {
                li = a.closest(".conditional");
                if (!(li instanceof Element)) return;
                conditionals = conditionals.filter((c) => c.id !== li?.dataset.conditional);
                await updateItem();
            }

            // Add a new conditional modifier
            if (a.classList.contains("add-conditional-modifier")) {
                li = a.closest(".conditional");
                if (!(li instanceof Element)) return;
                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);

                const modifier = new pf1.components.ItemConditionalModifier(pf1.components.ItemConditionalModifier.defaultData);
                conditional?.data.modifiers.push(modifier.data);
                await updateItem();
            }

            // Remove a conditional modifier
            if (a.classList.contains("delete-conditional-modifier")) {
                li = a.closest(".conditional-modifier");
                if (!(li instanceof Element)) return;
                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;
                conditional.data.modifiers = conditional.data.modifiers.filter((m) => m._id !== li?.dataset.modifier);
                await updateItem();
            }
        });
    });

    /** @type {{ [key in ItemConditionalModifierData['target']]: { subTarget: ItemConditionalModifierData['subTarget'], critical: ItemConditionalModifierData['critical'], damageType: ItemConditionalModifierData['damageType'], type: ItemConditionalModifierData['type'],} }} */
    const modDefaults = {
        attack: { subTarget: 'allAttack', critical: 'normal', damageType: undefined, type: 'untyped', },
        damage: { subTarget: 'allDamage', critical: 'normal', damageType: pf1.components.ItemAction.defaultDamageType, type: 'untyped', },
        effect: { subTarget: 'dc', critical: undefined, damageType: undefined, type: undefined, },
        misc: { subTarget: 'charges', critical: undefined, damageType: undefined, type: undefined, },
        size: { subTarget: undefined, critical: undefined, damageType: undefined, type: undefined, },
    };

    div.querySelectorAll('.conditionals select').forEach((element) => {
        if (!element) return;

        /**
        * @type {HTMLSelectElement} - the target of the event
         */
        element.addEventListener(
            'change',
            async (event) => {
                const a = event.currentTarget;

                if (!a || !(a instanceof Element)) return;

                /** @type {HTMLDataListElement | null} */
                const li = a.closest(".conditional-modifier");

                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;
                const modifier = conditional.data.modifiers.find((m) => m._id === li?.dataset.modifier);
                if (!modifier) return;

                // @ts-ignore
                const /** @type {ItemConditionalModifierData['target']} */ value = event.target?.value || 'attack';

                if (element.classList.contains('conditional-target')) {
                    modifier.subTarget = modDefaults[value].subTarget;
                    modifier.critical = modDefaults[value].critical;
                    modifier.damageType = modDefaults[value].damageType;
                    modifier.type = modDefaults[value].type;
                    modifier.target = value;
                }
                else if (element.classList.contains('conditional-sub-target')) {
                    // @ts-ignore
                    modifier.subTarget = value;
                }
                else if (element.classList.contains('conditional-critical')) {
                    // @ts-ignore
                    modifier.critical = value;
                }
                else if (element.classList.contains('conditional-type')) {
                    // @ts-ignore
                    modifier.type = value;
                }

                await updateItem();
            },
        );
    });

    div.querySelectorAll('input.conditional-formula').forEach((element) => {
        if (!element) return;

        /**
        * @type {HTMLSelectElement} - the target of the event
         */
        element.addEventListener(
            'change',
            async (event) => {
                const a = event.currentTarget;

                if (!a || !(a instanceof Element)) return;

                /** @type {HTMLDataListElement | null} */
                const li = a.closest(".conditional-modifier");

                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;
                const modifier = conditional.data.modifiers.find((m) => m._id === li?.dataset.modifier);
                if (!modifier) return;

                // @ts-ignore
                const value = event.target?.value;
                modifier.formula = value;

                await updateItem();
            },
        );
    });

    div.querySelectorAll('input.conditional-name').forEach((element) => {
        if (!element) return;

        /**
        * @type {HTMLSelectElement} - the target of the event
         */
        element.addEventListener(
            'change',
            async (event) => {

                const a = event.currentTarget;

                if (!a || !(a instanceof Element)) return;

                /** @type {HTMLDataListElement | null} */
                const li = a.closest(".conditional");

                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;

                // @ts-ignore
                const value = event.target?.value;
                conditional.data.name = value;

                await updateItem();
            },
        );
    });

    div.querySelectorAll('.damage-type-visual').forEach((element) => {
        if (!(element instanceof Element)) return;
        element?.addEventListener(
            'click',
            async (event) => {
                event.preventDefault();
                const a = event.currentTarget;

                if (!a || !(a instanceof Element)) return;

                /** @type {HTMLDataListElement | null} */
                const li = a.closest(".conditional-modifier");

                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;
                const modifier = conditional.data.modifiers.find((m) => m._id === li?.dataset.modifier);
                if (!modifier) return;


                async function update( /** @type {{ [key: string]: TraitSelectorValuePlural }} */arg) {
                    if (!modifier) return;
                    modifier.damageType = arg[modifier._id];
                    await updateItem();
                }
                const app = new pf1.applications.DamageTypeSelector(
                    {
                        id: key,
                        update,
                    },
                    modifier._id,
                    modifier.damageType || { custom: '', values: [] },
                );
                return app.render(true);
            },
        );
    });

    addNodeToRollBonus(parentElement, div, item, canEdit, 'bonus');
}

api.inputs.modifiersInput = modifiersInput;
