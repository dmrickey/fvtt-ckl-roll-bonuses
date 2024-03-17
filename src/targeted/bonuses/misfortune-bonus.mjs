import { handleFortune } from '../../bonuses/fortune-handler.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseBonus } from './base-bonus.mjs';

/**
 * @extends {BaseBonus}
 */
export class MisfortuneBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get type() { return 'misfortune'; }

    /**
    * @inheritdoc
    * @override
    * @param {ItemPF} source
    * @returns {Nullable<string[]>}
    */
    static getHints(source) {
        /** @type {string[]} */
        if (this.isBonusSource(source)) {
            return [this.label];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ html },) {
        showEnabledLabel({
            label: this.label,
            parent: html,
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} bonusTarget
     * @param {{ fortuneCount: number; misfortuneCount: number; actionID: any; }} options passed into ItemPF.use
     */
    static onItemUse(bonusTarget, options) {
        const hasFlag = bonusTarget.hasItemBooleanFlag(this.key);
        if (!hasFlag) {
            return;
        }

        options.fortuneCount = 0;
        options.misfortuneCount = 1;
        handleFortune(options);
    }
}
