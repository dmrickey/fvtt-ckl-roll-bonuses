import { intersects } from '../../util/array-intersects.mjs';
import { allKnowledgeSkillIds, getFlaggedSkillIdsBySourceFromActor, getFlaggedSkillIdsFromActor, getSkillChoices } from '../../util/get-skills.mjs';
import { localize, localizeBonusLabel } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { onSkillSheetRender } from '../../util/on-skill-sheet-render-handler.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { key as rollUntrainedKey } from '../skills/roll-untrained.mjs'

export const inspirationKey = 'inspiration';
export const inspirationAmazingKey = 'inspiration-amazing';
export const inspirationFocusedKey = 'inspiration-focused';
export const inspirationTenaciousKey = 'inspiration-tenacious';
export const inspirationTrueKey = 'inspiration-true';

export const inspirationExtraDieKey = 'inspiration-extra-die';

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
    static #inspirationInspiredIntelligenceKey = 'inspiration-inspired-intelligence';
    static #inspirationUnderworldKey = 'inspiration-underworld';
    static #inspirationUnconventionalKey = 'inspiration-unconventional';

    static get inspirationDeviceTalent() { return LanguageSettings.getTranslation(this.#inspirationDeviceTalentKey); }
    static get inspirationEmpathy() { return LanguageSettings.getTranslation(this.#inspirationEmpathyKey); }
    static get inspirationExpanded() { return LanguageSettings.getTranslation(this.#inspirationExpandedKey); }
    static get inspirationInspiredIntelligence() { return LanguageSettings.getTranslation(this.#inspirationInspiredIntelligenceKey); }
    static get inspirationUnconventional() { return LanguageSettings.getTranslation(this.#inspirationUnconventionalKey); }
    static get inspirationUnderworld() { return LanguageSettings.getTranslation(this.#inspirationUnderworldKey); }

    static {
        LanguageSettings.registerItemNameTranslation(inspirationKey);
        LanguageSettings.registerItemNameTranslation(inspirationFocusedKey);
        LanguageSettings.registerItemNameTranslation(inspirationTenaciousKey);
        LanguageSettings.registerItemNameTranslation(inspirationTrueKey);

        LanguageSettings.registerItemNameTranslation(this.#inspirationDeviceTalentKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationEmpathyKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationExpandedKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationInspiredIntelligenceKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationUnderworldKey);
        LanguageSettings.registerItemNameTranslation(this.#inspirationUnconventionalKey);
    }
}

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
    const focused = getFlaggedSkillIdsBySourceFromActor(actor, inspirationFocusedKey);
    const extra = getFlaggedSkillIdsBySourceFromActor(actor, inspirationExtraDieKey);
    return [
        ...inspired,
        ...focused,
        ...extra,
    ];
}

onSkillSheetRender({
    key: inspirationKey,
    getSkillIds: getInspiredSkillsBySourceFromActor,
}, {
    classes: (actor, skillId) => {
        /** @param {string} flag*/
        const hasKeyForSkill = (flag) => intersects(getFlaggedSkillIdsFromActor(actor, flag), skillId);
        const classes = ['fas', 'ckl-skill-icon'];

        if (hasKeyForSkill(inspirationFocusedKey)) {
            classes.push('ckl-extra-focus');
        }

        const hasExtra = hasKeyForSkill(inspirationExtraDieKey);
        const hasTenacious = actor.hasItemBooleanFlag(inspirationTenaciousKey);
        if (hasExtra && hasTenacious) {
            classes.push('fa-magnifying-glass-plus');
        }
        else if (hasExtra || hasTenacious) {
            classes.push('fa-magnifying-glass', 'ckl-extra-fa-magnifying-glass');
        }
        else {
            classes.push('fa-magnifying-glass');
        }

        if (!canUseInspirationForFree(actor, skillId)) {
            classes.push('ckl-fa-slash');
        }
        return classes;
    },
    getText: (actor, skillId) => {
        let die;
        const diePath = getDieForSkill(actor, skillId)?.path;
        if (diePath) {
            const rollData = actor.getRollData();
            die = foundry.utils.getProperty(rollData, diePath);
        }

        let text = canUseInspirationForFree(actor, skillId)
            ? localize('skill-sheet.inspiration.skill-tip', { die })
            : localize('skill-sheet.inspiration.invalid-skill-tip', { die });

        /** @param {string} flag*/
        const hasKeyForSkill = (flag) => getFlaggedSkillIdsBySourceFromActor(actor, flag)
            .find(({ ids }) => ids.includes(skillId));

        {
            const amazing = actor.hasItemBooleanFlag(inspirationAmazingKey);
            if (amazing) {
                text += "<br><br>" + actor.itemFlags?.boolean[inspirationAmazingKey]?.sources[0]?.name;
                text += "<br>" + localize(`skill-sheet.${inspirationFocusedKey}.skill-tip`);
            }
        }

        {
            const focused = hasKeyForSkill(inspirationFocusedKey);
            if (focused) {
                text += "<br><br>" + focused.source.name;
                text += "<br>" + localize(`skill-sheet.${inspirationFocusedKey}.skill-tip`);
            }
        }

        {
            const extra = hasKeyForSkill(inspirationExtraDieKey);
            if (extra) {
                text += "<br><br>" + extra.source.name;
                text += "<br>" + localize(`skill-sheet.${inspirationTenaciousKey}.skill-tip`);
            }
        }

        {
            const tenacious = actor.hasItemBooleanFlag(inspirationTenaciousKey);
            if (tenacious) {
                text += "<br><br>" + actor.itemFlags?.boolean[inspirationTenaciousKey]?.sources[0]?.name;
                text += "<br>" + localize(`skill-sheet.${inspirationTenaciousKey}.skill-tip`);
            }
        }

        return text;
    }
});

/**
 * @typedef {object} InspirationDice
 * @property {string} inspiration
 * @property {string} inspirationImproved
 * @property {string} inspirationExtra
 * @property {string} inspirationImprovedExtra
 */

/**
 * @param {Nullable<ActorPF>} actor
 * @returns {InspirationDice | undefined}
 */
const getDie = (actor) => {
    if (!actor) return;

    const hasInspiration = !!actor.hasItemBooleanFlag(inspirationKey);
    const hasAmazing = !!actor.hasItemBooleanFlag(inspirationAmazingKey);
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
    let inspirationExtra = `${qty + 1}d${faces}kh`;
    let inspirationImprovedExtra = `${qty + 1}d${faces + 2}kh`;

    // only when spending inspiration
    // if (hasTrue) {
    //     inspiration = `{${inspiration}, ${inspiration}}kh`;
    //     inspirationImproved = `{${inspirationImproved}, ${inspirationImproved}}kh`;
    // }

    return {
        inspiration,
        inspirationImproved,
        inspirationExtra,
        inspirationImprovedExtra,
    };
}

/**
 *
 * @param {ActorPF} actor
 * @param {SkillId} skill
 */
const getDieForSkill = (actor, skill) => {

    const hasExtra = getFlaggedSkillIdsBySourceFromActor(actor, inspirationExtraDieKey).find(({ ids }) => intersects(ids, skill));

    const isFocused = getFlaggedSkillIdsBySourceFromActor(actor, inspirationFocusedKey).find(({ ids }) => intersects(ids, skill));
    if (isFocused) {
        return hasExtra
            ? {
                path: 'rb.inspiration.improvedExtra',
                sources: [isFocused.source.name, hasExtra.source.name],
            }
            : {
                path: 'rb.inspiration.improved',
                sources: [isFocused.source.name],
            };
    }

    const isInspired = getFlaggedSkillIdsBySourceFromActor(actor, inspirationKey).find(({ ids }) => intersects(ids, skill));
    if (isInspired) {
        return hasExtra
            ? {
                path: 'rb.inspiration.baseExtra',
                sources: [isInspired.source.name, hasExtra.source.name],
            }
            : {
                path: 'rb.inspiration.base',
                sources: [isInspired.source.name],
            };
    }
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
            rollData.rb ||= {};
            rollData.rb.inspiration = {
                base: die.inspiration,
                improved: die.inspirationImproved,
                baseExtra: die.inspirationExtra,
                improvedExtra: die.inspirationImprovedExtra,
            };
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
    options.parts ||= [];
    let part;

    const bonus = getDieForSkill(actor, skill);
    if (bonus) {
        part = `@${bonus.path}[${bonus.sources.join(',')}]`
        options.parts.push(part);
    }
}
Hooks.on('pf1PreActorRollSkill', onRollSkill);

// Device Talent
onCreate(
    'hwcRSJ1KAX1boUNv',
    () => InspirationLanguageSettings.inspirationDeviceTalent,
    {
        booleanKeys: [inspirationKey, rollUntrainedKey, 'fortune-skill_umd'],
        flagValues: {
            [inspirationKey]: /** @type {SkillId[]} */ (['umd']),
            [rollUntrainedKey]: /** @type {SkillId[]} */ (['umd']),
        },
    },
);

// Empathy
onCreate(
    'HLuoqBZCrV6vSJzK',
    () => InspirationLanguageSettings.inspirationEmpathy,
    {
        booleanKeys: [inspirationExtraDieKey, 'fortune-skill_sen'],
        flagValues: {
            [inspirationExtraDieKey]: /** @type {SkillId[]} */ (['sen']),
        },
    },
);

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
        },
    },
);

// Inspired Intelligence
onCreate(
    'HPzD3V2ohR5oOi8u',
    () => InspirationLanguageSettings.inspirationInspiredIntelligence,
    {
        booleanKeys: [inspirationKey],
        flagValues: {
            [inspirationKey]:
                /** @type {SkillId[]} */
                ([
                    allKnowledgeSkillIds,
                    'lin',
                    'spl',
                ]),
        }
    },
);

// Unconventional Inspiration
onCreate(
    'BFNWMeWYNOyZ1Ioe',
    () => InspirationLanguageSettings.inspirationUnconventional,
    {
        booleanKeys: [inspirationKey],
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
        },
    },
);
