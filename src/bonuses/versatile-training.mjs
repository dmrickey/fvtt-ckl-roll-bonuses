import { MODULE_NAME } from "../consts.mjs";
import { keyValueSelect } from '../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { api } from '../util/api.mjs';
import { intersection } from '../util/array-intersects.mjs';
import { createChange } from '../util/conditional-helpers.mjs';
import { getDocFlags } from '../util/flag-helpers.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { getWeaponGroupsFromActor } from '../util/get-weapon-groups-from-actor.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from "../util/item-hints.mjs";
import { listFormat } from '../util/list-format.mjs';
import { localize } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { SpecificBonus } from './_specific-bonus.mjs';

export class VersatileTraining extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'versatile-training'; }
    static get selectedKey() { return `${this.key}-selected`; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-training'; }

    /**
     * @param { ActorPF | ItemPF } doc
     * @returns {SkillId[]}
     * @param {object} [options]
     * @param {boolean} [options.onlyActive] Default true - if it should return when the bonus is active
     */
    static getTrainingSkills(doc, { onlyActive = true } = { onlyActive: true }) {
        return getDocFlags(doc, this.key, { key: this.selectedKey, onlyActive })
            .flatMap((skillIds) => skillIds)
            .filter(truthiness);
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {WeaponGroup} weaponGroup
     * @param {SkillId[]} skillIds
     * @returns {Promise<void>}
     */
    static async configure(item, weaponGroup, skillIds) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: weaponGroup,
                    [this.selectedKey]: skillIds,
                }
            },
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'ORQUp9lBAMxPhRVu',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                let currentGroup = /** @type {WeaponGroup} */ (item.getFlag(MODULE_NAME, this.key));

                /** @type {{[key: string]: string}} */
                const skillChoices = {};
                /** @type {{[key: string]: string}} */
                const groupChoices = { ...pf1.config.weaponGroups };
                if (isEditable && item.actor) {
                    if (!currentGroup) {
                        currentGroup =  /** @type {WeaponGroup} */ (Object.keys(api.config.versatileTraining.mapping)[0]);
                        item.setFlag(MODULE_NAME, this.key, currentGroup);
                        return;
                    }

                    const getName = (/** @type {SkillId} */ skillId) => isDriver(skillId)
                        ? localize('driver')
                        : getSkillName(item.actor, skillId);
                    api.config.versatileTraining.mapping[currentGroup].forEach((skillId) => skillChoices[skillId] = getName(skillId));
                    Object.entries(api.config.versatileTraining.mapping).forEach(([_group, skills]) => {
                        const group = /** @type {WeaponGroup} */ (_group);
                        if (groupChoices[group]) {
                            groupChoices[group] = `${groupChoices[group]}: ${skills.map((skillId) => getName(skillId)).join(', ')}`;
                        }
                    });

                    const currentSkills = item.getFlag(MODULE_NAME, this.selectedKey) || [];
                    const validSkills = intersection(
                        currentSkills,
                        api.config.versatileTraining.mapping[currentGroup],
                    );
                    if (currentSkills.length !== validSkills.length) {
                        item.setFlag(MODULE_NAME, this.selectedKey, validSkills);
                    }
                }

                keyValueSelect({
                    choices: groupChoices,
                    current: currentGroup,
                    item,
                    journal: this.journal,
                    key: this.key,
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
                    journal: this.journal,
                    key: this.selectedKey,
                    limit: 2,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    if (!item?.actor) return;

                    const group = getWeaponGroupsFromActor(item.actor)[0];
                    if (group) {
                        return {
                            [this.key]: group,
                            [this.selectedKey]: api.config.versatileTraining.mapping[group].slice(0, 2)
                        }
                    }
                }
            },
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(VersatileTraining.key); }

    static {
        LanguageSettings.registerItemNameTranslation(VersatileTraining.key);
    }
}

{
    /** @type {SkillId[]} */
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

registerItemHint((hintcls, actor, item, _data) => {
    if (!VersatileTraining.has(item)) return;

    const selectedSkills = VersatileTraining.getTrainingSkills(item, { onlyActive: false });

    if (!selectedSkills.length) {
        return;
    }

    const skills = listFormat(selectedSkills.map((id) => getSkillName(actor, id)), 'and');
    const hint = hintcls.create(localize('versatile-training.hint', { skills }), [], { hint: VersatileTraining.tooltip });
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
    const selectedSkills = VersatileTraining.getTrainingSkills(actor);

    if (!selectedSkills?.length) return;

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
        if (!selectedSkills.includes(skillId)) return;

        const icon = createVTIcon(actor);
        const name = li.querySelector('.skill-name');
        name?.appendChild(icon);
    });
});

/**
 * @param {{ skillId: SkillId, options: object }} seed
 * @param {ActorPF} actor
 * @returns {void}
 */
function versatileRollSkill(seed, actor) {
    const selectedSkills = VersatileTraining.getTrainingSkills(actor);

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
    const selectedSkills = VersatileTraining.getTrainingSkills(actor);
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
    if (!item.isActive || !item.actor || !VersatileTraining.has(item)) return;

    /** @type {Array<SkillId>} */
    const keys = item.getFlag(MODULE_NAME, VersatileTraining.selectedKey) ?? [];
    if (keys.length && item.actor) {
        if (!rollData.attributes.bab) return;

        const rank = rollData.attributes.bab.total;
        keys.forEach((skillKey) => {
            const change = createChange({
                name: `${game.i18n.localize("PF1.SkillRankPlural")} (${item.name})`,
                value: rank,
                formula: rank,
                type: 'base',
                target: `skill.~${skillKey}`,
                id: `${item.id}_${VersatileTraining.key}_${skillKey}`,
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
                    id: `${item.id}_${VersatileTraining.key}_${skillKey}_cs`,
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
