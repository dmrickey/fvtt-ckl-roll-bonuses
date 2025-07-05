import { BaseBonus } from '../_base-bonus.mjs';

/** @abstract */
export class BaseConditionalBonus extends BaseBonus {
    /**
     * @override
     * @inheritdoc
     */
    static get isConditionalBonus() { return true; }
}