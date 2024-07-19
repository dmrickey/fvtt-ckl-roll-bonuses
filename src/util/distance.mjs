import { api } from './api.mjs';

export class Distance {

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
        return Distance.#distance(this.token1, this.token2);
    }

    /** @returns {boolean} */
    isAdjacent() {
        return Distance.#isAdjacent(this.token1, this.token2);
    }

    /** @returns {boolean} */
    isEngagedInMelee() {
        return Distance.#threatens(this.token1, this.token2) || Distance.#threatens(this.token2, this.token1);
    }

    /** @returns {boolean} */
    isSharingSquare() {
        return Distance.#isSharingSquare(this.token1, this.token2) || Distance.#isSharingSquare(this.token2, this.token1);
    }

    /**
     * @param {ItemAction} [action]
     * @returns {boolean}
     */
    threatens(action = undefined) {
        return Distance.#threatens(this.token1, this.token2, action);
    }

    /** @returns {boolean} */
    isWithin10FootDiagonal() {
        return Distance.#isWithin10FootDiagonal(this.token1, this.token2);
    }

    // TODO need a "reach" checkbox because only reach weapons have a special exception
    /**
     * @param {number} minFeet
     * @param {number} maxFeet
     * @param {boolean} [reach]
     * @returns {boolean}
     */
    isWithinRange(minFeet, maxFeet, reach) {
        return Distance.#isWithinRange(this.token1, this.token2, minFeet, maxFeet, reach);
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
        let enlarged;
        if (diagonalReach) {
            const scene = game.scenes.active;
            const gridSize = scene.grid.size;

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
            )
        }

        return enlarged.intersects(right.bounds);
    }

    /**
     * @param {TokenPF} first
     * @param {TokenPF} second
     * @returns {boolean}
     */
    static #isSharingSquare(first, second) {
        return first.bounds.left >= second.bounds.left
            && first.bounds.top >= second.bounds.top
            && first.bounds.right <= second.bounds.right
            && first.bounds.bottom <= second.bounds.bottom;
    }

    /**
     * @param {TokenPF} token1
     * @param {TokenPF} token2
     * @returns {boolean}
     */
    static #isWithin10FootDiagonal(token1, token2) {
        const scene = game.scenes.active;
        const gridSize = scene.grid.size;

        return this.#isAdjacent(token1, token2, true);
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
        if (reach && maxFeet === 10 && this.#isWithin10FootDiagonal(token1, token2)) {
            return true;
        }

        const distance = this.#distance(token1, token2);
        return minFeet <= distance && distance <= maxFeet;
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
        let y1 = token1.bounds.top;
        let y2 = token2.bounds.top;

        if (this.#isLeftOf(token1.bounds, token2.bounds)) {
            x1 += token1.bounds.width - gridSize;
        }
        else if (this.#isRightOf(token1.bounds, token2.bounds)) {
            x2 += token2.bounds.width - gridSize;
        }
        else {
            x2 = x1;
        }

        if (this.#isAbove(token1.bounds, token2.bounds)) {
            y1 += token1.bounds.height - gridSize;
        }
        else if (this.#isBelow(token1.bounds, token2.bounds)) {
            y2 += token2.bounds.height - gridSize;
        }
        else {
            y2 = y1;
        }

        // @ts-ignore
        const ray = new Ray({ x: x1, y: y1 }, { x: x2, y: y2 });
        // @ts-ignore
        const distance = canvas.grid.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
        return distance;
    }

    /**
     * @param {Rect} token
     * @param {Rect} target
     * @returns {boolean}
     */
    static #isLeftOf(token, target) { return token.right <= target.left; }
    /**
     * @param {Rect} token
     * @param {Rect} target
     * @returns {boolean}
     */
    static #isRightOf(token, target) { return token.left >= target.right; }
    /**
     * @param {Rect} token
     * @param {Rect} target
     * @returns {boolean}
     */
    static #isAbove(token, target) { return token.bottom <= target.top; }
    /**
     * @param {Rect} token
     * @param {Rect} target
     * @returns {boolean}
     */
    static #isBelow(token, target) { return token.top >= target.bottom; }

    /**
     * @param {TokenPF} token
     * @returns {number}
     */
    static #ceiling(token) { return token.document.elevation + (token.bounds.width + token.bounds.height) / 2; }
    /**
     * @param {TokenPF} token
     * @returns {number}
     */
    static #floor(token) { return token.document.elevation; }

    /**
     * @param {TokenPF} self
     * @param {TokenPF} target
     * @returns {number}
     */
    static getShootingIntoMeleePenalty(self, target) {
        const potentials = game.scenes.active.tokens
            .filter((x) => x.disposition !== target.document.disposition && x.disposition === self.document.disposition)
            .map((x) => new Distance(target, x));

        /** @param {Distance} d @returns {boolean} */
        const targetIsUnderThreeSizesLarger = (d) => sizes[d.token1.actor.system.traits.size] - sizes[d.token2.actor.system.traits.size] < 3;
        /** @param {Distance} d @returns {boolean} */
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

api.utils.Distance = Distance;
