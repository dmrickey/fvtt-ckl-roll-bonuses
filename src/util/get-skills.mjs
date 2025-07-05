import { api } from './api.mjs';
import { intersects } from './array-intersects.mjs';
import { getIdsFromItem } from './get-id-array-from-flag.mjs';
import { getSkillName } from './get-skill-name.mjs';
import { localize } from './localize.mjs';
import { distinct } from './unique-array.mjs';

export const allKnowledges = /** @type {const} */ ('all-knowledges');
const allCrafts = /** @type {const} */ ('all-crafts');
const allPerforms = /** @type {const} */ ('all-performs');
const allProfessions = /** @type {const} */ ('all-professions');

api.config.knowledgeSkills = [
    'kar',
    'kdu',
    'ken',
    'kge',
    'khi',
    'klo',
    'kna',
    'kno',
    'kpl',
    'kre',
];

/**
 * @typedef {SkillId | 'all-knowledges'} SkillIdChoices
 */

/**
 * @param {Nullable<ActorPF>} actor
 * @param {object} options
 * @param {boolean} [options.includeAll]
 * @param {boolean} [options.isEditable] sanity for me to simplify places that need this code
 * @returns {Partial<Record<SkillId, string>>}
 */
export const getSkillChoices = (
    actor,
    {
        includeAll = true,
        isEditable = true,
    } = {
            includeAll: true,
            isEditable: true
        }
) => {
    if (!isEditable) return {};

    /** @type {boolean} */
    const backgroundEnabled = !!game.settings.get('pf1', 'allowBackgroundSkills');

    /** @type {Partial<Record<SkillIdChoices, string>>} */
    let skills;
    if (actor) {
        let allSkills = actor.allSkills;
        if (!backgroundEnabled) {
            allSkills = allSkills.filter(x => !intersects(pf1.config.backgroundOnlySkills, x));
        }

        skills = allSkills
            .map((id) => ({ id, name: getSkillName(actor, id, 'fullName') }))
            .reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {});
    }
    else {
        skills = foundry.utils.deepClone(pf1.config.skills);
        if (!backgroundEnabled) {
            pf1.config.backgroundOnlySkills.forEach((id) => delete (skills[id]));
        }
    }

    if (includeAll) {
        skills.crf = localize(allCrafts);
        skills.prf = localize(allPerforms);
        skills.pro = localize(allProfessions);

        let keyValues = Object.entries(skills);
        const i = Object.keys(skills).indexOf('kar');
        keyValues.splice(i, 0, [allKnowledges, localize(allKnowledges)]);
        skills = Object.fromEntries(keyValues)
    }
    else {
        delete skills.crf;
        delete skills.prf;
        delete skills.pro;
    }


    return /** @type {Record<SkillId, string>} */ skills;
};

/**
 * @param {Nullable<ActorPF>} actor
 * @param {ItemPF} item
 * @param {string} flag
 * @returns {string}
 */
export const getSkillHints = (actor, item, flag) => {
    /** @type {(SkillIdChoices)[]} */
    const ids = foundry.utils.deepClone(getIdsFromItem(item, flag));

    const names = ids.map((id) => {
        switch (id) {
            case 'crf': return localize(allCrafts);
            case 'prf': return localize(allPerforms);
            case 'pro': return localize(allProfessions);
            case allKnowledges: return localize(allKnowledges);
            default:
                try { return getSkillName(actor, id, 'fullName'); }
                catch { return id; }
        }
    });

    names.sort();
    return names.join(', ');
}

/**
 * @param {ActorPF} actor
 * @param {ItemPF} item
 * @param {string} flag
 * @returns {SkillId[]}
 */
export const getFlaggedSkillIdsFromItem = (actor, item, flag) => {
    /** @type {(SkillIdChoices)[]} */
    var skills = foundry.utils.deepClone(getIdsFromItem(item, flag));

    {
        const index = skills.indexOf(allKnowledges);
        if (index > -1) {
            skills.splice(index, 1);
            skills.push(...api.config.knowledgeSkills);
        }
    }

    /** @param {SkillId} id */
    const setupSubs = (id) => {
        const index = skills.indexOf(id);
        if (index > -1) {
            const prof = actor.getSkillInfo(id);
            const subs = /** @type {SkillId[]} */ (Object.keys(prof.subSkills ?? {}).map(x => `${id}.${x}`));
            skills.push(...subs);
        }
    }

    setupSubs('crf');
    setupSubs('prf');
    setupSubs('pro');

    return /** @type {SkillId[]} */ (skills);
}

/**
 * @param {ActorPF} actor
 * @param {string} flag
 * @param {string} [skillKey]
 * @returns {{ source: ItemPF, ids: SkillId[]}[]}
 */
export const getFlaggedSkillIdsBySourceFromActor = (actor, flag, skillKey = undefined) => {
    const sources = actor.itemFlags?.boolean[flag]?.sources ?? [];
    const mapped = sources.map((source) => ({
        source,
        ids: getFlaggedSkillIdsFromItem(actor, source, skillKey || flag),
    }))
    return mapped;
}

/**
 * @param {ActorPF} actor
 * @param {string[]} flags
 * @returns {SkillId[]}
 */
export const getFlaggedSkillIdsFromActor = (actor, ...flags) => {
    const all = flags.flatMap((flag) => getFlaggedSkillIdsBySourceFromActor(actor, flag).flatMap(x => x.ids));
    return distinct(all);
};
