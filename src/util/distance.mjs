import { api } from './api.mjs';

export class Distance {

    /** @type {TokenPF} */ token1;
    /** @type {TokenPF} */ token2;

    /**
     * @param {TokenDocumentPF | TokenPF} first
     * @param {TokenDocumentPF | TokenPF} second
     */
    constructor(first, second) {
        this.token1 = first instanceof pf1.documents.TokenDocumentPF
            ? first.object
            : first;
        this.token2 = second instanceof pf1.documents.TokenDocumentPF
            ? second.object
            : second;
    }

    /** @returns {boolean} */
    isAdjacent() {
        return Distance.#isAdjacent(this.token1, this.token2)
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

    /**
     * @param {number} minFeet
     * @param {number} maxFeet
     * @returns {boolean}
     */
    isWithinRange(minFeet, maxFeet) {
        return Distance.#isWithinRange(this.token1, this.token2, minFeet, maxFeet)
    }

    /**
     * @param {TokenPF} attacker
     * @param {TokenPF} target
     * @param {ItemAction} [action]
     * @returns {boolean}
     */
    static #threatens(attacker, target, action = undefined) {
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

        return actions.some((action) => this.#isWithinRange(attacker, target, action.minRange, action.maxRange));
    }

    /**
     * @param {{x: number, y: number, h: number, w: number}} left
     * @param {{x: number, y: number, h: number, w: number}} right
     * @returns {boolean}
     */
    static #isAdjacent(left, right) {
        // is above or below target
        if ((this.#left(left) >= this.#left(right) && this.#right(left) <= this.#right(right))
            || this.#right(left) >= this.#right(right) && this.#left(left) <= this.#left(right)
        ) {
            if (this.#top(left) == this.#bottom(right) || this.#bottom(left) == this.#top(right)) {
                return true;
            }
        }

        // is left or right of target
        if ((this.#bottom(left) >= this.#bottom(right) && this.#top(left) <= this.#top(right))
            || this.#top(left) >= this.#top(right) && this.#bottom(left) <= this.#bottom(right)
        ) {
            if (this.#left(left) == this.#right(right) || this.#right(left) == this.#left(right)) {
                return true;
            }
        }

        // is diagonally adjacent to target
        if (this.#left(left) == this.#right(right) || this.#right(left) == this.#left(right)) {
            if (this.#top(left) == this.#bottom(right) || this.#bottom(left) == this.#top(right)) {
                return true;
            }
        }

        // if none of the above, return true if sharing the same square as adjacent is basically defined as "one square or closer"
        return this.#isSharingSquare(left, right);
    }

    /**
     * @param {{x: number, y: number, h: number, w: number}} left
     * @param {{x: number, y: number, h: number, w: number}} right
     * @returns {boolean}
     */
    static #isSharingSquare(left, right) {
        return this.#left(left) >= this.#left(right)
            && this.#top(left) >= this.#top(right)
            && this.#right(left) <= this.#right(right)
            && this.#bottom(left) <= this.#bottom(right);
    }

    /**
     * @param {TokenPF} token1
     * @param {TokenPF} token2
     * @returns {boolean}
     */
    static #isWithin10FootDiagonal(token1, token2) {
        /**
         * @param {number} x
         * @param {number} y
         */
        const t1 = (x, y) => ({ x, y, h: token1.h, w: token1.w });
        const scene = game.scenes.active;
        const gridSize = scene.grid.size;
        // todo - verify this method
        // add "1 square (gridSize)" in all diagonals and see if adjacent
        if (this.#isAdjacent(t1(this.#left(token1) - gridSize, this.#top(token1) - gridSize), token2)
            || this.#isAdjacent(t1(this.#left(token1) - gridSize, this.#bottom(token1) + gridSize), token2)
            || this.#isAdjacent(t1(this.#right(token1) + gridSize, this.#top(token1) - gridSize), token2)
            || this.#isAdjacent(t1(this.#right(token1) + gridSize, this.#bottom(token1) + gridSize), token2)
        ) {
            return true;
        }

        return false;
    }

    /**
     * @param {TokenPF} token1
     * @param {TokenPF} token2
     * @param {number} minFeet
     * @param {number} maxFeet
     * @returns {boolean}
     */
    static #isWithinRange(token1, token2, minFeet, maxFeet) {
        if (minFeet === 0 && this.#isSharingSquare(token1, token2)) {
            return true;
        }

        const scene = game.scenes.active;
        const gridSize = scene.grid.size;

        if (maxFeet === 10 && this.#isWithin10FootDiagonal(token1, token2)) {
            return true;
        }

        let x1 = this.#left(token1);
        let x2 = this.#left(token2);
        let y1 = this.#top(token1);
        let y2 = this.#top(token2);

        if (this.#isLeftOf(token1, token2)) {
            x1 += token1.w - gridSize;
        }
        else if (this.#isRightOf(token1, token2)) {
            x2 += token2.w - gridSize;
        }
        else {
            x2 = x1;
        }

        if (this.#isAbove(token1, token2)) {
            y1 += token1.h - gridSize;
        }
        else if (this.#isBelow(token1, token2)) {
            y2 += token2.h - gridSize;
        }
        else {
            y2 = y1;
        }

        // @ts-ignore
        const ray = new Ray({ x: x1, y: y1 }, { x: x2, y: y2 });
        // @ts-ignore
        const distance = canvas.grid.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
        return minFeet <= distance && distance <= maxFeet;
    }

    /** @param {{x: number}} token @returns {number} */
    static #left(token) { return token.x; }
    /** @param {{x: number, w: number}} token @returns {number} */
    static #right(token) { return token.x + token.w; }
    /** @param {{y: number}} token @returns {number} */
    static #top(token) { return token.y; }
    /** @param {{y: number, h: number}} token @returns {number} */
    static #bottom(token) { return token.y + token.h; }

    /**
     * @param {{x: number, w: number}} token
     * @param {{x: number}} target
     * @returns {boolean}
     */
    static #isLeftOf(token, target) { return this.#right(token) <= this.#left(target); }
    /**
     * @param {{x: number}} token
     * @param {{x: number, w: number}} target
     * @returns {boolean}
     */
    static #isRightOf(token, target) { return this.#left(token) >= this.#right(target); }
    /**
     * @param {{y: number, h: number}} token
     * @param {{y: number}} target
     * @returns {boolean}
     */
    static #isAbove(token, target) { return this.#bottom(token) <= this.#top(target); }
    /**
     * @param {{y: number}} token
     * @param {{y: number, h: number}} target
     * @returns {boolean}
     */
    static #isBelow(token, target) { return this.#top(token) >= this.#bottom(target); }
}

api.utils.Distance = Distance;
