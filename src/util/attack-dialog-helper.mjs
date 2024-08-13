import { localize } from './localize.mjs'

/**
 * @param {HTMLElement} html
 * @param {string} key
 * @param {object} [options]
 * @param {string} [options.label]
 */
export const addCheckToAttackDialog = (html, key, { label = '' } = {}) => {
    label ||= localize(key);
    const flags = html.querySelector('div.form-group.stacked.flags');
    if (flags) {
        const label = document.createElement('label');
        label.classList.add('checkbox');

        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', key);

        label.textContent = ` ${label} `;
        label.insertBefore(input, label.firstChild);
        flags.appendChild(label);
    }
}

/**
 * @param {ActionUse} actionUse
 * @param {keyof ActionUseFormData} key
 * @returns
 */
export const hasFormData = (actionUse, key) => !!actionUse.formData[key];
