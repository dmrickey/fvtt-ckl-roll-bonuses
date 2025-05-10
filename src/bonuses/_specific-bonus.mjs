import { api } from '../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';

export class SpecificBonus {
    static register() { api.specificBonusTypeMap[this.key] = this; }

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
     * @param {object?} _options
     * @returns {Promise<void>}
     */
    static async configure(item, _options) {
        await item.addItemBooleanFlag(this.key);
    }

    /**
     * If the item or actor is configured for this bonus
     * @abstract
     * @param {ItemPF | ActorPF | TokenPF} doc
     * @param  {any[]} _args
     * @returns {boolean}
     */
    static has(doc, ..._args) {
        return doc instanceof pf1.canvas.TokenPF
            ? doc.actor?.hasItemBooleanFlag(this.key)
            : doc.hasItemBooleanFlag(this.key);
    }

    /**
     * @returns { JustRender | RenderAndCreateConfigure }
     */
    static get configuration() { throw new Error('must be overridden'); }
}
