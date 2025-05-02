// @ts-nocheck

import { MODULE_NAME } from "../consts.mjs";
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';

/**
 * Applies this change to an actor.
 *
 * @param {ActorPF} actor - The actor to apply the change's data to.
 * @param {string[]} [targets] - Property paths to target on the actor's data.
 * @param {object} [options] - Optional options to change the behavior of this function.
 * @param {boolean} [options.applySourceInfo=true] - Whether to add the changes to the actor's source information.
 * @param {object} [options.rollData] - Roll data
 */
function applyChange(actor, targets = null, { applySourceInfo = true, rollData } = {}) {
    // Prepare change targets
    targets ??= this.getTargets(actor);

    rollData ??= this.parent ? this.parent.getRollData({ refresh: true }) : actor.getRollData({ refresh: true });

    const overrides = actor.changeOverrides;
    for (const t of targets) {
        const override = overrides[t];
        const operator = this.operator;

        // HACK: Data prep change application creates overrides; only changes meant for manual comparison lack them,
        // and those do not have to be applied to the actor.
        // This hack enables calling applyChange on Changes that are not meant to be applied, but require a call to
        // determine effective operator and/or value.
        if (!override) continue;

        let value = 0;
        if (this.formula) {
            if (!isNaN(this.formula)) {
                value = parseFloat(this.formula);
            } else if (this.isDeferred && RollPF.parse(this.formula).some((t) => !t.isDeterministic)) {
                value = RollPF.replaceFormulaData(this.formula, rollData, { missing: 0 });
            } else {
                value = RollPF.safeRollSync(
                    this.formula,
                    rollData,
                    { formula: this.formula, target: t, change: this, rollData },
                    { suppressError: this.parent && !this.parent.isOwner },
                    { maximize: true }
                ).total;
            }
        }

        // #region THIS IS MY ONLY CHANGE - MODIFY THE VALUE BEFORE IT'S USED BELOW
        value = LocalHookHandler.fireHookWithReturnSync(localHooks.patchChangeValue, value, this.type, this.parent?.actor);
        // #endregion END MY ONLY CHANGE

        this.value = value;

        if (!t) continue;

        const prior = override[operator][this.type];

        switch (operator) {
            case "add":
                {
                    let base = foundry.utils.getProperty(actor, t);

                    // Don't change non-existing ability scores
                    if (base == null) {
                        if (t.match(/^system\.abilities/)) continue;
                        base = 0;
                    }

                    // Deferred formula
                    if (typeof value === "string") break;

                    if (typeof base === "number") {
                        // Skip positive dodge modifiers if lose dex to AC is in effect
                        if (actor.changeFlags.loseDexToAC && value > 0 && this.type === "dodge" && this.isAC) continue;

                        if (pf1.config.stackingBonusTypes.includes(this.type)) {
                            // Add stacking bonus
                            foundry.utils.setProperty(actor, t, base + value);
                            override[operator][this.type] = (prior ?? 0) + value;
                        } else {
                            // Use higher value only
                            const diff = !prior ? value : Math.max(0, value - (prior ?? 0));
                            foundry.utils.setProperty(actor, t, base + diff);
                            override[operator][this.type] = Math.max(prior ?? 0, value);
                        }
                    }
                }
                break;

            case "set":
                foundry.utils.setProperty(actor, t, value);
                override[operator][this.type] = value;
                break;
        }

        if (applySourceInfo) this.applySourceInfo(actor);

        // Adjust ability modifier
        const modifierChanger = t.match(/^system\.abilities\.([a-zA-Z0-9]+)\.(?:total|penalty|base)$/);
        const abilityTarget = modifierChanger?.[1];
        if (abilityTarget) {
            const ability = actor.system.abilities[abilityTarget];
            ability.mod = pf1.utils.getAbilityModifier(ability.total, {
                damage: ability.damage,
                penalty: ability.penalty,
            });
        }
    }
}

Hooks.once('init', () => libWrapper.register(MODULE_NAME, 'pf1.components.ItemChange.prototype.applyChange', applyChange, libWrapper.OVERRIDE));
