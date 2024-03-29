import { showBonusPicker } from './bonus-picker.mjs';
import { createTemplate, templates } from './templates.mjs';

const containerId = 'ckl-roll-bonus-container';

/**
 * @param {HTMLElement} itemSheetHtml
 * @param {Element} child
 * @param {ItemPF?} item
 */
const addNodeToRollBonus = (itemSheetHtml, child, item) => {
    const flagsContainer = itemSheetHtml.querySelector('.tab[data-tab="advanced"] .tags');
    if (!flagsContainer || !child || !item) {
        return;
    }

    let container = itemSheetHtml.querySelector(`#${containerId}`);
    if (!container) {
        container = createTemplate(templates.rollBonusesContainer);

        const settings = container.querySelector(`.settings`);
        settings?.addEventListener('click', (event) => {
            event.preventDefault();
            showBonusPicker({ item });
        });

        flagsContainer.after(container);
    }

    const button = child.querySelector('[data-compendium-entry]');
    if (button) {
        // const uuid = button.dataset?.compendiumEntry;
        debugger;
    }

    container.appendChild(child);
}

export { addNodeToRollBonus };
