
/** @typedef {{ key: string, type: 'dictionary' | 'boolean' }} BonusRegistration */

export class SpecificBonuses {

    /**
     * @param {object} bonus
     * @param {string} bonus.key
     * @param {'dictionary' | 'boolean'} [bonus.type]
     * @param  {...string} extraKeys
     */
    static registerSpecificBonus({ key, type = 'dictionary' }, ...extraKeys) {
        this.allBonuses[key] = { key, type, extraKeys, };
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
