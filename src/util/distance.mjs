import { api } from './api.mjs';

export class Distance {

    /** @type {TokenPF} */
    token1;
    /** @type {TokenPF} */
    token2;

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

    /**
     * @param {number} minFeet
     * @param {number} maxFeet
     * @returns {boolean}
     */
    isWithinRange(minFeet, maxFeet) {
        if (minFeet === 0 && this.isSharingSquare()) {
            return true;
        }

        const scene = game.scenes.active;
        const gridSize = scene.grid.size;

        if (maxFeet === 10 && this.isWithin10FootDiagonal()) {
            return true;
        }

        let x1 = Distance.#left(this.token1);
        let x2 = Distance.#left(this.token2);
        let y1 = Distance.#top(this.token1);
        let y2 = Distance.#top(this.token2);

        if (Distance.#isLeftOf(this.token1, this.token2)) {
            x1 += this.token1.w - gridSize;
        }
        else if (Distance.#isRightOf(this.token1, this.token2)) {
            x2 += this.token2.w - gridSize;
        }
        else {
            x2 = x1;
        }

        if (Distance.#isAbove(this.token1, this.token2)) {
            y1 += this.token1.h - gridSize;
        }
        else if (Distance.#isBelow(this.token1, this.token2)) {
            y2 += this.token2.h - gridSize;
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

    isSharingSquare() {
        return Distance.#isSharingSquare(this.token1, this.token2) || Distance.#isSharingSquare(this.token2, this.token1);
    }

    isWithin10FootDiagonal() {
        /**
         * @param {number} x
         * @param {number} y
         */
        const t1 = (x, y) => ({ x, y, h: this.token1.h, w: this.token1.w });
        const scene = game.scenes.active;
        const gridSize = scene.grid.size;
        // todo - verify this method
        // add "1 square (gridSize)" in all diagonals and see if adjacent
        if (Distance.#isAdjacent(t1(Distance.#left(this.token1) - gridSize, Distance.#top(this.token1) - gridSize), this.token2)
            || Distance.#isAdjacent(t1(Distance.#left(this.token1) - gridSize, Distance.#bottom(this.token1) + gridSize), this.token2)
            || Distance.#isAdjacent(t1(Distance.#right(this.token1) + gridSize, Distance.#top(this.token1) - gridSize), this.token2)
            || Distance.#isAdjacent(t1(Distance.#right(this.token1) + gridSize, Distance.#bottom(this.token1) + gridSize), this.token2)
        ) {
            return true;
        }

        return false;
    }

    isAdjacent() {
        return Distance.#isAdjacent(this.token1, this.token2)
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

    /** @param {{x: number}} token */
    static #left(token) { return token.x; }
    /** @param {{x: number, w: number}} token */
    static #right(token) { return token.x + token.w; }
    /** @param {{y: number}} token */
    static #top(token) { return token.y; }
    /** @param {{y: number, h: number}} token */
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
