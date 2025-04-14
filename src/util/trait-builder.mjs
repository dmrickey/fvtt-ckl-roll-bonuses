/**
 * @implements {TraitSelector}
 */
export class Trait {
    /**
     * @param {Record<string, string>} choices
     * @param {string[]?} traits
     */
    constructor(choices, traits) {
        this.base = traits || [];
        this.#choices = choices;

        for (const c of this.base) {
            if (choices[c]) this.standard.add(c);
            else this.custom.add(c);
        }
    }

    /** @type {Record<string, string>} */
    #choices = {};
    /** @type {Set<string>} */
    custom = new Set();
    /** @type {Set<string>} */
    standard = new Set();

    /** @type {Set<string>} */
    get total() {
        return this.standard.union(this.custom);
    };

    /** @type {Array<string>} */
    get names() {
        return [...this.standard.map((t) => this.#choices[t] || t), ...this.custom];
    };
}
