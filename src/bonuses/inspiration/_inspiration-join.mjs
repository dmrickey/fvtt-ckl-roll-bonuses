import { intersects } from '../../util/array-intersects.mjs';
import { allKnowledges, getFlaggedSkillIdsBySourceFromActor, getFlaggedSkillIdsFromActor, getSkillChoices } from '../../util/get-skills.mjs';
import { localize } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { onSkillSheetRender } from '../../util/on-skill-sheet-render-handler.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { RollSkillUntrained } from '../roll-untrained.mjs';
import { InspirationAmazing } from './inspiration-amazing.mjs';
import { InspirationExtraDie } from './inspiration-extra-die.mjs';
import { InspirationFocused } from './inspiration-focused.mjs';
import { InspirationTenacious } from './inspiration-tenacious.mjs';
import { InspirationTrue } from './inspiration-true.mjs';
import { Inspiration } from './inspiration.mjs';

class MiscInspirationLanguageSettings {
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
    if (InspirationTrue.has(actor)) return true;

    const inspired = getFlaggedSkillIdsFromActor(actor, Inspiration.key);
    if (intersects(inspired, id) && actor.getSkillInfo(id).rank) return true;

    return false;
}

/**
 * @param {ActorPF} actor
 * @returns {{ source: ItemPF, ids: SkillId[]}[]}
 */
const getInspiredSkillsBySourceFromActor = (actor) => {
    const trueItem = actor.itemFlags?.boolean[InspirationTrue.key]?.sources[0];
    if (trueItem) {
        return [{
            source: trueItem,
            ids: /** @type {SkillId[]} */ (/** @type {any[]} */ Object.keys(getSkillChoices(actor))),
        }];
    }

    const inspired = getFlaggedSkillIdsBySourceFromActor(actor, Inspiration.key);
    const focused = getFlaggedSkillIdsBySourceFromActor(actor, InspirationFocused.key);
    const extra = getFlaggedSkillIdsBySourceFromActor(actor, InspirationExtraDie.key);
    return [
        ...inspired,
        ...focused,
        ...extra,
    ];
}

