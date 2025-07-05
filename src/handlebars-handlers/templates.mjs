import { MODULE_NAME } from "../consts.mjs";

export const templates = /** @type {const} */ ({
    /** bonus container for item sheets */
    rollBonusesContainer: `modules/${MODULE_NAME}/hbs/roll-bonuses-container.hbs`,
    targetHeaderToggle: `modules/${MODULE_NAME}/hbs/target-header-toggle.hbs`,

    /** container for turning off global bonuses on actors */
    globalBonusActorDisabledContainer: `modules/${MODULE_NAME}/hbs/global-bonus-actor-disabled-container.hbs`,

    // generic shortcuts
    checkboxInput: `modules/${MODULE_NAME}/hbs/checkbox-input.hbs`,
    enabledLabel: `modules/${MODULE_NAME}/hbs/enabled-label.hbs`,
    invalidLabel: `modules/${MODULE_NAME}/hbs/invalid-label.hbs`,
    keyValueSelect: `modules/${MODULE_NAME}/hbs/labeled-key-value-dropdown-select.hbs`,
    radioInput: `modules/${MODULE_NAME}/hbs/radio-input.hbs`,
    stringSelect: `modules/${MODULE_NAME}/hbs/labeled-string-dropdown-select.hbs`,
    textInput: `modules/${MODULE_NAME}/hbs/text-input.hbs`,
    textInputAndKeyValueSelect: `modules/${MODULE_NAME}/hbs/text-input-and-key-value-select.hbs`,

    /** versatile performance picker used on item sheets */
    versatilePerformance: `modules/${MODULE_NAME}/hbs/versatile-performance-selector.hbs`,

    // targeted - bonuses
    conditionalsInput: `modules/${MODULE_NAME}/hbs/targeted/bonuses/conditionals-input.hbs`,
    damageInput: `modules/${MODULE_NAME}/hbs/targeted/bonuses/damage-input.hbs`,
    scriptCallBonus: `modules/${MODULE_NAME}/hbs/targeted/bonuses/script-call-bonus-input.hbs`,

    // targeted - targets
    actionsAppV2: `modules/${MODULE_NAME}/hbs/targeted/targets/actions-input-application-v2.hbs`,
    actorSelectApp: `modules/${MODULE_NAME}/hbs/targeted/targets/actor-select-application.hbs`,
    checklist: `modules/${MODULE_NAME}/hbs/targeted/targets/checklist.hbs`,
    editableIcons: `modules/${MODULE_NAME}/hbs/targeted/targets/editable-icons.hbs`,
    itemsApp: `modules/${MODULE_NAME}/hbs/targeted/targets/items-input-application.hbs`,
    targetWeaponGroup: `modules/${MODULE_NAME}/hbs/targeted/targets/weapon-group-input.hbs`,
    tokenSelectApp: `modules/${MODULE_NAME}/hbs/targeted/targets/token-select-application.hbs`,
    traitInput: `modules/${MODULE_NAME}/hbs/targeted/targets/trait-input.hbs`,

    /** bonus picker application */
    bonusPicker: `modules/${MODULE_NAME}/hbs/bonus-picker.hbs`,
    /** bonus picker indivudal item row */
    bonusPickerItem: `modules/${MODULE_NAME}/hbs/bonus-picker-item.hbs`,

    /** label used for all bonuses that shows label, tooltip, and journal */
    label: `modules/${MODULE_NAME}/hbs/label.hbs`,
    labelPartial: `modules/${MODULE_NAME}/hbs/label-partial.hbs`,

    /** item name translation app for auto-recognition */
    itemNameTranslationConfigApp: `modules/${MODULE_NAME}/hbs/item-name-translation-config.hbs`,

    /** combat settings for automatic bonsuses */
    globalBonusesConfigApp: `modules/${MODULE_NAME}/hbs/gm-global-settings-config.hbs`,
});

/**
 * @param {typeof templates[keyof typeof templates]} template
 * @param {Record<string, any>} [templateData]
 * @returns {Element}
 */
export function createTemplate(template, templateData = {}) {
    const div = document.createElement('div');
    div.innerHTML = Handlebars.partials[template](
        templateData,
        { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true },
    );

    const child = div.firstChild;
    if (child instanceof Element) {
        return child;
    }

    console.error('should never happen', template, div.innerHTML)
    throw new Error('should never happen');
}
