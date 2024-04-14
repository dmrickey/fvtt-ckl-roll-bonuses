
import { SpecificBonuses } from '../bonuses/all-specific-bonuses.mjs';
import { api } from '../util/api.mjs';
import { intersection } from '../util/array-intersects.mjs';
import { localize } from '../util/localize.mjs';
import { templates } from './templates.mjs';

/**
 * @typedef {object} PickerItemData
 * @property {string} key
 * @property {string} label
 * @property {string} tooltip
 * @property {boolean} value
 * @property {string[]} [extraKeys]
 */

/**
 * @typedef {object} BonusPickerData
 * @property {PickerItemData[]} targets
 * @property {PickerItemData[]} conditionalTargets
 * @property {PickerItemData[]} bonuses
 * @property {(PickerItemData & {children?: PickerItemData[]})[]} specifics
 */

/**
 * @param {object} args
 * @param {ItemPF} args.item
 */
export function showBonusPicker({
    item
}) {
    const currentBooleanKeys = Object.keys(item.system.flags.boolean);
    const currentDictionaryKeys = Object.keys(item.system.flags.dictionary);

    const allBonuses = api.allBonusTypes
        .filter((source) => !source.skipPicker)
        .sort((a, b) => a.label.localeCompare(b.label));
    const allTargets = api.allTargetTypes
        .filter((source) => !source.skipPicker && !source.isConditionalTarget)
        .sort((a, b) => a.label.localeCompare(b.label));
    const allConditionalTargets = api.allTargetTypes
        .filter((source) => !source.skipPicker && source.isConditionalTarget)
        .sort((a, b) => a.label.localeCompare(b.label));
    const specifics = Object.values(SpecificBonuses.allBonuses)
        .sort((a, b) =>
            !!a.parent || !!b.parent
                ? 0
                : a.label.localeCompare(b.label)
        );

    const currentBonusSources = intersection(
        allBonuses.map((source) => source.key),
        currentBooleanKeys,
    );
    const currentConditionalTargetSources = intersection(
        allConditionalTargets.map((source) => source.key),
        currentBooleanKeys,
    );
    const currentTargetSources = intersection(
        allTargets.map((source) => source.key),
        currentBooleanKeys,
    );
    const currentSpecificBonuses = [
        ...intersection(currentBooleanKeys, SpecificBonuses.booleanKeys),
        ...intersection(currentDictionaryKeys, SpecificBonuses.dictionaryKeys),
    ];

    /** @type {BonusPickerData} */
    const data = {
        targets: allTargets.map((source, i) => ({
            journal: source.journal,
            key: source.key,
            label: source.label,
            path: `targets.${i}`,
            tooltip: source.tooltip,
            value: currentTargetSources.includes(source.key),
        })),
        conditionalTargets: allConditionalTargets.map((source, i) => ({
            journal: source.journal,
            key: source.key,
            label: source.label,
            path: `conditionalTargets.${i}`,
            tooltip: source.tooltip,
            value: currentConditionalTargetSources.includes(source.key),
        })),
        bonuses: allBonuses.map((source, i) => ({
            journal: source.journal,
            key: source.key,
            label: source.label,
            path: `bonuses.${i}`,
            tooltip: source.tooltip,
            value: currentBonusSources.includes(source.key),
        })),
        specifics: specifics
            .filter((bonus) => !bonus.parent)
            .map((bonus, i) => ({
                extraKeys: bonus.extraKeys,
                journal: bonus.journal,
                key: bonus.key,
                label: bonus.label,
                path: `specifics.${i}`,
                tooltip: bonus.tooltip,
                value: currentSpecificBonuses.includes(bonus.key),
                children: specifics
                    .filter((child) => child.parent === bonus.key)
                    .map((child, ii) => ({
                        extraKeys: child.extraKeys,
                        journal: child.journal,
                        key: child.key,
                        label: child.label,
                        path: `specifics.${i}.${ii}`,
                        tooltip: child.tooltip,
                        value: currentSpecificBonuses.includes(child.key),
                    })),
            })),
    };

    const app = new BonusPickerApp(item, data);
    app.render(true);
}

/** @ts-ignore */
/** @extends {DocumentSheet<BonusPickerData, ItemPF>} */
class BonusPickerApp extends DocumentSheet {
    /**
     * @param {ItemPF} item
     * @param {BonusPickerData} data
     */
    constructor(item, data) {
        super(item, data);
        this.data = data;
    }
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.height = 'auto';
        options.width = 800;
        options.template = templates.bonusPicker;
        options.title = localize('roll-bonuses');

        return options;
    }

    /** @override */
    get title() { return `${BonusPickerApp.defaultOptions.title} - ${this.object.name}`; }

    /** @override */
    async getData() {
        return this.options;
    }

    /** @type {(keyof BonusPickerData)[]} */
    sources = ['bonuses', 'conditionalTargets', 'targets'];

    /**
     * @override
     * @param {JQuery} html
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[type=reset]')?.click(this.close.bind(this));

        const buttons = html.find('[data-journal]');
        buttons?.on(
            'click',
            async (event) => {
                event.preventDefault();
                const journal = event.currentTarget.dataset.journal;
                // @ts-ignore // TODO
                const [uuid, header] = journal.split('#');
                const doc = await fromUuid(uuid);

                // @ts-ignore // TODO
                if (doc instanceof JournalEntryPage) {
                    doc.parent.sheet.render(true, { pageId: doc.id, anchor: header });
                } else {
                    doc.sheet.render(true);
                }
            },
        );
    }

    /**
     * @override
     * @param {Record<string, unknown>} updateData
     * @returns {Record<string, unknown>}
     */
    _getSubmitData(updateData) {
        console.log('Updating item', this.object.name);
        const formData = super._getSubmitData(updateData);
        console.log(formData);

        /** @type {Partial<ItemPF>} */ // @ts-ignore
        let updateObj = null;
        Object.entries(formData).forEach(([key, value]) => {
            // @ts-ignore
            const /** @type {[keyof BonusPickerData, string]} */[prop, index, childIndex] = key.split('.');

            /** @type {PickerItemData} */ // @ts-ignore
            const bonusData = this.data[prop][index].children?.[childIndex] || this.data[prop][index];

            if (bonusData.value !== value) {
                updateObj ||= {
                    //@ts-ignore
                    system: { flags: { boolean: {}, dictionary: {} } },
                };

                if (this.sources.includes(prop)
                    || (prop === 'specifics' && SpecificBonuses.booleanKeys.includes(bonusData.key))
                ) {
                    // set to true if value is true, delete if value is false
                    // @ts-ignore
                    updateObj.system.flags.boolean[`${(value ? '' : '-=')}${bonusData.key}`] = true;
                }
                else if (prop === 'specifics'
                    && SpecificBonuses.dictionaryKeys.includes(bonusData.key)
                ) {
                    // @ts-ignore
                    updateObj.system.flags.dictionary[`${(value ? '' : '-=')}${bonusData.key}`] = '';
                }
                else {
                    throw new Error("should never happen");
                }

                (bonusData.extraKeys ?? []).forEach((key) =>
                    // @ts-ignore
                    updateObj.system.flags.dictionary[`${(value ? '' : '-=')}${key}`] = ''
                );
            }
        });

        return updateObj || {};
    }
}
