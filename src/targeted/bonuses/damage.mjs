import { MODULE_NAME } from "../../consts.mjs";
import { damageInput } from "../../handlebars-handlers/targeted/bonuses/damage.mjs";
import { localize } from "../../util/localize.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class DamageBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'damage'; }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        const hasFlag = item.system.flags.boolean?.hasOwnProperty(this.key);
        if (!hasFlag) {
            return;
        }

        const parts = item.getFlag(MODULE_NAME, this.key) ?? [];

        damageInput({
            item,
            key: this.key,
            parent: html,
            parts,
        });
    }

    /**
     * @override
     * @param {object} o
     * @param {ActorPF} o.actor,
     * @param {typeof Hint} o.hintcls,
     * @param {ItemPF} o.item,
     */
    static registerHintOnBonus({ actor, hintcls, item }) {
        // todo
    }

    /**
     * @override
     * @param {object} o
     * @param {ActorPF} o.actor,
     * @param {typeof Hint} o.hintcls,
     * @param {ItemPF} o.item,
     */
    static registerHintOnTarget({ actor, hintcls, item }) {
        // todo
    }

    /**
     * @override
     * @param {ActionUse} actionUse
     * @returns {string[]}
     */
    static getDamageBonusesForRoll({ actor, item }) {
        /** @type {string[]} */
        const bonuses = [];
        if (!actor) return bonuses;

        if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
            return bonuses;
        }

        const name = localize(this.key);

        // const damages = actor.itemFlags.boolean[this.key]?.sources;
        // if (damages) {
        //     debugger;
        // }

        // if (isFocused) {
        //     const change = new pf1.components.ItemChange(
        //         {
        //             flavor: name,
        //             formula: 1,
        //             modifier: 'untypedPerm',
        //             operator: 'add',
        //             priority: 0,
        //             subTarget: 'damage',
        //             value: 1,
        //         }
        //     );
        //     bonuses.push(change);
        // }

        return bonuses;
    }

    /**
     * @override
     * @param {ActionUse} actionUse
     * @returns {any}
     */
    static getConditional({ actor, item, shared }) {
        /** @type {any[]} */
        const conditionals = [];
        if (!item.actor) return conditionals;

        if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
            return conditionals;
        }

        const name = localize(this.key);

        const sources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        sources.forEach((source) => {
            /** @type {RollData['action']['damage']['parts']} */
            const damages = source.getFlag(MODULE_NAME, this.key);
            conditionals.push(this.createConditional(damages));
            // debugger;
        });

        // if (isFocused) {
        //     const change = new pf1.components.ItemChange(
        //         {
        //             flavor: name,
        //             formula: 1,
        //             modifier: 'untypedPerm',
        //             operator: 'add',
        //             priority: 0,
        //             subTarget: 'damage',
        //             value: 1,
        //         }
        //     );
        //     bonuses.push(change);
        // }

        return conditionals;
    }

    /**
     *
     * @param {{ formula: string; type: TraitSelectorValuePlural }[]} damageBonuses
     */
    static createConditional(damageBonuses) {
        return {
            _id: foundry.utils.randomID(),
            default: true,
            name,
            modifiers: damageBonuses.map((bonus) => ({
                _id: foundry.utils.randomID(),
                formula: bonus.formula,
                target: 'damage',
                subTarget: 'allDamage',
                type: '',
                damageType: bonus.type,
                critical: 'normal',
            })),
        }
    }

    /**
     * @override
     * @param {ItemAction} item
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip({ item }) {
        /** @type {ItemChange[]} */
        const bonuses = [];
        if (!item.actor) return bonuses;

        if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
            return bonuses;
        }

        const name = localize(this.key);

        const sources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        sources.forEach((source) => {
            /** @type {RollData['action']['damage']['parts']} */
            const damages = source.getFlag(MODULE_NAME, this.key);
            // debugger;
        });

        // if (isFocused) {
        //     const change = new pf1.components.ItemChange(
        //         {
        //             flavor: name,
        //             formula: 1,
        //             modifier: 'untypedPerm',
        //             operator: 'add',
        //             priority: 0,
        //             subTarget: 'damage',
        //             value: 1,
        //         }
        //     );
        //     bonuses.push(change);
        // }

        return bonuses;
    }
}
// todo wrap this method from ActionUse
// if I override it I can fix https://gitlab.com/foundryvtt_pathfinder1e/foundryvtt-pathfinder1/-/merge_requests/1485/diffs too
// hook will call base, then call into my bonus and add my bonus onto this -- which will basically have to do this whole bit of logic
// handleConditionals() {
//     if (this.shared.conditionals) {
//       const conditionalData = {};
//       for (const i of this.shared.conditionals) {
//         const conditional = this.shared.action.data.conditionals[i];
//         const tag = createTag(conditional.name);
//         for (const [i, modifier] of conditional.modifiers.entries()) {
//           // Adds a formula's result to rollData to allow referencing it.
//           // Due to being its own roll, this will only correctly work for static formulae.
//           const conditionalRoll = RollPF.safeRoll(modifier.formula, this.shared.rollData);
//           if (conditionalRoll.err) {
//             ui.notifications.warn(
//               game.i18n.format("PF1.WarningConditionalRoll", { number: i + 1, name: conditional.name })
//             );
//             // Skip modifier to avoid multiple errors from one non-evaluating entry
//             continue;
//           } else conditionalData[[tag, i].join(".")] = RollPF.safeRoll(modifier.formula, this.shared.rollData).total;

//           // Create a key string for the formula array
//           const partString = `${modifier.target}.${modifier.subTarget}${
//             modifier.critical ? "." + modifier.critical : ""
//           }`;
//           // Add formula in simple format
//           if (["attack", "effect", "misc"].includes(modifier.target)) {
//             const hasFlavor = /\[.*\]/.test(modifier.formula);
//             const flavoredFormula = hasFlavor ? modifier.formula : `(${modifier.formula})[${conditional.name}]`;
//             this.shared.conditionalPartsCommon[partString] = [
//               ...(this.shared.conditionalPartsCommon[partString] ?? []),
//               flavoredFormula,
//             ];
//           }
//           // Add formula as array for damage
//           else if (modifier.target === "damage") {
//             this.shared.conditionalPartsCommon[partString] = [
//               ...(this.shared.conditionalPartsCommon[partString] ?? []),
//               [modifier.formula, modifier.damageType, false],
//             ];
//           }
//           // Add formula to the size property
//           else if (modifier.target === "size") {
//             this.shared.rollData.size += conditionalRoll.total;
//           }
//         }
//       }
//       // Expand data into rollData to enable referencing in formulae
//       this.shared.rollData.conditionals = expandObject(conditionalData, 5);

//       // Add specific pre-rolled rollData entries
//       for (const target of ["effect.cl", "effect.dc", "misc.charges"]) {
//         if (this.shared.conditionalPartsCommon[target] != null) {
//           const formula = this.shared.conditionalPartsCommon[target].join("+");
//           const roll = RollPF.safeRoll(formula, this.shared.rollData, [target, formula]).total;
//           switch (target) {
//             case "effect.cl":
//               this.shared.rollData.cl += roll;
//               break;
//             case "effect.dc":
//               this.shared.rollData.dcBonus = roll;
//               break;
//             case "misc.charges":
//               this.shared.rollData.chargeCostBonus = roll;
//               break;
//           }
//         }
//       }
//     }
//   }
