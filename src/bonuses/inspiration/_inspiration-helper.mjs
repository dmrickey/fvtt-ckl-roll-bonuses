import { api } from '../../util/api.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { getIdsFromItem } from '../../util/get-id-array-from-flag.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';

export const inspirationKey = 'inspiration';
export const inspirationExpandedKey = 'inspiration-expanded';
export const inspirationFocusedKey = 'inspiration-focused';
export const inspirationTrueKey = 'inspiration-true';

export const allKnowledgeSkillIds = /** @type {const} */ ('all-knowledge');

export class InspirationLanguageSettings {
    static get inpsiration() { return LanguageSettings.getTranslation(inspirationKey); }
    static get inpsirationProper() { return LanguageSettings.getTranslation(inspirationKey, false); }
    static get focusedInspiration() { return LanguageSettings.getTranslation(inspirationFocusedKey); }
    static get focusedInspirationProper() { return LanguageSettings.getTranslation(inspirationFocusedKey, false); }

    static {
        LanguageSettings.registerItemNameTranslation(inspirationKey);
        LanguageSettings.registerItemNameTranslation(inspirationFocusedKey);
    }
}

export const getInspirationPart = () => `@inspiration[${InspirationLanguageSettings.inpsirationProper}]`;
export const getInspirationFocusedPart = () => `@improvedInspiration[${InspirationLanguageSettings.focusedInspirationProper}]`;

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
 * @param {ActorPF} actor
 * @param {SkillId} id
 * @returns {boolean}
 */
export const canUseInspirationForFree = (actor, id) => {
    if (actor.hasItemBooleanFlag(inspirationTrueKey)) return true;

    const inspired = getInspirationSkillsFromActor(actor, inspirationKey);
    if (intersects(inspired, id) && actor.getSkillInfo(id).rank) return true;

    const expanded = getInspirationSkillsFromActor(actor, inspirationExpandedKey);
    if (intersects(expanded, id) && actor.getSkillInfo(id).rank) return true;

    return false;
}

/**
 * @param {ItemPF} item
 * @param {string} flag
 * @returns {SkillId[]}
 */
export const getInspirationSkillsFromItem = (item, flag) => {
    /** @type {(SkillId | 'all-knowledge')[]} */
    var skills = foundry.utils.deepClone(getIdsFromItem(item, flag));

    const index = skills.indexOf(allKnowledgeSkillIds);
    if (index > -1) {
        skills.splice(index, 1);
        skills.push(...api.config.knowledgeSkills);
    }

    return /** @type {SkillId[]} */ (skills);
}

/**
 * @param {ActorPF} actor
 * @param {string} flag
 * @returns {{ source: ItemPF, ids: SkillId[]}[]}
 */
export const getInspirationSkillsBySourceFromActor = (actor, flag) => {
    const sources = actor.itemFlags?.boolean[flag]?.sources ?? [];
    const mapped = sources.map((source) => ({
        source,
        ids: getInspirationSkillsFromItem(source, flag),
    }))
    return mapped;
}

/**
 * @param {ActorPF} actor
 * @param {string} flag
 * @returns {SkillId[]}
 */
export const getInspirationSkillsFromActor = (actor, flag) => {
    const all = getInspirationSkillsBySourceFromActor(actor, flag).flatMap(x => x.ids);
    return uniqueArray(all);
};
