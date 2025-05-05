import { difference } from './array-intersects.mjs';
import { PositionalHelper } from './positional-helper.mjs';

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
        return this.hasOutflank(this.attacker)
            ? this.allFlankBuddies.filter(this.hasOutflank)
            : [];
    };
    get isOutflanking() { return this.hasOutflank(this.attacker) && !!this.outflankBuddies.length; }

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
            throw new Error('tokens must be in teh same scene');
        }

        this.attacker = _attacker;
        this.target = _target;

        let threateningAllies = flankingWith || this.attacker.scene.tokens
            .filter((x) => ![this.attacker.id, this.target.id].includes(x.id)
                && x.disposition !== this.target.document.disposition
                && x.disposition === this.attacker.document.disposition
            ).map(toToken)
            .filter((x) => new PositionalHelper(x, this.target).threatens());

        const attackerAndTarget = new PositionalHelper(this.attacker, this.target);
        if (!attackerAndTarget.threatens(action)) return;

        // is being menaced
        this.targetIsBeingMenaced = [this.attacker, ...threateningAllies]
            .filter(this.hasMenacing)
            .some((x) => new PositionalHelper(x, this.target).isAdjacent());

        // Gang Up
        if (this.hasGangUp(this.attacker)) {
            if (threateningAllies.length >= 2) {
                this.allFlankBuddies.push(...threateningAllies);
                // no need to go further since they're all already accounted for
                return;
            }
        }

        // ratfolk swarming
        if (this.hasSwarming(this.attacker)) {
            this.allFlankBuddies.push(...threateningAllies.filter(this.hasSwarming));
            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        //mouser
        if (this.isMouser(this.attacker)) {
            if (attackerAndTarget.isSharingSquare()) {
                this.allFlankBuddies.push(...threateningAllies.filter((ally) =>
                    new PositionalHelper(this.attacker, ally).isAdjacent() && new PositionalHelper(ally, this.target).isAdjacent()
                ));

                threateningAllies = difference(threateningAllies, this.allFlankBuddies);
                if (!threateningAllies.length) return;
            }
        }
        // if any allies are mouser
        const mousers = threateningAllies.filter(this.isMouser);
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
                this.hasPackFlanking(this.attacker, ally)
                && new PositionalHelper(ally, this.attacker).isAdjacent()
            ));

            threateningAllies = difference(threateningAllies, this.allFlankBuddies);
            if (!threateningAllies.length) return;
        }

        //Improved Outflank
        if (this.hasImprovedOutflank(this.attacker)) {
            this.allFlankBuddies.push(...threateningAllies.filter((ally) =>
                this.hasImprovedOutflank(ally)
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

    // todo fill in logic for these getters

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    hasGangUp(token) {
        return false;
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    hasOutflank(token) {
        return false;
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    hasImprovedOutflank(token) {
        return false;
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    hasMenacing(token) {
        return false;
    }

    /**
     * @param {TokenPF} token
     * @param {TokenPF} partner
     * @returns {boolean}
     */
    hasPackFlanking(token, partner) {
        // make sure to check that "token is configured for partner" and "partner is configured parent"
        return false;
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    hasSwarming(token) {
        return false;
    }

    /**
     * @param {TokenPF} token
     * @returns {boolean}
     */
    isMouser(token) {
        return false;
    }
}