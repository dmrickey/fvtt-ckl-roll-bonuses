import { intersects } from '../../util/array-intersects.mjs';
import { getFlaggedSkillIdsFromActor, getSkillChoices } from '../../util/get-skills.mjs';
import { LanguageSettings } from '../../util/settings.mjs';

export const inspirationKey = 'inspiration';
export const inspirationExpandedKey = 'inspiration-expanded';
export const inspirationFocusedKey = 'inspiration-focused';
export const inspirationTrueKey = 'inspiration-true';

export class InspirationLanguageSettings {
    static get inspirationExpanded() { return LanguageSettings.getTranslation(inspirationExpandedKey); }
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

/**
 * @param {ActorPF} actor
 * @param {SkillId} id
 * @returns {boolean}
 */
export const canUseInspirationForFree = (actor, id) => {
    if (actor.hasItemBooleanFlag(inspirationTrueKey)) return true;

    const inspired = getFlaggedSkillIdsFromActor(actor, inspirationKey);
    if (intersects(inspired, id) && actor.getSkillInfo(id).rank) return true;

    const expanded = getFlaggedSkillIdsFromActor(actor, inspirationExpandedKey);
    if (intersects(expanded, id) && actor.getSkillInfo(id).rank) return true;

    return false;
}
