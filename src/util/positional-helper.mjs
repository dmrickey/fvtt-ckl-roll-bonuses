import { MODULE_NAME } from '../consts.mjs';
import { isMelee } from './action-type-helpers.mjs';
import { api } from './api.mjs';
import { ifDebug } from './if-debug.mjs';
import { localize } from './localize.mjs';

/**
 * Cache so the console isn't spammed everytime the same invalid action is found
 * @type {UUID[]}
 */
const errorCache = [];

export class PositionalHelper {

    /** @type {TokenPF} */ token1;
    /** @type {TokenPF} */ token2;

    /**
     * @param {TokenDocumentPF | TokenPF} first
     * @param {TokenDocumentPF | TokenPF} second
     */
    constructor(first, second) {
        /**
         * @param {TokenDocumentPF | TokenPF} t
         * @returns {TokenPF}
         */
        const toToken = (t) => (t instanceof pf1.documents.TokenDocumentPF
            ? t.object
            : t);

        const token1 = toToken(first);
        const token2 = toToken(second);

        if (token1.scene !== token2.scene) {
            throw new Error('tokens must be in teh same scene');
        }

        this.token1 = token1;
        this.token2 = token2;
    }

    /** @returns {number} */
    distance() {
        return PositionalHelper.#distance(this.token1, this.token2);
    }

    /**
     * @returns {number}
     */
    getShootingIntoMeleePenalty() {
        const potentials = this.token1.scene.tokens
            .filter((x) => ![this.token1.id, this.token2.id].includes(x.id))
            .filter((x) => x.disposition !== this.token2.document.disposition && x.disposition === this.token1.document.disposition)
            .map((x) => new PositionalHelper(this.token2, x));

        /** @param {PositionalHelper} d @returns {boolean} */
        const targetIsUnderThreeSizesLarger = (d) => d.token1.actor.system.traits.size.value - d.token2.actor.system.traits.size.value < 3;
        /** @param {PositionalHelper} d @returns {boolean} */
        const isExactlyTwoSizesLarger = (d) => d.token1.actor.system.traits.size.value - d.token2.actor.system.traits.size.value === 2;

        const engaged = potentials
            .filter((d) => d.isAdjacent())
            .filter((d) => d.isEngagedInMelee())
            .filter((d) => targetIsUnderThreeSizesLarger(d));

        if (!engaged.length) {
            return 0;
        }

        const penalties = engaged
            .map((e) => {
                // assume creature is large enough to shoot at without penalty (huge or larger, i.e. can aim at spot 10' away from friendly)
                if (e.token1.actor.system.traits.size.value >= 6) {
                    return 0;
                }
                if (isExactlyTwoSizesLarger(e)) {
                    return 2;
                }

                return 4;
            });

        return Math.max(...penalties);
    }

    /** @returns {boolean} */
    isAdjacent() {
        return PositionalHelper.#isAdjacent(this.token1, this.token2);
    }

    /** @returns {boolean} */
    isEngagedInMelee() {
        return PositionalHelper.#threatens(this.token1, this.token2) || PositionalHelper.#threatens(this.token2, this.token1);
    }

    /**
     *
     * @param {TokenPF} ally
     * @param {object} [options]
     * @param {boolean} [options.hasImprovedOutflank]
     * @param {ItemAction} [options.specificAction]
     * @returns {boolean}
     */
    isFlankingWith(ally, {
        hasImprovedOutflank = false,
        specificAction = undefined,
    } = {
            hasImprovedOutflank: false,
            specificAction: undefined,
        }
    ) {
        return PositionalHelper.#isFlankingWith(this.token1, ally, this.token2, { hasImprovedOutflank, specificAction });
    }

    isOnHigherGround() {
        return PositionalHelper.#floor(this.token1) > PositionalHelper.#floor(this.token2);
    }

    /** @returns {boolean} */
    isSharingSquare() {
        return PositionalHelper.#isSharingSquare(this.token1, this.token2);
    }

    /**
     * @param {ItemAction} [action]
     * @returns {boolean}
     */
    threatens(action = undefined) {
        return PositionalHelper.#threatens(this.token1, this.token2, action);
    }

