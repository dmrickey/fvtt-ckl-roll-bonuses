
/** @typedef {{ primaryKey: string, label: string, tooltip: string, type: 'dictionary' | 'boolean' }} BonusRegistration */

export class SpecificBonuses {

    /**
     *
     * @param {BonusRegistration} bonus
     * @param  {...string} extraKeys
     */
    static registerSpecificBonus(
        bonus,
        ...extraKeys
    ) {
        this.allBonuses[bonus.primaryKey] = { bonus, extraKeys, };
    }

    /**
     * @type {Record<string, {bonus: BonusRegistration, extraKeys: string[]}>}
     */
    static allBonuses = {}

    static get dictionaryKeys() {
        return Object.values(this.allBonuses)
            .filter((bonus) => bonus.bonus.type === 'dictionary')
            .map((bonus) => bonus.bonus.primaryKey);
    }

    static get booleanKeys() {
        return Object.values(this.allBonuses)
            .filter((bonus) => bonus.bonus.type === 'boolean')
            .map((bonus) => bonus.bonus.primaryKey);
    }
}
