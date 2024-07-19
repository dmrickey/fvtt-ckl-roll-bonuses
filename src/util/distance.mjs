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
        return Distance.#distance(this.token1.bounds, this.token2.bounds);
    }

    /** @returns {boolean} */
    isAdjacent() {
        return Distance.#isAdjacent(this.token1.bounds, this.token2.bounds);
    }

    /** @returns {boolean} */
    isEngagedInMelee() {
        return Distance.#threatens(this.token1, this.token2) || Distance.#threatens(this.token2, this.token1);
    }

    /** @returns {boolean} */
    isSharingSquare() {
        return Distance.#isSharingSquare(this.token1.bounds, this.token2.bounds) || Distance.#isSharingSquare(this.token2.bounds, this.token1.bounds);
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
        return Distance.#isWithin10FootDiagonal(this.token1.bounds, this.token2.bounds);
    }

    // TODO need a "reach" checkbox because only reach weapons have a special exception
    /**
     * @param {number} minFeet
     * @param {number} maxFeet
     * @param {boolean} [reach]
     * @returns {boolean}
     */
    isWithinRange(minFeet, maxFeet, reach) {
        return Distance.#isWithinRange(this.token1.bounds, this.token2.bounds, minFeet, maxFeet, reach);
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

        return actions.some((action) => this.#isWithinRange(attacker.bounds, target.bounds, action.minRange, action.maxRange, hasReach(action)));
    }

    /**
     * @param {Rect} left
     * @param {Rect} right
     * @returns {boolean}
     */
    static #isAdjacent(left, right) {
        const enlarged = new PIXI.Rectangle(
            left.left - 1,
            left.top - 1,
            left.width + 2,
            left.height + 2,
        )

        return enlarged.intersects(right);
    }

    /**
     * @param {Rect} first
     * @param {Rect} second
     * @returns {boolean}
     */
    static #isSharingSquare(first, second) {
        return first.left >= second.left
            && first.top >= second.top
            && first.right <= second.right
            && first.bottom <= second.bottom;
    }

    /**
     * @param {Rect} token1
     * @param {Rect} token2
     * @returns {boolean}
     */
    static #isWithin10FootDiagonal(token1, token2) {
        /**
         * @param {number} x
         * @param {number} y
         */
        const t1 = (x, y) => ({ x, y, height: token1.height, width: token1.width });
        const scene = game.scenes.active;
        const gridSize = scene.grid.size;

        // add "1 square (gridSize)" in all directions and see if adjacent
        const enlarged = new PIXI.Rectangle(
            token1.left - gridSize,
            token1.top - gridSize,
            token1.width + gridSize * 2,
            token1.height + gridSize * 2,
        );

        return this.#isAdjacent(enlarged, token2);
    }

    // TODO need a "reach" checkbox because only reach weapons have a special exception
    /**
     * @param {Rect} token1
     * @param {Rect} token2
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
     * @param {Rect} token1
     * @param {Rect} token2
     * @returns {number}
     */
    static #distance(token1, token2) {
        if (this.#isSharingSquare(token1, token2)) {
            return 0;
        }

        const scene = game.scenes.active;
        const gridSize = scene.grid.size;

        let x1 = token1.left;
        let x2 = token2.left;
        let y1 = token1.top;
        let y2 = token2.top;

        if (this.#isLeftOf(token1, token2)) {
            x1 += token1.width - gridSize;
        }
        else if (this.#isRightOf(token1, token2)) {
            x2 += token2.width - gridSize;
        }
        else {
            x2 = x1;
        }

        if (this.#isAbove(token1, token2)) {
            y1 += token1.height - gridSize;
        }
        else if (this.#isBelow(token1, token2)) {
            y2 += token2.height - gridSize;
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
