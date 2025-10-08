import { BaseTarget } from '../_base-target.mjs';

/**
 * @abstract
 * @extends {BaseTarget}
 */
export class BaseConditionalTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get isConditionalTarget() { return true; }

    /**
     * @override
     * @returns {boolean}
     */
    static get isGenericTarget() { return true; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF & { actor: ActorPF }} item
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction} doc - originating doc event in case a specific action is needed
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources, doc) {
        return this._filterToApplicableSources(item.actor, sources, doc);
    }

    /**
     * For a given target source, does it target the `thing`?
     * @param {ItemPF} targetSource
     * @param {ActorPF} actor
     * @returns {boolean} True if this target source applies to the `thing`
     */
    static doesConditionalTargetInclude(targetSource, actor) {
        return !!this.getActiveConditionalActorSourcesFor(actor).find((bonusSource) => bonusSource.id === targetSource.id);
    }

    /**
     * Description used in the system's tooltips for conditional bonuses
     * @abstract
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) { throw new Error('must be overridden'); }

    /**
     * If the doc is targeted by this
     *
     * @virtual
     * @param {ActorPF} actor
     * @returns {ItemPF[]}
     */
    static getActiveConditionalActorSourcesFor(actor) {
        if (!actor) {
            return [];
        }

        const sources = actor.itemFlags?.boolean[this.key]?.sources ?? [];
        if (!sources.length) return [];

        // @ts-ignore checked above to make sure actor is defined
        return this._filterToApplicableSources(actor, sources) || [];
    };

    /**
     * @abstract
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction | undefined} doc - originating doc event in case a specific action is needed
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources, doc) { throw new Error('must be overridden'); }
}
