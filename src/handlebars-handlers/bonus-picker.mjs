import { allBonusTypes } from '../targeted/bonuses/all-bonuses.mjs';
import { allTargetTypes } from '../targeted/targets/all-targets.mjs';
import { SpecificBonuses } from '../bonuses/all-specific-bonuses.mjs';
import { intersection } from '../util/array-intersects.mjs';
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
        allTargetTypes.map((source) => source.key),
        currentBooleanKeys,
    );
    const currentBonusSources = intersection(
        allBonusTypes.map((source) => source.key),
        currentBooleanKeys,
    );
    const currentSpecificBonuses = [
        ...intersection(currentBooleanKeys, SpecificBonuses.booleanKeys),
        ...intersection(currentDictionaryKeys, SpecificBonuses.dictionaryKeys),
    ];

    const data = {
        targets: allTargetTypes.map((source) => ({
            key: source.key,
            label: source.label,
            tooltip: source.tooltip,
            value: currentTargetSources.includes(source.key),
        })),
        bonuses: allBonusTypes.map((source) => ({
            key: source.key,
            label: source.label,
            tooltip: source.tooltip,
            value: currentBonusSources.includes(source.key),
        })),
        specifics: Object.values(SpecificBonuses.allBonuses).map((bonus) => ({
            key: bonus.bonus.primaryKey,
            label: bonus.bonus.label,
            tooltip: bonus.bonus.hint,
            extraKeys: bonus.extraKeys,
            value: currentSpecificBonuses.includes(bonus.bonus.primaryKey),
        })),
    };

    const app = new MyFormApplication(item, data);
    app.render();
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
