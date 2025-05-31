
import { MODULE_NAME } from '../../consts.mjs';
import { showScriptBonusEditor } from '../../handlebars-handlers/targeted/bonuses/script-call-bonus-input.mjs';
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
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
                handleBonusesFor(
                    shared.action,
                    (bonusType, sourceItem) => {
                        const scriptCalls = bonusType.getScriptCalls(sourceItem, this);
                        scriptCalls
                            .filter((s) => s.category === category)
                            .forEach((s) => {
                                scripts.push(s);
                            });
                    },
                    { specificBonusType: ScriptCallBonus },
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

        /**
        * Executes all script calls on this item of a specified category.
        *
        * @this {ItemScriptCall}
        * @returns {Promise<Macro>} - Actual macro or its delegate
        */
        async function getDelegate() {
            /** @type {Macro} */
            let macro;
            if (this.type === "script") {
                macro = new Macro({
                    type: "script",
                    command: this.value,
                    name: this.name,
                });
            } else {
                macro = await fromUuid(this.value);
            }

            if (this.rollBonus && this.source) {
                macro.source = this.source;
            }

            return macro;
        }

        Hooks.once('init', () => {
            libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.executeScriptCalls', executeScriptCalls, libWrapper.OVERRIDE);
            libWrapper.register(MODULE_NAME, 'pf1.components.ItemScriptCall.prototype.getDelegate', getDelegate, libWrapper.OVERRIDE);
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
     * @param {ItemPF} parent The item to add the script call to
     * @return {ItemScriptCall[]}
     */
    static getScriptCalls(source, parent) {
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
            }, {
                parent
            }));
        scripts.forEach(x => {
            x.rollBonus = true;
            x.source = source;
        });
        return scripts;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ItemScriptCallData[]} scriptCalls
     * @returns {Promise<void>}
     */
    static async configure(item, scriptCalls) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: scriptCalls || [] },
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
