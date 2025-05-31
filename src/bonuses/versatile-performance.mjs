// https://www.d20pfsrd.com/classes/core-classes/bard/#Versatile_Performance_Ex

import { MODULE_NAME } from "../consts.mjs";
import { addNodeToRollBonus } from "../handlebars-handlers/add-bonus-to-item-sheet.mjs";
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { createTemplate, templates } from "../handlebars-handlers/templates.mjs";
import { api } from '../util/api.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { getSkillChoices } from '../util/get-skills.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { isNotEmptyObject } from '../util/is-empty-object.mjs';
import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeBonusTooltip } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { truthiness } from '../util/truthiness.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

{
    /** @type {Array<SkillId>} */
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

export class VersatilePerformance extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'versatile-performance'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-performance'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {{ base: SkillId, choice1: SkillId, choice2: SkillId, expanded: SkillId }[]} versatiles
     * @returns {Promise<void>}
     */
    static async configure(item, versatiles) {
        const boolean = { [this.key]: true }
        if (versatiles.some((x) => !!x.expanded)) {
            boolean[VersatilePerformanceExpanded.key] = true;
        }
        await item.update({
            system: { flags: { boolean } },
            flags: { [MODULE_NAME]: { [this.key]: versatiles } },
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'HAqAsb5H56C6cZm3',
            isItemMatchFunc: (name) => name.includes(Settings.name),
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const currentVPs = getVPsFromItem(item);

                // /** @type { { [key: SkillId]: string }} */
                /** @type {Partial<Record<SkillId, string>>} */
                const allSkills = getSkillChoices(actor, { isEditable, includeAll: false });
                /** @type {Partial<Record<SkillId, string>>} */
                let performs = {};
                if (isEditable) {
                    if (actor) {
                        performs = getPerformanceSkills(actor);
                        if (isNotEmptyObject(performs) && !currentVPs.length) {
                            item.setFlag(MODULE_NAME, this.key, [new VPData({
                                // @ts-ignore
                                base: Object.keys(performs)[0],
                                // @ts-ignore
                                choice1: Object.keys(allSkills)[0],
                                // @ts-ignore
                                choice2: Object.keys(allSkills)[1],
                            })]);
                        }
                    }
                }

                const hasExpanded = !!actor?.hasItemBooleanFlag(VersatilePerformanceExpanded.key);
                const expandedSkills = expandedChoices.reduce((acc, id) => ({ ...acc, [id]: getSkillName(actor, id) }), {});

                const templateData = {
                    allSkills,
                    currentVPs,
                    expandedSkills,
                    hasExpanded,
                    journal: this.journal,
                    label: localize('versatile-performance.header'),
                    performs,
                    readonly: !isEditable,
                    tooltip: this.tooltip,
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
                            foundry.utils.setProperty(currentVPs, path, value);
                            await item.setFlag(MODULE_NAME, this.key, currentVPs);
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
                                await item.setFlag(MODULE_NAME, this.key, currentVPs);
                            }
                            else if (a.classList.contains('delete')) {
                                currentVPs.pop();
                                await item.setFlag(MODULE_NAME, this.key, currentVPs);
                            }
                        });
                    });
                }

                addNodeToRollBonus(html, div, item, isEditable, 'specific-bonus');
            },
        };
    }
}

export class VersatilePerformanceExpanded extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return `versatile-performance-expanded`; }

    /** @inheritdoc @override */
    static get journal() { return VersatilePerformance.journal; }

    /** @inheritdoc @override */
    static get parent() { return VersatilePerformance.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'vfIW1NT2bfnBLElS',
            isItemMatchFunc: (name) => name.includes(Settings.expanded),
            showInputsFunc: (item, html, isEditable) => {
                // don't show if this is configured on the same item as Versatile Performance
                if (VersatilePerformance.has(item)) return;

                showEnabledLabel({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(VersatilePerformance.key); }
    static get expanded() { return LanguageSettings.getTranslation(VersatilePerformanceExpanded.key); }

    static {
        LanguageSettings.registerItemNameTranslation(VersatilePerformance.key);
    }
}

class VPData {
    /**
     * @param {object} arg
     * @param {SkillId} arg.base
     * @param {SkillId} arg.choice1
     * @param {SkillId} arg.choice2
     * @param {SkillId} arg.expanded
     * @param {object} options
     * @param {boolean} [options.hasExpanded]
     */
    constructor({ base, choice1, choice2, expanded }, { hasExpanded = false } = {}) {
        this.base = base;
        this.choice1 = choice1;
        this.choice2 = choice2;
        /** @type {SkillId | ''} */
        this.expanded = hasExpanded ? expanded : '';
    }

    /**
     * @param {SkillId} skillId
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
    if (!VersatilePerformance.has(item)) {
        return [];
    }

    const vps = item.getFlag(MODULE_NAME, VersatilePerformance.key) || [];

    return vps.map(( /** @type {any} */ x) => {
        const data = new VPData(x || {}, { hasExpanded: !!item.actor?.hasItemBooleanFlag(VersatilePerformanceExpanded.key) });
        return data.base ? data : null;
    })
        .filter(truthiness);
}

/**
 * @param {ActorPF} actor
 * @returns { VPData[] }
 */
const getVPDataFromActor = (actor) => {
    const items = getCachedBonuses(actor, VersatilePerformance.key);
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
        const hint = hintcls.create(localize('versatile-performance.hint', { base: baseName, skills }), [], { hint: localizeBonusTooltip(VersatilePerformance.key) });
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
        /** @returns {SkillId} */
        const getSkillId = () => {

            const skillId = /** @type {SkillId} */ ( /** @type {any} */ li.getAttribute('data-skill'));
            const subId = li.getAttribute('data-sub-skill');
            return subId
                ? /** @type {SkillId} */ ( /** @type {any} */ `${skillId}.${subId}`)
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
 * @param {{ skillId: SkillId , options: object }} seed
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
     * @returns {{ [key: SkillId]: string }}
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
