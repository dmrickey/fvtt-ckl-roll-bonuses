// @ts-nocheck

import { getHighestChanges } from './get-highest-change.mjs';

/**
 * @param {ActorPF} actor
 * @param {RollData} rollData
 * @param {keyof typeof pf1.config.skills} skillId
 */
export const getSkillFormula = (actor, rollData, skillId) => {

    const skillIdParts = skillId.split(".");
    const mainSkillId = skillIdParts[0],
        subSkillId = skillIdParts.length > 1 ? skillIdParts.at(-1) : null;

    const skl = actor.getSkillInfo(skillId);
    const haveParentSkill = !!subSkillId;

    //     // Add contextual attack string
    //     const noteObjects = actor.getContextNotes(`skill.${skillId}`);
    //     if (haveParentSkill) noteObjects.push(...actor.getContextNotes(`skill.${mainSkillId}`, false));
    //     const notes = actor.formatContextNotes(noteObjects, rollData);
    //
    //     // Add untrained note
    //     if (skl.rt && !skl.rank) {
    //         notes.push(game.i18n.localize("PF1.Untrained"));
    //     }

    // Gather changes
    const parts = [];
    const changes = getHighestChanges(
        actor.changes.filter((c) => {
            const cf = c.getTargets(actor);

            if (haveParentSkill && cf.includes(`system.skills.${mainSkillId}.mod`)) return true;
            return cf.includes(`system.skills.${skillId}.mod`);
        }),
        { ignoreTarget: true }
    );

    // Add ability modifier
    if (skl.ability) {
        parts.push(`@abilities.${skl.ability}.mod[${pf1.config.abilities[skl.ability]}]`);
    }

    // Add rank
    if (skl.rank > 0) {
        parts.push(`${skl.rank}[${game.i18n.localize("PF1.SkillRankPlural")}]`);
        if (skl.cs) {
            parts.push(`${pf1.config.classSkillBonus}[${game.i18n.localize("PF1.CSTooltip")}]`);
        }
    }

    // Add armor check penalty
    if (skl.acp && rollData.attributes.acp.skill !== 0) {
        parts.push(`-@attributes.acp.skill[${game.i18n.localize("PF1.ACPLong")}]`);
    }

    // Add Wound Thresholds info
    if (rollData.attributes.woundThresholds?.penalty > 0) {
        const label = pf1.config.woundThresholdConditions[rollData.attributes.woundThresholds.level];
        // notes.push(label);
        parts.push(`- @attributes.woundThresholds.penalty[${label}]`);
    }

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

    //     const props = [];
    //     if (notes.length > 0) props.push({ header: game.i18n.localize("PF1.Notes"), value: notes });
    //
    //     const token = options.token ?? actor.token;

    const formula = ['1d20', ...parts].join("+");
    const roll = new pf1.dice.D20RollPF(formula, rollData, { async: false });
    return roll.formula;
}
