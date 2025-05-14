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

export class SharedSettings {

    static #elephantInTheRoom = 'elephant-in-the-room';

    /** @returns {boolean} */
    static get elephantInTheRoom() { return !!game.settings.get(MODULE_NAME, this.#elephantInTheRoom); }

    static {
        Hooks.once('init', () => {
            registerSetting({
                key: this.#elephantInTheRoom,
                defaultValue: false,
                settingType: Boolean,
            }, {
                skipReady: true,
            });
        });
    }
}

export class LanguageSettings {
    /**
     * @param {string} itemName
     * @param {string} baseName
     * @param {boolean} [exact] True (default) if name needs to match exactly, false if the item name only needs to include the translated name
     * @returns {boolean}
     */
    static is(itemName, baseName, exact = true) {
        return exact
            ? itemName === baseName
            : itemName.includes(baseName);
    }

    /** @param {string} itemName @param {string} baseName @returns {boolean} */
    static isImproved(itemName, baseName) { return itemName.includes(baseName) && itemName.includes(this.improved); }

    /** @param {string} itemName @param {string} baseName @returns {boolean} */
    static isGreater(itemName, baseName) { return itemName.includes(baseName) && itemName.includes(this.greater); }

    /** @param {string} itemName @param {string} baseName @returns {boolean} */
    static isMythic(itemName, baseName) { return itemName.includes(baseName) && itemName.includes(this.mythic); }

    static get itemNameTranslationsKey() { return 'item-name-translations'; }

    /** @type {string[]} */
    static itemNameTranslationKeys = [];

    /** @param {string} key */
    static registerItemNameTranslation = (key) => this.itemNameTranslationKeys.push(key);

    /** @param {string} key */
    static getTranslation = (key, toLowerCase = true) => {
        const current = this.itemNameTranslations;
        const value = current[key] || localize(`item-name-translations.${key}.default`);
        return toLowerCase
            ? value.toLocaleLowerCase()
            : value;
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

export class GlobalBonusSettings {
    /** @type {Set<RollBonusesAPI["BaseGlobalBonus"]>} */
    static #bonuses = new Set();
    static get bonusTypes() { return [...this.#bonuses]; }

    /** @param {RollBonusesAPI["BaseGlobalBonus"]} bonus */
    static registerKey(bonus) { this.#bonuses.add(bonus); }

    /** @abstract */
    static registerBonuses() { }

    static get globalBonusSettingsKey() { return 'global-bonuses'; }

    /** @returns {Record<string, boolean>} */
    static get #globalBonusSettings() {
        const current = game.settings.get(MODULE_NAME, this.globalBonusSettingsKey) || {};
        // @ts-ignore
        return current;
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    static setting(key) {
        return !Object.hasOwn(this.#globalBonusSettings, key) || !!this.#globalBonusSettings[key];
    }

    static {
        Hooks.once('init', () => {
            registerSetting({
                key: this.globalBonusSettingsKey,
                config: false,
                defaultValue: {},
                settingType: Object,
            }, {
                skipReady: true,
            });

            game.settings.registerMenu(MODULE_NAME, this.globalBonusSettingsKey, {
                name: `${MODULE_NAME}.global-settings.application.title`,
                label: `${MODULE_NAME}.global-settings.application.label`,
                hint: `${MODULE_NAME}.global-settings.application.hint`,
                icon: "ra ra-crossed-swords",
                type: GlobalBonusSettingsApplication,
                restricted: true,
            });
        });
    }
}

class GlobalBonusSettingsApplication extends FormApplication {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "ckl-global-bonuses";
        options.template = templates.globalBonusesConfigApp;
        options.height = "auto";
        options.width = 750;
        options.title = localize('global-settings.application.title');
        return options;
    }

    /** @override */
    getData(options = {}) {
        let context = super.getData()
        const sections = GlobalBonusSettings.bonusTypes.map((bonus) => ({
            description: localize(`global-settings.application.section.${bonus.bonusKey}.description`),
            issues: localize(`global-settings.application.section.${bonus.bonusKey}.issues`),
            key: bonus.key,
            label: bonus.label,
            value: GlobalBonusSettings.setting(bonus.key),
        }));

        context.key = GlobalBonusSettings.globalBonusSettingsKey;

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
        game.settings.set(MODULE_NAME, GlobalBonusSettings.globalBonusSettingsKey, update);
        SettingsConfig.reloadConfirm({ world: true });
    }
}
