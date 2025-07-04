import { api } from '../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { onRenderCreate } from '../util/on-create.mjs';

/** @param {typeof SpecificBonus} bonus */
export const initConfiguration = (bonus) => {
    try {
        const config = bonus.configuration;
        switch (config.type) {
            case 'just-render':
                onRender(bonus.key, config.showInputsFunc);
                break;
            case 'render-and-create':
                onRenderCreate(
                    bonus.key,
                    config.compendiumId,
                    config.isItemMatchFunc,
                    {
                        defaultFlagValuesFunc: config.options?.defaultFlagValuesFunc,
                        extraBooleanFlags: config.options?.extraBooleanFlags,
                        showInputsFunc: config.showInputsFunc,
                        ignoreFunc: config.ignoreFunc,
                    }
                );
                break;
            default: throw new Error('new configuration type was added and this switch statement wasn\'t updated');
        }
    }
    catch {
        ui.notifications.error(`Bonus '${bonus.prototype.constructor.name} :: ${bonus.key}' has no configuration.`);
    }
}

/**
 * @param {string} key
 * @param {ShowInputsFunc} showInputsFunc
 */
const onRender = (key, showInputsFunc) => {
    Hooks.on(
        'renderItemSheet',
        (
            /** @type {ItemSheetPF} */ { isEditable, item },
            /** @type {[HTMLElement]} */[html],
            /** @type {unknown} */ _data
        ) => {
            if (!(item instanceof pf1.documents.item.ItemPF)) return;
            if (item.hasItemBooleanFlag(key)) {
                showInputsFunc(item, html, isEditable);
            }
        }
    );
};

export class SpecificBonus {
    static register() {
        const key = /** @type {keyof RollBonusesAPI['specificBonusTypeMap']} */ (this.key);
        if (!!api.specificBonusTypeMap[key]) {
            console.error(`Roll Bonus for key '${key}' (${this.label}) has already been registered. This is not a user error. Report this to the mod author adding this bonus.`);
            return;
        }
        // @ts-ignore
        api.specificBonusTypeMap[key] = this;
        initConfiguration(this);
    }

    /** @returns { string } */
    static get key() { return this.sourceKey; }
    // static get key() { return `specific_${this.sourceKey}`; } // todo - future update after SBC uses api to create bonuses

    /**
     * The key of the parent Specific Bonus to nest this bonus under in the Bonus Picker dialog application.
     * @abstract
     * @virtual
     * @returns {string}
     */
    static get sourceKey() { throw new Error('must be overridden'); }

    /**
     * The uuid journal entry for this bonus.
     * @abstract
     * @returns {string}
     */
    static get journal() { return ''; }

    static get label() { return localizeBonusLabel(this.sourceKey); }
    static get tooltip() { return localizeBonusTooltip(this.sourceKey); }

    /**
     * The key of the parent Specific Bonus to nest this bonus under in the Bonus Picker dialog application.
     * @abstract
     * @returns {string | undefined}
     */
    static get parent() { return; }

    /**
     * @abstract
     * @param {ItemPF} item
     * @param {...any} _options
     * @returns {Promise<void>}
     */
    static async configure(item, ..._options) {
        await item.addItemBooleanFlag(this.key);
    }

    /**
     * If the item or actor is configured for this bonus
     * @abstract
     * @param {ItemPF | ActorPF | TokenPF} doc
     * @returns {boolean}
     */
    static has(doc) {
        return doc instanceof pf1.canvas.TokenPF
            ? doc.actor?.hasItemBooleanFlag(this.key)
            : doc.hasItemBooleanFlag(this.key);
    }

    /**
     * @returns { JustCreate | JustRender | CreateAndRender }
     */
    static get configuration() { throw new Error('must be overridden'); }
}
