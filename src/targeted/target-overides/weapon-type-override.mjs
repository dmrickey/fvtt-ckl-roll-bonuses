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
    static get journal() { return 'TODO'; }

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
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        // TOOD add invalid label if this is an armor, attack, or weapon

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
        });
    }
}
