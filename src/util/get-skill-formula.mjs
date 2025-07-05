import { api } from './api.mjs';

/**
 * @param {ActorPF} actor
 * @param {RollData} rollData
 * @param {SkillId} skillId
 * @param {object} [options]
 * @param {boolean} [options.includeD20]
 */
export const getSkillFormula = (actor, rollData, skillId, {
    includeD20 = false,
} = {}) => {
    const skillIdParts = skillId.split(".");
    const mainSkillId = skillIdParts[0],
        subSkillId = skillIdParts.length > 1 ? skillIdParts.at(-1) : null;
    // @ts-expect-error Reconstruct skill ID to ensure it is valid for everything else.
    skillId = subSkillId ? `${mainSkillId}.${subSkillId}` : mainSkillId;

    const skl = actor.getSkillInfo(skillId);

    // Add parts
    const parts = [];

    // Base parts
    // Ability damage and penalty are not part of change system
    const details = actor.getSourceDetails(`system.abilities.${skl.ability}.mod`);
    for (const { value, name } of details) {
        parts.push(`${value}[${name}]`);
    }

    // Add armor check penalty
    if (skl.acp && rollData.attributes.acp.skill !== 0) {
        parts.push(`-@attributes.acp.skill[${game.i18n.localize("PF1.ACPLong")}]`);
    }

    // Add Wound Thresholds info
    if (rollData.attributes.woundThresholds?.penalty > 0) {
        const label = pf1.config.woundThresholdConditions[rollData.attributes.woundThresholds.level];
        parts.push(`- @attributes.woundThresholds.penalty[${label}]`);
    }

    // Gather changes
    const skillDataPathPart = subSkillId ? `${mainSkillId}.subSkills.${subSkillId}` : mainSkillId;

    const validChanges = actor.changes?.filter((/** @type {ItemChange} */ c) =>
        c.getTargets(actor).includes(`system.skills.${skillDataPathPart}.mod`)
    ) ?? [];
    const changes = pf1.documents.actor.changes.getHighestChanges(validChanges, { ignoreTarget: true });

    // Add changes
    for (const c of changes) {
        if (!c.value) continue;
        // Hide complex change formulas in parenthesis.
        if (typeof c.value === "string" && RollPF.parse(c.value).length > 1) {
            parts.push(`(${c.value})[${c.flavor}]`);
        } else {
            parts.push(`${c.value}[${c.flavor}]`);
        }
    }

    const formula = [pf1.dice.D20RollPF.standardRoll, ...parts].slice(includeD20 ? 0 : 1).join(" + ");
    const roll = new Roll(formula, rollData);
    return roll.formula;
}

api.utils.getSkillFormula = getSkillFormula;
