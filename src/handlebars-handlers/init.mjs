import { MODULE_NAME } from "../consts.mjs";

export const templates = {
    labeledKeyValueSelect: `modules/${MODULE_NAME}/hbs/labeled-key-value-dropdown-selector.hbs`,
    labeledStringSelect: `modules/${MODULE_NAME}/hbs/labeled-string-dropdown-selector.hbs`,
    labeledTextInputKeyValueSelect: `modules/${MODULE_NAME}/hbs/labeled-formula-key-value-selector.hbs`,

    // todo probably don't need this
    racialWeaponFocusSelect: `modules/${MODULE_NAME}/hbs/racial-weapon-focus-selector.hbs`,

    // todo should use labeledTextInputKeyValueSelect
    schoolClOffset: `modules/${MODULE_NAME}/hbs/school-cl-offset.hbs`,

    // todo should use labeledKeyValueSelect
    spellFocus: `modules/${MODULE_NAME}/hbs/spell-focus-selector.hbs`,

    textInput: `modules/${MODULE_NAME}/hbs/text-input.hbs`,
    versatilePerformance: `modules/${MODULE_NAME}/hbs/versatile-performance-selector.hbs`,
};

Hooks.on('ready', () => loadTemplates(Object.values(templates)));
