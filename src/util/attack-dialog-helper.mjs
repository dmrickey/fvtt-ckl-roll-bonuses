import { api } from './api.mjs';
import { localize } from './localize.mjs'

/**
 * @param {HTMLElement} html
 * @param {string} key
 * @param {AttackDialog} dialog
 * @param {object} [options]
 * @param {boolean} [options.checked]
 * @param {boolean} [options.isConditional]
 * @param {string} [options.label]
 * @param {string} [options.title]
 */
export const addCheckToAttackDialog = (
    html,
    key,
    dialog,
    {
        checked = false,
        label = undefined,
        isConditional = false,
        title = undefined,
    } = {},
) => {
    if (!(dialog instanceof pf1.applications.AttackDialog)) {
        return;
    }

    if (label === undefined) {
        label = localize(key);
    }

    const group = isConditional ? 'conditionals' : 'flags';

    let container = html.querySelector(`div.form-group.stacked.${group}`);

    if (!container) {
        container = document.createElement('div');
        container.classList.add('form-group', 'stacked', group);
        const label = document.createElement('label');
        const labelText = isConditional
            ? localize('PF1.Conditionals')
            : localize('PF1.Misc');
        label.textContent = ` ${labelText} `;
        container.appendChild(label);

        const sibling = html.querySelector('.form-group.flags') || html.querySelector('.form-group');
        if (sibling) {
            sibling.after(container);
        }
    }

    if (container) {
        const labelElement = document.createElement('label');
        labelElement.classList.add('checkbox');
        labelElement.textContent = ` ${label} `;
        if (title) {
            labelElement.setAttribute('title', title);
        }

        if (checked) {
            DialogValueTracker.track(dialog.appId, key);
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', key);
        if (isConditional) {
            input.classList.add('conditional');
        }
        if (title) {
            input.setAttribute('title', title);
        }

        input.checked = DialogValueTracker.getTracked(dialog.appId, key);
        input.addEventListener('change', function () {
            if (this.checked) {
                DialogValueTracker.track(dialog.appId, key);
            } else {
                DialogValueTracker.untrack(dialog.appId, key);
            }
        });

        labelElement.insertBefore(input, labelElement.firstChild);
        container.appendChild(labelElement);
        dialog.setPosition();
    }
}

/**
 * @param {HTMLElement} html
 * @param {string} key
 * @param {AttackDialog} dialog
 * @param {object} options
 * @param {string[]} options.iconClasses
 * @param {string} [options.label]
 * @param {string} options.placeholder
 * @param {string} [options.value]
 */
export const addTextInputToAttackDialog = (
    html,
    key,
    dialog,
    {
        iconClasses,
        label = undefined,
        placeholder,
        value = '',
    },
) => {
    if (!(dialog instanceof pf1.applications.AttackDialog)) {
        return;
    }

    if (label === undefined) {
        label = localize(key);
    }

    let container = html.querySelector('div.form-group:has(input[name="damage-bonus"])');

    if (container) {
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group');

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        formGroup.appendChild(labelElement);

        const formFields = document.createElement('div');
        formFields.classList.add('form-fields');
        formGroup.appendChild(formFields);

        const icon = document.createElement('i');
        icon.classList.add('fa-fw', 'roll-bonus-icon', ...iconClasses);
        icon.inert = true;
        formFields.appendChild(icon);

        const input = document.createElement('input');
        input.classList.add('attribute');
        input.setAttribute('name', key);
        input.setAttribute('placeholder', placeholder);
        input.setAttribute('type', 'text');
        input.value = DialogValueTracker.getTracked(dialog.appId, key) || value;

        input.addEventListener('change', function () {
            DialogValueTracker.track(dialog.appId, key, this.value);
        });
        formFields.appendChild(input);

        container.after(formGroup);
        dialog.setPosition();
    }
}

/** @typedef {number} AppId */

class DialogValueTracker {

    /** @type {Map<AppId, Map<string, any>>} */
    static #trackedApplications = new Map();

    /**
     * @param {AppId} id
     * @param {string} key
     * @param {any} value
     */
    static track(id, key, value = true) {
        this.#trackedApplications.has(id)
            ? this.#trackedApplications.get(id)?.set(key, value)
            : this.#trackedApplications.set(id, new Map([[key, value]]));

        // remove any tracked ids that are no longer on screen
        const toRemove = [...this.#trackedApplications.keys()]
            // @ts-ignore
            .filter((key) => !ui.windows[key]);
        for (const key of toRemove) {
            this.#removeApp(key);
        }
    }

    /**
     * @param {AppId} id
     * @param {string} key
     */
    static getTracked(id, key) {
        return this.#trackedApplications.get(id)?.get(key) || false;
    }

    /**
     * @param {AppId} id
     * @param {string} key
     */
    static untrack(id, key) {
        return !!this.#trackedApplications.get(id)?.delete(key);
    }

    /** @param {AppId} id */
    static #removeApp(id) { this.#trackedApplications.delete(id); }
}

/**
 * @template {keyof ActionUseFormData} K
 * @param {ActionUse | ActionUseShared } actionUse
 * @param {K} key
 * @returns {ActionUseFormData[K] | undefined}
 */
export const getFormData = (actionUse, key) => {
    const formValue = actionUse.formData?.[key];
    return formValue;
}

api.utils.addCheckToAttackDialog = addCheckToAttackDialog;
api.utils.addTextInputToAttackDialog = addTextInputToAttackDialog;
api.utils.getFormData = getFormData;
