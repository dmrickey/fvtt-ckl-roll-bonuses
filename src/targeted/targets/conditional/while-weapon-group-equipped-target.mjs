import { MODULE_NAME } from '../../../consts.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../../util/array-intersects.mjs';
import { getWeaponGroupChoicesFromActor, getWeaponGroupsFromActor } from '../../../util/get-weapon-groups-from-actor.mjs';
import { localizeFluentDescription } from '../../../util/localize.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/**
 * @extends BaseConditionalTarget
 */
export class WhileWeaponGroupEquippedTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'while-weapon-group-equipped'; }

    /**
     * @todo
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#while-weapon-group-equipped'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const hints = this.getHints(source);
        return localizeFluentDescription(this, { size: hints?.[0] || '' });
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {(keyof WeaponGroups)[]} */
        const targetedGroups = source.getFlag(MODULE_NAME, this.key) ?? [];
        return targetedGroups.map((group) => pf1.config.weaponGroups[group] || group).filter(truthiness);
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources) {
        const equippedGroups = getWeaponGroupsFromActor(actor, { onlyEquipped: true });

        const bonusSources = sources.filter((source) => {
            const targetedGroups = source.getFlag(MODULE_NAME, this.key) || [];
            return intersects(equippedGroups, targetedGroups);
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<string>} weaponGroups
     * @returns {Promise<void>}
     */
    static async configure(item, weaponGroups) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(weaponGroups),
                },
            },
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ actor, html, isEditable, item }) {
        const choices = getWeaponGroupChoicesFromActor(actor);

        traitInput({
            choices,
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
    }
}
