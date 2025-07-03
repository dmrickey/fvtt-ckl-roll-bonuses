import { FlankingImmunity } from '../bonuses/flanking/flanking-immunity.mjs';
import { GangUp } from '../bonuses/flanking/gang-up.mjs';
import { OutflankImproved } from '../bonuses/flanking/outflank-improved.mjs';
import { PackFlanking } from '../bonuses/flanking/pack-flanking.mjs';
import { Swarming } from '../bonuses/flanking/swarming.mjs';
import { UncannyDodgeImproved } from '../bonuses/flanking/uncanny-dodge-improved.mjs';
import { UnderfootAssault } from '../bonuses/flanking/underfoot-assault.mjs';
import { SoloTactics } from '../bonuses/solo-tactics.mjs';
import { Outflank } from '../global-bonuses/specific/bonuses/flanking/outflank.mjs';
import { MenacingBonus } from '../global-bonuses/targeted/bonuses/menacing.mjs';
import { handleBonusesFor } from '../target-and-bonus-join.mjs';
import { isMelee } from './action-type-helpers.mjs';
import { difference } from './array-intersects.mjs';
import { localize } from './localize.mjs';
import { PositionalHelper } from './positional-helper.mjs';
import { toArray } from './to-array.mjs';
import { truthiness } from './truthiness.mjs';
import { api } from './api.mjs';
import { ifDebug } from './if-debug.mjs';

/**
 * @param {TokenDocumentPF | TokenPF} t
 * @returns {TokenPF}
 */
