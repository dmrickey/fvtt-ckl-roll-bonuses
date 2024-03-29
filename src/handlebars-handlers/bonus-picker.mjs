
import { SpecificBonuses } from '../bonuses/all-specific-bonuses.mjs';
import { api } from '../util/api.mjs';
import { intersection } from '../util/array-intersects.mjs';
import { localizeSpecificBonusLabel, localizeSpecificBonusTooltip } from '../util/localize.mjs';
import { templates } from './templates.mjs';

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

    const data = {
        targets: api.allTargetTypes.map((source) => ({
            key: source.key,
            label: source.label,
            tooltip: source.tooltip,
            value: currentTargetSources.includes(source.key),
        })),
        bonuses: api.allBonusTypes.map((source) => ({
            key: source.key,
            label: source.label,
            tooltip: source.tooltip,
            value: currentBonusSources.includes(source.key),
        })),
        specifics: Object.values(SpecificBonuses.allBonuses).map((bonus) => ({
            key: bonus.key,
            label: localizeSpecificBonusLabel(bonus.key),
            tooltip: localizeSpecificBonusTooltip(bonus.key),
            extraKeys: bonus.extraKeys,
            value: currentSpecificBonuses.includes(bonus.key),
        })),
    };

    console.log(data);

    const app = new MyFormApplication(item, data);
    app.render(true);
}

class MyFormApplication extends FormApplication {
    /**
     *
     * @param {ItemPF} item
     * @param {*} data
     * @param {any?} [options]
     */
    constructor(item, data, options = {}) {
        super(item, options);
        this.data = data;
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            template: templates.bonusPicker,
            id: 'roll-bonuses-picker',
            title: 'Roll Bonuses',
            height: 500,
            width: 500,
        });
    }

    /** @override */
    getData() {
        return this.data;
    }

    /**
     * @override
     * @param {JQuery} html
     */
    activateListeners(html) {
        super.activateListeners(html);
    }

    /**
     * @param {Event} event
     * @param {any} formData
     */
    async _updateObject(event, formData) {
        console.log('Updating item', this.object.name);
        console.log(formData.exampleInput);
        // TODO update this.object (ItemPF)
        super.close();
    }
}
