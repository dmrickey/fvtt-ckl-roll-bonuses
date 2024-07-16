import { MODULE_NAME } from "../consts.mjs";

export const templates =/** @type {const} */ ({
    /** bonus container for item sheets */
    rollBonusesContainer: `modules/${MODULE_NAME}/hbs/roll-bonuses-header.hbs`,

    // generic shortcuts
    checkboxInput: `modules/${MODULE_NAME}/hbs/checkbox-input.hbs`,
    enabledLabel: `modules/${MODULE_NAME}/hbs/enabled-label.hbs`,
    keyValueSelect: `modules/${MODULE_NAME}/hbs/labeled-key-value-dropdown-select.hbs`,
    stringSelect: `modules/${MODULE_NAME}/hbs/labeled-string-dropdown-select.hbs`,
    textInput: `modules/${MODULE_NAME}/hbs/text-input.hbs`,
    textInputAndKeyValueSelect: `modules/${MODULE_NAME}/hbs/text-input-and-key-value-select.hbs`,

    /** versatile performance picker used on item sheets */
    versatilePerformance: `modules/${MODULE_NAME}/hbs/versatile-performance-selector.hbs`,

    /** damage input used on item sheets */
    damageInput: `modules/${MODULE_NAME}/hbs/targeted/bonuses/damage-input.hbs`,

    /** not used */
    conditionals: 'systems/pf1/templates/apps/item-action/conditionals.hbs', // (targeted but belongs to pf1) belongs to pf1

    // targeted - targets
    checklist: `modules/${MODULE_NAME}/hbs/targeted/targets/checklist.hbs`,
    editableIcons: `modules/${MODULE_NAME}/hbs/targeted/targets/editable-icons.hbs`,
    itemsApp: `modules/${MODULE_NAME}/hbs/targeted/targets/items-input-application.hbs`,
    targetWeaponGroup: `modules/${MODULE_NAME}/hbs/targeted/targets/weapon-group-input.hbs`,
    tokenApp: `modules/${MODULE_NAME}/hbs/targeted/targets/token-application.hbs`,

    /** bonus picker application */
    bonusPicker: `modules/${MODULE_NAME}/hbs/bonus-picker.hbs`,
    /** bonus picker indivudal item row */
    bonusPickerItem: `modules/${MODULE_NAME}/hbs/bonus-picker-item.hbs`,

    /** label used for all bonuses that shows label, tooltip, and journal */
    label: `modules/${MODULE_NAME}/hbs/label.hbs`,

    /** item name translation app for auto-recognition */
    itemNameTranslationConfigApp: `modules/${MODULE_NAME}/hbs/item-name-translation-config.hbs`,

    /** combat settings for automatic bonsuses */
    automaticCombatBonusesConfigApp: `modules/${MODULE_NAME}/hbs/gm-combat-settings-config.hbs`,
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
