import { api } from './api.mjs';
import { intersects } from './array-intersects.mjs';
import { getIdsFromItem } from './get-id-array-from-flag.mjs';
import { getSkillName } from './get-skill-name.mjs';
import { localize } from './localize.mjs';
import { distinct } from './unique-array.mjs';

export const allKnowledgeSkillIds = /** @type {const} */ ('all-knowledge');
const allPerform = /** @type {const} */ ('all-performs');
const allProf = /** @type {const} */ ('all-professions');

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

    /** @type {Partial<Record<SkillId | 'all-knowledge', string>>} */
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
        // skills[allKnowledgeSkillIds] = localize(allKnowledgeSkillIds);
        skills.prf = localize(allPerform);
        skills.pro = localize(allProf);


        let keyValues = Object.entries(skills);
        const i = Object.keys(skills).indexOf('kar');
        keyValues.splice(i, 0, [allKnowledgeSkillIds, localize(allKnowledgeSkillIds)]);
        skills = Object.fromEntries(keyValues)
    }
    else {
        delete skills.prf;
        delete skills.pro;
    }


    return /** @type {Record<SkillId, string>} */ skills;
};

/**
 * @param {ActorPF} actor
 * @param {ItemPF} item
 * @param {string} flag
 * @returns {SkillId[]}
 */
export const getFlaggedSkillIdsFromItem = (actor, item, flag) => {
    /** @type {(SkillId | 'all-knowledge')[]} */
    var skills = foundry.utils.deepClone(getIdsFromItem(item, flag));

    {
        const index = skills.indexOf(allKnowledgeSkillIds);
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
 * @returns {{ source: ItemPF, ids: SkillId[]}[]}
 */
export const getFlaggedSkillIdsBySourceFromActor = (actor, flag) => {
    const sources = actor.itemFlags?.boolean[flag]?.sources ?? [];
    const mapped = sources.map((source) => ({
        source,
        ids: getFlaggedSkillIdsFromItem(actor, source, flag),
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
