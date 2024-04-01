import { addNodeToRollBonus } from '../handlebars-handlers/add-bonus-to-item-sheet.mjs';
import './extreme-mood-swings.mjs'
import './weapon-finesse.mjs';

Hooks.on(
    'renderItemSheet',
    (
        /** @type {ItemSheetPF} */ { isEditable, item },
        /** @type {[HTMLElement]} */[html],
        /** @type {unknown} */ _data
    ) => {
        addNodeToRollBonus(html, null, item, isEditable);
    }
);
