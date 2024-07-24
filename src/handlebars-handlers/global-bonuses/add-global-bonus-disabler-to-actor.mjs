import { createTemplate, templates } from '../templates.mjs';

const combatBonusSectionSelector = '#ckl-roll-bonus-container'

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

    tab.appendChild(template);
}