    /**
     * @param {number} minFeet
     * @param {number} maxFeet
     * @returns {boolean}
     */
    isWithinRange(minFeet, maxFeet) {
        return PositionalHelper.#isWithinRange(this.token1, this.token2, minFeet, maxFeet);
    }

    /**
     * @param {TokenPF} attacker
     * @param {TokenPF} target
     * @param {ItemAction} [specificAction]
     * @returns {boolean}
     */
    static #threatens(attacker, target, specificAction = undefined) {
        if (attacker.actor instanceof pf1.documents.actor.ActorPF && target.actor instanceof pf1.documents.actor.ActorPF) {
            const { actor } = attacker;

            /** @type {Array<keyof Conditions>} */
            const conditions = [
                'cowering',
                'dazed',
                'dead',
                'dying',
                'fascinated',
                'flatFooted',
                'helpless',
                'nauseated',
                'panicked',
                'paralyzed',
                'petrified',
                'pinned',
                'stunned',
                'unconscious',
            ];
            if (conditions.some((c) => actor.statuses.has(c))) {
                return false;
            }

            const senses = actor.system.traits.senses;
            if (actor.statuses.has('blind') && !(senses.bs || senses.ts)) {
                return false;
            }

            if (target.actor.statuses.has('invisible')
                && !(senses.si || senses.ts)
            ) {
                return false;
            }
        }

        let actions = [];
        if (specificAction) {
            actions = [specificAction];
        } else {
            actions = attacker.actor.items
                .filter((item) => item.canUse && item.activeState)
                .flatMap((item) => item.actions.contents);
        }
        actions = actions
            .filter((action) => action.hasAttack && isMelee(undefined, action));

