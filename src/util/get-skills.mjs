import { intersects } from './array-intersects.mjs';
import { getSkillName } from './get-skill-name.mjs';

/**
 * @param {Nullable<ActorPF>} actor
 * @param {boolean} [isEditable] sanity for me to simplify places that need this code
 * @returns {Partial<Record<SkillId, string>>}
 */
export const getSkills = (actor, isEditable = true) => {
    if (!isEditable) return {};

    /** @type {boolean} */
    const backgroundEnabled = !!game.settings.get('pf1', 'allowBackgroundSkills');

    /** @type {Partial<Record<SkillId, string>>} */
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

    return skills;
};
