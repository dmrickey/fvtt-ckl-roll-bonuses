import { localize } from "../util/localize.mjs";
import { createTemplate, templates } from './templates.mjs';

const containerId = 'ckl-roll-bonus-container';

const addNodeToRollBonus = (
    /** @type {HTMLElement} */ itemSheetHtml,
    /** @type {Element} */ child,
) => {
    const flagsContainer = itemSheetHtml.querySelector('.tab[data-tab="advanced"] .tags');
    if (!flagsContainer || !child) {
        return;
    }

    let container = itemSheetHtml.querySelector(`#${containerId}`);
    if (!container) {
        container = createTemplate(templates.rollBonusesContainer);
        flagsContainer.after(container);
    }

    container.appendChild(child);
}

export { addNodeToRollBonus };
