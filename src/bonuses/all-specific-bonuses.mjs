import { api } from '../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';

export class SpecificBonuses {

    /**
     * @param {object} bonus
     * @param {string} bonus.journal
     * @param {string} bonus.key
     * @param {Nullable<string>} [bonus.labelKey]
     * @param {Nullable<string>?} [bonus.tooltipKey]
     * @param {Nullable<string>?} [bonus.parent]
     */
    static registerSpecificBonus({ journal, labelKey = null, key, tooltipKey = undefined, parent }) {
        this.allBonuses[key] = new SpecificBonus(journal, key, labelKey, parent, tooltipKey);
    }

    /**
     * @type {Record<string, SpecificBonus>}}
     */
    static allBonuses = {};

    static get allBonusKeys() {
        return Object.values(this.allBonuses)
            .map((bonus) => bonus.key);
    }
}

api.SpecificBonuses = SpecificBonuses;

class SpecificBonus {
    /**
     * @param {string} journal
     * @param {string} key
     * @param {Nullable<string>} labelKey
     * @param {Nullable<string>} parent
     * @param {Nullable<string>} tooltipKey
     */
    constructor(
        journal,
        key,
        labelKey,
        parent,
        tooltipKey,
    ) {
        this.journal = journal;
        this.key = key;
        this._labelKey = labelKey;
        this.parent = parent;
        this._tooltipKey = tooltipKey;
    }

    get label() {
        return this._labelKey
            ? localizeBonusLabel(this._labelKey)
            : localizeBonusLabel(this.key);
    }
    get tooltip() {
        return this._tooltipKey
            ? localizeBonusTooltip(this._tooltipKey)
            : localizeBonusTooltip(this.key);
    }
}
