import { handleFortune } from '../../bonuses/fortune-handler.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseBonus } from './_base-bonus.mjs';

/**
 * @extends {BaseBonus}
 */
export class FortuneBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'fortune'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#fortune/misfortune'; }

    /**
    * @inheritdoc
    * @override
    * @param {ItemPF} source
    * @returns {Nullable<string[]>}
    */
    static getHints(source) {
        return [this.label];
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        showEnabledLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ActionUse} actionUse the action being used
     */
    static actionUseProcess(source, actionUse) {
        const hasFlag = source.hasItemBooleanFlag(this.key);
        if (!hasFlag) {
            return;
        }

        const dice = actionUse.shared.dice;

        const options = {
            fortuneCount: 1,
            dice,
        };
        handleFortune(options);

        actionUse.shared.dice = options.dice;
    }
}
