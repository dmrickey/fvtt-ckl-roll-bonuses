// @ts-nocheck

import { MODULE_NAME } from "../consts.mjs";

/**
 * @this {ActorPF}
 * @param {BuffTarget} target Target (e.g. "ac" or "skills")
 * @param {BonusModifers} modifierType Type (e.g. "profane", "untyped", or "dodge"). If undefined, all valid targets will be returned.
 * @param {number} [value]  Value, if known
 * @returns {Array<string>} Array of target paths to modify
 */
const getChangeFlat = function (target, modifierType, value) {
    // ** MY CHANGE */
    // initialize value to 0
    value ||= 0;
    // ** END MY CHANGE */
    if (target == null) return [];

    const curData = this.system;
    /** @type {string[]} */
    const result = [];

    switch (target) {
        case "mhp":
            result.push("system.attributes.hp.max");
            break;
        case "wounds":
            result.push("system.attributes.wounds.max");
            break;
        case "vigor":
            result.push("system.attributes.vigor.max");
            break;
        case "str":
        case "dex":
        case "con":
        case "int":
        case "wis":
        case "cha":
            if (modifierType === "penalty") {
                result.push(`system.abilities.${target}.penalty`);
                break;
            }
            if (["base", "untypedPerm"].includes(modifierType)) {
                result.push(`system.abilities.${target}.total`, `system.abilities.${target}.base`);
                break;
            }
            result.push(`system.abilities.${target}.total`);
            break;
        case "strMod":
        case "dexMod":
        case "conMod":
        case "intMod":
        case "wisMod":
        case "chaMod":
            result.push(`system.abilities.${target.slice(0, 3)}.mod`);
            break;
        case "carryStr":
            result.push("system.details.carryCapacity.bonus.total");
            break;
        case "carryMult":
            result.push("system.details.carryCapacity.multiplier.total");
            break;
        case "ac":
            result.push("system.attributes.ac.normal.total", "system.attributes.ac.touch.total");

            switch (modifierType) {
                case "dodge":
                case "haste":
                    result.push("system.attributes.cmd.total");
                    break;
                case "deflection":
                case "circumstance":
                case "insight":
                case "luck":
                case "morale":
                case "profane":
                case "sacred":
                case "penalty":
                    result.push(
                        "system.attributes.ac.flatFooted.total",
                        "system.attributes.cmd.total",
                        "system.attributes.cmd.flatFootedTotal"
                    );
                    break;
                default:
                    result.push("system.attributes.ac.flatFooted.total");
                    // Other penalties also apply to CMD, but not bonuses
                    if (value < 0) {
                        result.push("system.attributes.cmd.total", "system.attributes.cmd.flatFootedTotal");
                    }
                    break;
            }
            break;
        case "aac": {
            const targets = ["system.ac.normal.total"];
            switch (modifierType) {
                case "base":
                    targets.push("system.ac.normal.base");
                    break;
                case "enh":
                    targets.push("system.ac.normal.enh");
                    break;
                default:
                    targets.push("system.ac.normal.misc");
                    break;
            }
            result.push(...targets);
            break;
        }
        case "sac": {
            const targets = ["system.ac.shield.total"];
            switch (modifierType) {
                case "base":
                    targets.push("system.ac.shield.base");
                    break;
                case "enh":
                    targets.push("system.ac.shield.enh");
                    break;
                default:
                    targets.push("system.ac.shield.misc");
                    break;
            }
            result.push(...targets);
            break;
        }
        case "nac": {
            const targets = ["system.ac.natural.total"];
            switch (modifierType) {
                case "base":
                    targets.push("system.ac.natural.base");
                    break;
                case "enh":
                    targets.push("system.ac.natural.enh");
                    break;
                default:
                    targets.push("system.ac.natural.misc");
                    break;
            }
            result.push(...targets);
            break;
        }
        case "tac":
            result.push("system.attributes.ac.touch.total");
            break;
        case "ffac":
            result.push("system.attributes.ac.flatFooted.total");
            break;
        case "ffcmd":
            result.push("system.attributes.cmd.flatFootedTotal");
            break;
        case "bab":
            result.push("system.attributes.bab.total");
            break;
        case "~attackCore":
            result.push("system.attributes.attack.shared");
            break;
        case "attack":
            result.push("system.attributes.attack.general");
            break;
        case "mattack":
            result.push("system.attributes.attack.melee");
            break;
        case "rattack":
            result.push("system.attributes.attack.ranged");
            break;
        case "critConfirm":
            result.push("system.attributes.attack.critConfirm");
            break;
        case "allSavingThrows":
            result.push(
                "system.attributes.savingThrows.fort.total",
                "system.attributes.savingThrows.ref.total",
                "system.attributes.savingThrows.will.total"
            );
            break;
        case "fort":
            result.push("system.attributes.savingThrows.fort.total");
            break;
        case "ref":
            result.push("system.attributes.savingThrows.ref.total");
            break;
        case "will":
            result.push("system.attributes.savingThrows.will.total");
            break;
        case "skills":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                result.push(`system.skills.${a}.changeBonus`);

                if (skl.subSkills != null) {
                    for (const b of Object.keys(skl.subSkills)) {
                        result.push(`system.skills.${a}.subSkills.${b}.changeBonus`);
                    }
                }
            }
            break;
        case "~skillMods":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                result.push(`system.skills.${a}.mod`);

                if (skl.subSkills != null) {
                    for (const b of Object.keys(skl.subSkills)) {
                        result.push(`system.skills.${a}.subSkills.${b}.mod`);
                    }
                }
            }
            break;
        case "unskills":
            // Untrained skills
            for (const [skillId, skill] of Object.entries(curData.skills)) {
                if (skill == null) continue;
                for (const [subSkillId, subskill] of Object.entries(skill.subSkills ?? {})) {
                    if (subskill.rank > 0) continue;
                    result.push(`system.skills.${skillId}.subSkills.${subSkillId}.changeBonus`);
                }
                if (skill.rank > 0) continue;
                result.push(`system.skills.${skillId}.changeBonus`);
            }
            break;
        case "strSkills":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                if (skl.ability === "str") result.push(`system.skills.${a}.changeBonus`);

                if (skl.subSkills != null) {
                    for (const [b, subSkl] of Object.entries(skl.subSkills)) {
                        if (subSkl != null && subSkl.ability === "str")
                            result.push(`system.skills.${a}.subSkills.${b}.changeBonus`);
                    }
                }
            }
            break;
        case "dexSkills":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                if (skl.ability === "dex") result.push(`system.skills.${a}.changeBonus`);

                if (skl.subSkills != null) {
                    for (const [b, subSkl] of Object.entries(skl.subSkills)) {
                        if (subSkl != null && subSkl.ability === "dex")
                            result.push(`system.skills.${a}.subSkills.${b}.changeBonus`);
                    }
                }
            }
            break;
        case "conSkills":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                if (skl.ability === "con") result.push(`system.skills.${a}.changeBonus`);

                if (skl.subSkills != null) {
                    for (const [b, subSkl] of Object.entries(skl.subSkills)) {
                        if (subSkl != null && subSkl.ability === "con")
                            result.push(`system.skills.${a}.subSkills.${b}.changeBonus`);
                    }
                }
            }
            break;
        case "intSkills":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                if (skl.ability === "int") result.push(`system.skills.${a}.changeBonus`);

                if (skl.subSkills != null) {
                    for (const [b, subSkl] of Object.entries(skl.subSkills)) {
                        if (subSkl != null && subSkl.ability === "int")
                            result.push(`system.skills.${a}.subSkills.${b}.changeBonus`);
                    }
                }
            }
            break;
        case "wisSkills":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                if (skl.ability === "wis") result.push(`system.skills.${a}.changeBonus`);

                if (skl.subSkills != null) {
                    for (const [b, subSkl] of Object.entries(skl.subSkills)) {
                        if (subSkl != null && subSkl.ability === "wis")
                            result.push(`system.skills.${a}.subSkills.${b}.changeBonus`);
                    }
                }
            }
            break;
        case "chaSkills":
            for (const [a, skl] of Object.entries(curData.skills)) {
                if (skl == null) continue;
                if (skl.ability === "cha") result.push(`system.skills.${a}.changeBonus`);

                if (skl.subSkills != null) {
                    for (const [b, subSkl] of Object.entries(skl.subSkills)) {
                        if (subSkl != null && subSkl.ability === "cha")
                            result.push(`system.skills.${a}.subSkills.${b}.changeBonus`);
                    }
                }
            }
            break;
        case "allChecks":
            result.push(
                "system.abilities.str.checkMod",
                "system.abilities.dex.checkMod",
                "system.abilities.con.checkMod",
                "system.abilities.int.checkMod",
                "system.abilities.wis.checkMod",
                "system.abilities.cha.checkMod",
                ...(this.system.attributes.init.ability ? ["system.attributes.init.total"] : [])
            );
            break;
        case "strChecks":
            result.push(
                "system.abilities.str.checkMod",
                ...(this.system.attributes.init.ability === "str" ? ["system.attributes.init.total"] : [])
            );
            break;
        case "dexChecks":
            result.push(
                "system.abilities.dex.checkMod",
                ...(this.system.attributes.init.ability === "dex" ? ["system.attributes.init.total"] : [])
            );
            break;
        case "conChecks":
            result.push(
                "system.abilities.con.checkMod",
                ...(this.system.attributes.init.ability === "con" ? ["system.attributes.init.total"] : [])
            );
            break;
        case "intChecks":
            result.push(
                "system.abilities.int.checkMod",
                ...(this.system.attributes.init.ability === "int" ? ["system.attributes.init.total"] : [])
            );
            break;
        case "wisChecks":
            result.push(
                "system.abilities.wis.checkMod",
                ...(this.system.attributes.init.ability === "wis" ? ["system.attributes.init.total"] : [])
            );
            break;
        case "chaChecks":
            result.push(
                "system.abilities.cha.checkMod",
                ...(this.system.attributes.init.ability === "cha" ? ["system.attributes.init.total"] : [])
            );
            break;
        case "allSpeeds":
            for (const speedKey of Object.keys(curData.attributes.speed)) {
                const base = curData.attributes.speed[speedKey]?.base;
                if (base !== undefined) result.push(`system.attributes.speed.${speedKey}.total`);
            }
            break;
        case "landSpeed":
            if (modifierType === "base") return ["system.attributes.speed.land.total"];
            result.push("system.attributes.speed.land.add", "system.attributes.speed.land.total");
            break;
        case "climbSpeed":
            if (modifierType === "base") {
                result.push("system.attributes.speed.climb.total");
                break;
            }
            result.push("system.attributes.speed.climb.add", "system.attributes.speed.climb.total");
            break;
        case "swimSpeed":
            if (modifierType === "base") {
                result.push("system.attributes.speed.swim.total");
                break;
            }
            result.push("system.attributes.speed.swim.add", "system.attributes.speed.swim.total");
            break;
        case "burrowSpeed":
            if (modifierType === "base") {
                result.push("system.attributes.speed.burrow.total");
                break;
            }
            result.push("system.attributes.speed.burrow.add", "system.attributes.speed.burrow.total");
            break;
        case "flySpeed":
            if (modifierType === "base") {
                result.push("system.attributes.speed.fly.total");
                break;
            }
            result.push("system.attributes.speed.fly.add", "system.attributes.speed.fly.total");
            break;
        case "cmb":
            result.push("system.attributes.cmb.bonus");
            break;
        case "cmd":
            if (["dodge", "haste"].includes(modifierType)) {
                result.push("system.attributes.cmd.total");
                break;
            }
            result.push("system.attributes.cmd.total", "system.attributes.cmd.flatFootedTotal");
            break;
        case "init":
            result.push("system.attributes.init.total");
            break;
        case "acpA":
            result.push("system.attributes.acp.armorBonus");
            break;
        case "acpS":
            result.push("system.attributes.acp.shieldBonus");
            break;
        case "mDexA":
            result.push("system.attributes.mDex.armorBonus");
            break;
        case "mDexS":
            result.push("system.attributes.mDex.shieldBonus");
            break;
        case "spellResist":
            result.push("system.attributes.sr.total");
            break;
        case "damage":
            result.push("system.attributes.damage.general");
            break;
        case "wdamage":
            result.push("system.attributes.damage.weapon");
            break;
        case "sdamage":
            result.push("system.attributes.damage.spell");
            break;
        case "bonusFeats":
            result.push("system.details.feats.bonus");
            break;
        case "bonusSkillRanks":
            result.push("system.details.skills.bonus");
            break;
        case "concentration":
            result.push(
                "system.attributes.spells.spellbooks.primary.concentration.total",
                "system.attributes.spells.spellbooks.secondary.concentration.total",
                "system.attributes.spells.spellbooks.tertiary.concentration.total",
                "system.attributes.spells.spellbooks.spelllike.concentration.total"
            );
            break;
        case "cl":
            result.push(
                "system.attributes.spells.spellbooks.primary.cl.total",
                "system.attributes.spells.spellbooks.secondary.cl.total",
                "system.attributes.spells.spellbooks.tertiary.cl.total",
                "system.attributes.spells.spellbooks.spelllike.cl.total"
            );
            break;
    }

    if (target.match(/^skill\.([a-zA-Z0-9]+)$/)) {
        const sklKey = RegExp.$1;
        const skillData = curData.skills[sklKey];
        if (skillData != null) {
            result.push(`system.skills.${sklKey}.changeBonus`);
            // Apply to subskills also
            for (const subSklKey of Object.keys(skillData.subSkills ?? {})) {
                result.push(`system.skills.${sklKey}.subSkills.${subSklKey}.changeBonus`);
            }
        }
    } else if (target.match(/^skill\.([a-zA-Z0-9]+)\.subSkills\.([a-zA-Z0-9_]+)$/)) {
        const sklKey = RegExp.$1;
        const subSklKey = RegExp.$2;
        if (curData.skills[sklKey]?.subSkills?.[subSklKey] != null) {
            result.push(`system.skills.${sklKey}.subSkills.${subSklKey}.changeBonus`);
        }
    }

    // Call hooks to enable modules to add or adjust the result array
    Hooks.callAll("pf1GetChangeFlat", result, target, modifierType, value, this);

    // Return results directly when deprecation is removed
    return result;
};

