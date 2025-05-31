import { MODULE_NAME } from '../../consts.mjs';
import { radioInput } from '../../handlebars-handlers/bonus-inputs/radio-input.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { isMelee, isNatural, isNaturalSecondary, isPhysical, isRanged, isSpell, isThrown, isWeapon } from '../../util/action-type-helpers.mjs';
import { listFormat } from '../../util/list-format.mjs';
import { localize, localizeBonusLabel } from '../../util/localize.mjs';
import { toArray } from '../../util/to-array.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseTarget } from './_base-target.mjs';

/** @typedef {keyof typeof filterTypes} FilterType */

const filterTypes = /** @type {const} */ ({
    ['is-melee']: { label: '', filter: isMelee },
    ['is-natural']: { label: '', filter: isNatural },
    ['is-natural-secondary']: { label: '', filter: isNaturalSecondary },
    ['is-physical']: { label: '', filter: isPhysical },
    ['is-ranged']: { label: '', filter: isRanged },
    ['is-spell']: { label: '', filter: isSpell },
    ['is-thrown']: { label: '', filter: isThrown },
    ['is-weapon']: { label: '', filter: isWeapon },
});

const all = 'all';
const any = 'any';

/** @override */
export class ActionTypeTarget extends BaseTarget {

    static get #radioKey() { return `${this.key}-radio`; }
    static get #typesKey() { return `${this.key}-types`; }

    static {
        Hooks.once("i18nInit", () => {
            Object.keys(filterTypes).forEach((f) => {
                const key = /** @type {FilterType} */ (f);
                // @ts-expect-error overwrite readonly label with translation
                filterTypes[key].label = localizeBonusLabel(`action-type-types-choices.${f}`);
            });
        });
    }

    /**
     * @param {ItemPF} source
     * @returns { 'some' | 'every' }
     */
    static #getFilterArrayFunc(source) {
        const func = source.getFlag(MODULE_NAME, this.#radioKey) === all ? 'every' : 'some';
        return func;
    }

    /**
     * @param {ItemPF} source
     * @returns {(FilterType)[]}
     */
    static #getFilterTypes(source) {
        const filters = source.getFlag(MODULE_NAME, this.#typesKey) || [];
        return filters;
    }

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'action-type'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#action-type'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const types = (/** @type {FilterType[]} */ (source.getFlag(MODULE_NAME, this.#typesKey) ?? []))
            .filter(truthiness)
            .map((x) => filterTypes[x].label);
        const join = source.getFlag(MODULE_NAME, this.#radioKey) === all ? 'and' : 'or';
        return [listFormat(types, join)];
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF & {actor: ActorPF}} item
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction} doc - originating doc event in case a specific action is needed
     * @returns {Nullable<ItemPF[]>}
     */
    static _getSourcesFor(item, sources, doc) {
        const action = doc instanceof pf1.documents.item.ItemPF
            ? doc.defaultAction
            : doc instanceof pf1.actionUse.ActionUse
                ? doc.action
                : doc;

        const actionUse = doc instanceof pf1.actionUse.ActionUse ? doc : null;

        const filteredSources = sources.filter((source) => {
            const func = this.#getFilterArrayFunc(source);
            const filters = this.#getFilterTypes(source);
            if (!filters.length) return false;

            /** @param {FilterType} f */
            const hasType = (f) => filterTypes[f].filter(item, action, actionUse);
            return filters[func](hasType);
        });

        return filteredSources;
    };

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<FilterType>} actionTypes
     * @param {typeof any | typeof all} [anyOrAll]
     * @returns {Promise<void>}
     */
    static async configure(item, actionTypes, anyOrAll) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.#typesKey]: toArray(actionTypes),
                    [this.#radioKey]: anyOrAll || any,
                },
            },
        });
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
    static showInputOnItemSheet({ html, isEditable, item }) {
        /** @type {{[key: string]: string}} */
        const choices = {};
        Object.keys(filterTypes).forEach((f) => {
            const key = /** @type {FilterType} */ (f);
            choices[key] = filterTypes[key].label;
        });

        const radioValues = [
            { id: all, label: localize(`target-toggle.${all}`) },
            { id: any, label: localize(`target-toggle.${any}`) },
        ];

        traitInput({
            choices,
            item,
            journal: this.journal,
            key: this.#typesKey,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });

        const current = item.getFlag(MODULE_NAME, this.#typesKey) || [];
        if (current.length > 1) {
            radioInput({
                item,
                journal: this.journal,
                key: this.#radioKey,
                values: radioValues,
                parent: html,
            }, {
                canEdit: isEditable,
                inputType: 'target',
                isSubLabel: true,
            });
        }
    }
}
