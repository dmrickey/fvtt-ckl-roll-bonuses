import { MODULE_NAME } from '../../consts.mjs';
import { showLabel } from '../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { getBaneLabelForTargetsFromSource } from '../../util/bane-helper.mjs';
import { createChange } from '../../util/conditional-helpers.mjs';
import { currentTargets } from '../../util/get-current-targets.mjs';
import { getIdsFromItem, getTraitsFromItem } from '../../util/get-id-array-from-flag.mjs';
import { listFormat } from '../../util/list-format.mjs';
import { localize, localizeBonusTooltip } from '../../util/localize.mjs';
import { toArray } from '../../util/to-array.mjs';
import { BaseBonus } from './_base-bonus.mjs';

export class ChangeBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'change'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#change'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        return ['change test'];
    }

    // /**
    //  * @override
    //  * @inheritdoc
    //  * @param {ItemPF} item
    //  * @param {RollData} rollData
    //  */
    // static prepareSourceData(item, rollData) {
    //     const { actor } = item;
    //     if (!actor?.changes) return;
    // }

    /**
     * @param {ActorPF} actor
     */
    static createChange(actor) {
        const change = createChange({
            value: 100,
            formula: '2[test]',
            target: 'skill.acr',
            id: 'test',
        })
        if (!actor?.changes) return;
        actor.changes.set(change.id, change);
    }

    // /**
    //  * @inheritdoc
    //  * @override
    //  * @param {ItemPF} item
    //  * @param {object} options
    //  * @param {ArrayOrSelf<CreatureType>} [options.creatureTypes]
    //  * @param {ArrayOrSelf<CreatureSubtype>} [options.creatureSubtypes]
    //  * @returns {Promise<void>}
    //  */
    // static async configure(item, { creatureTypes, creatureSubtypes }) {
    //     await item.update({
    //         system: { flags: { boolean: { [this.key]: true } } },
    //         flags: {
    //             [MODULE_NAME]: {
    //                 [this.creatureTypeKey]: toArray(creatureTypes),
    //                 [this.creatureSubtypeKey]: toArray(creatureSubtypes),
    //             },
    //         },
    //     });
    // }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        showLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            inputType: 'bonus',
        });
    }
}
