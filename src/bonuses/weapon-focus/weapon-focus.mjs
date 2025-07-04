import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from '../../handlebars-handlers/bonus-inputs/string-select.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { getDocFlags } from '../../util/flag-helpers.mjs';
import { getWeaponTypesFromActor } from '../../util/get-weapon-types-from-actor.mjs';
import { LanguageSettings, registerSetting, SharedSettings } from '../../util/settings.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';

class BaseWeaponFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-focus'; }

    /**
     * @param { ActorPF | ItemPF } doc
     * @param {object} [options]
     * @param {boolean} [options.onlyActive] Default true - if it should return when the bonus is active
     * @returns {string[]}
     */
    static getFocusedWeapons(doc, { onlyActive = true } = { onlyActive: true }) {
        return getDocFlags(doc, this.key, { onlyActive });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} weaponType
     * @returns {Promise<void>}
     */
    static async configure(item, weaponType) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: weaponType } },
        });
    }
}

export class WeaponFocus extends BaseWeaponFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'weapon-focus'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'n250dFlbykAIAg5Z',
            ignoreFunc: (_item) => SharedSettings.elephantInTheRoom,
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = isEditable
                    ? getWeaponTypesFromActor(actor)
                    : [];

                stringSelect({
                    choices,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const actor = item?.actor;
                    if (!actor) return;

                    const choices = getWeaponTypesFromActor(actor);
                    if (choices.length) {
                        return { [this.key]: choices[0] };
                    }
                }
            }
        };
    }
}
export class WeaponFocusGreater extends BaseWeaponFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'weapon-focus-greater'; }

    /** @inheritdoc @override */
    static get parent() { return WeaponFocus.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'IER2MzJrjSvxMlNS',
            ignoreFunc: (_item) => SharedSettings.elephantInTheRoom,
            isItemMatchFunc: (name) => LanguageSettings.isGreater(name, Settings.name),
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = actor
                    ? WeaponFocus.getFocusedWeapons(actor)
                    : [];

                stringSelect({
                    choices,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const actor = item?.actor;
                    if (!actor) return;

                    const choices = actor
                        ? WeaponFocus.getFocusedWeapons(actor)
                        : [];
                    if (choices.length) {
                        return { [this.key]: choices[0] };
                    }
                }
            }
        };
    }
}
export class WeaponFocusMythic extends BaseWeaponFocus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'weapon-focus-mythic'; }

    /** @inheritdoc @override */
    static get parent() { return WeaponFocus.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'stJ6Jp1ALN6qgGBr',
            ignoreFunc: (_item) => SharedSettings.elephantInTheRoom,
            isItemMatchFunc: (name) => LanguageSettings.isMythic(name, Settings.name),
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = actor
                    ? WeaponFocus.getFocusedWeapons(actor)
                    : [];

                stringSelect({
                    choices,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const actor = item?.actor;
                    if (!actor) return;

                    const choices = actor
                        ? WeaponFocus.getFocusedWeapons(actor)
                        : [];
                    if (choices.length) {
                        return { [this.key]: choices[0] };
                    }
                }
            }
        };
    }
}

export class WeaponFocusRacial extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'weapon-focus-racial'; }

    /** @inheritdoc @override */
    static get journal() { return WeaponFocus.journal; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: '8RzIeYtbx0UtXUge',
            ignoreFunc: (_item) => SharedSettings.elephantInTheRoom,
            isItemMatchFunc: (name) => name === Settings.racialWeaponFocus,
            showInputsFunc: (item, html, isEditable) => {
                const current = item.getFlag(MODULE_NAME, WeaponFocusRacial.key);
                textInput({
                    current,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    isFormula: false,
                    inputType: 'bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: () => {
                    return { [this.key]: Settings.defaultRace };
                }
            }
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(WeaponFocus.key); }

    static #defaultRaceKey = 'weapon-focus-racial-default-race';

    static get racialWeaponFocus() { return Settings.#getSetting(WeaponFocusRacial.key); }
    static get defaultRace() { return Settings.#getSetting(this.#defaultRaceKey); }

    /** This is a per-client string which is different than all the other language settings */
    static #getSetting(/** @type {string} */key) { return /** @type {string} */ (game.settings.get(MODULE_NAME, key)).toLowerCase(); }

    static {
        registerSetting({ key: WeaponFocusRacial.key, scope: 'client' });
        registerSetting({ key: this.#defaultRaceKey, scope: 'client' });

        LanguageSettings.registerItemNameTranslation(WeaponFocus.key);
    }
}
