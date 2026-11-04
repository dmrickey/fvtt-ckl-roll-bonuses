import { MODULE_NAME } from '../consts.mjs';
import { showLabel } from '../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInputAndKeyValueSelect } from '../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { changeTypeLabel } from '../util/change-type-label.mjs';
import { createChange } from '../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from '../util/flag-helpers.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { getSkillChoices, getSkillHints } from '../util/get-skills.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { onSkillSheetRender } from '../util/on-skill-sheet-render-handler.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

export class TakeTenBonus extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'take-ten'; }

    /** @inheritdoc @override */
    static get journal() { return ''; }

    static get formulaKey() { return `${this.key}-formula`; }
    static get changeTypeKey() { return `${this.key}-type`; }
    static get selectedKey() { return `${this.key}-selected`; }

    static {
        onSkillSheetRender({
            key: this.key,
            skillKey: this.selectedKey,
        }, {
            classes: () => ['fas', 'fa-circle-dot', 'ckl-skill-icon'],
            getText: (_actor, _skillId, source) => {
                const formula = FormulaCacheHelper.getHint(source, TakeTenBonus.formulaKey) ?? '';
                const changeType = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, TakeTenBonus.changeTypeKey) || 'untyped');
                const typeLabel = changeTypeLabel(changeType);
                return `${source.name}<br>${formatChange(formula, typeLabel)}`;
            },
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} formula
     * @param {BonusTypes} type
     * @param {SkillId[]} skillIds
     * @returns {Promise<void>}
     */
    static async configure(item, formula, type, skillIds) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.formulaKey]: formula + '',
                    [this.changeTypeKey]: type,
                    [this.selectedKey]: skillIds,
                },
            },
        });
    }

    /** @inheritdoc @override @returns {JustRender} */
    static get configuration() {
        return {
            type: 'just-render',
            showInputsFunc: (item, html, isEditable) => {
                const choices = getSkillChoices(item.actor, { includeAll: false, isEditable });
                const { bonusTypes } = pf1.config;
                const current = item.getFlag(MODULE_NAME, this.changeTypeKey);
                const formula = item.getFlag(MODULE_NAME, this.formulaKey);

                showLabel({
                    item,
                    key: this.key,
                    journal: this.journal,
                    parent: html,
                }, {
                    inputType: 'specific-bonus',
                });

                const typeChoices = Object.entries(bonusTypes)
                    .map(([key, label]) => ({ key, label }));

                textInputAndKeyValueSelect({
                    item,
                    journal: '',
                    label: localizeBonusLabel(this.formulaKey),
                    tooltip: localizeBonusTooltip(this.formulaKey),
                    parent: html,
                    select: { current, choices: typeChoices, key: this.changeTypeKey },
                    text: { current: formula, key: this.formulaKey },
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                    isSubLabel: true,
                });

                traitInput({
                    choices,
                    item,
                    journal: '',
                    key: this.selectedKey,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                    isSubLabel: true,
                });
            },
        };
    }
}

FormulaCacheHelper.registerModuleFlag(TakeTenBonus.formulaKey);

registerItemHint((hintcls, actor, item, _data) => {
    if (!TakeTenBonus.has(item)) return;

    const formula = FormulaCacheHelper.getHint(item, TakeTenBonus.formulaKey);
    const skills = getSkillHints(actor, item, TakeTenBonus.selectedKey);
    if (!formula || !skills) return;

    const changeType = /** @type {BonusTypes} */ (item.getFlag(MODULE_NAME, TakeTenBonus.changeTypeKey) || 'untyped');
    const hint = `${skills}<br>${formatChange(formula, changeTypeLabel(changeType))}`;
    return hintcls.create(localizeBonusLabel(TakeTenBonus.key), [], { hint });
});

/**
 * @param {SkillId} skill
 * @returns {string}
 */
const getSkillTarget = (skill) => {
    const [mainSkillId, subSkillId] = skill.split('.');
    const skillDataPathPart = subSkillId
        ? `${mainSkillId}.subSkills.${subSkillId}`
        : mainSkillId;
    return `system.skills.${skillDataPathPart}.mod`;
};

/**
 * @param {ActorPF} actor
 * @param {SkillId} skill
 * @returns {ItemChange[]}
 */
const getTakeTenChanges = (actor, skill) => getCachedBonuses(actor, TakeTenBonus.key)
    .filter((source) => {
        const selected = /** @type {SkillId[]} */ (source.getFlag(MODULE_NAME, TakeTenBonus.selectedKey) ?? []);
        return selected.includes(skill);
    })
    .map((source) => {
        const formula = FormulaCacheHelper.getModuleFlagFormula(source, TakeTenBonus.formulaKey)[TakeTenBonus.formulaKey];
        const value = FormulaCacheHelper.getModuleFlagValue(source, TakeTenBonus.formulaKey);
        const type = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, TakeTenBonus.changeTypeKey) || 'untyped');

        return createChange({
            name: source.name,
            value,
            formula,
            type,
            target: `skill.~${skill}`,
            id: `${source.id}_${TakeTenBonus.key}_${skill}`,
        });
    });

