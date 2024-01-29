import { addNodeToRollBonus } from '../src/handlebars-handlers/roll-bonus-on-item-sheet.mjs';
import { createTemplate, templates } from './handlebars-handlers/templates.mjs';
import { getSets } from './utils/flag-helpers.mjs';
import { prepareData } from './utils/hbs-prepartion.mjs';

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const currentSets = getSets(item);
    const prepareSets = prepareData(actor, item, currentSets);
    const div = createTemplate(
        templates.targetBonusArea,
        { item, sets: prepareSets },
    );
    addNodeToRollBonus(html, div);
});
