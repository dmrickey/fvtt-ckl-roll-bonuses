import { MODULE_NAME } from '../../consts.mjs';
import { showChecklist } from '../../handlebars-handlers/targeted/targets/checklist-input.mjs';
import { difference } from '../../util/array-intersects.mjs';
import { getActorItemsByTypes } from '../../util/get-actor-items-by-type.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';
import { BaseTargetOverride } from './_base-target-override.mjs';

/** @extends {BaseTargetOverride} */
export class WeaponGroupOverride extends BaseTargetOverride {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'weapon-group-override'; }

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
            || item instanceof pf1.documents.item.ItemWeaponPF;
    }

    /**
     * @override
     * @param {ItemPF} item
     * @param {RollData} _rollData
     */
    static prepareSourceData(item, _rollData) {
        const groups = item.getFlag(MODULE_NAME, this.key) || [];
        /** @type {(keyof WeaponGroups)[]} */
        const value = groups.filter((/** @type {keyof WeaponGroups} */ group) => !!pf1.config.weaponGroups[group]);
        /** @type {string[]} */
        const custom = difference(groups, value);
        if (value.length || custom.length) {
            item.system.weaponGroups ||= {};
            item.system.weaponGroups.custom ||= [];
            item.system.weaponGroups.value ||= [];
            item.system.weaponGroups.custom.push(...custom);
            item.system.weaponGroups.value.push(...value);

            const total = [
                ...item.system.weaponGroups.custom,
                ...item.system.weaponGroups.value
                    .map((group) => pf1.config.weaponGroups[group] || group),
            ];
            total.sort();
            item.system.weaponGroups.total = new Set(total);
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ actor, html, isEditable, item }) {
        // TOOD add invalid label if this is an attack or weapon

        const actorGroups = getActorItemsByTypes(actor, 'attack', 'weapon')
            .flatMap((i) => (i.system.weaponGroups.custom))
            .filter(truthiness);
        const targetedGroups = item.getFlag(MODULE_NAME, this.key) || [];
        const custom = difference(
            uniqueArray([
                ...targetedGroups,
                ...actorGroups,
            ]),
            Object.keys(pf1.config.weaponGroups),
        );
        custom.sort();

        const options = {
            ...pf1.config.weaponGroups,
            ...custom.reduce((acc, curr) => ({ ...acc, [curr]: curr, }), {}),
        };

        showChecklist({
            item,
            journal: this.journal,
            key: this.key,
            options,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
    }
}
