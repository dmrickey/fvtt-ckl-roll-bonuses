import { MODULE_NAME } from "../consts.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeBonusTooltip } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';
import { api } from '../util/api.mjs';
import { keyValueSelect } from '../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { getDocFlags } from '../util/flag-helpers.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { intersection } from '../util/array-intersects.mjs';
import { itemHasCompendiumId } from '../util/has-compendium-id.mjs';
import { createChange } from '../util/conditional-helpers.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { traitInput } from '../handlebars-handlers/trait-input.mjs';

const key = 'versatile-training';
const selectedKey = 'versatile-training-selected';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-training';
const compendiumId = 'ORQUp9lBAMxPhRVu';

SpecificBonuses.registerSpecificBonus({ journal, key });

class Settings {
    static get versatileTraining() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

{
    /** @type {(keyof typeof pf1.config.skills)[]} */
    const allChoices = ['blf', 'int'];
    api.config.versatileTraining.default = allChoices;
    const sort = (/** @type {any[]} */ arr) => { arr.sort(); return arr; }
    api.config.versatileTraining.mapping = {
        'axes': sort([...allChoices, 'clm', 'sur']),
        'bladesHeavy': sort([...allChoices, 'dip', 'rid']),
        'bladesLight': sort([...allChoices, 'dip', 'slt']),
        'bows': sort([...allChoices, 'ken', 'per']),
        'close': sort([...allChoices, 'sen', 'ste']),
        'crossbows': sort([...allChoices, 'per', 'ste']),
        'double': sort([...allChoices, 'acr', 'sen']),
        'firearms': sort([...allChoices, 'per', 'slt']),
        'flails': sort([...allChoices, 'acr', 'slt']),
        'hammers': sort([...allChoices, 'dip', 'rid']),
        'monk': sort([...allChoices, 'acr', 'esc']),
        'natural': sort([...allChoices, 'clm', 'fly', 'swm']),
        'polearms': sort([...allChoices, 'dip', 'sen']),
        'siegeEngines': sort([...allChoices, 'clm', 'pro.driver']),
        'spears': sort([...allChoices, 'han', 'rid']),
        'thrown': sort([...allChoices, 'acr', 'per']),
        'tribal': sort([...allChoices, 'clm', 'sur']),
    };
}

/**
 *
 * @param {ActorPF} actor
 */
const getActorVTSkills = (actor) => {
    const sources = getCachedBonuses(actor, key);
    const selectedSkills = sources.flatMap((source) => getDocFlags(source, selectedKey))
        .filter(truthiness);
    return selectedSkills;
}

registerItemHint((hintcls, actor, item, _data) => {
    if (!item.hasItemBooleanFlag(key)) return;

    const selectedSkills = getDocFlags(item, selectedKey)
        .flatMap(x => x)
        .filter(truthiness);

    if (!selectedSkills.length) {
        return;
    }

    const skills = selectedSkills.map((id) => getSkillName(actor, id)).join(', ');
    const hint = hintcls.create(localize('versatile-training.hint', { skills }), [], { hint: localizeBonusTooltip(key) });
    return hint;
});

/**
 * @param {ActorPF} actor
 * @returns {HTMLElement}
 */
function createVTIcon(actor) {
    const icon = document.createElement('a');
    icon.classList.add('ra', 'ra-crossed-swords', 'ckl-skill-icon');

    const rollData = actor.getRollData();
    const tip = localize('versatile-training.skill-tip', { bab: rollData.attributes.bab.total });
    icon.setAttribute('data-tooltip', tip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    return icon;
}

Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ { actor }
) => {
    const selectedSkills = getActorVTSkills(actor);

    if (!selectedSkills?.length) return;

    html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
        const getSkillId = () => {
            const skillId = li.getAttribute('data-skill');
            const subId = li.getAttribute('data-sub-skill');
            return subId
                ? `${skillId}.${subId}`
                : skillId;
        }

        const skillId = getSkillId();
        if (!skillId) return;
        if (!selectedSkills.includes(skillId)) return;

        const icon = createVTIcon(actor);
        const name = li.querySelector('.skill-name');
        name?.appendChild(icon);
    });
});

