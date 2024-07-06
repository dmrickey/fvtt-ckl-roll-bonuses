import { api } from '../util/api.mjs';
import { showBonusPicker } from './bonus-picker.mjs';
import { createTemplate, templates } from './templates.mjs';

const bonusSectionSelector = '#ckl-roll-bonus-container'
const containerSelector = '.bonuses';

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

    let section = itemSheetHtml.querySelector(bonusSectionSelector);
    if (!section) {
        section = createTemplate(templates.rollBonusesContainer);

        const settings = section.querySelectorAll(`.settings`);
        settings.forEach((s) => {
            if (canEdit) {
                s?.addEventListener('click', (event) => {
                    event.preventDefault();
                    showBonusPicker({ item });
                });
            }
            else if (s) {
                // @ts-ignore
                s.hidden = true;
                // @ts-ignore
                s.style.display = 'none';
            }
        });

        flagsContainer.before(section);
    }

    if (!child) {
        return;
    }

    const container = section.querySelector(containerSelector);
    if (!container) return;

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
