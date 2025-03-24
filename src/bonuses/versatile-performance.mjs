// https://www.d20pfsrd.com/classes/core-classes/bard/#Versatile_Performance_Ex

import { MODULE_NAME } from "../consts.mjs";
import { createTemplate, templates } from "../handlebars-handlers/templates.mjs";
import { addNodeToRollBonus } from "../handlebars-handlers/add-bonus-to-item-sheet.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeBonusTooltip } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { truthiness } from '../util/truthiness.mjs';
import { api } from '../util/api.mjs';
import { isNotEmptyObject } from '../util/is-empty-object.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { itemHasCompendiumId } from '../util/has-compendium-id.mjs';

const key = 'versatile-performance';
export { key as versatilePerformanceKey };
const expandedKey = `${key}-expanded`;

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-performance';

const compendiumIds = ['HAqAsb5H56C6cZm3', 'EuQ3UFsJX9njW3pm', 'KQeYLQvYh1QgS0XI'];

{
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
    api.config.versatilePerformance.expandedChoices = expandedChoices;
}
const expandedChoices = api.config.versatilePerformance.expandedChoices;

SpecificBonuses.registerSpecificBonus({ journal, key });
SpecificBonuses.registerSpecificBonus({ journal, key: expandedKey, parent: key });

class Settings {
    static get versatilePerformance() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

class VPData {
    /**
     * @param {object} arg
     * @param {keyof typeof pf1.config.skills} arg.base
     * @param {keyof typeof pf1.config.skills} arg.choice1
     * @param {keyof typeof pf1.config.skills} arg.choice2
     * @param {keyof typeof pf1.config.skills} arg.expanded
     * @param {object} options
     * @param {boolean} [options.hasExpanded]
     */
    constructor({ base, choice1, choice2, expanded }, { hasExpanded = false } = {}) {
        this.base = base;
        this.choice1 = choice1;
        this.choice2 = choice2;
        /** @type {keyof typeof pf1.config.skills | ''} */
        this.expanded = hasExpanded ? expanded : '';
    }

    /**
     * @param {keyof typeof pf1.config.skills} skillId
     * @returns {boolean}
     */
    includesOverride(skillId) {
        return [this.choice1, this.choice2, this.expanded].includes(skillId);
    }
}

/**
 * @param {ItemPF} item
 * @returns { VPData[] }
 */
const getVPsFromItem = (item) => {
    if (!item.hasItemBooleanFlag(key)) {
        return [];
    }

    const vps = item.getFlag(MODULE_NAME, key) || [];

    return vps.map(( /** @type {any} */ x) => {
        const data = new VPData(x || {}, { hasExpanded: item.hasItemBooleanFlag(expandedKey) });
        return data.base ? data : null;
    })
        .filter(truthiness);
}

/**
 * @param {ActorPF} actor
 * @returns { VPData[] }
 */
const getVPDataFromActor = (actor) => {
    const items = getCachedBonuses(actor, key);
    return items.flatMap(getVPsFromItem).filter(truthiness);
}

const disabledKey = (
    /** @type {string} */ baseId,
    /** @type {string} */ skillId,
) => `vp_disable_${baseId}_${skillId}`;

registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemFeatPF)) return;

    const vps = getVPsFromItem(item);
    if (!vps.length) return;

    const hints = vps.map((data) => {
        const substitutes = [data.choice1, data.choice2, data.expanded]
            .filter(truthiness);

        const baseName = getSkillName(actor, data.base);
        const skills = substitutes.map((id) => getSkillName(actor, id)).join(', ');
        const hint = hintcls.create(localize('versatile-performance.hint', { base: baseName, skills }), [], { hint: localizeBonusTooltip(key) });
        return hint;
    });
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

    const tip = localize('versatile-performance.skill-tip', { base: baseSkill.name, enabled: localize(disabled ? 'PF1.Disabled' : 'PF1.Enabled') });
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

            const icon = createVPIcon(actor, d.base, skillId);
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
        if (!d.includesOverride(skillInfo.id) || !!actor.getFlag(MODULE_NAME, disabledKey(d.base, skillInfo.id))) {
            return;
        }

        const baseSkill = actor.getSkillInfo(d.base);

        skillInfo.ability = baseSkill.ability;
        skillInfo.acp = baseSkill.acp;
        skillInfo.cs = baseSkill.cs;
        skillInfo.fullName = localize('versatile-performance.replace-label', { skill: skillInfo.fullName, base: baseSkill.fullName });
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

    const originalSkillElement = () => {
        const skillInfo = actor.getSkillInfo(skillId);
        const journal = skillInfo.journal;
        const linkProp = journal
            ? `<a data-tooltip="PF1.OpenAssociatedCompendiumEntry" data-action="open-compendium-entry" data-compendium-entry="${journal}" data-document-type="JournalEntry"><i class="fas fa-book"></i></a>`
            : '';
        const label = localize('PF1.Check', { type: skillInfo.name });
        const vpTitle = localize('versatile-performance.title', { skill: label });
        return `
<span class="flavor-text">
${linkProp}
${vpTitle}
</span>
`;
    };

    for (const d of data) {
        if (d.includesOverride(seed.skillId) && !actor.getFlag(MODULE_NAME, disabledKey(d.base, seed.skillId))) {
            const baseName = actor.getSkillInfo(d.base).name;

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
            seed.skillId = d.base;
            return;
        }
    }
}
Hooks.once('init', () => {
    LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);
    LocalHookHandler.registerHandler(localHooks.actorRollSkill, versatileRollSkill);
});

