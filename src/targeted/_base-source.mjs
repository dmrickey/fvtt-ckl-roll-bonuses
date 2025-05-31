import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';

export class BaseSource {

    /**
     * Get Item Hints tooltip value
     *
     * @abstract
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) { return; }

    /**
     * Whether or not this Source should be available in the picker application
     *
     * @abstract
     * @returns { boolean }
     */
    static get gmOnlyForPicker() { return false; }

    /**
     * Initialize any source-specific settings.
     *
     * @abstract
     */
    static init() { }

    /**
     * If the item is a source for this SourceType
     *
     * @param {ItemPF} source
     * @returns {boolean}
     */
    static isSource(source) { return source.hasItemBooleanFlag(this.key); };

    /**
     * @abstract
     * @returns {string}
     */
    static get journal() { throw new Error('must be overridden'); }

    /** @returns { string } */
    static get key() { return `${this.sourceBaseType}_${this.sourceKey}`; }

    /** @returns {string} */
    static get label() { return localizeBonusLabel(this.sourceKey); }

    /**
     * Prepare data on the source that it needs to reference later
     *
     * @abstract
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareSourceData(item, rollData) { }

    /**
     * @abstract
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ actor, html, isEditable, item }) { throw new Error('must be overridden'); }

    /** @abstract @returns { string } */
    static get sourceBaseType() { throw new Error('must be overridden'); }

    /** @abstract @returns { string } */
    static get sourceKey() { throw new Error('must be overridden'); }

    /** @abstract @returns { string } */
    static get tooltip() { return localizeBonusTooltip(this.sourceKey); }

    /**
     * @abstract
     * @param {ItemPF} item
     * @param {...any} _options
     * @returns {Promise<void>}
     */
    static async configure(item, ..._options) {
        await item.addItemBooleanFlag(this.key);
    }
}
