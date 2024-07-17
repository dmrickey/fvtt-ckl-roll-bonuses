import { MODULE_NAME } from "../consts.mjs";
import { templates } from '../handlebars-handlers/templates.mjs';
import { localize } from "./localize.mjs";

/**
 * @param {object} setting
 * @param {boolean} [setting.config]
 * @param {string} setting.key
 * @param {any} [setting.defaultValue]
 * @param {'world' | 'client'} [setting.scope]
 * @param {BooleanConstructor | StringConstructor | NumberConstructor | ObjectConstructor} [setting.settingType]
 * @param {object} [options]
 * @param {boolean} [options.skipReady]
 */
export const registerSetting = ({
    config = true,
    defaultValue = null,
    key,
    scope = 'world',
    settingType = String,
}, {
    skipReady = false
} = {}) => {
    const doIt = () =>
        game.settings.register(MODULE_NAME, key, {
            name: `${MODULE_NAME}.settings.${key}.name`,
            hint: `${MODULE_NAME}.settings.${key}.hint`,
            default: defaultValue === null ? localize(`settings.${key}.default`) : defaultValue,
            scope,
            requiresReload: false,
            config,
            type: settingType
        });

    game.ready || skipReady
        ? doIt()
        : Hooks.once('ready', doIt);
};

export class GlobalSettings {

    static #elephantInTheRoom = 'elephant-in-the-room';

    /** @returns {boolean} */
    static get elephantInTheRoom() { return !!game.settings.get(MODULE_NAME, this.#elephantInTheRoom); }

    static {
        // register this setting once PF1 is ready so that all translation keys have already been registered before this is run
        Hooks.once('pf1PostReady', () => {
            registerSetting({
                key: this.#elephantInTheRoom,
                defaultValue: false,
                settingType: Boolean,
            });
        });
    }
}

export class LanguageSettings {

    static get itemNameTranslationsKey() { return 'item-name-translations'; }

    /** @type {string[]} */
    static itemNameTranslationKeys = [];

    /** @param {string} key */
    static registerItemNameTranslation = (key) => this.itemNameTranslationKeys.push(key);

    /** @param {string} key */
    static getTranslation = (key) => {
        const current = this.itemNameTranslations;
        return (current[key] || localize(`item-name-translations.${key}.default`)).toLocaleLowerCase();
    }

    static get greater() { return this.getTranslation('greater'); }
    static get improved() { return this.getTranslation('improved'); }
    static get mythic() { return this.getTranslation('mythic'); }

    /** @returns {Record<string, string>} */
    static get itemNameTranslations() {
        const current = game.settings.get(MODULE_NAME, this.itemNameTranslationsKey) || {};

        return /** @type {Record<string, string>} */ (current);
    }

    static {
        // register this setting once PF1 is ready so that all translation keys have already been registered before this is run
        Hooks.once('pf1PostReady', () => {
            this.itemNameTranslationKeys.sort();

            registerSetting({
                key: this.itemNameTranslationsKey,
                config: false,
                defaultValue: {},
                settingType: Object,
            })

            game.settings.registerMenu(MODULE_NAME, this.itemNameTranslationsKey, {
                name: localize('item-name-app.title'),
                label: localize('item-name-app.label'),
                hint: localize('item-name-app.hint'),
                icon: "fas fa-table-list",
                type: ItemNameTranslationConfig,
                restricted: true,
            });
        });
    }
}

class ItemNameTranslationConfig extends FormApplication {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "ckl-item-name-translation-config";
        options.template = templates.itemNameTranslationConfigApp;
        options.height = "auto";
        options.width = 550;
        options.title = localize('item-name-app.title');
        return options;
    }

    /** @override */
    getData(options = {}) {
        let context = super.getData()
        const current = LanguageSettings.itemNameTranslations;

        const choices = LanguageSettings.itemNameTranslationKeys.map((key) => ({
            key,
            label: localize(`item-name-translations.${key}.name`),
            value: current[key] || localize(`item-name-translations.${key}.default`),
        }));

        context.improved = {
            key: 'improved',
            label: localize(`item-name-translations.improved.name`),
            value: current.improved || localize(`item-name-translations.improved.default`),
        }
        context.greater = {
            key: 'greater',
            label: localize(`item-name-translations.greater.name`),
            value: current.greater || localize(`item-name-translations.greater.default`),
        }
        context.mythic = {
            key: 'mythic',
            label: localize(`item-name-translations.mythic.name`),
            value: current.mythic || localize(`item-name-translations.mythic.default`),
        }
        context.key = LanguageSettings.itemNameTranslationsKey;

        context.choices = choices;
        return context
    }

    /**
     * @override
     * @inheritdoc
     * @param {Event} _event
     * @param {object} formData
     */
    async _updateObject(_event, formData) {
        const update = expandObject(formData);
        game.settings.set(MODULE_NAME, LanguageSettings.itemNameTranslationsKey, update);
    }
}

const automaticCombatBonusesKeys =  /** @type {const} */ (['range-increments']);
/** @typedef {typeof automaticCombatBonusesKeys[keyof typeof automaticCombatBonusesKeys]} CombatBonusKey */
class AutomaticCombatBonusesSettings {
    static get automaticCombatBonusesKey() { return 'automatic-combat-bonuses'; }

    /** @returns {Record<CombatBonusKey, boolean>} */
    static get automaticCombatBonuses() {
        const current = game.settings.get(MODULE_NAME, this.automaticCombatBonusesKey) || {};
        // @ts-ignore
        return current;
    }

    static {
        // register this setting once PF1 is ready so that all translation keys have already been registered before this is run
        Hooks.once('pf1PostReady', () => {
            registerSetting({
                key: this.automaticCombatBonusesKey,
                config: false,
                defaultValue: {},
                settingType: Object,
            })

            game.settings.registerMenu(MODULE_NAME, this.automaticCombatBonusesKey, {
                name: localize('combat-settings.application.title'),
                label: localize('combat-settings.application.label'),
                hint: localize('combat-settings.application.hint'),
                icon: "ra ra-crossed-swords",
                type: GMCombatOptionsApplication,
                restricted: true,
            });
        });
    }
}

class GMCombatOptionsApplication extends FormApplication {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "ckl-automatic-combat-bonuses";
        options.template = templates.automaticCombatBonusesConfigApp;
        options.height = "auto";
        options.width = 750;
        options.title = localize('combat-settings.application.title');
        return options;
    }

    /** @override */
    getData(options = {}) {
        let context = super.getData()
        const current = AutomaticCombatBonusesSettings.automaticCombatBonuses;

        const sections = automaticCombatBonusesKeys.map((key) => ({
            description: localize(`combat-settings.application.section.${key}.description`),
            issues: localize(`combat-settings.application.section.${key}.issues`),
            key,
            label: localize(`combat-settings.application.section.${key}.label`),
            value: !!current[key],
        }));

        context.key = AutomaticCombatBonusesSettings.automaticCombatBonusesKey;

        context.sections = sections;
        return context
    }

    /**
     * @override
     * @inheritdoc
     * @param {Event} _event
     * @param {object} formData
     */
    async _updateObject(_event, formData) {
        const update = expandObject(formData);
        game.settings.set(MODULE_NAME, AutomaticCombatBonusesSettings.automaticCombatBonusesKey, update);
    }
}
