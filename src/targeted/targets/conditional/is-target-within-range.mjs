import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { PositionalHelper } from '../../../util/positional-helper.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { localizeBonusLabel } from '../../../util/localize.mjs';
import { BaseTarget } from '../_base-target.mjs';
import { showLabel } from '../../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { MODULE_NAME } from '../../../consts.mjs';

export class WhenTargetInRangeTarget extends BaseTarget {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'is-target-within-range'; }

    static get #minKey() { return `${this.key}-min`; }
    static get #maxKey() { return `${this.key}-max`; }

    static get #units() {
        return pf1.utils.getDistanceSystem() === 'imperial'
            ? pf1.config.measureUnitsShort.ft
            : pf1.config.measureUnitsShort.m;
    }

    /**
     * @param {ItemPF} source
     * @returns {number}
     */
    static #min(source) { return FormulaCacheHelper.getModuleFlagValue(source, this.#minKey) || 0; }
    /**
     * @param {ItemPF} source
     * @returns {number}
     */
    static #max(source) { return FormulaCacheHelper.getModuleFlagValue(source, this.#maxKey) || Number.POSITIVE_INFINITY; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#within-range'; }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.#minKey);
        FormulaCacheHelper.registerModuleFlag(this.#maxKey);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const min = this.#min(source);
        const max = this.#max(source);
        const units = this.#units;
        return [`${min}${units}-${max}${units}`];
    }

    /**
     * @override
     * @param {ItemPF & { actor: ActorPF }} item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources) {
        const token = item.actor?.getActiveTokens()[0];
        if (!token) {
            return [];
        }

        /** @type {TokenPF[]} */
        const targets = [...game.user.targets];
        if (!targets.length) {
            return [];
        }

        const filtered = sources.filter((source) => {
            // pf1 system believes "minRange" is not inclusive, so it reports "minRange" as "squares one closer".
            // The distance logic is now set up for that so reducing this by Infinitesimally small amount accounts for their error
            const min = (this.#min(source) || 0) - .0001;
            const max = this.#max(source);
            return targets.every((target) => new PositionalHelper(token, target).isWithinRange(min, max));
        });
        return filtered;
    }

    /**
     * @override
     * @inheritdoc
     */
    static get isConditionalTarget() { return true; }

    /**
     * @override
     * @inheritdoc
     */
    static get isGenericTarget() { return true; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {Formula} [options.min]
     * @param {Formula} [options.max]
     * @returns {Promise<void>}
     */
    static async configure(item, { min, max }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.#minKey]: (min || '') + '',
                    [this.#maxKey]: (max || '') + '',
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
    static showInputOnItemSheet({ html, isEditable, item }) {
        showLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            inputType: 'target',
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#minKey,
            label: localizeBonusLabel(this.#minKey, { unit: this.#units }),
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'target',
            placeholder: '0',
            isSubLabel: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#maxKey,
            label: localizeBonusLabel(this.#maxKey, { unit: this.#units }),
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'target',
            placeholder: `${Number.POSITIVE_INFINITY}`,
            isSubLabel: true,
        });
    }
}
