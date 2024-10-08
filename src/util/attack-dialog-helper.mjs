import { localize } from './localize.mjs'

/**
 * @param {HTMLElement} html
 * @param {string} key
 * @param {AttackDialog} dialog
 * @param {object} [options]
 * @param {string} [options.label]
 */
export const addCheckToAttackDialog = (html, key, dialog, { label = '' } = {}) => {
    label ||= localize(key);
    const flags = html.querySelector('div.form-group.stacked.flags');
    if (flags) {
        const labelElement = document.createElement('label');
        labelElement.classList.add('checkbox');

        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', key);

        input.checked = !!trackedApps.get(dialog.appId);
        input.addEventListener('change', function () {
            if (this.checked) {
                track(dialog.appId);
            } else {
                untrack(dialog.appId);
            }
        });

        labelElement.textContent = ` ${label} `;
        labelElement.insertBefore(input, labelElement.firstChild);
        flags.appendChild(labelElement);
        dialog.setPosition();
    }
}

const trackedApps = new Map();
/** @param {number} id */
const track = (id) => {
    trackedApps.set(id, true);
    // remove any tracked ids that are no longer present
    trackedApps.keys()
        // @ts-ignore
        .filter((key) => !ui.windows[key])
        .forEach(untrack);
}
/** @param {number} id */
const untrack = (id) => trackedApps.delete(id);

/**
 * @param {ActionUse} actionUse
 * @param {keyof ActionUseFormData} key
 * @returns
 */
export const hasFormData = (actionUse, key) => !!actionUse.formData[key];
