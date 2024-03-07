import { BaseTarget } from './base-target.mjs';

/**
 * @abstract
 */
export class BaseItemFilterTarget extends BaseTarget {
    /**
     * @returns {(item: ItemPF) => boolean}
     */
    static get itemFilter() { return (/** @type {ItemPF} */ item) => item.hasAction && this.extendedItemFilter(item) }

    /**
     * @abstract
     * @returns {(item: ItemPF) => boolean}
     */
    static get extendedItemFilter() { throw new Error('must be overridden'); }
}

// TODO
