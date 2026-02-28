import { isMelee } from '../util/action-type-helpers.mjs';
import { intersection } from '../util/array-intersects.mjs';
import { addCheckToAttackDialog, addTextInputToAttackDialog, getFormData } from '../util/attack-dialog-helper.mjs';
import { buildDamageMultiplierConditional } from '../util/damage-multiplier-conditional.mjs';
import { localize } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import { SpiritedCharge } from './specific/bonuses/spirited-charge-bonus.mjs';

/** @extends {BaseGlobalBonus} */
export class DamageMultiplierGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'damage-multiplier'; }

    /** @returns {string} */
    static get lanceKey() { return 'lance'; }

    /** @returns {string} */
    static get mountedKey() { return `${this.key}-mounted`; }

    /** @returns {string} */
    static get healingLabel() { return localize(`global-bonus.label.${this.bonusKey}-healing`); }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#damage-multiplier'; }

    /**
     * @inheritdoc
     * @override
     */
    static registerBonuses() {
        SpiritedCharge.register();
    }

    /**
     * @param {AttackDialog} dialog
     * @param {[HTMLElement]} html
     * @param {AttackDialogData} data
     */
    static updateAttackDialog(dialog, [html], data) {
        if (!(dialog instanceof pf1.applications.AttackDialog)) {
            return;
        }
        if (DamageMultiplierGlobalBonus.isDisabled() || DamageMultiplierGlobalBonus.isDisabledForActor(data.item?.actor)) {
            return;
        }

        addTextInputToAttackDialog(
            html,
            DamageMultiplierGlobalBonus.key,
            dialog,
            {
                iconClasses: ['ra', 'ra-crossed-swords'],
                label: data.isHealing ? DamageMultiplierGlobalBonus.healingLabel : DamageMultiplierGlobalBonus.label,
                placeholder: 'e.g. 2',
            }
        );

        const checkbox = /** @type {HTMLInputElement | undefined } */ (html.querySelector('input[name=charge]'));
        const isCharging = checkbox?.checked;
        if (isCharging) {
            // timeout so that this checkbox is added at the end after other dynamically added checkboxes
            setTimeout(() =>
                addCheckToAttackDialog(
                    html,
                    DamageMultiplierGlobalBonus.mountedKey,
                    dialog,
                    {
                        label: localize('mounted'),
                        title: localize('mounted-title'),
                    }
                )
            );
        }
    }

    /**
     * @param {ActionUse} action 
     * @param {ItemConditional[]} conditionals 
     * @returns {ItemConditional[]}
     */
    static getMultiplier(action, conditionals) {
        if (DamageMultiplierGlobalBonus.isDisabled() || DamageMultiplierGlobalBonus.isDisabledForActor(action.actor)) {
            return [];
        }

        const multiplierConditionals = [];

        const formula = /** @type {string} */ (getFormData(action, this.key));
        if (formula) {
            const multiplier = RollPF.safeTotal(formula, action.shared?.rollData) || 0;
            if (multiplier > 1) {
                const conditional = buildDamageMultiplierConditional(action, conditionals, this.label, { includeActionDamage: true, multiplier });
                if (conditional) {
                    multiplierConditionals.push(conditional);
                }
            }
        }

        const isMountedCharging = getFormData(action, this.mountedKey)
            && isMelee(action.item, action.action)
            && getFormData(action, 'charge');

        if (isMountedCharging) {
            if (SpiritedCharge.has(action.actor)) {
                const mountedConditional = buildDamageMultiplierConditional(action, conditionals, SpiritedCharge.label, { includeActionDamage: true, multiplier: 2 });
                if (mountedConditional) {
                    multiplierConditionals.push(mountedConditional);
                }
            }

            const lanceIntersection = intersection(action.item?.system.baseTypes, [LanguageSettings.getTranslation(DamageMultiplierGlobalBonus.lanceKey), 'lance', 'Lance'])[0];
            if (lanceIntersection) {
                const lanceConditional = buildDamageMultiplierConditional(action, conditionals, localize('lance-charge'), { includeActionDamage: true, multiplier: 2 });
                if (lanceConditional) {
                    multiplierConditionals.push(lanceConditional);
                }
            }
        }

        return multiplierConditionals;
    }

    static {
        Hooks.on('renderApplication', DamageMultiplierGlobalBonus.updateAttackDialog);
        LanguageSettings.registerItemNameTranslation(this.lanceKey);
    }
}
