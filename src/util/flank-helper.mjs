import { GangUp } from '../bonuses/flanking/gang-up.mjs';
import { OutflankImproved } from '../bonuses/flanking/outflank-improved.mjs';
import { PackFlanking } from '../bonuses/flanking/pack-flanking.mjs';
import { Swarming } from '../bonuses/flanking/swarming.mjs';
import { UnderfootAssault } from '../bonuses/flanking/underfoot-assault.mjs';
import { SoloTactics } from '../bonuses/solo-tactics.mjs';
import { Outflank } from '../global-bonuses/specific/bonuses/flanking/outflank.mjs';
import { MenacingBonus } from '../global-bonuses/targeted/bonuses/menacing.mjs';
import { handleBonusesFor } from '../target-and-bonus-join.mjs';
import { isMelee } from './action-type-helpers.mjs';
import { difference } from './array-intersects.mjs';
import { PositionalHelper } from './positional-helper.mjs';
import { truthiness } from './truthiness.mjs';

export class FlankHelper {

    get isFlanking() { return !!this.allFlankBuddies.length; }
    /**
     * @readonly
     * @type {TokenPF[]}
     */
    allFlankBuddies = [];

    /**
     * @readonly
     * @type {TokenPF[]}
     */
    get outflankBuddies() {
        return this.#hasOutflank(this.attacker)
            ? this.allFlankBuddies.filter(this.#hasOutflank)
            : [];
    };
    get isOutflanking() {
        return this.#hasOutflank(this.attacker)
            && (this.#hasSoloTactics(this.attacker) || !!this.outflankBuddies.length);
    }

    targetIsBeingMenaced = false;

    /** @returns {number} */
    get totalBonus() { return 2 + (this.isOutflanking ? 2 : 0) + (this.targetIsBeingMenaced ? 2 : 0); }

    /** @type {TokenPF} */ attacker;
    /** @type {TokenPF} */ target;

    /**
     * @param {TokenDocumentPF | TokenPF} attacker
     * @param {TokenDocumentPF | TokenPF} target
     * @param {object} [args]
     * @param {ItemAction} [args.action]
     * @param {TokenPF[]} [args.flankingWith]
     */
    constructor(
        attacker,
        target,
        {
            action = undefined,
            flankingWith = undefined,
        } = {
                action: undefined,
                flankingWith: undefined,
            }
    ) {
        /**
         * @param {TokenDocumentPF | TokenPF} t
         * @returns {TokenPF}
         */
        const toToken = (t) => (t instanceof pf1.documents.TokenDocumentPF
            ? t.object
            : t);

        const _attacker = toToken(attacker);
        const _target = toToken(target);

        if (_attacker.scene !== _target.scene) {
            throw new Error('tokens must be in the same scene');
        }

        this.attacker = _attacker;
        this.target = _target;

        if (this.#cannotBeFlanked(this.attacker, this.target)) {
            return;
        }

        let threateningAllies = flankingWith || this.attacker.scene.tokens
            .filter((x) => ![this.attacker.id, this.target.id].includes(x.id)
                && x.disposition !== this.target.document.disposition
                && x.disposition === this.attacker.document.disposition
            ).map(toToken)
            .filter((x) => new PositionalHelper(x, this.target).threatens());

        const attackerAndTarget = new PositionalHelper(this.attacker, this.target);
        if (!attackerAndTarget.threatens(action)) return;

        // is being menaced
        this.targetIsBeingMenaced = this.#hasMenacing(this.attacker, [action].filter(truthiness))
            || threateningAllies
                .filter((x) => new PositionalHelper(x, this.target).isAdjacent())
                .some((x) => this.#hasMenacing(x));

        // Gang Up
        if (this.#hasGangUp(this.attacker)) {
            if (threateningAllies.length >= 2) {
                this.allFlankBuddies.push(...threateningAllies);
                // no need to go further since they're all already accounted for
                return;
            }
        }

        // ratfolk swarming
        if (this.#hasSwarming(this.attacker)) {
            const withSwarming = threateningAllies.filter(this.#hasSwarming);
            this.allFlankBuddies.push(...withSwarming.filter((ally) => new PositionalHelper(this.attacker, ally).isSharingSquare()));
            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        //mouser
        if (this.#isMouser(this.attacker)) {
            if (attackerAndTarget.isSharingSquare()) {
                this.allFlankBuddies.push(...threateningAllies.filter((ally) =>
                    new PositionalHelper(this.attacker, ally).isAdjacent() && new PositionalHelper(ally, this.target).isAdjacent()
                ));

                threateningAllies = difference(threateningAllies, this.allFlankBuddies);
                if (!threateningAllies.length) return;
            }
        }
        // if any allies are mouser
        const mousers = threateningAllies.filter(this.#isMouser);
        if (mousers.length) {
            this.allFlankBuddies.push(...mousers.filter((mouser) => {
                const mouserAndTarget = new PositionalHelper(mouser, this.target);
                return mouserAndTarget.isSharingSquare() && new PositionalHelper(mouser, this.attacker).isAdjacent() && new PositionalHelper(this.attacker, this.target).isAdjacent();
            }));
            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        //pack flanking
        {
            this.allFlankBuddies.push(...threateningAllies.filter((ally) =>
                this.#hasPackFlanking(this.attacker, ally)
                && new PositionalHelper(ally, this.attacker).isAdjacent()
            ));

            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        //Improved Outflank
        if (this.#hasImprovedOutflank(this.attacker)) {
            this.allFlankBuddies.push(...threateningAllies.filter((ally) =>
                (this.#hasImprovedOutflank(ally) || this.#hasSoloTactics(this.attacker))
                && attackerAndTarget.isFlankingWith(ally, { hasImprovedOutflank: true, specificAction: action })
            ));

            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        // regular flanking
        this.allFlankBuddies.push(...threateningAllies.filter((ally) =>
            attackerAndTarget.isFlankingWith(ally, { specificAction: action })
        ));
    }

    /**
     * @param {TokenPF} attacker
     * @param {TokenPF} target
     * @returns {boolean}
     */
    #cannotBeFlanked(attacker, target) {
        // todo
        return false;
        // throw new Error('Method not implemented.');
    }

    // todo fill in logic for these getters

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    #hasGangUp(token) {
        return GangUp.has(token);
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    #hasOutflank(token) {
        return Outflank.has(token);
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    #hasImprovedOutflank(token) {
        return OutflankImproved.has(token);
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    #hasSoloTactics(token) {
        return SoloTactics.has(token);
    }

    /**
     * @param {TokenPF} token
     * @param {ItemAction[]} [actions]
     * @returns {boolean}
     */
    #hasMenacing(token, actions = []) {
        const actor = token.actor;
        if (!actor) return false;

        if (!actions.length) {
            actions = [...actor.itemTypes.attack, ...actor.itemTypes.weapon]
                .filter((item) => item.isActive)
                .flatMap((item) => [...item.actions])
                .filter((action) => isMelee(action.item, action));
        }

        let hasMenacing = false;
        handleBonusesFor(
            actions,
            () => hasMenacing = true,
            {
                specificBonusType: MenacingBonus
            }
        );

        return hasMenacing;
    }

    /**
     * @param {TokenPF} token
     * @param {TokenPF} partner
     * @returns {boolean}
     */
    #hasPackFlanking(token, partner) {
        return PackFlanking.has(token.actor, partner.actor) && PackFlanking.has(token.actor, partner.actor);
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    #hasSwarming(token) {
        return Swarming.has(token);
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    #isMouser(token) {
        return UnderfootAssault.has(token);
    }
}
