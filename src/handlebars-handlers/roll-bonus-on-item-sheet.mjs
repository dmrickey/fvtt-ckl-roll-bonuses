import { localize } from "../util/localize.mjs";

const containerId = 'ckl-roll-bonus-container';

const addNodeToRollBonus = (
    /** @type {HTMLElement} */ itemSheetHtml,
    /** @type {HTMLDivElement} */ child,
) => {
    const flagsContainer = itemSheetHtml.querySelector('.tab[data-tab="advanced"] .tags');
    if (!flagsContainer || !child) {
        return;
    }

    let container = itemSheetHtml.querySelector(`#${containerId}`);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;

        const header = document.createElement('h3');
        header.textContent = localize('roll-bonuses');
        header.classList.add('form-header');

        const icon = document.createElement('i');
        icon.classList.add('fal', 'fa-dice-d20');

        header.prepend(icon);

        container.appendChild(header);

        flagsContainer.after(container);
    }

    container.appendChild(child);
}

export { addNodeToRollBonus };
