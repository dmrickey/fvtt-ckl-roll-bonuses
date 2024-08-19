import { api } from '../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';

export class SpecificBonuses {

    /**
     * @param {object} bonus
     * @param {string} bonus.journal
     * @param {string} bonus.key
     * @param {Nullable<string>} [bonus.label]
     * @param {Nullable<string>?} [bonus.tooltip]
     * @param {keyof SystemItemData['flags']} [bonus.type]
     * @param {Nullable<string>?} [bonus.parent]
     * @param  {...string} extraKeys
    */
    // * @param {'boolean'} bonus.type
    static registerSpecificBonus({ journal, label = null, key, type = 'dictionary', tooltip = undefined, parent }, ...extraKeys) {
        this.allBonuses[key] = new SpecificBonus(extraKeys, journal, key, label, parent, tooltip, type);
    }

    /**
     * @type {Record<string, SpecificBonus>}}
     */
    static allBonuses = {};

    static get dictionaryKeys() {
        return Object.values(this.allBonuses)
            .filter((bonus) => bonus.type === 'dictionary')
            .map((bonus) => bonus.key);
    }

    static get booleanKeys() {
        return Object.values(this.allBonuses)
            .filter((bonus) => bonus.type === 'boolean')
            .map((bonus) => bonus.key);
    }
}

api.SpecificBonuses = SpecificBonuses;

class SpecificBonus {
    /**
     * @param {string[]} extraKeys
     * @param {string} journal
     * @param {string} key
     * @param {Nullable<string>} label
     * @param {Nullable<string>} parent
     * @param {Nullable<string>} tooltip
     * @param {keyof SystemItemData['flags']} type
     */
    constructor(
        extraKeys,
        journal,
        key,
        label,
        parent,
        tooltip,
        type,
    ) {
        this.extraKeys = extraKeys;
        this.journal = journal;
        this.key = key;
        this.label = label || localizeBonusLabel(key);
        this.parent = parent;
        this.tooltip = tooltip || localizeBonusTooltip(key);
        this.type = type;
    }
}
