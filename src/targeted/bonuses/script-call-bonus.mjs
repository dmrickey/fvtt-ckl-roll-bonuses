
import { MODULE_NAME } from '../../consts.mjs';
import { showScriptBonusEditor } from '../../handlebars-handlers/targeted/bonuses/script-call-bonus-input.mjs';
import { handleBonusTypeFor } from '../../target-and-bonus-join.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseBonus } from './_base-bonus.mjs';

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
        * Executes all script calls on this item of a specified category.
        *
        * @this {ItemPF}
        * @param {string} category - The category of script calls to call.
        * @param {Object<string, object>} [extraParams={}] - A dictionary of extra parameters to pass as variables for use in the script.
        * @param {Partial<ActionUseShared>} [shared={}] - Shared data object
        * @returns {Promise.<object>} The shared object between calls which may have been given data.
        */
        async function executeScriptCalls(category, extraParams = {}, shared = {}) {
            /** @type {ItemScriptCall[]} */
            const scripts = this.scriptCalls?.filter((o) => o.category === category) ?? [];

            // BEGIN MY OVERRIDE
            if (shared.action) {
                handleBonusTypeFor(
                    shared.action,
                    ScriptCallBonus,
                    (bonusType, sourceItem) => {
                        const scriptCalls = bonusType.getScriptCalls(sourceItem);
                        scriptCalls
                            .filter((s) => s.category === category)
                            .forEach((s) => {
                                s.parent = this;
                                scripts.push(s);
                            });
                    },
                );
            }
            // END MY OVERRIDE

            shared.category = category;

            try {
                for (const s of scripts) {
                    await s.execute(shared, extraParams);
                }
            } catch (error) {
                console.error(`Script call execution failed\n`, error, this);
                // Rethrow to ensure everything cancels
                throw new Error("Error occurred while executing a script call", { cause: error });
            }

            return shared;
        }

        Hooks.once('init', () => {
            libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.executeScriptCalls', executeScriptCalls, libWrapper.OVERRIDE);
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
     * Get script from the source
     *
     * @param {ItemPF} source
     * @return {ItemScriptCall[]}
     */
    static getScriptCalls(source) {
        /** @type {ItemScriptCallData[]} */
        const scriptData = (source.getFlag(MODULE_NAME, this.key) || []);

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
