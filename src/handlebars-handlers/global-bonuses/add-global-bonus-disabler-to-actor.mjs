import { createTemplate, templates } from '../templates.mjs';

/**
 * @typedef {object} GlobalActorDisableSetting
 * @property {string} label
 * @property {string} journal
 * @property {string} path
 * @property {boolean} checked
 */

/**
 * @param {HTMLElement} actorSheetHtml
 * @param {GlobalActorDisableSetting[]} settings
 * @param {boolean} canEdit
 */
export const addGlobalBonusDisablerToActor = (actorSheetHtml, settings, canEdit) => {
    const tab = actorSheetHtml.querySelector('.tab.settings');
    if (!tab) {
        return;
    }

    const template = createTemplate(templates.globalBonusActorDisabledContainer, { settings });

    // @ts-ignore
    const journals = /** @type {HTMLElement[]} */ (template.querySelectorAll('[data-journal]'));
    journals.forEach((journal) => {
        journal?.addEventListener(
            'click',
            async (event) => {
                event.preventDefault();
                const journalLink = journal.dataset.journal;
                if (journalLink) {
                    const [uuid, header] = journalLink.split('#');
                    const doc = await fromUuid(uuid);

                    // @ts-ignore
                    if (doc instanceof JournalEntryPage) {
                        doc.parent.sheet.render(true, { pageId: doc.id, anchor: header });
                    } else {
                        doc.sheet.render(true);
                    }
                }
            },
        );
    });

    tab.appendChild(template);
}
