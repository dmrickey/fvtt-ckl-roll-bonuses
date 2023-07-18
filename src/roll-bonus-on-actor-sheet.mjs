import { localize } from "./util/localize.mjs";

const headerId = 'ckl-roll-bonus-header';

const addElementToRollBonus = (
    /** @type {HTMLElement} */ itemSheetHtml,
    /** @type {HTMLDivElement} */ element,
) => {
    const flagsContainer = itemSheetHtml.querySelector('.tab[data-tab="advanced"] .tags');
    if (!flagsContainer || !element) {
        return;
    }

    let header = itemSheetHtml.querySelector(`#${headerId}`);
    if (!header) {
        header = document.createElement('h3');
        header.textContent = localize('rollBonuses');
        header.classList.add('form-header');
        header.id = headerId;

        const icon = document.createElement('i');
        icon.classList.add('fal', 'fa-dice-d20');

        header.prepend(icon);
        flagsContainer.after(header);
    }

    header.after(element);
}

export { addElementToRollBonus };
