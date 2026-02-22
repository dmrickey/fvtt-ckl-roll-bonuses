import { initSpecificBonuses } from './bonuses/_init-specific-bonuses.mjs';
import './bonuses/ammunition.mjs';
import { addNodeToRollBonus } from './handlebars-handlers/add-bonus-to-item-sheet.mjs';
import './target-and-bonus-join.mjs';

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

initSpecificBonuses();