        return actions.some((action) => {
            const range = action[MODULE_NAME].range || { max: 0, min: 0, range: 0 };
            let { max, min, single } = range;

            // early failsafe for first data prep
            if (single === null || single === undefined) return true;

            if ((single && !max)) {
                if (specificAction && !errorCache.includes(action.uuid)) {
                    const error = localize('warning.range-misconfigured', {
                        actionName: action.name,
                        itemName: action.item.name,
                        actionUuid: action.uuid,
                    });
                    ifDebug(() => ui.notifications.error(error));
                    console.warn(error, { max, min, single });
                    errorCache.push(action.uuid);
                }

                return true;
            }

            return this.#isWithinRange(attacker, target, min, max || 0);
        });
    }

    /**
     * @param {TokenPF} left
     * @param {TokenPF} right
     * @param {boolean} [tenFootCheck] if the check is for "10 foot reach adjacency test"
     * @returns {boolean}
     */
    static #isAdjacent(left, right, tenFootCheck = false) {
        const scene = left.scene;
        const gridSize = scene.grid.size;

        let floor = this.#floor(left);
        let ceiling = this.#ceiling(left);

        let enlarged;
        if (tenFootCheck) {
            // add "1 square (gridSize)" in all directions and see if adjacent
            enlarged = new PIXI.Rectangle(
                left.bounds.left - gridSize - 1,
                left.bounds.top - gridSize - 1,
                left.bounds.width + gridSize * 2 + 2,
                left.bounds.height + gridSize * 2 + 2,
            );
            floor -= gridSize;
            ceiling += gridSize;
        }
        else {
            enlarged = new PIXI.Rectangle(
                left.bounds.left - 1,
                left.bounds.top - 1,
                left.bounds.width + 2,
                left.bounds.height + 2,
            );
        }

        return enlarged.intersects(right.bounds)
            // essentially this.#sharesElevation(left, right) but with an enlarged area to verify
            && (
                (this.#floor(right) <= ceiling && ceiling <= this.#ceiling(right))
                || (this.#floor(right) <= floor && floor <= this.#ceiling(right))
                || (ceiling >= this.#ceiling(right) && this.#ceiling(right) >= floor)
            );
    }

    /**
     * @param {TokenPF} first
     * @param {TokenPF} second
     * @returns {boolean}
     */
    static #isSharingSquare(first, second) {
        const isSharing = () => first.bounds.intersects(second.bounds);
        return isSharing() && this.#sharesElevation(first, second);
    }

    /**
     * @param {TokenPF} first
     * @param {TokenPF} second
     * @param {TokenPF} target
     * @param {object} [options]
     * @param {ItemAction} [options.specificAction]
     * @param {boolean} [options.hasImprovedOutflank]
     * @returns {boolean}
     */
    static #isFlankingWith(
        first,
        second,
        target,
        {
            hasImprovedOutflank = false,
            specificAction = undefined,
        } = {
                hasImprovedOutflank: false,
                specificAction: undefined,
            }
    ) {
        if (!this.#threatens(first, target, specificAction) || !this.#threatens(second, target)) {
            return false;
        }

        /**
         * Specifically passing in f/s (vs using local reference to parameter) becasue Improved Outflank needs to enlarged one at a time
         * @param {TokenPF} f
         * @param {TokenPF} s
         * @returns {boolean}
         */
        const isOnOppositeSides = (f, s) => {
            if ((this.#isLeftOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && !this.#isAbove(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }) && !this.#isBelow(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }))
                && (this.#isRightOf(s, target, { anySquare: true }) && !this.#isAbove(s, target, { anySquare: true, func: 'every' }) && !this.#isBelow(s, target, { anySquare: true, func: 'every' }))
            ) {
                return true;
            }
            if ((this.#isRightOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && !this.#isAbove(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }) && !this.#isBelow(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }))
                && (this.#isLeftOf(s, target, { anySquare: true }) && !this.#isAbove(s, target, { anySquare: true, func: 'every' }) && !this.#isBelow(s, target, { anySquare: true, func: 'every' }))
            ) {
                return true;
            }
            if ((this.#isAbove(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && !this.#isLeftOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }) && !this.#isRightOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }))
                && (this.#isBelow(s, target, { anySquare: true }) && !this.#isLeftOf(s, target, { anySquare: true, func: 'every' }) && !this.#isRightOf(s, target, { anySquare: true, func: 'every' }))
            ) {
                return true;
            }
            if ((this.#isBelow(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && !this.#isLeftOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }) && !this.#isRightOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank, func: 'every' }))
                && (this.#isAbove(s, target, { anySquare: true }) && !this.#isLeftOf(s, target, { anySquare: true, func: 'every' }) && !this.#isRightOf(s, target, { anySquare: true, func: 'every' }))
            ) {
                return true;
            }

            // on opposite diagonals - can be technically wrong for creatures with reach
            if (this.#isLeftOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isAbove(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isRightOf(s, target, { anySquare: true }) && this.#isBelow(s, target, { anySquare: true })) {
                return true;
            }
            if (this.#isLeftOf(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isBelow(f, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isRightOf(s, target, { anySquare: true }) && this.#isAbove(s, target, { anySquare: true })) {
                return true;
            }
            if (this.#isLeftOf(s, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isAbove(s, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isRightOf(f, target, { anySquare: true }) && this.#isBelow(f, target, { anySquare: true })) {
                return true;
            }
            if (this.#isLeftOf(s, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isBelow(s, target, { anySquare: true, enlarged: hasImprovedOutflank }) && this.#isRightOf(f, target, { anySquare: true }) && this.#isAbove(f, target, { anySquare: true })) {
                return true;
            }

            return false;
        }

        const isAboveAndBelow = () => (this.#isAboveCeiling(first, target, { anySquare: true }) && this.#isBelowFloor(second, target, { anySquare: true }))
            || (this.#isBelowFloor(first, target, { anySquare: true }) && this.#isAboveCeiling(second, target, { anySquare: true }));

        // don't need to check the second condition if no outflank as it's the exact same as the first
        const isOpposite = isOnOppositeSides(first, second) || (hasImprovedOutflank && isOnOppositeSides(second, first));
        return (this.#sharesElevation(first, target) && this.#sharesElevation(second, target) && isOpposite)
            || (isAboveAndBelow() && (isOpposite || (first.bounds.intersects(target.bounds) && second.bounds.intersects(target.bounds))));
    }

    /**
     * @param {TokenPF} token1
     * @param {TokenPF} token2
     * @param {number} minFeet
     * @param {number} maxFeet
     * @returns {boolean}
     */
    static #isWithinRange(token1, token2, minFeet, maxFeet) {
        minFeet ||= 0;
        if (!maxFeet && maxFeet !== 0) {
            maxFeet = Number.POSITIVE_INFINITY;
        }

        // special case for 10' diagonal
        if (maxFeet === 10
            && this.#isAdjacent(token1, token2, true)
            && (!minFeet || !this.#isAdjacent(token1, token2))
        ) {
            return true;
        }

        const distance = this.#distance(token1, token2);
        return (minFeet === 0 && distance === 0)
            || (minFeet < distance && distance <= maxFeet);
    }

    /**
     * @param {TokenPF} token1
     * @param {TokenPF} token2
     * @returns {number}
     */
    static #distance(token1, token2) {
        if (this.#isSharingSquare(token1, token2)) {
            return 0;
        }

        const grid = token1.scene.grid;
        const gridSize = grid.size;

        let x1 = token1.bounds.left;
        let x2 = token2.bounds.left;
        if (this.#isLeftOf(token1, token2)) {
            x1 += token1.bounds.width - gridSize;
        }
        else if (this.#isRightOf(token1, token2)) {
            x2 += token2.bounds.width - gridSize;
        }
        else {
            x2 = x1;
        }

        let y1 = token1.bounds.top;
        let y2 = token2.bounds.top;
        if (this.#isAbove(token1, token2)) {
            y1 += token1.bounds.height - gridSize;
        }
        else if (this.#isBelow(token1, token2)) {
            y2 += token2.bounds.height - gridSize;
        }
        else {
            y2 = y1;
        }

        let z1 = this.#floor(token1);
        let z2 = this.#floor(token2);
        if (this.#isAboveCeiling(token1, token2)) {
            z2 = this.#ceiling(token2) - gridSize;
        }
        else if (this.#isBelowFloor(token1, token2)) {
            z1 = this.#ceiling(token1) - gridSize;
        }
        else {
            z2 = z1;
        }

        /**
         * @param {{ x: number, y: number, z: number }} param1
         * @returns
         */
        const measureFrom3dOrigin = ({ x, y, z }) =>
            grid.measurePath([{ x: 0, y: 0 }, { x, y: grid.measurePath([{ x: 0, y: 0 }, { x: y, y: z }]).distance * gridSize / grid.distance }]);
        var measured = measureFrom3dOrigin({ x: x1 - x2, y: y1 - y2, z: z1 - z2 });
        return measured.distance;
    }

    /**
     * @param {TokenPF} left
     * @param {TokenPF} right
     * @returns {boolean}
     */
    static #sharesElevation(left, right) {
        return !this.#isAboveCeiling(left, right)
            && !this.#isBelowFloor(left, right);
    }

    /**
     * @typedef {'some' | 'every'} ArrayFunc
     * @typedef {{anySquare: boolean, enlarged?: false, func?: ArrayFunc} | { anySquare: true, enlarged: true, func?: ArrayFunc}} PositionalComparisons
     */

    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @param {PositionalComparisons} [options]
     * @returns {boolean}
     */
    static #isLeftOf(token, target, { anySquare = false, enlarged = false, func = 'some' } = { anySquare: false, enlarged: false, func: 'some' }) {
        if (!anySquare) {
            return token.bounds.right <= target.bounds.left;
        }

        // if enlarged (i.e. Improved Outflank), add two squares on either side to account for flanking from those spots

        const size = token.scene.grid.size;
        const widthSquares = Math.ceil(token.bounds.width / size) + (enlarged ? 2 : 0);

        const rights = [...Array(widthSquares)].map((_, i) => token.bounds.right - i * size + (enlarged ? size : 0));
        return rights[func]((right) => right <= target.bounds.left);
    }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @param {PositionalComparisons} [options]
     * @returns {boolean}
     */
    static #isRightOf(token, target, { anySquare = false, enlarged = false, func = 'some' } = { anySquare: false, enlarged: false, func: 'some' }) {
        if (!anySquare) {
            return token.bounds.left >= target.bounds.right;
        }

        // if enlarged (i.e. Improved Outflank), add two squares on either side to account for flanking from those spots

        const size = token.scene.grid.size;
        const widthSquares = Math.ceil(token.bounds.width / size) + (enlarged ? 2 : 0);

        const lefts = [...Array(widthSquares)].map((_, i) => token.bounds.left + i * size - (enlarged ? size : 0));
        return lefts[func]((left) => left >= target.bounds.right);
    }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @param {PositionalComparisons} [options]
     * @returns {boolean}
     */
    static #isAbove(token, target, { anySquare = false, enlarged = false, func = 'some' } = { anySquare: false, enlarged: false, func: 'some' }) {
        if (!anySquare) {
            return token.bounds.bottom <= target.bounds.top;
        }

        // if enlarged (i.e. Improved Outflank), add two squares on either side to account for flanking from those spots

        const size = token.scene.grid.size;
        const heightSquares = Math.ceil(token.bounds.height / size) + (enlarged ? 2 : 0);

        const bottoms = [...Array(heightSquares)].map((_, i) => token.bounds.bottom - i * size + (enlarged ? size : 0));
        return bottoms[func]((bottom) => bottom <= target.bounds.top);
    }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @param {PositionalComparisons} [options]
     * @returns {boolean}
     */
    static #isBelow(token, target, { anySquare = false, enlarged = false, func = 'some' } = { anySquare: false, enlarged: false, func: 'some' }) {
        if (!anySquare) {
            return token.bounds.top >= target.bounds.bottom;
        }

        // if enlarged (i.e. Improved Outflank), add two squares on either side to account for flanking from those spots

        const size = token.scene.grid.size;
        const heightSquares = Math.ceil(token.bounds.height / size) + (enlarged ? 2 : 0);

        const tops = [...Array(heightSquares)].map((_, i) => token.bounds.top + i * size - (enlarged ? size : 0));
        return tops[func]((top) => top >= target.bounds.bottom);
    }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @param {PositionalComparisons} [options]
     * @returns {boolean} If the floor of the token is above the ceiling of the target.
     */
    static #isAboveCeiling(token, target, { anySquare = false, enlarged = false, func = 'some' } = { anySquare: false, enlarged: false, func: 'some' }) {
        if (!anySquare) {
            return this.#floor(token) >= this.#ceiling(target);
        }

        // if enlarged (i.e. Improved Outflank), add two squares on either side to account for flanking from those spots

        const floor = this.#floor(token);
        const height = this.#ceiling(token) - floor;

        const size = token.scene.grid.size;
        const heightSquares = Math.ceil(height / size) + (enlarged ? 2 : 0);

        const floors = [...Array(heightSquares)].map((_, i) => floor + i * size - (enlarged ? size : 0));
        return floors[func]((f) => f >= this.#ceiling(target));
    }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @param {PositionalComparisons} [options]
     * @returns {boolean} If the ceiling of the token is below the floor of the target.
     */
    static #isBelowFloor(token, target, { anySquare = false, enlarged = false, func = 'some' } = { anySquare: false, enlarged: false, func: 'some' }) {
        if (!anySquare) {
            return this.#ceiling(token) <= this.#floor(target);
        }

        // if enlarged (i.e. Improved Outflank), add two squares on either side to account for flanking from those spots

        const floor = this.#floor(token);
        const ceiling = this.#ceiling(token);
        const height = ceiling - floor;

        const size = token.scene.grid.size;
        const heightSquares = Math.ceil(height / size) + (enlarged ? 2 : 0);

        const ceilings = [...Array(heightSquares)].map((_, i) => ceiling - i * size + (enlarged ? size : 0));
        return ceilings[func]((c) => c <= this.#floor(target));
    }

    /**
     * Gets the ceiling (height) of the token as a z coordinate normalized by the grid size.
     * @param {TokenPF} token
     * @returns {number}
     */
    static #ceiling(token) { return this.#floor(token) + (token.bounds.width + token.bounds.height) / 2; }
    /**
     * Gets the floor of the token as a z coordinate normalized by the grid size.
     * @param {TokenPF} token
     * @returns {number}
     */
    static #floor(token) {
        const { distance, size } = token.scene.grid;
        const units = size / distance;
        return token.document.elevation * units;
    }
}

api.utils.PositionalHelper = PositionalHelper;
