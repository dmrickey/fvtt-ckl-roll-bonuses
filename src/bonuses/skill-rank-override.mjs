import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeItemHint } from "../util/localize.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';
import { showChecklist } from '../handlebars-handlers/targeted/targets/checklist-input.mjs';
import { FormulaCacheHelper, getDocFlags } from '../util/flag-helpers.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { textInput } from '../handlebars-handlers/bonus-inputs/text-input.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { createChange } from '../util/conditional-helpers.mjs';

const key = 'skill-rank-override';
const formulaKey = 'skill-rank-override-formula';
const selectedKey = 'skill-rank-override-selected';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#skill-rank-override';

SpecificBonuses.registerSpecificBonus({ journal, key });
FormulaCacheHelper.registerModuleFlag(formulaKey);

registerItemHint((hintcls, actor, item, _data) => {
    const hasOverride = item.hasItemBooleanFlag(key);
    if (!hasOverride) return;

    const overrides = getDocFlags(item, selectedKey)
        .flatMap(x => x)
        .filter(truthiness);

    const rank = FormulaCacheHelper.getModuleFlagValue(item, formulaKey);

    if (!overrides.length || !rank) {
        return;
    }

    const skills = overrides.map((id) => getSkillName(actor, id)).join(', ');
    const label = localizeItemHint(key, { rank, skills });
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

    const tip = localize(`${key}.skill-sheet-tip`, { itemName, rank });
    icon.setAttribute('data-tooltip', tip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    return icon;
}

/**
 * @param {ActorPF} actor
 * @return {Array<{name: string, rank: number, skills: Array<keyof typeof pf1.config.skills>}>}
 */
const getSources = (actor) => (actor.itemFlags?.boolean?.[key]?.sources ?? [])
    .map((source) => ({
        name: source.name,
        rank: FormulaCacheHelper.getModuleFlagValue(source, formulaKey),
        skills: /** @type {Array<keyof typeof pf1.config.skills>} */ (source.getFlag(MODULE_NAME, selectedKey) ?? []),
    }));

Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ { actor }
) => {
    const sources = getSources(actor);
    if (!sources.length) return;

    html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
        /** @returns {keyof typeof pf1.config.skills} */
        const getSkillId = () => {
            const skillId = li.getAttribute('data-skill');
            const subId = li.getAttribute('data-sub-skill');
            return /** @type {keyof typeof pf1.config.skills} */ (subId
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
 * @param {{ skillId: keyof typeof pf1.config.skills, options: object }} seed
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
        const title = localize(`${key}.skill-card-name`, { sourceName: source.name, rank: source.rank, skillName: name })
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
    if (!item.isActive) return;

    /** @type {Array<keyof typeof pf1.config.skills>} */
    const keys = item.getFlag(MODULE_NAME, selectedKey) ?? [];
    if (keys.length && item.actor) {
        keys.forEach((skillKey) => {
            const formula = item.getFlag(MODULE_NAME, formulaKey);
            const rank = FormulaCacheHelper.getModuleFlagValue(item, formulaKey);
            const change = createChange({
                name: `${game.i18n.localize("PF1.SkillRankPlural")} (${item.name})`,
                value: rank,
                formula,
                type: 'base',
                target: `skill.~${skillKey}`,
                id: `${item.id}_${key}_${skillKey}`,
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
                    id: `${item.id}_${key}_${skillKey}_cs`,
                });
                item.actor.changes.set(csChange.id, csChange);
            }

            if (ori.rank < rank) {
                rollData.skills[skillKey].mod += (rank - ori.rank);
                rollData.skills[skillKey].rank = rank;
            }
        });
    }
}

Hooks.once('init', () => {
    LocalHookHandler.registerHandler(localHooks.actorRollSkill, rollSkill);
    LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);
    LocalHookHandler.registerHandler(localHooks.prepareData, prepareData);
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(key);
    if (!hasFlag) {
        return;
    }
    /** @type {{[key: string]: string}} */
    let skillChoices = {};
    if (isEditable) {
        if (actor) {
            skillChoices = actor.allSkills
                .reduce((acc, skillId) => ({ ...acc, [skillId]: getSkillName(actor, skillId) }), {});
        } else {
            skillChoices = pf1.config.skills;
        }
    }

    textInput({
        item,
        journal,
        key: formulaKey,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    })
    showChecklist({
        item,
        journal,
        key: selectedKey,
        options: skillChoices,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});
