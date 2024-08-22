// https://www.d20pfsrd.com/classes/core-classes/bard/#Versatile_Performance_Ex

import { MODULE_NAME } from "../consts.mjs";
import { createTemplate, templates } from "../handlebars-handlers/templates.mjs";
import { addNodeToRollBonus } from "../handlebars-handlers/add-bonus-to-item-sheet.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { difference } from '../util/array-intersects.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { keyValueSelect } from '../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { truthiness } from '../util/truthiness.mjs';

const key = 'versatile-performance';
export { key as versatilePerformanceKey };
const keyBase = `${key}-base`;
const keyChoice1 = `${key}-choice-1`;
const keyChoice2 = `${key}-choice-2`;
const keyExpanded = `${key}-expanded`;
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-performance';

/** @type {Array<keyof typeof pf1.config.skills>} */
const expandedChoices = [
    'blf',
    'dip',
    'dis',
    'esc',
    'han',
    'int',
    'sen',
    'umd',
];

Hooks.once('ready', () => {
    SpecificBonuses.registerSpecificBonus({ journal, key, type: 'boolean' });
    SpecificBonuses.registerSpecificBonus({ journal, key: keyExpanded, parent: key, type: 'boolean' });
});

class Settings {
    static get versatilePerformance() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

/**
 * @param {ItemPF} item
 * @param {RollData} _rollData
 */
function prepareData(item, _rollData) {
    if (!item?.actor || !item.isActive) return;

    if (item.hasItemBooleanFlag(key)) {
        item.actor[MODULE_NAME][key] ||= [];
        item.actor[MODULE_NAME][key].push(item);
    }
}
LocalHookHandler.registerHandler(localHooks.prepareData, prepareData);

class VPData {
    /**
     * @param {keyof typeof pf1.config.skills} baseId
     * @param {keyof typeof pf1.config.skills} skill1Id
     * @param {keyof typeof pf1.config.skills} skill2Id
     * @param {keyof typeof pf1.config.skills} expandedId
     */
    constructor(baseId, skill1Id, skill2Id, expandedId) {
        this.baseId = baseId;
        this.skill1Id = skill1Id;
        this.skill2Id = skill2Id;
        this.expandedId = expandedId;
    }

    /**
     * @param {keyof typeof pf1.config.skills} skillId
     * @returns {boolean}
     */
    includesOverride(skillId) {
        return [this.skill1Id, this.skill2Id, this.expandedId].includes(skillId);
    }
}

/**
 * @param {ItemPF} item
 * @returns { null | VPData }
 */
const getVPDataFromItem = (item) => {
    if (!item.hasItemBooleanFlag(key)) {
        return null;
    }

    return new VPData(
        item.getFlag(MODULE_NAME, keyBase),
        item.getFlag(MODULE_NAME, keyChoice1),
        item.getFlag(MODULE_NAME, keyChoice2),
        item.getFlag(MODULE_NAME, keyExpanded),
    );
}

/**
 * @param {ActorPF} actor
 * @returns { VPData[] }
 */
const getVPDataFromActor = (actor) => {
    const items = actor[MODULE_NAME]?.[key] ?? [];
    return items.map(getVPDataFromItem).filter(truthiness);
}

const disabledKey = (
    /** @type {string} */ baseId,
    /** @type {string} */ skillId,
) => `vp_disable_${baseId}_${skillId}`;

registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemFeatPF)) return;
    const has = item.hasItemBooleanFlag(key);
    if (!has) return;


    const base = item.getFlag(MODULE_NAME, keyBase);
    const substitutes = [
        item.getFlag(MODULE_NAME, keyChoice1),
        item.getFlag(MODULE_NAME, keyChoice2),
        item.getFlag(MODULE_NAME, keyExpanded),
    ].filter(truthiness);

    const baseName = getSkillName(actor, base);
    const skills = substitutes.map((id) => getSkillName(actor, id)).join(', ');
    const hint = hintcls.create(localize('versatilePerformance.hint', { base: baseName, skills }), [], {});
    const hints = [hint];
    return hints;
});

/**
 *
 * @param {ActorPF} actor
 * @param {string} baseId
 * @param {string} skillId
 * @returns {HTMLElement}
 */