function getAbilityModifier(score = null, options = {}) {
    if (score != null) {
        const penalty = Math.abs(options.penalty ?? 0);
        const damage = Math.abs(options.damage ?? 0);
        return Math.max(-5, Math.floor((score - 10) / 2) - Math.floor(penalty / 2) - Math.floor(damage / 2));
    }
    return 0;
}

/**
 * Applies this change to an actor.
 *
 * @this {ItemChange}
 * @param {ActorPF} actor - The actor to apply the change's data to.
 * @param {string[] | null} [targets] - Property paths to target on the actor's data.
 * @param {object} [options] - Optional options to change the behavior of this function.
 * @param {boolean} [options.applySourceInfo=true] - Whether to add the changes to the actor's source information.
 */
function applyChange(actor, targets = null, { applySourceInfo = true } = {}) {
    // Prepare change targets
    targets ??= getChangeFlat.call(actor, this.subTarget, this.modifier);

    // Ensure application of script changes creates a warning
    if (this.operator === "script") {
        ui.notifications?.warn(game.i18n.format("SETTINGS.pf1AllowScriptChangesF", { parent: this.parent?.name }), {
            console: false,
        });
        console.warn(
            game.i18n.format("SETTINGS.pf1AllowScriptChangesF", { parent: this.parent?.uuid || this.parent?.name }),
            {
                change: this,
                item: this.parent,
                actor: this.parent?.actor,
            }
        );
    }

    const rollData = this.parent ? this.parent.getRollData({ refresh: true }) : actor.getRollData({ refresh: true });

    const overrides = actor.changeOverrides;
    for (const t of targets) {
        const override = overrides[t];
        let operator = this.operator;
        if (operator === "+") operator = "add";
        if (operator === "=") operator = "set";

        // HACK: Data prep change application creates overrides; only changes meant for manual comparison lack them,
        // and those do not have to be applied to the actor.
        // This hack enables calling applyChange on Changes that are not meant to be applied, but require a call to
        // determine effective operator and/or value.
        if (!override) continue;

        const modifierChanger = t != null ? t.match(/^system\.abilities\.([a-zA-Z0-9]+)\.(?:total|penalty|base)$/) : null;
        const isModifierChanger = modifierChanger != null;
        const abilityTarget = modifierChanger?.[1];
        const ability = isModifierChanger ? deepClone(actor.system.abilities[abilityTarget]) : null;

        let value = 0;
        if (this.formula) {
            if (operator === "script") {
                if (!game.settings.get("pf1", "allowScriptChanges")) {
                    value = 0;
                    operator = "add";
                } else {
                    const fn = this.createFunction(this.formula, ["d", "item"]);
                    const result = fn(rollData, this.parent);
                    value = result.value;
                    operator = result.operator;
                }
            } else if (operator === "function") {
                value = this.formula(rollData, this.parent);
                operator = "add";
            } else if (!isNaN(this.formula)) {
                value = parseFloat(this.formula);
            } else if (this.isDeferred && RollPF.parse(this.formula).some((t) => !t.isDeterministic)) {
                value = RollPF.replaceFormulaData(this.formula, rollData, { missing: 0 });
            } else {
                value = RollPF.safeRoll(this.formula, rollData, [t, this, rollData], {
                    suppressError: this.parent && !this.parent.testUserPermission(game.user, "OWNER"),
                }).total;
            }
        }

        this.data.value = value;

        // ** anything after this that referenced value now references this.value to use my modified getter

        if (!t) continue;
        if (operator === "script") continue; // HACK: Script Changes without formula are not evaluated

        const prior = override[operator][this.modifier];

        switch (operator) {
            case "add":
                {
                    let base = getProperty(actor, t);

                    // Don't change non-existing ability scores
                    if (base == null) {
                        if (t.match(/^system\.abilities/)) continue;
                        base = 0;
                    }

                    // Deferred formula
                    if (typeof this.value === "string") break;

                    if (typeof base === "number") {
                        if (pf1.config.stackingBonusModifiers.includes(this.modifier)) {
                            // Add stacking bonus
                            setProperty(actor, t, base + this.value);
                            override[operator][this.modifier] = (prior ?? 0) + this.value;
                        } else {
                            // Use higher value only
                            const diff = !prior ? this.value : Math.max(0, this.value - (prior ?? 0));
                            setProperty(actor, t, base + diff);
                            override[operator][this.modifier] = Math.max(prior ?? 0, this.value);
                        }
                    }
                }
                break;

            case "set":
                setProperty(actor, t, this.value);
                override[operator][this.modifier] = this.value;
                break;
        }

        if (applySourceInfo) this.applySourceInfo(actor, this.value);

        // Adjust ability modifier
        if (isModifierChanger) {
            const newAbility = actor.system.abilities[abilityTarget];
            const mod = getAbilityModifier(newAbility.total, {
                damage: newAbility.damage,
                penalty: newAbility.penalty,
            });

            actor.system.abilities[abilityTarget].mod = mod;
        }
    }
}

Hooks.once('init', () => libWrapper.register(MODULE_NAME, 'pf1.components.ItemChange.prototype.applyChange', applyChange, libWrapper.OVERRIDE));
