import { getMartialFocusCondtional } from '../bonuses/martial-focus.mjs';
import { getGreaterWeaponSpecializaitonConditional } from '../bonuses/weapon-specialization/greater-weapon-specialization.mjs';
import { getWeaponSpecializaitonConditional } from '../bonuses/weapon-specialization/weapon-specialization.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { handleBonusesFor } from '../target-and-bonus-join.mjs';
import { DiceTransformBonus } from '../targeted/bonuses/dice-transform-bonus.mjs';
import { truthiness } from '../util/truthiness.mjs';

/**
 * Get action's damage formula.
 *
 * @internal
 * @param {ItemAction} action
 * @param {object} [options] - Additional options
 * @param {boolean} [options.simplify] - Simplify and compress the resulting formula before returning.
 * @param {boolean} [options.strict] - Strict option to pass to {@link pf1.utils.formula.simplify simplify}.
 * @returns {string}
 */
function actionDamage(action, { simplify = true, strict = true } = {}) {
    if (action[MODULE_NAME].formula) return action[MODULE_NAME].formula;

    const actor = action.actor,
        item = action.item,
        actorData = actor?.system;

    /** BEGIN OVERRIDE */
    const actionData = foundry.utils.deepClone(action);
    const actionDamageParts = [...actionData.damage.parts];
    const actionDamageNonCritParts = [...actionData.damage.nonCritParts];
    /** END OVERRIDE */

    /** @type {Formula[]} */
    const parts = [];

    const lazy = {
        /** @type { RollData?} */
        _cache: null,
        /** @type { RollData} */
        get rollData() {
            this._cache ??= action.getRollData();
            return this._cache;
        },
    };

    /** BEGIN OVERRIDE */
    if (!action[MODULE_NAME].conditionals) {
        action[MODULE_NAME].conditionals = [];
        handleBonusesFor(
            action,
            (bonusType, sourceItem) => {
                const conditionals = [];
                conditionals.push(...(bonusType.getConditionals(sourceItem) ?? [])
                    .flatMap(x => x)
                    .filter(truthiness)
                    .flatMap(x => x.modifiers.map(y => y._source)));
                action[MODULE_NAME].conditionals?.push(...conditionals);
            }
        );
        // todo turn this into a hook instead of calling these specific pieces of code
        const extras = [
            getWeaponSpecializaitonConditional(item)?.modifiers.find(x => !!x)?._source,
            getGreaterWeaponSpecializaitonConditional(item)?.modifiers.find(x => !!x)?._source,
            getMartialFocusCondtional(item)?.modifiers.find(x => !!x)?._source,
        ].filter(truthiness);
        action[MODULE_NAME].conditionals.push(...extras);
    }

    const conditionals = action[MODULE_NAME]?.conditionals || [];
    /** END OVERRIDE */

    /**
     * @param {string | number} formula
     * @param {*} [change]
     */
    const handleFormula = (formula, change) => {
        try {
            switch (typeof formula) {
                case "string": {
                    // Ensure @item.level and similar gets parsed correctly
                    /** BEGIN OVERRIDE */
                    /** @type {RollData} */
                    const _rd = formula.indexOf("@") >= 0 ? (change?.parent?.getRollData() ?? lazy.rollData) : {};
                    const rd = { ..._rd };
                    if (!isNaN(rd.size)) {
                        rd.size += conditionals
                            .filter((x) => x.target === 'size')
                            .map((x) => RollPF.safeTotal(x.formula))
                            .reduce((acc, x) => acc + x, 0);
                        /** END OVERRIDE */
                    }
                    if (!!formula) {
                        const newformula = pf1.utils.formula.simplify(formula, rd, { strict });
                        if (!!newformula) parts.push(newformula);
                    }
                    break;
                }
                case "number":
                    if (formula != 0) parts.push(`${formula}`);
                    break;
            }
        } catch (err) {
            console.error(`Action damage formula parsing error with "${formula}"`, err, action);
            parts.push("NaN");
        }
    };

    /** BEGIN OVERRIDE */
    /** @type {ItemConditionalModifierSourceData['subTarget'][]} */
    const subTargets = ['allDamage', 'attack_0'];
    const allDamageParts = conditionals
        .filter((x) => x.target === 'damage' && subTargets.includes(x.subTarget) && x.critical === 'normal' && !!x.formula)
        .map(x => (new pf1.models.action.DamagePartModel({ formula: x.formula, types: x.damageType })));

    actionDamageParts.push(...allDamageParts);
    /** END OVERRIDE */

    /** @param {DamagePartModel[]} _parts */
    const handleParts = (_parts) => _parts.forEach(({ formula }) => handleFormula(formula));

    // Normal damage parts
    handleParts(actionDamageParts);
    /** BEGIN OVERRIDE */
    if (parts[0]) {
        /** @type {PreDamageRollPart[]} */
        const fakeParts = [{ base: parts[0] + '' }];
        DiceTransformBonus.preDamageRoll(action, lazy.rollData, fakeParts);
        parts[0] = fakeParts[0].base;
    }
    /** END OVERRIDE */

    const isNatural = action.item.subType === "natural";

    // Include ability score only if the string isn't too long yet
    const dmgAbl = actionData.ability.damage;
    if (dmgAbl) {
        const ablMax = actionData.ability?.max ?? Infinity;
        const dmgAblBaseMod = Math.min(actorData?.abilities?.[dmgAbl]?.mod ?? 0, ablMax);
        const held = actionData?.held || item?.system.held || "1h";
        let ablDmgMult =
            actionData.ability.damageMult ?? (isNatural ? null : pf1.config.abilityDamageHeldMultipliers[held]) ?? 1;
        if (isNatural && !(actionData.naturalAttack?.primary ?? true)) {
            ablDmgMult = actionData.naturalAttack?.secondary?.damageMult ?? 0.5;
        }

        const dmgAblMod = dmgAblBaseMod >= 0 ? Math.floor(dmgAblBaseMod * ablDmgMult) : dmgAblBaseMod;
        if (dmgAblMod != 0) parts.push(dmgAblMod);
    }

    /** BEGIN OVERRIDE */
    const nonCritDamageParts = conditionals
        .filter((x) => x.target === 'damage' && subTargets.includes(x.subTarget) && x.critical === 'nonCrit' && !!x.formula)
        .map(x => (new pf1.models.action.DamagePartModel({ formula: x.formula, types: x.type ? [x.type] : [] })));

    actionDamageNonCritParts.push(...nonCritDamageParts);
    /** END OVERRIDE */

    // Include damage parts that don't happen on crits
    handleParts(actionDamageNonCritParts);

    // Include general sources. Item enhancement bonus is among these.
    action.allDamageSources.forEach((s) => handleFormula(s.formula, s));

    // Something probably went wrong
    // Early exit from invalid formulas
    if (parts.length === 0 || parts.some((p) => p === "NaN")) {
        console.warn("Action damage resulted in invalid formula:", parts.join(" + "), action);
        return "NaN";
    }

    let formula = pf1.utils.formula.compress(parts.join("+"));
    if (simplify) {
        // Simplification turns 1d12+1d8+6-8+3-2 into 1d12+1d8-1
        try {
            const rollData = formula.indexOf("@") >= 0 ? lazy.rollData : undefined;
            const final = pf1.utils.formula.simplify(formula, rollData, { strict });
            formula = pf1.utils.formula.compress(final);
        } catch (err) {
            console.error("Invalid action damage formula:", parts.join(" + "), action, err);
            return "NaN";
        }
    }

    /** BEGIN OVERRIDE */
    action[MODULE_NAME].formula = formula;
    /** END OVERRIDE */

    return formula;
}

Hooks.once('init', () => {
    pf1.utils.formula.actionDamage = actionDamage;
});