onSkillSheetRender({
    key: Inspiration.key,
    getSkillIds: getInspiredSkillsBySourceFromActor,
}, {
    classes: (actor, skillId) => {
        /** @param {string} flag*/
        const hasKeyForSkill = (flag) => intersects(getFlaggedSkillIdsFromActor(actor, flag), skillId);
        const classes = ['fas', 'ckl-skill-icon'];

        if (hasKeyForSkill(InspirationFocused.key)) {
            classes.push('ckl-extra-focus');
        }

        const hasExtra = hasKeyForSkill(InspirationExtraDie.key);
        const hasTenacious = InspirationTenacious.has(actor);
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
            const amazing = InspirationAmazing.has(actor);
            if (amazing) {
                text += "<br><br>" + actor.itemFlags?.boolean[InspirationAmazing.key]?.sources[0]?.name;
                text += "<br>" + localize(`skill-sheet.${InspirationFocused.key}.skill-tip`);
            }
        }

        {
            const focused = hasKeyForSkill(InspirationFocused.key);
            if (focused) {
                text += "<br><br>" + focused.source.name;
                text += "<br>" + localize(`skill-sheet.${InspirationFocused.key}.skill-tip`);
            }
        }

        {
            const extra = hasKeyForSkill(InspirationExtraDie.key);
            if (extra) {
                text += "<br><br>" + extra.source.name;
                text += "<br>" + localize(`skill-sheet.${InspirationTenacious.key}.skill-tip`);
            }
        }

        {
            const tenacious = InspirationTenacious.has(actor);
            if (tenacious) {
                text += "<br><br>" + actor.itemFlags?.boolean[InspirationTenacious.key]?.sources[0]?.name;
                text += "<br>" + localize(`skill-sheet.${InspirationTenacious.key}.skill-tip`);
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

    const hasInspiration = Inspiration.has(actor);
    const hasAmazing = InspirationAmazing.has(actor);
    const hasTenacious = InspirationTenacious.has(actor);
    // const hasTrue = !!actor.hasItemBooleanFlag(inspirationTrueKey);
    if (!hasInspiration) return;

    const faces = 6 + (hasAmazing ? 2 : 0);
    let qty = 1;
    let mod = '';
    // I don't think this is accurate, but I'm just leaving this here for future me
    // if (hasAmazing) {
    //     const items = actor.itemFlags?.boolean[Inspiration.key]?.sources ?? [];
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
    let inspirationExtra = `${qty + 1}d${faces}kh`;
    let inspirationImproved = `${qty}d${faces + 2}${mod}`;
    let inspirationImprovedExtra = `${qty + 1}d${faces + 2}kh`;

    // only when spending inspiration
    // if (hasTrue) {
    //     inspiration = `{${inspiration}, ${inspiration}}kh`;
    //     inspirationImproved = `{${inspirationImproved}, ${inspirationImproved}}kh`;
    // }

    return {
        inspiration,
        inspirationExtra,
        inspirationImproved,
        inspirationImprovedExtra,
    };
}

/**
 *
 * @param {ActorPF} actor
 * @param {SkillId} skill
 */
const getDieForSkill = (actor, skill) => {

    const hasExtra = getFlaggedSkillIdsBySourceFromActor(actor, InspirationExtraDie.key).find(({ ids }) => intersects(ids, skill));

    const isFocused = getFlaggedSkillIdsBySourceFromActor(actor, InspirationFocused.key).find(({ ids }) => intersects(ids, skill));
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

    const isInspired = getFlaggedSkillIdsBySourceFromActor(actor, Inspiration.key).find(({ ids }) => intersects(ids, skill));
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
    // this fires for actor -> item -> action
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
        part = `@${bonus.path}[${bonus.sources.join(', ')}]`;
        options.parts.push(part);
    }
}
Hooks.on('pf1PreActorRollSkill', onRollSkill);

// Device Talent
onCreate(
    'hwcRSJ1KAX1boUNv',
    () => MiscInspirationLanguageSettings.inspirationDeviceTalent,
    {
        booleanKeys: [Inspiration.key, RollSkillUntrained.key, 'fortune-skill_umd'],
        flagValues: {
            [Inspiration.key]: /** @type {SkillId[]} */ (['umd']),
            [RollSkillUntrained.key]: /** @type {SkillId[]} */ (['umd']),
        },
    },
);

// Empathy
onCreate(
    'HLuoqBZCrV6vSJzK',
    () => MiscInspirationLanguageSettings.inspirationEmpathy,
    {
        booleanKeys: [InspirationExtraDie.key, 'fortune-skill_sen'],
        flagValues: {
            [InspirationExtraDie.key]: /** @type {SkillId[]} */ (['sen']),
        },
    },
);

// Expanded Inspiration
onCreate(
    'DwEK2dM8PONQRIHm',
    () => MiscInspirationLanguageSettings.inspirationExpanded,
    {
        booleanKeys: [Inspiration.key],
        flagValues: {
            [Inspiration.key]:
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
    () => MiscInspirationLanguageSettings.inspirationInspiredIntelligence,
    {
        booleanKeys: [Inspiration.key],
        flagValues: {
            [Inspiration.key]:
                /** @type {SkillId[]} */
                ([
                    allKnowledges,
                    'lin',
                    'spl',
                ]),
        }
    },
);

// Unconventional Inspiration
onCreate(
    'BFNWMeWYNOyZ1Ioe',
    () => MiscInspirationLanguageSettings.inspirationUnconventional,
    {
        booleanKeys: [Inspiration.key],
    },
);

// Underworld Inspiration
onCreate(
    'pR0MLt0XLQpBePa3',
    () => MiscInspirationLanguageSettings.inspirationUnderworld,
    {
        booleanKeys: [Inspiration.key],
        flagValues: {
            [Inspiration.key]:
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
