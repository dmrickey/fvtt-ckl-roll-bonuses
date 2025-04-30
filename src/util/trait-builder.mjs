import { api } from './api.mjs';
import { listFormat } from './list-format.mjs';

/**
 * Proper type wrapper for pf1's "traits" that are built inline.
 * Plus a couple conveniency getters.
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

    /**
     * Joins [a, b, c] to 'a, b, and c'
     * Joins [a, b] to 'a and b'
     * @type {string}
     */
    get namesAnd() {
        return listFormat(this.names, 'and');
    }

    /**
     * Joins [a, b, c] to 'a, b, or c'
     * Joins [a, b] to 'a or b'
     * @type {string}
     */
    get namesOr() {
        return listFormat(this.names, 'or');
    }
}

api.utils.Trait = Trait;
