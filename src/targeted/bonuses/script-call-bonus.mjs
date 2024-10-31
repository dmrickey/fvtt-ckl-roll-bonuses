
import { MODULE_NAME } from '../../consts.mjs';
import { showScriptBonusEditor } from '../../handlebars-handlers/targeted/bonuses/script-call-bonus-input.mjs';
import { truthiness } from '../../util/truthiness.mjs';
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
     * @override
     * @inheritdoc
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) {
        /** @type {ItemScriptCallData[]} */
        const scriptData = source.getFlag(MODULE_NAME, this.key) || [];
        const hints = scriptData
            .map((script) => script.name)
            .filter(truthiness);
        return hints;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @return {Nullable<ItemScriptCall | ItemScriptCall[]>}
     */
    static getScriptCalls(item) {
        /** @type {ItemScriptCallData[]} */
        const scriptData = (item.getFlag(MODULE_NAME, this.key) || []);

        const scripts = scriptData
            .filter(x => !!x?.value)
            .map((script) => new pf1.components.ItemScriptCall({
                _id: script._id,
                category: script.category,
                hidden: true,
                name: script.name,
                type: script.type,
                value: script.value,
            }));
        scripts.forEach(x => x.rollBonus = true);
        return scripts;
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
        showScriptBonusEditor({
            item,
            key: this.key,
            journal: this.journal,
            label: this.label,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }
}
