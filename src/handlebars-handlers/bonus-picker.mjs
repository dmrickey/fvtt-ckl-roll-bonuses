
import { SpecificBonuses } from '../bonuses/all-specific-bonuses.mjs';
import { api } from '../util/api.mjs';
import { intersection } from '../util/array-intersects.mjs';
import { localize, localizeSpecificBonusLabel, localizeSpecificBonusTooltip } from '../util/localize.mjs';
import { templates } from './templates.mjs';

/**
 * @typedef {{key: string; label: string; tooltip: string; value: boolean; extraKeys?: string[];}} PickerData
 * @typedef {{ readonly targets: PickerData[]; readonly bonuses: PickerData[]; readonly specifics: PickerData[]; }} BonusPickerData
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

    const currentTargetSources = intersection(
        api.allTargetTypes.map((source) => source.key),
        currentBooleanKeys,
    );
    const currentBonusSources = intersection(
        api.allBonusTypes.map((source) => source.key),
        currentBooleanKeys,
    );
    const currentSpecificBonuses = [
        ...intersection(currentBooleanKeys, SpecificBonuses.booleanKeys),
        ...intersection(currentDictionaryKeys, SpecificBonuses.dictionaryKeys),
    ];

    const data = /** @type {BonusPickerData} */ ({
        targets: api.allTargetTypes.map((source, i) => ({
            key: source.key,
            label: source.label,
            path: `targets.${i}`,
            tooltip: source.tooltip,
            value: currentTargetSources.includes(source.key),
        })),
        bonuses: api.allBonusTypes.map((source, i) => ({
            key: source.key,
            label: source.label,
            path: `bonuses.${i}`,
            tooltip: source.tooltip,
            value: currentBonusSources.includes(source.key),
        })),
        specifics: Object.values(SpecificBonuses.allBonuses).map((bonus, i) => ({
            key: bonus.key,
            label: bonus.label || localizeSpecificBonusLabel(bonus.key),
            path: `specifics.${i}`,
            tooltip: localizeSpecificBonusTooltip(bonus.key),
            extraKeys: bonus.extraKeys,
            value: currentSpecificBonuses.includes(bonus.key),
        })),
    });

    const app = new BonusPickerApp(item, data);
    app.render(true);
}

/** @ts-ignore */
/** @extends {DocumentSheet<BonusPickerData, ItemPF>} */
class BonusPickerApp extends DocumentSheet {
    /**
     *
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
    sources = ['bonuses', 'targets'];

    /**
     * @override
     * @param {JQuery} html
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[type=reset]')?.click(this.close.bind(this));
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
            const /** @type {[keyof BonusPickerData, string]} */[prop, index] = key.split('.');

            /** @type {PickerData} */ // @ts-ignore
            const bonusData = this.data[prop][index];

            if (bonusData.value !== value) {
                updateObj ||= {
                    //@ts-ignore
                    system: { flags: { boolean: {}, dictionary: {} } },
                };

                if (this.sources.includes(prop) || (prop === 'specifics'
                    && SpecificBonuses.booleanKeys.includes(bonusData.key))
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

// /**
//  * @extends {FormApplication<FormApplicationOptions, ItemPF>}
//  */
// class BonusPickerApp extends FormApplication {
//     /**
//      *
//      * @param {ItemPF} item
//      * @param {*} data
//      * @param {any?} [options]
//      */
//     constructor(item, data, options = {}) {
//         super(item, options);
//         this.data = data;
//     }

//     /** @override */
//     static get defaultOptions() {
//         return mergeObject(super.defaultOptions, {
//             classes: ['form'],
//             template: templates.bonusPicker,
//             id: 'roll-bonuses-picker',
//             title: localize('roll-bonuses'),
//             height: 500,
//             width: 500,
//         });
//     }

//     /** @override */
//     getData() {
//         return this.data;
//     }

//     /** @override */
//     get title() { return `${BonusPickerApp.defaultOptions.title} - ${this.object.name}`; }

//     /**
//      * @override
//      * @param {JQuery} html
//      */
//     activateListeners(html) {
//         super.activateListeners(html);
//     }

//     /**
//      * @param {Event} event
//      * @param {any} formData
//      */
//     async _updateObject(event, formData) {
//         console.log('Updating item', this.object.name);
//         console.log(formData.exampleInput);
//         // TODO update this.object (ItemPF)
//         super.close();
//     }
// }
