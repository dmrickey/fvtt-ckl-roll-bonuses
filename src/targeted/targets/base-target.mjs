import { localizeTargetedTargetHint, localizeTargetedTargetLabel } from "../../util/localize.mjs";
import { BaseSource } from '../base-source.mjs';

/**
 * @abstract
 */
export class BaseTarget extends BaseSource {

    /**
     * @override
     * @returns { string }
     */
    static get sourceBaseType() { return 'target'; }

    /**
     * If the arg is targeted by this
     *
     * @abstract
     * @param {ItemPF | ActionUse | ItemAction} arg
     * @returns {ItemPF[]}
     */
    static getSourcesFor(arg) { throw new Error('must be overridden'); };

    /**
     * For a given target source, does it target the `thing`?
     * @param {ItemPF} targetSource
     * @param {ActionUse | ItemPF | ItemAction} thing
     * @returns {boolean} True if this target source applies to the `thing`
     */
    static doesTargetInclude(targetSource, thing) {
        return !!this.getSourcesFor(thing).find((bonusSource) => bonusSource.id === targetSource.id);
    }

    /**
     * Returns true the targeting is too generic to show a hint on a specific item
     * - generally means this is a "token" target that does not have a specific targeted item
     * - also used for "self item targets" which already show the bonus, so don't need to show the target as well on the same item
     *
     * @abstract
     * @returns {boolean}
     */
    static get isGenericTarget() { return false; }

    /**
     * @override
     * Label for this target source
     * @returns { string }
     */
    static get label() { return localizeTargetedTargetLabel(this.sourceKey); }

    /**
     * Returns true if this target should show its editor when the Item is made is active
     *
     * @abstract
     * @returns {boolean}
     */
    static get showOnActive() { return false; }

    /**
     * Shows editor for target
     *
     * @param {ItemPF} source
     */
    static showTargetEditor(source) { }

    /**
     * @override
     * @inheritdoc
     * @returns { string }
     */
    static get tooltip() { return localizeTargetedTargetHint(this.sourceKey); }

}
