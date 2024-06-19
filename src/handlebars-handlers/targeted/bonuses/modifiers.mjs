import { MODULE_NAME } from "../../../consts.mjs";
import { localize } from "../../../util/localize.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { api } from '../../../util/api.mjs';

/**
 *
 * @returns {ItemConditionalModifier['targets']}
 */
function getConditionalTargets() {
    /** @type {ItemConditionalModifier['targets']} */
    const result = {
        attack: pf1.config.conditionalTargets.attack._label,
        damage: pf1.config.conditionalTargets.damage._label,
        size: pf1.config.conditionalTargets.size._label,
        effect: pf1.config.conditionalTargets.effect._label,
    };

    // Only add Misc target if subTargets are available
    if (Object.keys(getConditionalSubTargets("misc")).length > 0) {
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
    }
    // Add misc subtargets
    if (target === "misc") {
        // Add charges subTarget with specific label
        result["charges"] = game.i18n.localize("PF1.ChargeCost");
    }
    return result;
}

/** Generates lists of conditional modifier bonus types applicable to a formula.
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

/** Generates a list of critical applications for a given formula target.
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
            crit: "PF1.CritDamageBonusFormula",
            nonCrit: "PF1.NonCritDamageBonusFormula",
        };
    }
    return result;
}

/**
 *
 * @param {Nullable<any>} data
 * @returns {ItemConditionalModifier}
 */
function createModifier(data = null) {
    data ||= pf1.components.ItemConditionalModifier.defaultData;
    let modifier = new pf1.components.ItemConditionalModifier(data);

    modifier = { ...modifier, ...modifier.data };
    modifier.id = modifier._id;

    modifier.targets = getConditionalTargets();
    modifier.subTargets = getConditionalSubTargets(modifier.target);
    modifier.conditionalModifierTypes = getConditionalModifierTypes(modifier.target);
    modifier.conditionalCritical = getConditionalCritical(modifier.target);

    return modifier;
}

/**
 *
 * @param {ItemPF} item
 * @param {Nullable<ItemConditional>} existing
 * @returns
 */
function createConditional(item, existing = null) {
    const data = existing?.data || pf1.components.ItemConditional.defaultData;
    data.default = true;
    data.name = item.name;
    const c = new pf1.components.ItemConditional(data);
    c._id = c.id ?? '';

    const modifiers = existing?.modifiers;
    if (modifiers?.length) {
        // c.data.modifiers = loadModifiers(modifiers);
        c.modifiers = modifiers.map(({ data }) => createModifier(data));
        c.data.modifiers = c.modifiers;
    }
    else {
        c.modifiers = [createModifier()];
    }

    return c;
}

/**
 *
 * @param {ItemPF} item
 * @param {string} key
 * @returns
 */
function createId(item, key) {
    return `${item.id}-${key}`;
}

