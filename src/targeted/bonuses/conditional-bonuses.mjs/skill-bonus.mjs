import { MODULE_NAME } from '../../../consts.mjs';
import { showLabel } from '../../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInputAndKeyValueSelect } from '../../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { handleConditionalBonusesFor } from '../../../target-and-bonus-join.mjs';
import { createChange } from '../../../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { getFlaggedSkillIdsFromItem, getSkillChoices, getSkillHints } from '../../../util/get-skills.mjs';
import { LocalHookHandler, localHooks } from '../../../util/hooks.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { onSkillSheetRender } from '../../../util/on-skill-sheet-render-handler.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { BaseConditionalBonus } from './_base-conditional-bonus.mjs';

export class SkillBonus extends BaseConditionalBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'skill'; }
    static get chosenKey() { return `${this.key}-chosen`; }
    static get formulaKey() { return `${this.key}-formula`; }
    static get typeKey() { return `${this.key}-type`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.VlFEvwU7m3nbjy5d#skill'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        if (!source.actor) return;

        let hintText = localizeBonusTooltip(this.key);
        hintText += '<br>' + FormulaCacheHelper.getHint(source, this.formulaKey);

        const changeType = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, this.typeKey));
        hintText += ' ' + pf1.config.bonusTypes[changeType] || changeType;

        const skills = getSkillHints(source.actor, source, this.chosenKey);
        if (skills.length) {
            hintText += '<br>' + skills;
        }

        return [hintText];
    }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.formulaKey);
    }

    /**
     * @param {ItemPF} item
     * @param {SkillId} skillId
     * @returns {ItemChange | undefined}
     */
    static createChange(item, skillId) {
        const { actor } = item;
        if (!actor) return;

        const targetedIds = getFlaggedSkillIdsFromItem(actor, item, this.chosenKey);
        if (!targetedIds.includes(skillId)) return;

        const formula = FormulaCacheHelper.getModuleFlagFormula(item, this.formulaKey)[this.formulaKey];
        if (!formula) return;

        const change = createChange({
            value: FormulaCacheHelper.getModuleFlagValue(item, this.formulaKey),
            formula: formula,
            target: `skill.${skillId}`,
            id: `${this.key}_${item.id}_${skillId}`,
            type: item.getFlag(MODULE_NAME, this.typeKey),
            name: item.name,
        });
        return change;
    }

    /**
     *
     * @param {ItemChange[]} changes
     * @param {ActorPF} actor
     * @param {SkillId} skillId
     * @returns {ItemChange[]}
     */
    static getActorSkillChanges(changes, actor, skillId) {
        handleConditionalBonusesFor(
            actor,
            SkillBonus,
            (bonus, item) => {
                const change = bonus.createChange(item, skillId);
                if (change) {
                    changes.push(change);
                }
            }
        );
        return changes;
    }

    /**
     * @param {{ actor: ActorCharacterPF }} actorSheet
     * @param {`skill.${SkillId}` | undefined} key
     * @param {{ content: HTMLElement }} html
     */
    static onTooltipRender({ actor }, key, html) {
        if (!key?.startsWith('skill') || !actor) return;

        const skillId = /** @type {SkillId} */ (key.slice(6));

        const sources = actor.itemFlags?.boolean?.[this.key]?.sources ?? [];
        if (!sources.length) return;

        const ul = document.createElement('ul');
        ul.classList.add('notes');

        const header = document.createElement('h4');
        header.textContent = localize('bonus-header-labels.conditional-bonus');

        ul.appendChild(header);

        let found = false;
        sources.forEach((source) => {
            const conditionalTargets = /** @type {Array<RollBonusesAPI['sources']['BaseConditionalTarget']>} */((source[MODULE_NAME]?.targets ?? []).filter(t => t.isConditionalTarget));

            const targetedIds = getFlaggedSkillIdsFromItem(actor, source, this.chosenKey);
            if (!targetedIds.includes(skillId)) return;

            let bonusValue = this.isSource(source) && FormulaCacheHelper.getHint(source, this.formulaKey);
            if (!conditionalTargets.length || !bonusValue) return;

            const changeType = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, this.typeKey));
            bonusValue += ' ' + pf1.config.bonusTypes[changeType] || changeType;

            const hints = [source.name, ...conditionalTargets.map(t => t.fluentDescription(source)), bonusValue];
            hints.forEach((hint) => {
                const li = document.createElement('li');
                li.classList.add('note');
                li.innerHTML = hint;
                ul.appendChild(li);
            });
            found = true;
        });

        if (found) {
            html.content.append(ul);
        }
    }

    static {
        LocalHookHandler.registerHandler(localHooks.getActorSkillChanges, this.getActorSkillChanges.bind(this));
        Hooks.on('renderPF1ExtendedTooltip', this.onTooltipRender.bind(this));

        onSkillSheetRender({
            key: this.key,
            skillKey: this.chosenKey,
        }, {
            classes: () => ['fas', 'fa-star-of-life', 'ckl-skill-icon'],
            getText: (_actor, _skillId, source) => {
                let bonusValue = this.isSource(source) && FormulaCacheHelper.getHint(source, this.formulaKey);

                const conditionalTargets = /** @type {Array<RollBonusesAPI['sources']['BaseConditionalTarget']>} */((source[MODULE_NAME]?.targets ?? []).filter(t => t.isConditionalTarget));
                if (!conditionalTargets.length || !bonusValue) return '';

                const changeType = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, this.typeKey));
                bonusValue += ' ' + pf1.config.bonusTypes[changeType] || changeType;

                const hints = [source.name, ...conditionalTargets.map(t => t.fluentDescription(source)), bonusValue];
                return hints.join('<br>');
            },
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {string} [options.formula]
     * @param {BonusTypes} [options.changeType]
     * @param {ArrayOrSelf<SkillId>} [options.skillIds]
     * @returns {Promise<void>}
     */
    static async configure(item, { formula, changeType, skillIds }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.chosenKey]: toArray(skillIds),
                    [this.formulaKey]: formula,
                    [this.typeKey]: changeType,
                },
            },
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        const { bonusTypes } = pf1.config;
        const skillChoices = getSkillChoices(item.actor, { isEditable });
        const typeChoices = Object.entries(bonusTypes)
            .map(([key, label]) => ({ key, label }));

        showLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            inputType: 'conditional-bonus',
        });
        textInputAndKeyValueSelect({
            item,
            journal: this.journal,
            label: localizeBonusLabel(`${this.key}-input`),
            parent: html,
            select: {
                choices: typeChoices,
                key: this.typeKey,
            },
            text: {
                key: this.formulaKey,
            },
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'conditional-bonus',
            isSubLabel: true,
        });
        traitInput({
            choices: skillChoices,
            hasCustom: false,
            item,
            journal: this.journal,
            key: this.chosenKey,
            label: localizeBonusLabel(this.chosenKey),
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'conditional-bonus',
            isSubLabel: true,
        });
    }
}
