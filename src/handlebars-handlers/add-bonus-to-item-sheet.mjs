import { api } from '../util/api.mjs';
import { handleJournalClick } from '../util/handle-journal-click.mjs';
import { showBonusPicker } from './bonus-picker.mjs';
import { createTemplate, templates } from './templates.mjs';

const bonusSectionSelector = '#ckl-roll-bonus-container'
const containerSelector = '.bonuses';

const openDocumenation = async () => {
    const uuid = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC';
    const doc = await fromUuid(uuid);
    doc.sheet.render(true);
}

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

    /** @param {Element} elem */
    const addSettingsHandler = (elem) => {
        const settings = elem.querySelectorAll(`.settings`);
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

        const diceIcon = elem.querySelector('.form-header a:has(i.fas.fa-dice-d20');
        diceIcon?.addEventListener('click', (event) => {
            event.preventDefault();
            openDocumenation();
        });
    }

    let section = itemSheetHtml.querySelector(bonusSectionSelector);
    if (!section) {
        section = createTemplate(templates.rollBonusesContainer);
        addSettingsHandler(section);
        flagsContainer.before(section);
    }

    if (!child) {
        return;
    }

    const container = section.querySelector(containerSelector);
    if (!container) return;

    const button = /** @type {HTMLElement} */ (child.querySelector('[data-journal]'));
    button?.addEventListener(
        'click',
        async (event) => {
            event.preventDefault();
            await handleJournalClick(button);
        },
    );
    addSettingsHandler(child);

    container.appendChild(child);
}

export { addNodeToRollBonus };

api.inputs.addNodeToRollBonus = addNodeToRollBonus;
