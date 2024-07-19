import { createTemplate, templates } from '../templates.mjs';

const combatBonusSectionSelector = '#ckl-roll-bonus-container'

/**
 * @param {HTMLElement} itemSheetHtml
 * @param {Element?} child
 * @param {boolean} canEdit
 */
const addNodeToRollBonus = (itemSheetHtml, child, canEdit) => {
    const flagsContainer = itemSheetHtml.querySelector('.tab[data-tab="advanced"] .tags');
    if (!flagsContainer) {
        return;
    }

    /** @param {Element} elem */
    const addSettingsHandler = (elem) => {
        const settings = elem.querySelectorAll(`.settings`);
        settings.forEach((s) => {
            if (canEdit) {
                s?.addEventListener('click', (event) => {
                    event.preventDefault();
                });
            }
            else if (s) {
                // @ts-ignore
                s.hidden = true;
                // @ts-ignore
                s.style.display = 'none';
            }
        });
    }

    let section = itemSheetHtml.querySelector(combatBonusSectionSelector);
    if (!section) {
        section = createTemplate(templates.globalBonusActorDisabledContainer);
        addSettingsHandler(section)
        flagsContainer.before(section);
    }

    if (!child) {
        return;
    }

    const container = section.querySelector(combatBonusSectionSelector);
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
    addSettingsHandler(child);

    container.appendChild(child);
}
