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
        return this._getConditionalActorSourcesFor(item.actor, sources, doc);
    }

    /**
     * @abstract
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction} doc - originating doc event in case a specific action is needed
     * @returns {ItemPF[]}
     */
    static _getConditionalActorSourcesFor(actor, sources, doc) { throw new Error('must be overridden'); }
}