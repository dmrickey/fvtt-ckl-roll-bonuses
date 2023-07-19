
// Shield Focus - adds +1 AC
// improved Shield Focus - Reduce shield ACP by one
// Greater Shield Focus - adds an extra +1 AC

// THIS IS NOT USED - BASICALLY EVERYTHING HERE CAN ALREADY BE HANDLED BY THE SYSTEM
// THIS IS JUST STILL HERE AS EXAMPLES
// todo add localization

import { hasAnyBFlag } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";

const shieldFocus = 'shieldFocus';
const improvedShieldFocus = 'improvedShieldFocus';
const greaterShieldFocus = 'greaterShieldFocus';

registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemEquipmentPF)) return;

    const isShield = item.isActive && item.system.slot === 'shield';
    const hasFocus = hasAnyBFlag(actor, shieldFocus, improvedShieldFocus, greaterShieldFocus);

    if (isShield && hasFocus) {
        const hint = hintcls.create('Shield Focus', [], {});
        return hint;
    }
});

/**
 * @param {ActorPF | ItemPF | ItemAction} doc
 * @param {RollData} rollData
 */
function handleShieldFocusRollData(doc, rollData) {
    if (!(doc instanceof pf1.documents.item.ItemEquipmentPF)) return;

    const actor = doc.actor;
    if (!actor) return;

    const isShield = doc.isActive && doc.system.slot === 'shield';
    const hasShieldFocus = actor.itemFlags?.boolean?.[shieldFocus];
    const hasImprovedShieldFocus = actor.itemFlags?.boolean?.[improvedShieldFocus];
    const hasGreaterShieldFocus = actor.itemFlags?.boolean?.[greaterShieldFocus];

    if (isShield) {
        if (hasShieldFocus) {
            rollData.item.armor.value += 1;
        }

        if (hasImprovedShieldFocus) {
            const current = rollData.item.armor.acp || 0;
            rollData.item.armor.acp = Math.max(current - 1, 0);
        }

        if (hasGreaterShieldFocus) {
            rollData.item.armor.value += 1;
        }
    }
}

/**
 * @param {ActorPF} actor
 * @param {ItemChange[]} tempChanges
 */
function handleShieldFocusChange(actor, tempChanges) {
    const hasShieldFocus = actor.itemFlags?.boolean?.[shieldFocus];
    const hasImprovedShieldFocus = actor.itemFlags?.boolean?.[improvedShieldFocus];
    const hasGreaterShieldFocus = actor.itemFlags?.boolean?.[greaterShieldFocus];
    if (!hasShieldFocus && !hasImprovedShieldFocus && !hasGreaterShieldFocus) return;

    //@ts-ignore
    const /** @type {ItemEquipmentPF} */ equippedShield = actor.items.find(
        /** @returns {item is ItemEquipmentPF | undefined} */
        (item) =>
            item instanceof pf1.documents.item.ItemEquipmentPF
            && item.isActive
            && item.system.slot === 'shield'
    );
    if (!equippedShield) return;

    if (hasShieldFocus) {
        tempChanges.push(
            new pf1.components.ItemChange({
                flavor: 'Shield Focus',
                formula: 1,
                modifier: "untypedPerm",
                subTarget: "sac",
            })
        );
    }

    if (hasImprovedShieldFocus) {
        const current = equippedShield.system.armor.acp || 0;
        if (current > 0) {
            tempChanges.push(
                new pf1.components.ItemChange({
                    flavor: 'Improved Shield Focus',
                    formula: -1,
                    modifier: "untypedPerm",
                    subTarget: "acpS",
                })
            );
        }
    }

    if (hasGreaterShieldFocus) {
        tempChanges.push(
            new pf1.components.ItemChange({
                flavor: 'Greater Shield Focus',
                formula: 1,
                modifier: "untypedPerm",
                subTarget: "sac",
            })
        );
    }
}

Hooks.on('pf1GetRollData', handleShieldFocusRollData);
Hooks.on('pf1AddDefaultChanges', handleShieldFocusChange);
