import { intersects } from '../../util/array-intersects.mjs';
import { getFlaggedSkillIdsBySourceFromActor, getFlaggedSkillIdsFromActor, getSkillChoices } from '../../util/get-skills.mjs';
import { localize } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { onSkillSheetRender } from '../../util/on-skill-sheet-render-handler.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { key as rollUntrainedKey } from '../skills/roll-untrained.mjs'

export const inspirationKey = 'inspiration';
export const inspirationAmazingeKey = 'inspiration-amazing';
export const inspirationFocusedKey = 'inspiration-focused';
export const inspirationTenaciousKey = 'inspiration-tenacious';
export const inspirationTrueKey = 'inspiration-true';

export class InspirationLanguageSettings {

    static get inpsiration() { return LanguageSettings.getTranslation(inspirationKey); }
    static get inpsirationProper() { return LanguageSettings.getTranslation(inspirationKey, false); }

    static get inspirationFocused() { return LanguageSettings.getTranslation(inspirationFocusedKey); }
    static get inspirationFocusedProper() { return LanguageSettings.getTranslation(inspirationFocusedKey, false); }

    static get inpsirationTenacious() { return LanguageSettings.getTranslation(inspirationTenaciousKey); }

    static get inpsirationTrue() { return LanguageSettings.getTranslation(inspirationTrueKey); }

    static #inspirationDeviceTalentKey = 'inspiration-device-talent';
    static #inspirationEmpathyKey = 'inspiration-empathy';
    static #inspirationExpandedKey = 'inspiration-expanded';
    static #inspirationUnderworldKey = 'inspiration-underworld';