/**
 * @param {{ skillId: keyof typeof pf1.config.skills, options: object }} seed
 * @param {ActorPF} actor
 * @returns {void}
 */
function versatileRollSkill(seed, actor) {
    const selectedSkills = getActorVTSkills(actor);

    if (selectedSkills.includes(seed.skillId)) {
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
            const vtTitle = localize('versatile-training.title', { skill: name });
            doc.updateSource({ content: doc.content.replace(name, vtTitle) });
        });
    }
}

/**
 * @param {SkillInfo} skillInfo
 * @param {ActorPF} actor
 * @param {RollData} rollData
 */
function getSkillInfo(skillInfo, actor, rollData) {
    const selectedSkills = getActorVTSkills(actor);
    if (selectedSkills.includes(skillInfo.id)) {
        skillInfo.rank = rollData.attributes.bab.total;
        skillInfo.cs = true;
    }
}


/**
 * @param {ItemPF} item
 * @param {RollData} rollData
 */
function prepareData(item, rollData) {
    if (!item.isActive || !item.actor || !item.hasItemBooleanFlag(key)) return;

    /** @type {Array<keyof typeof pf1.config.skills>} */
    const keys = item.getFlag(MODULE_NAME, selectedKey) ?? [];
    if (keys.length && item.actor) {
        keys.forEach((skillKey) => {
            const rank = rollData.attributes.bab.total;
            const change = createChange({
                name: `${game.i18n.localize("PF1.SkillRankPlural")} (${item.name})`,
                value: rank,
                formula: rank,
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
            if ((!ori.rank || !ori.cs) && rank) {
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
    LocalHookHandler.registerHandler(localHooks.actorRollSkill, versatileRollSkill);
    LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);
    LocalHookHandler.registerHandler(localHooks.prepareData, prepareData);
});

/** @param {string} id  @returns {boolean} */
const isDriver = (id) => id === 'pro.driver';

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasKey = item.hasItemBooleanFlag(key);
    if (!hasKey) {
        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.versatileTraining || hasCompendiumId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    let currentGroup = /** @type {keyof typeof pf1.config.weaponGroups} */ (item.getFlag(MODULE_NAME, key));

    /** @type {{[key: string]: string}} */
    const skillChoices = {};
    /** @type {{[key: string]: string}} */
    const groupChoices = { ...pf1.config.weaponGroups };
    if (isEditable && actor) {
        if (!currentGroup) {
            currentGroup =  /** @type {keyof typeof pf1.config.weaponGroups} */ (Object.keys(api.config.versatileTraining.mapping)[0]);
            item.setFlag(MODULE_NAME, key, currentGroup);
            return;
        }

        const getName = (/** @type {keyof typeof pf1.config.skills} */ skillId) => isDriver(skillId)
            ? localize('driver')
            : getSkillName(actor, skillId);
        api.config.versatileTraining.mapping[currentGroup].forEach((skillId) => skillChoices[skillId] = getName(skillId));
        Object.entries(api.config.versatileTraining.mapping).forEach(([_group, skills]) => {
            const group = /** @type {keyof typeof pf1.config.weaponGroups} */ (_group);
            if (groupChoices[group]) {
                groupChoices[group] = `${groupChoices[group]}: ${skills.map((skillId) => getName(skillId)).join(', ')}`;
            }
        });

        const currentSkills = item.getFlag(MODULE_NAME, selectedKey) || [];
        const validSkills = intersection(
            currentSkills,
            api.config.versatileTraining.mapping[currentGroup],
        );
        if (currentSkills.length !== validSkills.length) {
            item.setFlag(MODULE_NAME, selectedKey, validSkills);
        }
    }

    keyValueSelect({
        choices: groupChoices,
        current: currentGroup,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
    traitInput({
        choices: skillChoices,
        description: localize('versatile-training.description'),
        hasCustom: false,
        item,
        journal,
        key: selectedKey,
        limit: 2,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

/**
 * @param {ItemPF} item
 * @param {object} data
 * @param {{temporary: boolean}} param2
 * @param {string} id
 */
const onCreate = (item, data, { temporary }, id) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;
    if (temporary) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
    const hasBonus = item.hasItemBooleanFlag(key);

    if ((name === Settings.versatileTraining || hasCompendiumId) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${key}`]: true,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
