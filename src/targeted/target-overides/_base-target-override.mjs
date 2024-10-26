import { BaseSource } from '../base-source.mjs';

/** @abstract */
export class BaseTargetOverride extends BaseSource {
    /**
     * @override
     * @returns { string }
     */
    static get sourceBaseType() { return 'target-override'; }

    /**
     * @abstract
     * @param {ItemPF} item
     * @returns { boolean }
     */
    static isInvalidItemType(item) { return false; }
}
