import { MODULE_NAME } from "../consts.mjs";
import { hasAnyBFlag, getDocDFlagsStartsWith, KeyedDFlagHelper } from "../util/flag-helpers.mjs";
import { localHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { signed } from "../util/to-signed-string.mjs";

const selfKeen = 'keen-self';
const keenAll = 'keen-all';
const keenId = (/** @type {IdObject} */ { id }) => `keen_${id}`;

const critOffsetSelf = 'crit-offset-self';
const critOffsetAll = 'crit-offset-all';
const critOffsetId = (/** @type {IdObject} */ { id }) => `crit-offset_${id}`;

const critMultOffsetSelf = 'crit-mult-offset-self';
const critMultOffsetAll = 'crit-mult-offset-all';
const critMultOffsetId = (/** @type {IdObject} */ { id }) => `crit-mult-offset_${id}`;

// register keen
registerItemHint((hintcls, _actor, item, _data) => {
    const bFlags = Object.entries(item.system?.flags?.boolean ?? {})
        .filter(([_, value]) => !!value)
        .map(([key, _]) => key);

    const hasKeen = bFlags.find(flag => flag.startsWith('keen'));

    if (!hasKeen) return;

    const hint = hintcls.create(localize('keen'), [], {});
    return hint;
});

// register crit mod - making assumptions that there aren't really positives and negatives on the same "buff"
registerItemHint((hintcls, actor, item, _data,) => {
    const dFlags = getDocDFlagsStartsWith(item, 'crit-offset');
    const values = Object.values(dFlags)
        .flatMap((x) => x)
        .map((x) => RollPF.safeTotal(x, actor.getRollData()));

    if (!values.length) {
        return;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    const mod = Math.abs(min) > Math.abs(max)
        ? min
        : max;

    if (mod === 0) {
        return;
    }

    const label = localize('crit-offset', { mod: signed(mod) });
    const hint = hintcls.create(label, [], {});
    return hint;
});

Hooks.on('pf1GetRollData', (
    /** @type {Action} */ action,
    /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction)) {
        return;
    }
    const { item } = action;
    const isBroken = !!item.system.broken;

    // update critMult
    const calculateMult = () => {
        if (isBroken) {
            return 2;
        }

        const sum = new KeyedDFlagHelper(rollData.dFlags, critMultOffsetSelf, critMultOffsetAll, critMultOffsetId(action), critMultOffsetId(item))
            .sumAll(rollData);

        return rollData.action.ability.critMult + sum;
    };

    const mult = calculateMult();
    rollData.action.ability.critMult = mult;
    // end update critMult

    // update critRange
    const calculateRange = () => {
        const current = rollData.action.ability.critRange;

        if (isBroken) {
            return 20;
        }

        const hasKeen = item.hasItemBooleanFlag(selfKeen)
            || hasAnyBFlag(item.parentActor, keenAll, keenId(item), keenId(action));

        let range = hasKeen
            ? current * 2 - 21
            : current;

        const flags = [critOffsetAll, critOffsetId(item), critOffsetId(action)];
        const mod = new KeyedDFlagHelper(rollData.dFlags, ...flags).sumAll(rollData)
            + new KeyedDFlagHelper(item.system.flags.dictionary, critOffsetSelf).sumAll(rollData);

        range -= mod;
        range = Math.clamped(range, 2, 20);
        return range;
    };

    const range = calculateRange();
    rollData.action.ability.critRange = range;
    // end update critRange
});

/**
 *  ***shouldn't be necessary in 0.83.0***
 * Override to read critRange from rollData - this should be identical to the function in 0.83.0
 * @this {ChatAttack}
 */
function critRange() {
    if (this.action.item.system.broken) return 20;
    return this.rollData.action.ability?.critRange || 20;
}

Hooks.on(localHooks.chatAttackAttackNotes, (
    /** @type {ChatAttack} */ { action, attackNotes }
) => {
    const hasKeen = action.item.hasItemBooleanFlag(selfKeen)
        || hasAnyBFlag(action.item.parentActor, keenAll, keenId(action.item), keenId(action));
    if (hasKeen) {
        attackNotes.push(localize('keen'));
    }
});

Hooks.once('setup', () => {
    // todo hopefully not necessary in 0.83.0
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.critRange', critRange, libWrapper.OVERRIDE);
});
