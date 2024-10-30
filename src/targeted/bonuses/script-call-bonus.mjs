
import { MODULE_NAME } from '../../consts.mjs';
import { keyValueSelect } from '../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { showScriptBonusEditor } from '../../handlebars-handlers/targeted/bonuses/script-call-bonus-input.mjs';
import { BaseBonus } from './base-bonus.mjs';

/** @extends {BaseBonus} */
export class ScriptCallBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     * @returns { string }
     */
    static get sourceKey() { return 'script-call'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#script-call'; }

    static get #categoryKey() { return `${this.key}-category`; }
    static get #scriptKey() { return `${this.key}-script`; }

    static {

        /**
         * Copied directly from the system with one line changed
         *
         * @this {ItemSheetPF}
         * @param {any} context
         */
        async function itemSheetPF_prepareScriptCalls(context) {
            context.scriptCalls = null;

            const categories = pf1.registry.scriptCalls.filter((category) => {
                if (!category.itemTypes.includes(this.item.type)) return false;
                return !(category.hidden === true && !game.user.isGM);
            });
            // Don't show the Script Calls section if there are no categories for this item type
            if (!categories.length) return;

            context.scriptCalls = {};

            // Iterate over all script calls, and adjust data
            const scriptCalls = this.item.scriptCalls?.filter((s) => !s.rollBonus) ?? []; /** THIS IS MY OVERRIDE */

            // Create categories, and assign items to them
            for (const { id, name, info } of categories) {
                context.scriptCalls[id] = {
                    name,
                    tooltip: info,
                    items: scriptCalls.filter((sc) => sc.category === id && !sc.hide),
                    dataset: { category: id },
                };
            }
        }
        Hooks.once('init', () => {
            libWrapper.register(MODULE_NAME, 'pf1.applications.item.ItemSheetPF.prototype._prepareScriptCalls', itemSheetPF_prepareScriptCalls, libWrapper.OVERRIDE);
        });
    }

    /**
     * Get Item Hints tooltip value
     *
     * @override
     * @inheritdoc
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) {
        const script = source.getFlag(MODULE_NAME, this.#scriptKey);
        return script?.name ? [script.name] : [this.label];
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @return {Nullable<ItemScriptCall | ItemScriptCall[]>}
     */
    static getScriptCalls(item) {
        /** @type {{ command: string, name: string, _id: string } | undefined} */
        const script = item.getFlag(MODULE_NAME, this.#scriptKey);
        const category = item.getFlag(MODULE_NAME, this.#categoryKey);
        if (script && category) {
            const scriptCall = new pf1.components.ItemScriptCall({
                name: script.name,
                value: script.command,
                _id: script._id,
                hidden: true,
                category,
            });
            scriptCall.rollBonus = true;
            return scriptCall;
        }
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
        const choices = pf1.registry.scriptCalls.map((sc) => ({
            key: sc._id,
            label: sc.name,
        }));
        keyValueSelect({
            choices,
            item,
            journal: this.journal,
            key: this.#categoryKey,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
        showScriptBonusEditor({
            item,
            journal: this.journal,
            key: this.#scriptKey,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }
}
