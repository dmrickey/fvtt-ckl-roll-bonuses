import { MODULE_NAME } from "../consts.mjs";

export const templates =/** @type {const} */ ({
    // bonus container for item sheets
    rollBonusesContainer: `modules/${MODULE_NAME}/hbs/roll-bonuses-header.hbs`,

    // generic shortcuts
    checkboxInput: `modules/${MODULE_NAME}/hbs/checkbox-input.hbs`,
    enabledLabel: `modules/${MODULE_NAME}/hbs/enabled-label.hbs`,
    keyValueSelect: `modules/${MODULE_NAME}/hbs/labeled-key-value-dropdown-select.hbs`,
    stringSelect: `modules/${MODULE_NAME}/hbs/labeled-string-dropdown-select.hbs`,
    textInput: `modules/${MODULE_NAME}/hbs/text-input.hbs`,
    textInputAndKeyValueSelect: `modules/${MODULE_NAME}/hbs/text-input-and-key-value-select.hbs`,

    // preloaded specifics
    versatilePerformance: `modules/${MODULE_NAME}/hbs/versatile-performance-selector.hbs`,

    // targeted - bonuses
    damageInput: `modules/${MODULE_NAME}/hbs/targeted/bonuses/damage-input.hbs`,
    conditionals: 'systems/pf1/templates/apps/item-action/conditionals.hbs', // (targeted but belongs to pf1) belongs to pf1

    // targeted - targets
    checkedItems: `modules/${MODULE_NAME}/hbs/targeted/targets/checked-items.hbs`,
    editableIcons: `modules/${MODULE_NAME}/hbs/targeted/targets/editable-icons.hbs`,
    itemsApp: `modules/${MODULE_NAME}/hbs/targeted/targets/items-input-application.hbs`,
    targetWeaponGroup: `modules/${MODULE_NAME}/hbs/targeted/targets/weapon-group-input.hbs`,
    tokenApp: `modules/${MODULE_NAME}/hbs/targeted/targets/token-application.hbs`,

    // targeted - bonus or target
    textInputList: `modules/${MODULE_NAME}/hbs/targeted/text-input-list.hbs`,

    // bonus picker application
    bonusPicker: `modules/${MODULE_NAME}/hbs/bonus-picker.hbs`,
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

    throw new Error('should never happen');
}