function createVPIcon(actor, baseId, skillId) {
    const baseSkill = actor.getSkillInfo(baseId);

    const disabled = actor.getFlag(MODULE_NAME, disabledKey(baseId, skillId));

    /** @type {HTMLElement} */
    let icon;

    if (!disabled) {
        icon = document.createElement('a');
        icon.classList.add('fas', 'fa-music', 'ckl-skill-icon');
    }
    else {
        icon = document.createElement('a');
        icon.classList.add('ckl-skill-icon-container');

        const music = document.createElement('icon');
        music.classList.add('fas', 'fa-music', 'ckl-skill-icon');
        icon.appendChild(music);
        const slash = document.createElement('icon');
        slash.classList.add('fas', 'fa-slash', 'ckl-skill-icon', 'ckl-skill-icon-slash1');
        icon.appendChild(slash);
        const slash2 = document.createElement('icon');
        slash2.classList.add('fas', 'fa-slash', 'ckl-skill-icon', 'ckl-skill-icon-slash2');
        icon.appendChild(slash2);
    }

    const tip = localize('versatilePerformance.skillTip', { base: baseSkill.name, enabled: localize(disabled ? 'PF1.Disabled' : 'PF1.Enabled') });
    icon.setAttribute('data-tooltip', tip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    icon.addEventListener(
        'click',
        () => actor.setFlag(MODULE_NAME, disabledKey(baseId, skillId), !disabled),
    );
    return icon;
}

Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ { actor }
) => {
    const data = getVPDataFromActor(actor);
    if (!data.length) return;

    html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
        /** @returns {keyof typeof pf1.config.skills} */
        const getSkillId = () => {

            const skillId = /** @type {keyof typeof pf1.config.skills} */ ( /** @type {any} */ li.getAttribute('data-skill'));
            const subId = li.getAttribute('data-sub-skill');
            return subId
                ? /** @type {keyof typeof pf1.config.skills} */ ( /** @type {any} */ `${skillId}.${subId}`)
                : skillId;
        }

        const skillId = getSkillId();
        if (!skillId) return;

        data.forEach((d) => {
            if (!d.includesOverride(skillId)) return;

            const icon = createVPIcon(actor, d.baseId, skillId);
            const name = li.querySelector('.skill-name');
            name?.appendChild(icon);
        });
    });
});

/**
 * @param {SkillInfo} skillInfo
 * @param {ActorPF} actor
 * @param {RollData} rollData
 */
function getSkillInfo(skillInfo, actor, rollData) {
    const data = getVPDataFromActor(actor);
    if (!data.length) return;

    data.forEach((d) => {
        if (!d.includesOverride(skillInfo.id) || !!actor.getFlag(MODULE_NAME, disabledKey(d.baseId, skillInfo.id))) {
            return;
        }

        const baseSkill = actor.getSkillInfo(d.baseId);

        skillInfo.ability = baseSkill.ability;
        skillInfo.acp = baseSkill.acp;
        skillInfo.cs = baseSkill.cs;
        skillInfo.fullName = localize('versatilePerformance.replace-label', { skill: skillInfo.fullName, base: baseSkill.fullName });
        skillInfo.mod = baseSkill.mod;
        skillInfo.rank = baseSkill.rank;
        skillInfo.rt = baseSkill.rt;
    });
}
/**
 * @param {{ skillId: keyof typeof pf1.config.skills , options: object }} seed
 * @param {ActorPF} actor
 * @returns {void}
 */
