import { MODULE_NAME } from '../consts.mjs';
import { api } from '../util/api.mjs';
import { handleJournalClick } from '../util/handle-journal-click.mjs';
import { localize } from '../util/localize.mjs';
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
 * @param {InputType?} [inputType]
*/
const addNodeToRollBonus = (itemSheetHtml, child, item, canEdit, inputType) => {
    const flagsContainer = itemSheetHtml.querySelector('.tab[data-tab="advanced"] .tags')
        || itemSheetHtml.querySelector('.tab[data-tab="advanced"] .flags');
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

    let bonusContainer = null;
    if (inputType && item) {
        let bonusContainer = container.querySelector(`.${inputType}`);
        if (!bonusContainer) {
            bonusContainer = document.createElement('div');
            bonusContainer.classList.add(inputType);
            const header = document.createElement('h2');
            header.innerText = localize(`bonus-header-labels.${inputType}`);
            header.classList.add('bonus-header');

            if (inputType === 'target') {
                const headerContainer = document.createElement('div');
                headerContainer.classList.add('target-header');
                headerContainer.appendChild(header);
                bonusContainer.append(headerContainer);
            }
            else {
                bonusContainer.appendChild(header);
            }

            container.appendChild(bonusContainer);
        }
        // if target header already exists, then add target all/any toggle because this is the second target on it
        else if (inputType === 'target') {
            const hasToggle = !!bonusContainer.querySelector('.target-toggle');
            const targetsOnItem = item[MODULE_NAME].targets.length;
            if (!hasToggle && targetsOnItem >= 2) {
                const headerContainer = bonusContainer.querySelector('.target-header');
                if (headerContainer) {
                    const toggle = createTemplate(
                        templates.targetHeaderToggle,
                        {
                            readonly: !canEdit,
                            current: item.getFlag(MODULE_NAME, 'target-toggle') || 'all',
                        },
                    );
                    headerContainer.appendChild(toggle);
                }
            }
        }
    }

    const button = /** @type {HTMLElement} */ (child.querySelector('[data-journal]'));
    button?.addEventListener(
        'click',
        async (event) => {
            event.preventDefault();
            await handleJournalClick(button);
        },
    );
    addSettingsHandler(child);

    (bonusContainer ?? container).appendChild(child);
}

export { addNodeToRollBonus };

api.inputs.addNodeToRollBonus = addNodeToRollBonus;
