import { MODULE_NAME } from "../consts.mjs";

export const templates = {
    // generic shortcuts
    itemTarget: `modules/${MODULE_NAME}/hbs/item-target.hbs`,
    keyValueSelect: `modules/${MODULE_NAME}/hbs/labeled-key-value-dropdown-select.hbs`,
    stringSelect: `modules/${MODULE_NAME}/hbs/labeled-string-dropdown-select.hbs`,
    textInput: `modules/${MODULE_NAME}/hbs/text-input.hbs`,
    textInputAndKeyValueSelect: `modules/${MODULE_NAME}/hbs/text-input-and-key-value-select.hbs`,

    // preloaded specifics
    versatilePerformance: `modules/${MODULE_NAME}/hbs/versatile-performance-selector.hbs`,

    // targeted bonuses
    damageInput: `modules/${MODULE_NAME}/hbs/targeted/bonuses/damage-input.hbs`,

    // targeted inputs
    targetWeaponGroup: `modules/${MODULE_NAME}/hbs/targeted/targets/weapon-group-input.hbs`,

    // belongs to pf1
    conditionals: 'systems/pf1/templates/apps/item-action/conditionals.hbs',
};

Hooks.on('ready', () => loadTemplates(Object.values(templates)));
