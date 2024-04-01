
/** @typedef {{ key: string, type: 'dictionary' | 'boolean', label: Nullable<string>, journal: string, tooltip?: Nullable<string>, parent?: Nullable<string> }} BonusRegistration */

export class SpecificBonuses {

    /**
     * @param {object} bonus
     * @param {string} bonus.journal
     * @param {string} bonus.key
     * @param {Nullable<string>} [bonus.label]
     * @param {Nullable<string>?} [bonus.tooltip]
     * @param {'dictionary' | 'boolean'} [bonus.type]
     * @param {Nullable<string>?} [bonus.parent]
     * @param  {...string} extraKeys
     */
    static registerSpecificBonus({ journal, label = null, key, type = 'dictionary', tooltip = undefined, parent }, ...extraKeys) {
        this.allBonuses[key] = { extraKeys, journal, key, label, parent, tooltip, type };
    }

    /**
     * @type {Record<string, BonusRegistration & {extraKeys: string[]}>}}
     */
    static allBonuses = {}

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
