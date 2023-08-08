import { templates } from "../handlebars-handlers/init.mjs";
import { addNodeToRollBonus } from "../handlebars-handlers/roll-bonus-on-actor-sheet.mjs";

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const name = item?.name?.toLowerCase() ?? '';
    if (!actor) return;

    const templateData = { label: 'title here', current: 'in input' };

    const div = document.createElement('div');
    div.innerHTML = Handlebars.partials[templates.itemTarget](templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    addNodeToRollBonus(html, div);
});



