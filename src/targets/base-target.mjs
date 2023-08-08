export class BaseAttackTarget {
    /**
     * @param {ItemPF | ActionUse} arg
     * @returns {boolean}
     */
    isTarget(arg) { throw new Error('must be overridden'); };

    /**
     * @returns {'action' | 'item' | 'weapon-group' | 'equipment-type' }
     */
    get type() { throw new Error('must be overridden'); }
}
