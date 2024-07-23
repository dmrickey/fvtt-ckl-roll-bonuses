import { api } from './api.mjs';

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

        this.token1 = toToken(first);
        this.token2 = toToken(second);
    }

    /** @returns {number} */
    distance() {
        return PositionalHelper.#distance(this.token1, this.token2);
    }

    /**
     * @returns {number}
     */
    getShootingIntoMeleePenalty() {
        const potentials = game.scenes.active.tokens
            .filter((x) => x.id !== this.token1.id)
            .filter((x) => x.disposition !== this.token2.document.disposition && x.disposition === this.token1.document.disposition)
            .map((x) => new PositionalHelper(this.token2, x));

        /** @param {PositionalHelper} d @returns {boolean} */
        const targetIsUnderThreeSizesLarger = (d) => sizes[d.token1.actor.system.traits.size] - sizes[d.token2.actor.system.traits.size] < 3;
        /** @param {PositionalHelper} d @returns {boolean} */
        const isExactlyTwoSizesLarger = (d) => sizes[d.token1.actor.system.traits.size] - sizes[d.token2.actor.system.traits.size] === 2;

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
                if (sizes[e.token1.actor.system.traits.size] >= 2) {
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
     * @param {boolean} [reach]
     * @returns {boolean}
     */
    isWithinRange(minFeet, maxFeet, reach) {
        return PositionalHelper.#isWithinRange(this.token1, this.token2, minFeet, maxFeet, reach);
    }

    /**
     * @param {TokenPF} attacker
     * @param {TokenPF} target
     * @param {ItemAction} [action]
     * @returns {boolean}
     */
    static #threatens(attacker, target, action = undefined) {
        // todo - flat-footed does not exist
        // if (attacker.isFlatFooted) {
        //     return false;
        // }
        // if (attacker/target is unconconscious/immobilized) {
        //     return false;
        // }

        let actions = [];
        if (action) {
            actions = [action];
        } else {
            const weapons = attacker.actor.itemTypes.weapon
                .filter((weapon) => weapon.canUse && weapon.activeState)
                .flatMap((weapon) => weapon.actions.contents)
                .filter((action) => !action.isRanged);
            const attacks = attacker.actor.itemTypes.attack
                .filter((weapon) => weapon.canUse && weapon.activeState)
                .flatMap((weapon) => weapon.actions.contents)
                .filter((action) => !action.isRanged);
            actions = [...weapons, ...attacks];
        }

        /**
         * @param {ItemAction} action
         */
        const hasReach = (action) => {
            const { item } = action;
            if (item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF) {
                if (item.system.weaponGroups?.value.includes("natural")) {
                    return true;
                }
                if (action.data.range.units === 'reach') {
                    return true;
                }
            }
            return false;
        }

        return actions.some((action) => this.#isWithinRange(attacker, target, action.minRange, action.maxRange, hasReach(action)));
    }

    /**
     * @param {TokenPF} left
     * @param {TokenPF} right
     * @param {boolean} [diagonalReach] if the check is for "10 foot reach adjacency test"
     * @returns {boolean}
     */
    static #isAdjacent(left, right, diagonalReach = false) {
        const scene = game.scenes.active;
        const gridSize = scene.grid.size;

        let floor = this.#floor(left);
        let ceiling = this.#ceiling(left);

        let enlarged;
        if (diagonalReach) {
            // add "1 square (gridSize)" in all directions and see if adjacent
            enlarged = new PIXI.Rectangle(
                left.bounds.left - gridSize - 1,
                left.bounds.top - gridSize - 1,
                left.bounds.width + gridSize * 2 + 2,
                left.bounds.height + gridSize * 2 + 2,
            );
        }
        else {
            enlarged = new PIXI.Rectangle(
                left.bounds.left - 1,
                left.bounds.top - 1,
                left.bounds.width + 2,
                left.bounds.height + 2,
            );
            floor -= gridSize;
            ceiling += gridSize;
        }

        return enlarged.intersects(right.bounds)
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
        /** @param {TokenPF} f @param {TokenPF} s @returns {boolean} */
        const isSharing = (f, s) => f.bounds.intersects(s.bounds)
            && !this.#isAboveCeiling(f, s)
            && !this.#isBelowFloor(f, s);
        return isSharing(first, second) || isSharing(second, first);
    }

    /**
     * @param {TokenPF} token1
     * @param {TokenPF} token2
     * @param {number} minFeet
     * @param {number} maxFeet
     * @param {boolean} [reach]
     * @returns {boolean}
     */
    static #isWithinRange(token1, token2, minFeet, maxFeet, reach = false) {
        if (reach && maxFeet === 10 && this.#isAdjacent(token1, token2, true)) {
            return true;
        }

        const distance = this.#distance(token1, token2);

        return reach
            ? minFeet < distance && distance <= maxFeet
            : minFeet <= distance && distance <= maxFeet;
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

        const scene = game.scenes.active;
        const gridSize = scene.grid.size;

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
            z2 = this.#ceiling(token2);
        }
        else if (this.#isBelowFloor(token1, token2)) {
            z1 = this.#ceiling(token1);
        }
        else {
            z2 = z1;
        }

        // @ts-ignore
        const ray = new Ray({ x: x1, y: y1 }, { x: x2, y: y2 });
        // @ts-ignore
        const distance = canvas.grid.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
        if (z1 === z2) {
            return distance;
        }

        // @ts-ignore
        const zRay = new Ray({ x: 0, y: z1 }, { x: 0, y: z2 });
        // @ts-ignore
        const zDistance = canvas.grid.grid.measureDistances([{ ray: zRay }], { gridSpaces: true })[0];
        const d = Math.round(Math.sqrt(distance * distance + zDistance * zDistance) * 10) / 10;
        return d;
    }

    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @returns {boolean}
     */
    static #isLeftOf(token, target) { return token.bounds.right <= target.bounds.left; }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @returns {boolean}
     */
    static #isRightOf(token, target) { return token.bounds.left >= target.bounds.right; }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @returns {boolean}
     */
    static #isAbove(token, target) { return token.bounds.bottom <= target.bounds.top; }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @returns {boolean}
     */
    static #isBelow(token, target) { return token.bounds.top >= target.bounds.bottom; }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @returns {boolean}
     */
    static #isAboveCeiling(token, target) { return this.#floor(token) >= this.#ceiling(target); }
    /**
     * @param {TokenPF} token
     * @param {TokenPF} target
     * @returns {boolean}
     */
    static #isBelowFloor(token, target) { return this.#ceiling(token) <= this.#floor(target); }

    /**
     * @param {TokenPF} token
     * @returns {number}
     */
    static #ceiling(token) { return this.#floor(token) + (token.bounds.width + token.bounds.height) / 2; }
    /**
     * @param {TokenPF} token
     * @returns {number}
     */
    static #floor(token) {
        const { distance, size } = game.scenes.active.grid;
        const units = size / distance;
        return token.document.elevation * units;
    }

}

/** @type {Record<ActorSize, number>} */
const sizes = {
    fine: -4,
    dim: -3,
    tiny: -2,
    sm: -1,
    med: 0,
    lg: 1,
    huge: 2,
    grg: 3,
    col: 4,
}

api.utils.PositionalHelper = PositionalHelper;