/**
 * Uses PF1's conditionals.hbs and only shows the modifiers instead of individual conditionals
 *
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {HTMLElement} args.parentElement
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function modifiersInput({
    item,
    key,
    parentElement,
}, {
    canEdit,
}) {
    /** @type {ItemConditional[]} */
    let conditionals = (item.getFlag(MODULE_NAME, key) || [createConditional(item)]).map((/** @type {ItemConditional} */c) => createConditional(item, c));
    const templateData = {
        damageTypes: pf1.registry.damageTypes.toObject(),
        data: {
            conditionals,
        }
    };

    const div = createTemplate(templates.conditionals, templateData);
    div.classList.add('pf1', 'item-action');
    div.setAttribute('id', createId(item, key));

    // todo make sure "defaults" are saved when swapping to a new 'type'

    setTimeout(() => {
        const conditionalInput = document.querySelector(`#${createId(item, key)}`);
        // @ts-ignore
        const jq = $(conditionalInput);
        jq.find('.conditional.flexrow')?.hide();
        jq.find('.conditional-header')?.text(localize('modifiers'));
    });

    async function updateItem() {
        const sanitized = conditionals.map((c) => ({
            data: c.data,
            modifiers: c.modifiers.map(({ data }) => ({ data })),
        }));
        await item.setFlag(MODULE_NAME, key, sanitized);
        // can't do this without rehooking up bindings and adding
        // await item.update({ flags: { [MODULE_NAME]: { [key]: sanitized } } }, { render: false });
    }

    div.querySelectorAll('.conditional-control').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            const a = event.currentTarget;

            if (!a || !(a instanceof Element)) return;

            // Add new conditional
            if (a.classList.contains("add-conditional")) {
                conditionals.push(createConditional(item));
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
                conditional?.modifiers.push(createModifier());
                await updateItem();
            }

            // Remove a conditional modifier
            if (a.classList.contains("delete-conditional-modifier")) {
                li = a.closest(".conditional-modifier");
                if (!(li instanceof Element)) return;
                const conditional = conditionals.find((c) => c.id === li?.dataset.conditional);
                if (!conditional) return;
                conditional.modifiers = conditional.modifiers.filter((m) => m.id !== li?.dataset.modifier);
                await updateItem();
            }
        });
    });

    /** @type {{ [key in ItemConditionalModifier['target']]: { subTarget: ItemConditionalModifier['subTarget'], critical: ItemConditionalModifier['critical'], damageType: ItemConditionalModifier['damageType'], type: ItemConditionalModifier['type'],} }} */
    const modDefaults = {
        attack: { subTarget: 'allAttack', critical: 'normal', damageType: undefined, type: 'untyped', },
        damage: { subTarget: 'allDamage', critical: 'normal', damageType: pf1.components.ItemAction.defaultDamageType, type: 'untyped', },
        effect: { subTarget: 'dc', critical: undefined, damageType: undefined, type: undefined, },
        misc: { subTarget: 'charges', critical: undefined, damageType: undefined, type: undefined, },
        size: { subTarget: undefined, critical: undefined, damageType: undefined, type: undefined, },
    };

    /**
     *
     * @param {string} selector
     */
    function handleChangeForSelector(selector) {
        // @ts-ignore
        div.querySelectorAll(selector).forEach((/** @type {HTMLSelectElement} */ element) => {
            if (!element) return;

            /**
             * Listen to mousedown event
             *
            * @type {HTMLSelectElement} - the target of the event
            * @listens document#mousedown - the namespace and name of the event
             */
            element.addEventListener(
                'change',
                async (event) => {
                    const props = element.name.split('.');
                    props.shift();
                    props.splice(props.length - 1, 0, 'data');
                    const path = props.join('.');

                    // @ts-ignore
                    const /** @type {HTMLSelectElement}*/ eventTarget = event.target;
                    // @ts-ignore
                    let /** @type {ItemConditionalModifier['target']} */ value = eventTarget?.value;

                    if (!value) {
                        value = 'attack';
                    }

                    if (element.classList.contains('conditional-target')) {
                        const base = path.split('.');
                        // @ts-ignore
                        base.pop();
                        const baseProp = base.join('.');
                        setProperty(conditionals, `${baseProp}.subTarget`, modDefaults[value].subTarget);
                        setProperty(conditionals, `${baseProp}.critical`, modDefaults[value].critical);
                        setProperty(conditionals, `${baseProp}.damageType`, modDefaults[value].damageType);
                        setProperty(conditionals, `${baseProp}.type`, modDefaults[value].type);
                    }

                    setProperty(conditionals, path, value);
                    await updateItem();
                },
            );
        });
    }
    [
        '.conditionals input[type=text]',
        '.conditionals select',
    ].forEach(handleChangeForSelector);

    div.querySelectorAll('.damage-type-visual').forEach((element) => {
        if (!(element instanceof Element)) return;
        element?.addEventListener(
            'click',
            async (event) => {
                event.preventDefault();
                /** @type {string[]} */
                let props = element.getAttribute('data-name')?.split('.') || [];
                if (!props.length) {
                    const parent = element.parentElement?.parentElement?.querySelector('.conditional-target');
                    // @ts-ignore
                    props = parent.name.split('.');
                    props.pop();
                    props.push('damageType');
                }
                props.shift();
                props.splice(props.length - 1, 0, 'data');
                const path = props.join('.');

                async function update( /** @type {{ [key: string]: object }} */arg) {
                    setProperty(conditionals, path, arg[path]);
                    await updateItem();
                }
                const app = new pf1.applications.DamageTypeSelector(
                    {
                        id: key,
                        update,
                    },
                    path,
                    getProperty(conditionals, path) || { values: [] },
                );
                return app.render(true);
            },
        );
    });

    addNodeToRollBonus(parentElement, div, item, canEdit);
}

// api.inputs.modifiersInput = modifiersInput;
