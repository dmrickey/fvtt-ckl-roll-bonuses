// @ts-nocheck
// copied from foundryvtt-pathfinder1\module\documents\actor\utils\apply-changes.mjs

/**
 * @param {ItemChange[]} changes - An array containing all changes to check. Must be called after they received a value (by ItemChange.applyChange)
 * @param {object} [options]
 * @param {boolean} [options.ignoreTarget] - Whether to only check for modifiers such as enhancement, insight (true) or whether the target (AC, weapon damage) is also important (false)
 * @returns {ItemChange[]} - A list of processed changes, excluding the lower-valued ones inserted (if they don't stack)
 */
export const getHighestChanges = function (changes, options = { ignoreTarget: false }) {
    const highestTemplate = {
        value: 0,
        ids: [],
        highestID: null,
    };
    const highest = Object.keys(pf1.config.bonusModifiers).reduce((cur, k) => {
        if (options.ignoreTarget) cur[k] = duplicate(highestTemplate);
        else cur[k] = {};
        return cur;
    }, {});

    for (const c of changes) {
        let h;
        if (options.ignoreTarget) h = highest[c.modifier];
        else h = highest[c.modifier]?.[c.subTarget];

        if (!h) continue; // Ignore bad changes
        h.ids.push(c._id);
        if (h.value < c.value || !h.highestID) {
            h.value = c.value;
            h.highestID = c._id;
        }
    }

    {
        let mod, h;
        const filterFunc = function (c) {
            if (h.highestID === c._id) return true;
            if (pf1.config.stackingBonusModifiers.indexOf(mod) === -1 && h.ids.includes(c._id)) return false;
            return true;
        };

        for (mod of Object.keys(highest)) {
            if (options.ignoreTarget) {
                h = highest[mod];
                changes = changes.filter(filterFunc);
            } else {
                for (const subTarget of Object.keys(highest[mod])) {
                    h = highest[mod][subTarget];
                    changes = changes.filter(filterFunc);
                }
            }
        }
    }

    return changes;
};
