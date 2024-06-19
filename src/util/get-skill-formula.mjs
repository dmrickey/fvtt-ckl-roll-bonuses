// @ts-nocheck

import { getChangeFlat } from '../patch/change.mjs';
import { getHighestChanges } from './get-highest-change.mjs';

/**
 * @param {ActorPF} actor
 * @param {RollData} rollData
 * @param {keyof typeof pf1.config.skills} skillId
 */
export const getSkillFormula = (actor, rollData, skillId) => {
    const skl = actor.getSkillInfo(skillId);

    const skillMatch = /^(?<mainSkillId>\w+).subSkills.(?<subSkillId>\w+)$/.exec(skillId);
    const { mainSkillId, subSkillId } = skillMatch?.groups ?? {};
    const haveParentSkill = !!subSkillId;

    // Add contextual attack string
    const noteObjects = actor.getContextNotes(`skill.${skillId}`);
    if (haveParentSkill) noteObjects.push(...actor.getContextNotes(`skill.${mainSkillId}`));
    const notes = actor.formatContextNotes(noteObjects, rollData);

    // Add untrained note
    if (skl.rt && !skl.rank) {
        notes.push(game.i18n.localize("PF1.Untrained"));
    }

    // Gather changes
    const parts = [];
    const changes = getHighestChanges(
        actor.changes.filter((c) => {
            const cf = getChangeFlat.call(actor, c.subTarget, c.modifier);

            if (haveParentSkill && cf.includes(`system.skills.${mainSkillId}.changeBonus`)) return true;
            return cf.includes(`system.skills.${skillId}.changeBonus`);
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
    if (skl.acp && rollData.attributes.acp.total !== 0) {
        parts.push(`-@attributes.acp.total[${game.i18n.localize("PF1.ACPLong")}]`);
    }

    // Add Wound Thresholds info
    if (rollData.attributes.woundThresholds?.penalty > 0) {
        const label = pf1.config.woundThresholdConditions[rollData.attributes.woundThresholds.level];
        notes.push(label);
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

    // const props = [];
    // if (notes.length > 0) props.push({ header: game.i18n.localize("PF1.Notes"), value: notes });

    // const token = options.token ?? actor.token;

    const formula = ['1d20', ...parts].join("+");
    const roll = new CONFIG.Dice.rolls.D20RollPF(formula, rollData, { async: false });
    return roll.formula;
}
