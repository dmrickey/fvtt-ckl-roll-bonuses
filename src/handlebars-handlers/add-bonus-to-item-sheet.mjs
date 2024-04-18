import { api } from '../util/api.mjs';
import { showBonusPicker } from './bonus-picker.mjs';
import { createTemplate, templates } from './templates.mjs';

const containerId = 'ckl-roll-bonus-container';

/**
 * @param {HTMLElement} itemSheetHtml
 * @param {Element?} child
 * @param {ItemPF?} item
 * @param {boolean} canEdit
 */
const addNodeToRollBonus = (itemSheetHtml, child, item, canEdit) => {
    const flagsContainer = itemSheetHtml.querySelector('.tab[data-tab="advanced"] .tags');
    if (!flagsContainer || !item) {
        return;
    }

    let container = itemSheetHtml.querySelector(`#${containerId}`);
    if (!container) {
        container = createTemplate(templates.rollBonusesContainer);

        const settings = container.querySelector(`.settings`);
        if (canEdit) {
            settings?.addEventListener('click', (event) => {
                event.preventDefault();
                showBonusPicker({ item });
            });
        }
        else if (settings) {
            // @ts-ignore
            settings.hidden = true;
            // @ts-ignore
            settings.style.display = 'none';
        }

        flagsContainer.after(container);
    }

    if (!child) {
        return;
    }

    const button = child.querySelector('[data-journal]');
    button?.addEventListener(
        'click',
        async () => {
            // @ts-ignore // TODO
            const [uuid, header] = button.dataset.journal.split('#');
            const doc = await fromUuid(uuid);

            // @ts-ignore // TODO
            if (doc instanceof JournalEntryPage) {
                doc.parent.sheet.render(true, { pageId: doc.id, anchor: header });
            } else {
                doc.sheet.render(true);
            }
        },
    );

    container.appendChild(child);
}

export { addNodeToRollBonus };

api.inputs.addNodeToRollBonus = addNodeToRollBonus;