{
    /**
     * @param {ActorPF} actor
     * @returns {{ [key: keyof typeof pf1.config.skills]: string }}
     */
    const getPerformanceSkills = (actor) => {
        const skills = [];
        const perform = actor.getSkillInfo('prf');
        for (const [subId, subS] of Object.entries(perform.subSkills ?? {})) {
            const subSkill = foundry.utils.deepClone(subS);
            subSkill.id = `prf.${subId}`;
            skills.push(subSkill);
        }
        return skills
            .sort((a, b) => a.name.localeCompare(b.name))
            .reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {});
    }
    api.config.versatilePerformance.getPerformanceSkills = getPerformanceSkills;
}
const getPerformanceSkills = api.config.versatilePerformance.getPerformanceSkills;

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasFlag = item.hasItemBooleanFlag(key);
    if (!hasFlag) {
        if (isEditable && (name === Settings.versatilePerformance || compendiumIds.some(x => itemHasCompendiumId(item, x)))) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    const currentVPs = getVPsFromItem(item);

    // /** @type { { [key: keyof typeof pf1.config.skills]: string }} */
    /** @type {Partial<Record<keyof typeof pf1.config.skills, string>>} */
    let allSkills = {};
    /** @type {Partial<Record<keyof typeof pf1.config.skills, string>>} */
    let performs = {};
    if (isEditable) {
        if (actor) {
            allSkills = actor.allSkills
                .filter((id) => game.settings.get('pf1', 'allowBackgroundSkills') || !pf1.config.backgroundOnlySkills.includes(id))
                .map((id) => ({ id, name: getSkillName(actor, id) }))
                .reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {});

            performs = getPerformanceSkills(actor);
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
                })
                .reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {});
        }

        if (isEditable && isNotEmptyObject(performs) && !currentVPs.length) {
            item.setFlag(MODULE_NAME, key, [new VPData({
                // @ts-ignore
                base: Object.keys(performs)[0],
                // @ts-ignore
                choice1: Object.keys(allSkills)[0],
                // @ts-ignore
                choice2: Object.keys(allSkills)[1],
            })]);
        }
    }

    const hasExpanded = item.hasItemBooleanFlag(expandedKey);
    const expandedSkills = expandedChoices.reduce((acc, id) => ({ ...acc, [id]: getSkillName(actor, id) }), {});

    const templateData = {
        allSkills,
        currentVPs,
        expandedSkills,
        hasExpanded,
        journal,
        label: localize('versatile-performance.header'),
        performs,
        readonly: !isEditable,
        tooltip: localizeBonusTooltip(key),
    };

    const div = createTemplate(templates.versatilePerformance, templateData);

    if (isEditable) {
        div.querySelectorAll('select').forEach((element) => {
            element.addEventListener('change', async (event) => {
                // @ts-ignore - event.target is HTMLSelectElement
                const /** @type {HTMLSelectElement} */ target = event.target;
                const value = target?.value;
                const path = target.dataset.path;
                if (!path) return;
                setProperty(currentVPs, path, value);
                await item.setFlag(MODULE_NAME, key, currentVPs);
            });
        });

        div.querySelectorAll('.vp-actions a').forEach((element) => {
            element.addEventListener('click', async (event) => {
                event?.preventDefault();
                /** @type {HTMLElement } */
                // @ts-ignore
                const a = event.currentTarget;
                if (!a) return;

                if (a.classList.contains('add')) {
                    currentVPs.push(new VPData({
                        // @ts-ignore
                        base: Object.keys(performs)[0],
                        // @ts-ignore
                        choice1: Object.keys(allSkills)[0],
                        // @ts-ignore
                        choice2: Object.keys(allSkills)[1],
                    }));
                    await item.setFlag(MODULE_NAME, key, currentVPs);
                }
                else if (a.classList.contains('delete')) {
                    currentVPs.pop();
                    await item.setFlag(MODULE_NAME, key, currentVPs);
                }
            });
        });
    }

    addNodeToRollBonus(html, div, item, isEditable, 'specific-bonus');
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
    const hasBonus = item.hasItemBooleanFlag(key);

    if ((name === Settings.versatilePerformance || compendiumIds.some(x => itemHasCompendiumId(item, x))) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${key}`]: true,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