function versatileRollSkill(seed, actor) {
    const { skillId } = seed;
    const data = getVPDataFromActor(actor);

    // todo v10 change this to use the single journal entry in `getSkillInfo`

    const originalSkillElement = () => {
        const parentId = skillId.split('.')[0];
        const skillInfo = actor.getSkillInfo(skillId);
        const link = skillInfo.journal || actor.getSkillInfo(parentId)?.journal || pf1.config.skillCompendiumEntries[parentId] || '';
        const linkProp = link ? `data-compendium-entry="${link}"` : '';
        const label = localize('PF1.SkillCheck', { skill: skillInfo.name });
        const vpTitle = localize('versatilePerformance.title', { skill: label });
        return `
<span class="flavor-text">
<a data-tooltip="PF1.OpenAssociatedCompendiumEntry" data-action="open-compendium-entry" ${linkProp} data-document-type="JournalEntry">
    <i class="fas fa-book"></i>
</a>
${vpTitle}
</span>
`;
    };

    for (const d of data) {
        if (d.includesOverride(seed.skillId) && !actor.getFlag(MODULE_NAME, disabledKey(d.baseId, seed.skillId))) {
            const baseName = actor.getSkillInfo(d.baseId).name;

            Hooks.once('preCreateChatMessage', (
                /** @type {ChatMessagePF}*/ doc,
                /** @type {object}*/ _data,
                /** @type {object}*/ _options,
                /** @type {string}*/ _userId,
            ) => {
                const { content } = doc;
                if (!baseName || !content.includes(baseName)) {
                    return;
                }
                doc.updateSource({ content: originalSkillElement() + doc.content });
            });
            seed.skillId = d.baseId;
            return;
        }
    }
}
Hooks.once('init', () => {
    LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);
    LocalHookHandler.registerHandler(localHooks.actorRollSkill, versatileRollSkill);
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasFlag = item.hasItemBooleanFlag(key);
    if (!hasFlag) {
        if (name === Settings.versatilePerformance) {
            item.addItemBooleanFlag(key);
            return;
        }
    }

    const currentVP = getVPDataFromItem(item);
    const skillLookup = (/** @type {keyof typeof pf1.config.skills}*/ id) => {
        try {
            return actor?.getSkillInfo(id)
                || pf1.config.skills[id]
                ? { id, name: pf1.config.skills[id] }
                : { id, name: id };
        }
        catch {
            return undefined;
        }
    };

    let /** @type {{ id: string, name: string } | undefined} */ base;
    let /** @type {{ id: string, name: string } | undefined} */ skill1;
    let /** @type {{ id: string, name: string } | undefined} */ skill2;
    if (currentVP) {
        base = skillLookup(currentVP.baseId);
        skill1 = skillLookup(currentVP.skill1Id);
        skill2 = skillLookup(currentVP.skill2Id);
    }

    /** @type {{ id: keyof typeof pf1.config.skills, name: string }[]} */
    let allSkills = [];
    /** @type {{ id: keyof typeof pf1.config.skills, name: string }[]} */
    let performs = [];
    if (isEditable) {
        if (actor) {
            allSkills = actor.allSkills
                .filter((id) => game.settings.get('pf1', 'allowBackgroundSkills') || !pf1.config.backgroundOnlySkills.includes(id))
                .map((id) => ({ id, name: getSkillName(actor, id) }));

            performs = (() => {
                const skills = [];
                const perform = actor.getSkillInfo('prf');
                for (const [subId, subS] of Object.entries(perform.subSkills ?? {})) {
                    const subSkill = deepClone(subS);
                    subSkill.id = `prf.${subId}`;
                    skills.push(subSkill);
                }
                return skills
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(({ id, name }) => ({ id, name }));
            })();
        }
        else {
            allSkills = Object.entries(pf1.config.skills)
                .filter(
                    ([id]) => {
                        const _id = /** @type {keyof typeof pf1.config.skills} */ (/** @type {any} */ id);
                        return game.settings.get('pf1', 'allowBackgroundSkills') || !pf1.config.backgroundOnlySkills.includes(_id);
                    }
                )
                .map(([id, value]) => {
                    const _id = /** @type {keyof typeof pf1.config.skills} */ (/** @type {any} */ id);
                    return { id: _id, name: value }
                });
        }

        if (performs.length && !base) {
            item.setItemDictionaryFlag(key, `${performs[0].id}`);
        }
    }

    const templateData = {
        allSkills,
        base,
        readonly: !isEditable,
        journal,
        label: localize('versatilePerformance.header'),
        performs,
        skill1,
        skill2,
        tooltip: localize('bonuses.tooltip.versatile-performance'),
    };

    const div = createTemplate(templates.versatilePerformance, templateData);

    const updateVP = async () => {
        // @ts-ignore
        const b = document.querySelector('#vp-base-selector')?.value;
        // @ts-ignore
        const s1 = document.querySelector('#vp-skill1-selector')?.value;
        // @ts-ignore
        const s2 = document.querySelector('#vp-skill2-selector')?.value;
        await item.setItemDictionaryFlag(key, `${b};${s1};${s2}`);
    };
    const updateBase = async () => {
        // @ts-ignore
        const value = document.querySelector('#vp-base-selector')?.value;
        await item.setFlag(MODULE_NAME, keyBase, value);
    }
    const updateSkill1 = async () => {
        // @ts-ignore
        const value = document.querySelector('#vp-skill1-selector')?.value;
        await item.setFlag(MODULE_NAME, keyChoice1, value);
    }
    const updateSkill2 = async () => {
        // @ts-ignore
        const value = document.querySelector('#vp-skill2-selector')?.value;
        await item.setFlag(MODULE_NAME, keyChoice2, value);
    }
    div.querySelector('#vp-base-selector')?.addEventListener('change', updateBase);
    div.querySelector('#vp-skill1-selector')?.addEventListener('change', updateSkill1);
    div.querySelector('#vp-skill2-selector')?.addEventListener('change', updateSkill2);

    addNodeToRollBonus(html, div, item, isEditable);

    const hasExpanded = item.hasItemBooleanFlag(keyExpanded);
    if (hasExpanded) {
        const choices = difference(expandedChoices, currentVP ? [currentVP.skill1Id, currentVP.skill2Id] : [])
            .reduce((acc, id) => ({ ...acc, [id]: getSkillName(actor, id) }), {});

        keyValueSelect({
            choices,
            item,
            journal,
            key: keyExpanded,
            parent: html
        }, {
            canEdit: isEditable,
        });
    }
});
