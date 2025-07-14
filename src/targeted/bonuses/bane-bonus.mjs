import { MODULE_NAME } from '../../consts.mjs';
import { showLabel } from '../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { getBaneLabelForTargetsFromSource } from '../../util/bane-helper.mjs';
import { currentTargets } from '../../util/get-current-targets.mjs';
import { getIdsFromItem, getTraitsFromItem } from '../../util/get-id-array-from-flag.mjs';
import { listFormat } from '../../util/list-format.mjs';
import { localize, localizeBonusTooltip } from '../../util/localize.mjs';
import { toArray } from '../../util/to-array.mjs';
import { BaseBonus } from './_base-bonus.mjs';

export class BaneBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'bane'; }

    static get creatureTypeKey() { return `${this.key}-creature-type`; }
    static get creatureSubtypeKey() { return `${this.key}-creature-subtype`; }

    /**
     * @param {ItemPF} source
     * @returns {string | undefined}
     */
    static getLabelForTargetsFromSource(source) {
        return getBaneLabelForTargetsFromSource(source, this.creatureTypeKey, this.creatureSubtypeKey);
    }

    /**
     * @param {ItemPF} source
     * @param {ActorPF[]} [targets]
     * @returns {boolean}
     */
    static itemHasBaneTarget(source, targets) {
        let isBaneTarget = false;
        const creatureTypes = getIdsFromItem(source, this.creatureTypeKey);
        const creatureSubtypes = getIdsFromItem(source, this.creatureSubtypeKey);
        targets ||= currentTargets().map(x => x.actor);
        if (targets.length && (creatureTypes.length || creatureSubtypes.length)) {
            isBaneTarget = targets.every((a) =>
                (!creatureTypes.length || intersects(creatureTypes, a?.race?.system.creatureTypes.total))
                && (!creatureSubtypes.length || intersects(creatureSubtypes, a?.race?.system.creatureSubtypes.total))
            );
        }

        return isBaneTarget;
    }

    /**
     * @param {ItemAction} action
     * @param {ActorPF[]} [targets]
     * @returns {ItemPF | undefined}
     */
    static actionHasBaneTarget(action, targets) {
        let hasBonus;
        handleBonusesFor(
            action,
            (bonusType, sourceItem) => {
                if (bonusType.itemHasBaneTarget(sourceItem, targets)) {
                    hasBonus = sourceItem;
                }
            },
            { specificBonusType: this }
        );
        return hasBonus;
    }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#bane'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const hints = [];

        {
            const types = getTraitsFromItem(source, this.creatureTypeKey, pf1.config.creatureTypes).names;
            if (types.length) {
                const type = types.length > 1
                    ? localize('PF1.TypePlural')
                    : localize('PF1.Type');
                hints.push(type + ': ' + listFormat(types, 'or'));
            }
        }

        {
            const subtypes = getTraitsFromItem(source, this.creatureSubtypeKey, pf1.config.creatureSubtypes).names;
            if (subtypes.length) {
                const type = subtypes.length > 1
                    ? localize('PF1.RaceSubtypePlural')
                    : localize('PF1.Subtype');
                hints.push(type + ': ' + listFormat(subtypes, 'or'));
            }
        }

        return hints;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {ArrayOrSelf<CreatureType>} [options.creatureTypes]
     * @param {ArrayOrSelf<CreatureSubtype>} [options.creatureSubtypes]
     * @returns {Promise<void>}
     */
    static async configure(item, { creatureTypes, creatureSubtypes }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.creatureTypeKey]: toArray(creatureTypes),
                    [this.creatureSubtypeKey]: toArray(creatureSubtypes),
                },
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
        showLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            inputType: 'bonus',
        });
        traitInput({
            choices: pf1.config.creatureTypes,
            item,
            journal: this.journal,
            key: this.creatureTypeKey,
            label: localize('PF1.CreatureType'),
            parent: html,
            tooltip: localizeBonusTooltip(this.key),
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
        });
        traitInput({
            choices: pf1.config.creatureSubtypes,
            item,
            journal: this.journal,
            key: this.creatureSubtypeKey,
            label: localize('PF1.CreatureSubTypes.Single'),
            parent: html,
            tooltip: localizeBonusTooltip(this.key),
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
        });
    }
}
