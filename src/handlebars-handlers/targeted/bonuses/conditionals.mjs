import { MODULE_NAME } from "../../../consts.mjs";
import { templates } from "../../init.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";/**

/**
 *
 * @param {object} sourceObj
 * @param {object} targetObj
 * @param {string} keepPath
 * @returns
 */
function keepUpdateArray(sourceObj, targetObj, keepPath) {
    const newValue = getProperty(targetObj, keepPath);
    if (newValue == null) return;
    if (Array.isArray(newValue)) return;

    const newArray = deepClone(getProperty(sourceObj, keepPath) || []);

    for (const [key, value] of Object.entries(newValue)) {
        if (foundry.utils.getType(value) === "Object") {
            const subData = expandObject(value);
            newArray[key] = mergeObject(newArray[key], subData);
        } else {
            newArray[key] = value;
        }
    }

    setProperty(targetObj, keepPath, newArray);
}


/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {HTMLElement} args.parentElement
 */
export function conditionalsInput({
    item,
    key,
    parentElement,
}) {
    {
        // reset conditionals
        // item.setFlag(MODULE_NAME, key, []);
    }

    function getConditionalTargets() {
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
     * @param {string} target - The target key, as defined in PF1.conditionTargets.
     * @returns {Object<string, string>} A list of conditionals
     */
    function getConditionalSubTargets(target) {
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
     * @returns {Object.<string, string>} A list of bonus types.
     */
    function getConditionalModifierTypes(target) {
        const result = {};
        if (target === "attack" || target === "damage") {
            // Add bonusModifiers from PF1.bonusModifiers
            for (const [k, v] of Object.entries(pf1.config.bonusModifiers)) {
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

    /* Generates a list of critical applications for a given formula target.
     * @param {string} target - The target key as defined in PF1.conditionalTargets.
     * @returns {Object.<string, string>} A list of critical applications.
     */
    function getConditionalCritical(target) {
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

    function getModifier(data) {
        data ||= pf1.components.ItemConditionalModifier.defaultData;
        const modifier = new pf1.components.ItemConditionalModifier(data);
        modifier._id = modifier.id;

        modifier.targets = getConditionalTargets();
        modifier.subTargets = getConditionalSubTargets(modifier.target);
        modifier.conditionalModifierTypes = getConditionalModifierTypes(modifier.target);
        modifier.conditionalCritical = getConditionalCritical(modifier.target);

        return modifier;
    }

    function getConditional({ data, modifiers } = {}) {
        data ||= pf1.components.ItemConditional.defaultData;
        const c = new pf1.components.ItemConditional(data);
        c._id = c.id;

        if (modifiers?.length) {
            // c.data.modifiers = loadModifiers(modifiers);
            c.modifiers = modifiers.map(({ data }) => getModifier(data));
        }
        else {
            c.modifiers = [];
        }

        return c;
    }

    /** @type {ItemConditional[]} */
    let conditionals = (item.getFlag(MODULE_NAME, key) || []).map(getConditional);
    const templateData = {
        data: {
            conditionals,
        }
    };
    const conditionalsInput = Handlebars.partials[templates.conditionals](templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });
    const div = document.createElement('div');
    div.innerHTML = conditionalsInput;

    div.querySelectorAll('.conditional-control').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();
            const a = event.currentTarget;

            async function updateItem() {
                const sanitized = conditionals.map((c) => ({
                    data: c.data,
                    modifiers: c.modifiers.map(({ data }) => ({ data })),
                }));
                await item.setFlag(MODULE_NAME, key, conditionals);
            }

            // Add new conditional
            if (a.classList.contains("add-conditional")) {
                conditionals.push(getConditional());
                await updateItem();
            }

            // Remove a conditional
            if (a.classList.contains("delete-conditional")) {
                const li = a.closest(".conditional");
                conditionals = conditionals.filter((c) => c.id !== li.dataset.conditional);
                await updateItem();
            }

            // Add a new conditional modifier
            if (a.classList.contains("add-conditional-modifier")) {
                const li = a.closest(".conditional");
                const conditional = conditionals.find((c) => c.id === li.dataset.conditional);
                conditional.modifiers.push(getModifier());
                await updateItem();
            }

            // Remove a conditional modifier
            if (a.classList.contains("delete-conditional-modifier")) {
                const li = a.closest(".conditional-modifier");
                const conditional = conditionals.find((c) => c.id === li.dataset.conditional);
                conditional.modifiers = conditional.modifiers.filter((m) => m.id !== li.dataset.modifier);
                await updateItem();
            }
        });
    });

    addNodeToRollBonus(parentElement, div);
}
