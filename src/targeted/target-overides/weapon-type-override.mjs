import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { BaseTargetOverride } from './_base-target-override.mjs';

/** @extends {BaseTargetOverride} */
export class WeaponBaseTypeOverride extends BaseTargetOverride {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'weapon-type-override'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.fzOO7K3iPTrSolY1#weapon-type'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} _source
     * @returns {Nullable<string[]>}
     */
    static getHints(_source) {
        return ['TODO']; // todo
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @returns { boolean }
     */
    static isInvalidItemType(item) {
        return item instanceof pf1.documents.item.ItemAttackPF
            || item instanceof pf1.documents.item.ItemEquipmentPF
            || item instanceof pf1.documents.item.ItemWeaponPF;
    }

    /**
     * @override
     * @param {ItemPF} item
     * @param {RollData} _rollData
     */
    static prepareSourceData(item, _rollData) {
        const baseType = item.getFlag(MODULE_NAME, this.key)?.trim();
        if (baseType) {
            item.system.baseTypes ||= [];
            item.system.baseTypes.push(baseType);
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} weaponType
     * @returns {Promise<void>}
     */
    static async configure(item, weaponType) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: weaponType || '' },
            },
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            label: this.label,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target-override',
            isFormula: false,
        });
    }
}