    static get inspirationDeviceTalent() { return LanguageSettings.getTranslation(this.#inspirationDeviceTalentKey); }
    static get inspirationEmpathy() { return LanguageSettings.getTranslation(this.#inspirationEmpathyKey); }
    static get inspirationExpanded() { return LanguageSettings.getTranslation(this.#inspirationExpandedKey); }
    static get inspirationUnderworld() { return LanguageSettings.getTranslation(this.#inspirationUnderworldKey); }

    static {
        LanguageSettings.registerItemNameTranslation(inspirationKey);
        LanguageSettings.registerItemNameTranslation(inspirationFocusedKey);
        LanguageSettings.registerItemNameTranslation(inspirationTenaciousKey);
        LanguageSettings.registerItemNameTranslation(inspirationTrueKey);

        LanguageSettings.registerItemNameTranslation(this.#inspirationDeviceTalentKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationEmpathyKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationExpandedKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationUnderworldKey);
    }
}

export const getInspirationPart = () => `@inspiration[${InspirationLanguageSettings.inpsirationProper}]`;
export const getInspirationFocusedPart = () => `@inspirationImproved[${InspirationLanguageSettings.inspirationFocusedProper}]`;

/**
 * @param {ActorPF} actor
 * @param {SkillId} id
 * @returns {boolean}
 */
export const canUseInspirationForFree = (actor, id) => {
    if (actor.hasItemBooleanFlag(inspirationTrueKey)) return true;

    const inspired = getFlaggedSkillIdsFromActor(actor, inspirationKey);
    if (intersects(inspired, id) && actor.getSkillInfo(id).rank) return true;

    return false;
}

/**
 * @param {ActorPF} actor
 * @returns {{ source: ItemPF, ids: SkillId[]}[]}
 */
const getInspiredSkillsBySourceFromActor = (actor) => {
    const trueItem = actor.itemFlags?.boolean[inspirationTrueKey]?.sources[0];
    if (trueItem) {
        return [{
            source: trueItem,
            ids: /** @type {SkillId[]} */ (/** @type {any[]} */ Object.keys(getSkillChoices(actor))),
        }];
    }

    const inspired = getFlaggedSkillIdsBySourceFromActor(actor, inspirationKey);
    return inspired;
}

onSkillSheetRender({
    key: inspirationKey,
    getSkillIds: getInspiredSkillsBySourceFromActor,
}, {
    classes: (actor, skillId) => {
        const classes = ['far', 'fa-magnifying-glass', 'ckl-skill-icon'];
        if (!canUseInspirationForFree(actor, skillId)) {
            classes.push('ckl-fa-slash');
        }
        return classes;
    },
    getText: (actor, skillId) => {
        const rollData = actor.getRollData();
        const text = canUseInspirationForFree(actor, skillId)
            ? localize('skill-sheet.inspiration.skill-tip', { die: rollData.inspiration })
            : localize('skill-sheet.inspiration.invalid-skill-tip');
        return text;
    }
});

/**
 * @typedef {object} InspirationDice
 * @property {string} inspiration
 * @property {string} inspirationBase
 * @property {string} inspirationImproved
 */

/**
 * @param {Nullable<ActorPF>} actor
 * @returns {InspirationDice | undefined}
 */
const getDie = (actor) => {
    if (!actor) return;

    const hasInspiration = !!actor.hasItemBooleanFlag(inspirationKey);
    const hasAmazing = !!actor.hasItemBooleanFlag(inspirationAmazingeKey);
    const hasTenacious = !!actor.hasItemBooleanFlag(inspirationTenaciousKey);
    // const hasTrue = !!actor.hasItemBooleanFlag(inspirationTrueKey);
    if (!hasInspiration) return;

    const faces = 6 + (hasAmazing ? 2 : 0);
    let qty = 1;
    let mod = '';
    // I don't think this is accurate, but I'm just leaving this here for future me
    // if (hasAmazing) {
    //     const items = actor.itemFlags?.boolean[inspirationKey]?.sources ?? [];
    //     const classLevels = items
    //         .map(x => x.system.class)
    //         .map((c) => actor.itemTypes.class.find(x => x.system.tag === c))
    //         .filter(truthiness)
    //         .map((x) => x.system.level);
    //     const level = Math.max(...classLevels);
    //     if (level === 20) {
    //         qty++;
    //     }
    // }
    if (hasTenacious) {
        qty++;
        mod = 'kh';
    }

    let inspiration = `${qty}d${faces}${mod}`;
    let inspirationImproved = `${qty}d${faces + 2}${mod}`;
    const inspirationBase = inspiration;

    // only when spending inspiration
    // if (hasTrue) {
    //     inspiration = `{${inspiration}, ${inspiration}}kh`;
    //     inspirationImproved = `{${inspirationImproved}, ${inspirationImproved}}kh`;
    // }

    return { inspirationBase, inspiration, inspirationImproved };
}

/**
 * @param {ActorPF | ItemPF | ItemAction} thing
 * @param {RollData} rollData
 */
function onGetRollData(thing, rollData) {
    // this fires for actor -> item -> action. If I handle more than one then it would double up bonuses. So I handle the root-most option
    if (thing instanceof pf1.documents.actor.ActorPF) {
        const actor = thing;
        const die = getDie(actor);
        if (die) {
            rollData.inspiration = die.inspiration;
            rollData.inspirationBase = die.inspirationBase;
            rollData.inspirationImproved = die.inspirationImproved;
        }
    }
}
Hooks.on('pf1GetRollData', onGetRollData);

/**
 * @param {ActorPF} actor
 * @param {ActorRollOptions} options
 * @param {SkillId} skill
 */
function onRollSkill(actor, options, skill) {
    if (!canUseInspirationForFree(actor, skill)) {
        return;
    }

    const isFocused = intersects(getFlaggedSkillIdsFromActor(actor, inspirationFocusedKey), skill);
    if (isFocused) {
        options.parts ||= [];
        options.parts.push(getInspirationFocusedPart());
        return;
    }

    const isInspired = intersects(getFlaggedSkillIdsFromActor(actor, inspirationKey), skill);
    if (isInspired) {
        options.parts ||= [];
        options.parts.push(getInspirationPart());
        return;
    }
}
Hooks.on('pf1PreActorRollSkill', onRollSkill);

// Expanded Inspiration
onCreate(
    'DwEK2dM8PONQRIHm',
    () => InspirationLanguageSettings.inspirationExpanded,
    {
        booleanKeys: [inspirationKey],
        flagValues: {
            [inspirationKey]:
                /** @type {SkillId[]} */
                ([
                    'dip',
                    'hea',
                    'per',
                    'pro',
                    'sen',
                ]),
        }
    },
);

// Underworld Inspiration
onCreate(
    'pR0MLt0XLQpBePa3',
    () => InspirationLanguageSettings.inspirationUnderworld,
    {
        booleanKeys: [inspirationKey],
        flagValues: {
            [inspirationKey]:
                /** @type {SkillId[]} */
                ([
                    'blf',
                    'dis',
                    'dev',
                    'int',
                    'slt',
                ]),
        }
    },
);


// Device Talent
onCreate(
    'hwcRSJ1KAX1boUNv',
    () => InspirationLanguageSettings.inspirationDeviceTalent,
    {
        booleanKeys: [inspirationKey, rollUntrainedKey, 'fortune-skill_umd'],
        flagValues: {
            [inspirationKey]: /** @type {SkillId[]} */ (['umd']),
            [rollUntrainedKey]: /** @type {SkillId[]} */ (['umd']),
        }
    },
);


// Empathy
onCreate(
    'HLuoqBZCrV6vSJzK',
    () => InspirationLanguageSettings.inspirationEmpathy,
    {
        booleanKeys: [inspirationKey, 'fortune-skill_sen'],
    },
);
