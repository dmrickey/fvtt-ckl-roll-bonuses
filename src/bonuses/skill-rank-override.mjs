import { MODULE_NAME } from '../consts.mjs';
import { textInput } from '../handlebars-handlers/bonus-inputs/text-input.mjs';
import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { createChange } from '../util/conditional-helpers.mjs';
import { FormulaCacheHelper, getDocFlags } from '../util/flag-helpers.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { getSkillChoices } from '../util/get-skills.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeItemHint } from "../util/localize.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { SpecificBonus } from './_specific-bonus.mjs';

export class SkillRankOverride extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'skill-rank-override'; }

    static get formulaKey() { return `${this.key}-formula`; }
    static get selectedKey() { return `${this.key}-selected`; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#skill-rank-override'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {SkillId[]} skillIds
     * @param {Formula} formula
     * @returns {Promise<void>}
     */
    static async configure(item, skillIds, formula) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.formulaKey]: formula + '',
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
                let choices = getSkillChoices(item.actor, { isEditable, includeAll: false });

                textInput({
                    item,
                    journal: this.journal,
                    key: this.formulaKey,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                })
                traitInput({
                    choices,
                    item,
                    journal: this.journal,
                    key: this.selectedKey,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}

FormulaCacheHelper.registerModuleFlag(SkillRankOverride.formulaKey);

registerItemHint((hintcls, actor, item, _data) => {
    const hasOverride = item.hasItemBooleanFlag(SkillRankOverride.key);
    if (!hasOverride) return;

    const overrides = getDocFlags(item, SkillRankOverride.key, { key: SkillRankOverride.selectedKey, onlyActive: false })
        .flatMap(x => x)
        .filter(truthiness);

    const rank = FormulaCacheHelper.getModuleFlagValue(item, SkillRankOverride.formulaKey);

    if (!overrides.length || !rank) {
        return;
    }

    const skills = overrides.map((id) => getSkillName(actor, id)).join(', ');
    const label = localizeItemHint(SkillRankOverride.key, { rank, skills });
    const hint = hintcls.create(label, [], {});
    return hint;
});

/**
 * @param {string} itemName
 * @param {string|number} rank
 * @returns {HTMLElement}
 */
function createRankIcon(itemName, rank) {
    const icon = document.createElement('a');
    icon.classList.add('fas', 'fa-brain', 'ckl-skill-icon');

    const tip = localize(`${SkillRankOverride.key}.skill-sheet-tip`, { itemName, rank });
    icon.setAttribute('data-tooltip', tip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    return icon;
}

/**
 * @param {ActorPF} actor
 * @return {Array<{name: string, rank: number, skills: Array<SkillId>}>}
 */
const getSources = (actor) => getCachedBonuses(actor, SkillRankOverride.key)
    .map((source) => ({
        name: source.name,
        rank: FormulaCacheHelper.getModuleFlagValue(source, SkillRankOverride.formulaKey),
        skills: /** @type {Array<SkillId>} */ (source.getFlag(MODULE_NAME, SkillRankOverride.selectedKey) ?? []),
    }));

Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ { actor }
) => {
    const sources = getSources(actor);
    if (!sources.length) return;

    html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
        /** @returns {SkillId} */
        const getSkillId = () => {
            const skillId = li.getAttribute('data-skill');
            const subId = li.getAttribute('data-sub-skill');
            return /** @type {SkillId} */ (subId
                ? `${skillId}.${subId}`
                : skillId);
        }

        const skillId = getSkillId();
        if (!skillId) return;
        sources.forEach((source) => {
            if (!source.skills.includes(skillId)) return;

            const icon = createRankIcon(source.name, source.rank);
            const nameElement = li.querySelector('.skill-name');
            nameElement?.appendChild(icon);
        });
    });
});

/**
 * @param {{ skillId: SkillId, options: object }} seed
 * @param {ActorPF} actor
 * @returns {void}
 */
function rollSkill(seed, actor) {
    const sources = getSources(actor);
    const source = sources.find((x) => x.skills.includes(seed.skillId));
    if (!source) return;

    Hooks.once('preCreateChatMessage', (
        /** @type {ChatMessagePF}*/ doc,
        /** @type {object}*/ _data,
        /** @type {object}*/ _options,
        /** @type {string}*/ _userId,
    ) => {
        const name = getSkillName(actor, seed.skillId);
        if (!name) {
            return;
        }
        const title = localize(`${SkillRankOverride.key}.skill-card-name`, { sourceName: source.name, rank: source.rank, skillName: name })
        doc.updateSource({ content: doc.content.replace(name, title) });
    });
}

/**
 * @param {SkillInfo} skillInfo
 * @param {ActorPF} actor
 * @param {RollData} _rollData
 */
function getSkillInfo(skillInfo, actor, _rollData) {
    const sources = getSources(actor);
    const source = sources.find((x) => x.skills.includes(skillInfo.id));
    if (!source) return;

    skillInfo.rank = source.rank;
}

/**
 * @param {ItemPF} item
 * @param {RollData} rollData
 */
function prepareData(item, rollData) {
    if (!item.isActive || !item.actor || !item.hasItemBooleanFlag(SkillRankOverride.key)) return;

    /** @type {Array<SkillId>} */
    const keys = item.getFlag(MODULE_NAME, SkillRankOverride.selectedKey) ?? [];
    keys.forEach((skillKey) => {
        const formula = item.getFlag(MODULE_NAME, SkillRankOverride.formulaKey);
        const rank = FormulaCacheHelper.getModuleFlagValue(item, SkillRankOverride.formulaKey);
        const change = createChange({
            name: `${game.i18n.localize("PF1.SkillRankPlural")} (${item.name})`,
            value: rank,
            formula,
            type: 'base',
            target: `skill.~${skillKey}`,
            id: `${item.id}_${SkillRankOverride.key}_${skillKey}`,
            operator: 'set',
        });

        // not null, but type safety is complaining about it here for some reason
        if (!item.actor) return;

        item.actor.changes ||= new Collection();
        item.actor.changes.set(change.id, change);

        const ori = { ...rollData.skills[skillKey] };
        if (!ori.rank && rank && ori.cs) {
            rollData.skills[skillKey].mod += 3;

            const csChange = createChange({
                formula: pf1.config.classSkillBonus,
                value: pf1.config.classSkillBonus,
                target: `skill.~${skillKey}`,
                type: "untyped",
                operator: "add",
                name: game.i18n.localize("PF1.CSTooltip"),
                id: `${item.id}_${SkillRankOverride.key}_${skillKey}_cs`,
            });
            item.actor.changes.set(csChange.id, csChange);
        }

        if (ori.rank < rank) {
            rollData.skills[skillKey].mod += (rank - ori.rank);
            rollData.skills[skillKey].rank = rank;
        }
    });
}

Hooks.once('init', () => {
    LocalHookHandler.registerHandler(localHooks.actorRollSkill, rollSkill);
    LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);
    LocalHookHandler.registerHandler(localHooks.prepareData, prepareData);
});
