import { MODULE_NAME } from "../../../consts.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { api } from '../../../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { loadConditionals } from '../../../util/conditional-helpers.mjs';

/** @returns {ItemConditionalModifierSourceDataPrepped['targets']} */
function getConditionalTargets() {
    /** @type {ItemConditionalModifierSourceDataPrepped['targets']} */
    const result = {
        attack: pf1.config.conditionalTargets.attack._label,
        critMult: pf1.config.conditionalTargets.critMult._label,
        damage: pf1.config.conditionalTargets.damage._label,
        dc: game.i18n.localize("PF1.DC"),
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
            crit: "PF1.OnCritBonusFormula",
            nonCrit: "PF1.NonMultBonusFormula",
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
        /** @type {ItemConditionalSourceData[]} */
        const conditionalData = foundry.utils.deepClone(conditionals.map((c) => c._source));
        for (const conditional of conditionalData) {
            for (const modifier of conditional.modifiers) {
                (/** @type {ItemConditionalModifierSourceDataPrepped} */ (/** @type {unknown} */ (modifier))).targets = getConditionalTargets();
                (/** @type {ItemConditionalModifierSourceDataPrepped} */ (/** @type {unknown} */ (modifier))).subTargets = getConditionalSubTargets(modifier.target);
                (/** @type {ItemConditionalModifierSourceDataPrepped} */ (/** @type {unknown} */ (modifier))).conditionalModifierTypes = getConditionalModifierTypes(modifier.target);
                (/** @type {ItemConditionalModifierSourceDataPrepped} */ (/** @type {unknown} */ (modifier))).conditionalCritical = getConditionalCritical(modifier.target);
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

    if (!canEdit) {
        div.querySelectorAll('input').forEach((element) => {
            element.setAttribute('readonly', 'true');
        });
        div.querySelectorAll('select, input[type="checkbox"]').forEach((element) => {
            element.setAttribute('disabled', 'true');
        });
    }

    setTimeout(() => {
        const conditionalInput = document.querySelector(`#${createId(item, key)}`);
        // @ts-ignore
        const jq = $(conditionalInput);
        // jq.find('.conditional.flexrow')?.hide();
        jq.find('.conditional-header')?.hide();
    });

    async function updateItem() {
        const sanitized = conditionals.map((c) => c._source);
        await item.setFlag(MODULE_NAME, key, sanitized);
        // can't do this without rehooking up bindings and adding
        // await item.update({ flags: { [MODULE_NAME]: { [key]: sanitized } } }, { render: false });
    }

    // remove system's name property so it doesn't save automatically
    const named = div.querySelectorAll('[name]');
    named.forEach((elem) => elem.removeAttribute('name'));

    div.addEventListener('drop', async (event) => {
        event.preventDefault();

        /** @type {ItemConditionalSourceData} */ // @ts-ignore
        const data = JSON.parse(event.dataTransfer.getData("text/plain"));
        if (!data) return;

        if (data.modifiers) {
            data._id = foundry.utils.randomID();
            conditionals.push(new pf1.components.ItemConditional(data));
            await updateItem();
        }
    });

    div.querySelectorAll('li.conditional[data-conditional]').forEach((element) => {
        element.setAttribute('draggable', 'true');
        element.addEventListener('dragstart', async (event) => {
            const id = (/** @type {HTMLDataListElement}*/(element)).dataset?.conditional;
            if (id) {
                const conditional = conditionals.find(x => x.id === id);
                if (conditional) {
                    // @ts-ignore
                    event.dataTransfer.setData("text/plain", JSON.stringify(conditional.data));
                    return;
                }
            }
        });
    });

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
                conditional._source.default = checkbox.checked;
                await updateItem();
            }
        });
    });

    div.querySelectorAll('.conditional-control').forEach((element) => {
        if (!canEdit) return;

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
                conditional?._source.modifiers.push(modifier._source);
                await updateItem();
            }

            // Remove a conditional modifier
            if (a.classList.contains("delete-conditional-modifier")) {
                li = a.closest(".conditional-modifier");
                if (!(li instanceof Element)) return;
                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;
                conditional._source.modifiers = conditional._source.modifiers.filter((m) => m._id !== li?.dataset.modifier);
                await updateItem();
            }
        });
    });

    // target: 'attack' | 'damage' | 'effect' | 'misc' | 'size' | 'dc' | 'cl' | 'critMult';
    /** @type {{ [key in ItemConditionalModifierSourceData['target']]: { subTarget: ItemConditionalModifierSourceData['subTarget'], critical: ItemConditionalModifierSourceData['critical'], damageType: ItemConditionalModifierSourceData['damageType'], type: ItemConditionalModifierSourceData['type'],} }} */
    const modDefaults = {
        attack: { subTarget: 'allAttack', critical: 'normal', damageType: [], type: 'untyped', },
        damage: { subTarget: 'allDamage', critical: 'normal', damageType: [], type: 'untyped', },
        effect: { subTarget: 'dc', critical: undefined, damageType: [], type: undefined, },
        misc: { subTarget: 'charges', critical: undefined, damageType: [], type: undefined, },
        size: { subTarget: undefined, critical: undefined, damageType: [], type: undefined, },
        dc: { subTarget: undefined, critical: undefined, damageType: [], type: undefined, },
        cl: { subTarget: undefined, critical: undefined, damageType: [], type: undefined, },
        critMult: { subTarget: undefined, critical: undefined, damageType: [], type: undefined, },
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
                const modifier = conditional._source.modifiers.find((m) => m._id === li?.dataset.modifier);
                if (!modifier) return;

                // @ts-ignore
                const /** @type {ItemConditionalModifierSourceData['target']} */ value = event.target?.value || 'attack';

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
                const modifier = conditional._source.modifiers.find((m) => m._id === li?.dataset.modifier);
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
                conditional._source.name = value;

                await updateItem();
            },
        );
    });

    div.querySelectorAll('.damage-type-visual').forEach((element) => {
        if (!(element instanceof HTMLElement) || !canEdit) return;
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
                const modifier = conditional._source.modifiers.find((m) => m._id === li?.dataset.modifier);
                if (!modifier) return;

                // TODO - make sure this works
                /** @param {{ [key: string]: object }} types */
                async function updateCallback(types) {
                    if (!modifier) return;

                    modifier.damageType = types;
                    await updateItem();
                };
                const app = new pf1.applications.DamageTypeSelector(
                    { id: key },
                    modifier._id,
                    modifier.damageType || [],
                    { updateCallback }
                );
                return app.render(true);
            },
        );
    });

    addNodeToRollBonus(parentElement, div, item, canEdit, 'bonus');
}

api.inputs.modifiersInput = modifiersInput;
