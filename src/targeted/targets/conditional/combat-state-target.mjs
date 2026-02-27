import { MODULE_NAME } from '../../../consts.mjs';
import { radioInput } from '../../../handlebars-handlers/bonus-inputs/radio-input.mjs';
import { isActorInCombat } from '../../../util/is-actor-in-combat.mjs';
import { localizeFluentDescription } from '../../../util/localize.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/** @typedef {keyof typeof choices} CombatChoice */
const choices = {
    ['in-combat']: 'combat-state.in-combat',
    ['out-of-combat']: 'combat-state.out-of-combat',
};

/** @extends {BaseConditionalTarget} */
export class CombatStateTarget extends BaseConditionalTarget {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'combat-state'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#combat-state'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const choice = this.#getCombatChoice(source);
        return choices[choice];
    }

    /**
     * @inheritdoc
     * @override
     */
    static init() {
        Hooks.once('ready', () =>
            (/** @type {[CombatChoice, string][]} */ (Object.entries(choices))).forEach(([key, value]) => choices[key] = localizeFluentDescription(value))
        );
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        return [this.fluentDescription(source)];
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources) {
        const inCombat = isActorInCombat(actor);
        const filtered = sources.filter((source) => {
            const choice = this.#getCombatChoice(source);
            return inCombat === (choice === 'in-combat');
        });

        return filtered;
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
        radioInput({
            values: Object.entries(choices).map(([k, v]) => ({ id: k, label: v })),
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

    /**
     * @param {ItemPF} source 
     * @returns {CombatChoice}
     */
    static #getCombatChoice(source) {
        return source.getFlag(MODULE_NAME, this.key) || 'in-combat';
    }
}
