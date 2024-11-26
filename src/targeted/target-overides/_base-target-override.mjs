import { showInvalidLabel } from '../../handlebars-handlers/invalid-label.mjs';
import { BaseSource } from '../_base-source.mjs';

/** @abstract */
export class BaseTargetOverride extends BaseSource {
    /**
     * @override
     * @returns { string }
     */
    static get sourceBaseType() { return 'target-override'; }

    /**
     * @abstract
     * @param {ItemPF} item
     * @returns { boolean }
     */
    static isInvalidItemType(item) { return false; }

    /**
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInvalidInput({ actor, html, isEditable, item }) {
        showInvalidLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target-override',
        });
    }
}