/**
 * @param {Formula} value
 * @param {string | undefined} flavor
 * @returns {string}
 */
const formatChange = (value, flavor) => {
    if (typeof value === 'string' && RollPF.parse(value).length > 1) {
        return `(${value})[${flavor}]`;
    }
    return `${value}[${flavor}]`;
};

/**
 * @param {string[]} parts
 * @param {string[]} sequence
 * @returns {number}
 */
const findPartsSequence = (parts, sequence) => {
    if (!sequence.length) return -1;

    let result = -1;
    for (let index = 0; index <= parts.length - sequence.length; index++) {
        const matches = sequence.every((part, offset) => parts[index + offset] === part);
        if (!matches) continue;

        // Parts are strings, so an ambiguous match cannot be safely attributed to changes.
        if (result >= 0) return -1;
        result = index;
    }
    return result;
};

/**
 * Replace existing skill changes that were superseded by Take Ten changes.
 *
 * @param {D20RollPF} roll
 * @param {ItemChange[]} existingChanges
 * @param {Set<string>} highestChangeIds
 * @returns {boolean}
 */
const replaceSupersededChanges = (roll, existingChanges, highestChangeIds) => {
    const existingRenderableChanges = existingChanges
        .filter((change) => change.value);
    const supersededChanges = existingRenderableChanges
        .filter((change) => !highestChangeIds.has(change.id));
    if (!supersededChanges.length) return true;

    const existingChangeParts = existingRenderableChanges
        .map((change) => formatChange(change.value, change.flavor));
    const existingChangeTerms = RollPF.parse(existingChangeParts.join(' + '), roll.data);
    /** @param {RollTerm[]} terms @returns {string[]} */
    const getTermFormulas = (terms) => terms.map((term) => RollPF.getFormula([term]));
    const changePartsStart = findPartsSequence(
        getTermFormulas(roll.terms),
        getTermFormulas(existingChangeTerms),
    );
    if (changePartsStart < 0) return false;

    const remainingChangeParts = existingRenderableChanges
        .filter((change) => highestChangeIds.has(change.id))
        .map((change) => formatChange(change.value, change.flavor));
    const remainingChangeTerms = remainingChangeParts.length
        ? RollPF.parse(remainingChangeParts.join(' + '), roll.data)
        : [];

    let removeStart = changePartsStart;
    let removeLength = existingChangeTerms.length;
    if (!remainingChangeTerms.length && removeStart > 0) {
        const precedingTerm = roll.terms[removeStart - 1];
        if (RollPF.getFormula([precedingTerm]) === '+') {
            removeStart -= 1;
            removeLength += 1;
        }
    }

    roll.terms.splice(removeStart, removeLength, ...remainingChangeTerms);
    const mutableRoll = /** @type {D20RollPF & { _formula: string }} */ (roll);
    mutableRoll._formula = RollPF.getFormula(roll.terms);
    return true;
};

/**
 * Resolve the actor that initiated a d20 roll from its speaker data.
 *
 * @param {{ actor?: string; scene?: string; token?: string }} [speaker]
 * @returns {ActorPF | undefined}
 */
const getActorFromSpeaker = (speaker) => {
    if (speaker?.scene && speaker.token) {
        const token = game.scenes.get(speaker.scene)?.tokens.get(speaker.token);
        if (token?.actor) return token.actor;
    }

    return speaker?.actor ? game.actors.get(speaker.actor) : undefined;
};

/**
 * Alternative implementation using the system's post-dialog d20 roll hook.
 *
 * @param {D20RollPF} roll
 * @param {{
 *     subject?: { skill?: SkillId };
 *     speaker?: { actor?: string; scene?: string; token?: string };
 * }} options
 */
function onPreD20Roll(roll, options) {
    const rollOptions = /** @type {D20RollOptions} */ (roll.options);
    if (rollOptions.staticRoll !== 10) return;

    const skill = options.subject?.skill;
    if (!skill) return;

    const actor = getActorFromSpeaker(options.speaker);
    if (!actor) return;

    const takeTenChanges = getTakeTenChanges(actor, skill);
    if (!takeTenChanges.length) return;

    const target = getSkillTarget(skill);
    const validChanges = actor.changes?.filter((/** @type {ItemChange} */ change) =>
        change.getTargets(actor).includes(target)
    ) ?? [];
    const existingChanges = pf1.documents.actor.changes.getHighestChanges(
        validChanges,
        { ignoreTarget: true },
    );
    const changes = pf1.documents.actor.changes.getHighestChanges(
        [...validChanges, ...takeTenChanges],
        { ignoreTarget: true },
    );
    const highestChangeIds = new Set(changes.map((change) => change.id));

    if (!replaceSupersededChanges(roll, existingChanges, highestChangeIds)) return;

    const addBonus = /** @type {D20RollPF & { addBonus: (bonus: string) => void }} */ (roll);
    takeTenChanges
        .filter((change) => highestChangeIds.has(change.id) && change.value)
        .forEach((change) => addBonus.addBonus(formatChange(change.value, change.flavor)));
}

Hooks.on('pf1PreD20Roll', onPreD20Roll);