const toToken = (t) => (t instanceof pf1.documents.TokenDocumentPF
    ? t.object
    : t);

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
            && (this.#hasSoloTactics(this.attacker, this.allFlankBuddies) || !!this.outflankBuddies.length);
    }

    targetIsBeingMenaced = false;

    /** @returns {string} */
    get formula() {
        const parts = [];
        if (this.isFlanking) parts.push(`2[${localize('PF1.Flanking')}]`);
        if (this.isOutflanking) parts.push(`2[${Outflank.label}]`);
        if (this.targetIsBeingMenaced) parts.push(`2[${MenacingBonus.label}]`);
        return parts.join(' + ');
    }

    /** @returns {string} */
    get formulaWithoutBase() {
        const parts = [];
        if (this.isOutflanking) parts.push(`2[${Outflank.label}]`);
        if (this.targetIsBeingMenaced) parts.push(`2[${MenacingBonus.label}]`);
        return parts.join(' + ');
    }

    /** @returns {number} */
    get totalBonus() { return (this.isFlanking ? 2 : 0) + (this.isOutflanking ? 2 : 0) + (this.targetIsBeingMenaced ? 2 : 0); }

    /** @type {TokenPF} */ attacker;
    /** @type {TokenPF} */ target;
    debug = false;

    /**
     * @param {TokenDocumentPF | TokenPF} attacker
     * @param {TokenDocumentPF | TokenPF} target
     * @param {object} [args]
     * @param {ItemAction} [args.action]
     * @param {boolean} [args.debug]
     * @param {TokenPF[]} [args.flankingWith]
     */
    constructor(
        attacker,
        target,
        {
            action = undefined,
            debug = false,
            flankingWith = undefined,
        } = {
                action: undefined,
                debug: false,
                flankingWith: undefined,
            }
    ) {
        const _attacker = toToken(attacker);
        const _target = toToken(target);

        if (_attacker.scene !== _target.scene) {
            throw new Error('tokens must be in the same scene');
        }

        this.attacker = _attacker;
        this.target = _target;
        ifDebug(
            () => this.debug = true,
            () => this.debug = debug,
        );

        this.#calculatFlanking(action, flankingWith);
        if (this.debug) {
            console.log(this);
        }
    }

    /**
     * @param {undefined | ItemAction} action
     * @param {undefined | TokenPF[]} flankingWith
     */
    #calculatFlanking(action, flankingWith) {
        if (this.#cannotBeFlanked(this.attacker, this.target)) {
            if (this.debug) {
                console.log('Target is unabled to be flanked by the attacker.');
            }
            return;
        }

        let threateningAllies = (flankingWith || this.attacker.scene.tokens
            .filter((x) => ![this.attacker.id, this.target.id].includes(x.id)
                && x.disposition !== this.target.document.disposition
                && x.disposition === this.attacker.document.disposition
            ).map(toToken))
            .filter((x) => new PositionalHelper(x, this.target).threatens());
        if (this.debug) {
            console.log('Allies threatening the target:', threateningAllies);
        }

        const attackerAndTarget = new PositionalHelper(this.attacker, this.target);
        if (!attackerAndTarget.threatens(action)) {
            if (this.debug) {
                console.log('Attacker does not threaten the target.');
            }
            return;
        }

        // is being menaced (weapon ability)
        this.targetIsBeingMenaced = this.#hasMenacing(this.attacker, [action].filter(truthiness))
            || threateningAllies
                .filter((x) => new PositionalHelper(x, this.target).isAdjacent())
                .some((x) => this.#hasMenacing(x));

        // Gang Up
        if (this.#hasGangUp(this.attacker)) {
            if (threateningAllies.length >= 2) {
                this.allFlankBuddies.push(...threateningAllies);

                if (this.debug) {
                    console.log('Attacker has Gang Up and there are at least two other allies threatening the target.');
                }

                // no need to go further because this basically covers all cases
                return;
            }
            else {
                if (this.debug) {
                    console.log('Attacker has Gang Up and there are not at least two other allies threatening the target.');
                }
            }
        }

        // Ratfolk racial trait Swarming
        if (this.#hasSwarming(this.attacker)) {
            const withSwarming = threateningAllies.filter(this.#hasSwarming);
            this.allFlankBuddies.push(...withSwarming.filter((ally) => new PositionalHelper(this.attacker, ally).isSharingSquare()));
            threateningAllies = difference(threateningAllies, this.allFlankBuddies);

            if (this.debug) {
                console.log('Attacker has ratfolk swarming racial trait. Found allies with the same trait:', withSwarming);
            }

            if (!threateningAllies.length) return;
        }

        // Swashbuckler Mouser
        if (this.#isMouser(this.attacker)) {
            if (attackerAndTarget.isSharingSquare()) {
                const adjacent = threateningAllies.filter((ally) =>
                    new PositionalHelper(this.attacker, ally).isAdjacent() && new PositionalHelper(ally, this.target).isAdjacent()
                );
                this.allFlankBuddies.push(...adjacent);

                if (this.debug) {
                    console.log('Attacker is mouser and is in the target\'s square. Found allies that are adjacent to the mouser and the target:', adjacent);
                }

                threateningAllies = difference(threateningAllies, this.allFlankBuddies);
                if (!threateningAllies.length) return;
            }
            else {
                if (this.debug) {
                    console.log('Attacker is mouser and is not in the target\'s square.');
                }
            }
        }
        // if any allies are mouser
        const mousers = threateningAllies.filter(this.#isMouser);
        if (mousers.length) {
            if (this.debug) {
                console.log('Ally mousers that are threatening the target:', mousers);
            }
            const allyMousers = mousers.filter((mouser) => {
                const mouserAndTarget = new PositionalHelper(mouser, this.target);
                return mouserAndTarget.isSharingSquare() && new PositionalHelper(mouser, this.attacker).isAdjacent() && new PositionalHelper(this.attacker, this.target).isAdjacent();
            });

            if (this.debug) {
                console.log('Ally mousers within the target\'s square that the attacker are adjacent to:', allyMousers);
            }

            this.allFlankBuddies.push(...allyMousers);
            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        // Pack Flanking
        {
            const packFlankingBuddies = threateningAllies.filter((ally) =>
                this.#hasPackFlanking(this.attacker, ally)
                && new PositionalHelper(ally, this.attacker).isAdjacent()
            );
            this.allFlankBuddies.push(...packFlankingBuddies);

            if (this.debug && PackFlanking.has(this.attacker)) {
                console.log('Attacker has Pack Flanking. Allies that have Pack Flanking with the attacker:', packFlankingBuddies);
            }

            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        // Improved Outflank
        if (this.#hasImprovedOutflank(this.attacker)) {
            const improvedOutflankBuddies = threateningAllies.filter((ally) =>
                (this.#hasImprovedOutflank(ally) || this.#hasSoloTactics(this.attacker, ally))
                && attackerAndTarget.isFlankingWith(ally, { hasImprovedOutflank: true, specificAction: action })
            );
            this.allFlankBuddies.push(...improvedOutflankBuddies);

            if (this.debug) {
                console.log('Attacker has Improved Outflank. Flanking allies that have Improved Outflank:', improvedOutflankBuddies);
            }

            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        // regular flanking
        const regularFlanking = threateningAllies.filter((ally) =>
            attackerAndTarget.isFlankingWith(ally, { specificAction: action })
        );
        this.allFlankBuddies.push(...regularFlanking);
        if (this.debug) {
            console.log('Remaining flanking allies:', regularFlanking);
        }
    }

    /**
     * @param {TokenPF} attacker
     * @param {TokenPF} target
     * @returns {boolean}
     */
    #cannotBeFlanked(attacker, target) {
        return FlankingImmunity.has(target) || UncannyDodgeImproved.isImmuneToFlank(target, attacker);
    }

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
     * @param {ArrayOrSelf<TokenPF>} allies
     * @returns {boolean}
     */
    #hasSoloTactics(token, allies) {
        allies = toArray(allies);
        return allies.length
            ? allies.some((ally) => SoloTactics.hasSoloTacticsWith(token, ally))
            : SoloTactics.hasSoloTacticsWith(token);
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
        return PackFlanking.hasFlankingWith(token.actor, partner.actor) && PackFlanking.hasFlankingWith(partner.actor, token.actor);
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

api.utils.FlankHelper = FlankHelper;
