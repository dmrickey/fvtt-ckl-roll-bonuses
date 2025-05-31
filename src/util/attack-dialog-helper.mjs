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
 */
export const addCheckToAttackDialog = (
    html,
    key,
    dialog,
    {
        checked = false,
        label = undefined,
        isConditional = false,
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

        if (checked) {
            DialogBooleanTracker.track(dialog.appId, key);
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', key);
        if (isConditional) {
            input.classList.add('conditional');
        }

        input.checked = DialogBooleanTracker.isTracked(dialog.appId, key);
        input.addEventListener('change', function () {
            if (this.checked) {
                DialogBooleanTracker.track(dialog.appId, key);
            } else {
                DialogBooleanTracker.untrack(dialog.appId, key);
            }
        });

        labelElement.textContent = ` ${label} `;
        labelElement.insertBefore(input, labelElement.firstChild);
        container.appendChild(labelElement);
        dialog.setPosition();
    }
}

class DialogBooleanTracker {
    /** @typedef {number} AppId */

    /** @type {Map<AppId, Map<string, boolean>>} */
    static #trackedApplications = new Map();

    /**
     * @param {AppId} id
     * @param {string} key
     */
    static track(id, key) {
        this.#trackedApplications.has(id)
            ? this.#trackedApplications.get(id)?.set(key, true)
            : this.#trackedApplications.set(id, new Map([[key, true]]));

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
    static isTracked(id, key) {
        return !!this.#trackedApplications.get(id)?.get(key);
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

api.utils.addCheckToAttackDialog = addCheckToAttackDialog;

/**
 * @param {ActionUse} actionUse
 * @param {keyof ActionUseFormData} key
 * @returns {boolean | undefined}
 */
export const getFormData = (actionUse, key) => {
    const formValue = actionUse.formData[key];
    return formValue;
}
