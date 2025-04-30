import { api } from './api.mjs';
import { localize } from './localize.mjs';
import { truthiness } from './truthiness.mjs';

/**
 * @param {string[] | undefined} classes
 * @returns {string}
 */
const buildClasses = (classes) => {
    if (!classes?.length) return '';

    const sanitized = classes
        .filter(truthiness);
    return ' class="' + sanitized.join((' ')) + '"';
}

/**
 * Prompts an "are you sure?" message giving the user a chance to confirm/cancel
 *
 * @param {object} args
 * @param {string} args.title
 * @param {string} args.message
 * @param {() => void} args.confirmCallback
 * @param {object} [options]
 * @param {string[]} [options.classes]
 * @returns
 */
export const confirmationDialog = ({
    title,
    message,
    confirmCallback,
}, {
    classes,
} = {}) =>
    new Dialog({
        title,
        content: `
            <div${buildClasses(classes)} style="text-align:center;margin-block-end:1rem;text-wrap:balance;">
              ${message}
            </div>
        `,
        buttons: {
            cancel: {
                label: localize('Cancel'),
            },
            submit: {
                label: localize('PF1.Confirm'),
                callback: confirmCallback,
            },
        },
        default: "submit"
    }).render(true);

api.utils.confirmationDialog = confirmationDialog;
