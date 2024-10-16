// import { MODULE_NAME } from '../../consts.mjs';
// import { addNodeToRollBonus } from '../../handlebars-handlers/add-bonus-to-item-sheet.mjs';
// import { createTemplate } from '../../handlebars-handlers/templates.mjs';
// import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
// import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
// import { BaseBonus } from './base-bonus.mjs';
//
// /** @extends BaseBonus */
// export class ConditionalBonus extends BaseBonus {
//     /**
//      * @inheritdoc
//      * @override
//      */
//     static get sourceKey() { return 'conditional'; }
//
//     /**
//      * @override
//      * @returns {string}
//      */
//     static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#conditional'; }
//
//     /**
//      * @override
//      */
//     static init() {
//         LocalHookHandler.registerHandler(localHooks.prepareData, (item, rollData) => {
//             // const damages = item.getFlag(MODULE_NAME, this.key) || [];
//             // damages.forEach((/** @type {DamageInputModel}*/ damage) => {
//             //     item[MODULE_NAME][this.key] ||= [];
//             //     const roll = RollPF.create(damage.formula, rollData);
//             //     item[MODULE_NAME][this.key].push(roll.simplifiedFormula);
//             // });
//         });
//     }
//
//     /**
//      * @override
//      * @param {ItemPF} source
//      * @returns {Nullable<string[]>}
//      */
//     static getHints(source) {
//         return ['todo']; // todo
//     }
//
//     /**
//      * @param {unknown[]} damageBonuses
//      * @param {string} name
//      * @returns {ItemConditionalData}
//      */
//     static #createConditional(damageBonuses, name) {
//         return {
//             _id: foundry.utils.randomID(),
//             default: true,
//             name,
//             modifiers: damageBonuses?.map( /** @return {ItemConditionalModifierData} */(bonus) => ({
//                 _id: foundry.utils.randomID(),
//                 critical: bonus.crit || 'normal', // normal | crit | nonCrit
//                 damageType: bonus.type,
//                 formula: bonus.formula,
//                 subTarget: 'allDamage',
//                 target: 'damage',
//                 type: this.#damagesTypeToString(bonus.type),
//             }) ?? []),
//         }
//     }
//
//     /**
//      * @inheritdoc
//      * @override
//      * @param {object} options
//      * @param {ActorPF | null} options.actor
//      * @param {HTMLElement} options.html
//      * @param {boolean} options.isEditable
//      * @param {ItemPF} options.item
//      */
//     static showInputOnItemSheet({ html, isEditable, item }) {
//         conditionalInput({
//             item,
//             journal: this.journal,
//             key: this.key,
//             parent: html,
//             tooltip: this.tooltip,
//         }, {
//             canEdit: isEditable,
//             inputType: 'bonus',
//         });
//     }
// }
//
// /**
//  * @param {object} args
//  * @param {string[]} [args.choices]
//  * @param {FlagValue} [args.current]
//  * @param {ItemPF} args.item
//  * @param {string} args.journal
//  * @param {string} args.key
//  * @param {string} [args.label]
//  * @param {string} [args.tooltip]
//  * @param {HTMLElement} args.parent,
//  * @param {object} options
//  * @param {boolean} options.canEdit
//  * @param {string} [options.placeholder]
//  * @param {boolean} [options.isFormula]
//  * @param {InputType} options.inputType
//  * @param {true} [options.isModuleFlag] - true (default) if this is a data flag, false if this is a dictionary flag
//  */
// function conditionalInput({
//     item,
//     journal,
//     key,
//     parent,
// }, {
//     canEdit,
//     inputType,
//     placeholder = '',
// }) {
//     const current = item.getFlag(MODULE_NAME, key);
//     const label = localizeBonusLabel(key);
//     const tooltip = localizeBonusTooltip(key);
//
//     const div = createTemplate(
//         pf1ConditionalsHbs,
//         {
//             // choices,
//             current,
//             // isFormula,
//             journal,
//             key,
//             label,
//             placeholder,
//             readonly: !canEdit,
//             tooltip,
//         },
//     );
//
//
//     addNodeToRollBonus(parent, div, item, canEdit, inputType);
// }
