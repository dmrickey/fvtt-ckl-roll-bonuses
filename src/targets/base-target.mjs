export class BaseTarget {
    /**
     * @param {ItemPF | ActionUse} arg
     * @returns {boolean}
     */
    isTarget(arg) { throw new Error('must be overridden'); };

    /**
     * @returns { string }
     */
    static get type() { throw new Error('must be overridden'); }
}
