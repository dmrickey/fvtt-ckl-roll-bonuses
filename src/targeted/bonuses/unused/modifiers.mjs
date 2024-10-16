import { MODULE_NAME } from "../../../consts.mjs";
import { modifiersInput } from "../../../handlebars-handlers/targeted/bonuses/modifiers-input.mjs";
import { conditionalAttackTooltipModSource, conditionalModToItemChangeForDamageTooltip } from "../../../util/conditional-helpers.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { BaseBonus } from "../base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class ModifiersBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'modifiers'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'todo'; }

    //     /**
    //      * @override
    //      * @param {ItemPF} target
    //      * @returns {Nullable<ItemConditional>}
    //      */
    //     static getConditional(target) {
    //
    //         /** @type {ItemConditional} */
    //         const data = (target.getFlag(MODULE_NAME, this.key) || [])[0];
    //
    //         if (data) {
    //             const conditional = {
    //                 ...data,
    //                 ...data.data,
    //                 modifiers: data.modifiers?.map((m) => ({ ...m.data }) ?? []),
    //             };
    //             if (conditional.modifiers.length) {
    //                 return conditional;
    //             }
    //         }
    //     }

    //     /**
    //      * @override
    //      * @param {ItemPF} target
    //      * @returns {ItemChange[]}
    //      */
    //     static getDamageSourcesForTooltip(target) {
    //         /** @type {ItemChange[]} */
    //         let sources = [];
    //
    //         const conditional = this.getConditional(target);
    //         if (!conditional) {
    //             return sources;
    //         }
    //
    //         sources = (conditional.modifiers ?? [])
    //             .filter((mod) => mod.target === 'damage')
    //             .map((mod) => conditionalModToItemChangeForDamageTooltip(conditional, mod, { isDamage: true }))
    //             .filter(truthiness);
    //
    //         return sources;
    //     }

    //     /**
    //      * @override
    //      * @param {ItemPF} target
    //      * @returns {ModifierSource[]}
    //      */
    //     static getAttackSourcesForTooltip(target) {
    //         /** @type {ModifierSource[]} */
    //         let sources = [];
    //
    //         if (!target.actor) {
    //             return sources;
    //         }
    //
    //         const conditional = this.getConditional(target);
    //         if (!conditional) {
    //             return sources;
    //         }
    //
    //         sources = (conditional.modifiers ?? [])
    //             .filter((mod) => mod.target === 'attack')
    //             .map((mod) => conditionalAttackTooltipModSource(conditional, mod))
    //             .filter(truthiness);
    //
    //         return sources;
    //     }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        modifiersInput({
            item,
            key: this.key,
            parentElement: html,
        }, {
            canEdit: isEditable,
        });
    }
}
