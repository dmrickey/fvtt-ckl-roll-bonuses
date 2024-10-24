import { MODULE_NAME } from '../../consts.mjs';
import { radioInput } from '../../handlebars-handlers/bonus-inputs/radio-input.mjs';
import { showChecklist } from '../../handlebars-handlers/targeted/targets/checklist-input.mjs';
import { localize, localizeBonusLabel } from '../../util/localize.mjs';
import { BaseTarget } from './base-target.mjs';

/**
 * @param {ItemPF} item
 * @param {ItemAction} action
 */
const isNaturalSecondary = (item, action) => {
    if (!action || !item) return false;

    const isAttack = item instanceof pf1.documents.item.ItemAttackPF;
    const isWeapon = item instanceof pf1.documents.item.ItemWeaponPF;
    const isNatural = (isAttack && item.subType === 'natural')
        || ((isAttack || isWeapon) && item.system.weaponGroups?.value.includes("natural"));

    const isPrimary = action.data.naturalAttack.primaryAttack;

    return isNatural && !isPrimary;
}
/**
 * @param {ItemPF} item
 * @param {ItemAction} action
 */
const isNatural = (item, action) => {
    const isAttack = item instanceof pf1.documents.item.ItemAttackPF;
    const isWeapon = item instanceof pf1.documents.item.ItemWeaponPF;
    return (isAttack && item.subType === 'natural')
        || ((isAttack || isWeapon) && item.system.weaponGroups?.value.includes("natural"));
}
/**
 * @param {ItemPF} item
 * @param {ItemAction} action
 */
const isSpell = (item, action) => {
    const isSpell = item instanceof pf1.documents.item.ItemSpellPF;
    return isSpell || ['msak', 'rsak', 'spellsave'].includes(action?.data.actionType ?? '');
}

// /** @type {{ [key: string]: {label: string, filter: (item: ItemPF, action: ItemAction) => boolean}}} */
const filterTypes = /** @type {const} */ ({
    ['is-melee']: { label: '', filter: (/** @type {ItemPF} */ item, /** @type {ItemAction} */ action) => ['mwak', 'msak', 'mcman'].includes(action?.data.actionType) },
    ['is-natural']: { label: '', filter: isNatural },
    ['is-natural-secondary']: { label: '', filter: isNaturalSecondary },
    ['is-physical']: { label: '', filter: (/** @type {ItemPF} */ item, /** @type {ItemAction} */ action) => ['rcman', 'rwak', 'rsak', 'twak'].includes(action?.data.actionType) },
    ['is-ranged']: { label: '', filter: (/** @type {ItemPF} */ item, /** @type {ItemAction} */ action) => !!item?.isPhysical },
    ['is-spell']: { label: '', filter: isSpell },
    ['is-thrown']: { label: '', filter: (/** @type {ItemPF} */ item, /** @type {ItemAction} */ action) => action?.data.actionType === 'twak' },
    ['is-weapon']: { label: '', filter: (/** @type {ItemPF} */ item, /** @type {ItemAction} */ action) => ['mwak', 'rwak', 'twak'].includes(action?.data.actionType) },
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
                const key = /** @type {keyof typeof filterTypes} */ (f);
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
     * @returns {(keyof typeof filterTypes)[]}
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

        const filteredSources = sources.filter((source) => {
            const func = this.#getFilterArrayFunc(source);
            const filters = this.#getFilterTypes(source);
            if (!filters.length) return false;

            /** @param {keyof typeof filterTypes} f */
            const hasType = (f) => filterTypes[f].filter(item, action);
            return filters[func](hasType);
        });

        return filteredSources;
    };

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
        const options = {};
        Object.keys(filterTypes).forEach((f) => {
            const key = /** @type {keyof typeof filterTypes} */ (f);
            options[key] = filterTypes[key].label;
        });

        const radioValues = [
            { id: all, label: localize(`target-toggle.${all}`) },
            { id: any, label: localize(`target-toggle.${any}`) },
        ];

        showChecklist({
            item,
            journal: this.journal,
            key: this.#typesKey,
            options,
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
            });
        }
    }
}
