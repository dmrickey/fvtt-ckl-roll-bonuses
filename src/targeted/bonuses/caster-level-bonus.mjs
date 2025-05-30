import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { api } from '../../util/api.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { BaseBonus } from './_base-bonus.mjs';

export class CasterLevelBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'cl'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#caster-level'; }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);

        /**
         * @param {ActorPF} actor
         * @param {{messageId?: string, parts?: string[]}} rollOptions
         * @param {string} bookId
         */
        const onActorRollCL = (actor, rollOptions, bookId) => {
            if (!rollOptions.messageId || !rollOptions.parts?.length) return;

            const action = game.messages.get(rollOptions.messageId)?.actionSource;
            if (!action) return;

            api.utils.handleBonusesFor(
                action,
                (_bonusType, sourceItem) => {
                    const mod = FormulaCacheHelper.getModuleFlagValue(sourceItem, this.key);
                    if (mod) {
                        rollOptions.parts?.push(`${mod}[${sourceItem.name}]`);
                    }
                },
                { specificBonusType: CasterLevelBonus },
            );

        };
        Hooks.on('pf1PreActorRollCl', onActorRollCL);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const value = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        if (value) {
            const mod = signed(value);
            return [localize('cl-mod', { mod })];
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {RollData} _rollData
     * @returns {Nullable<string[]>}
     */
    static getItemChatCardInfo(source, _rollData) {
        const value = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        if (value) {
            const mod = signed(value);
            return [`${localize('cl-mod', { mod })} ${source.name}`];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} formula
     * @returns {Promise<void>}
     */
    static async configure(item, formula) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: (formula || '') + '' },
            },
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @param {RollData} rollData
     */
    static updateItemActionRollData(source, action, rollData) {
        if (!(action instanceof pf1.components.ItemAction)) {
            return;
        }

        const { actor, item } = action;
        const value = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        if (!actor
            || !value
            || !(item instanceof pf1.documents.item.ItemSpellPF)
            || !rollData
        ) {
            return;
        }
        rollData.cl ||= 0;
        rollData.cl += value;
    }
}
