// https://www.d20pfsrd.com/classes/core-classes/bard/#Versatile_Performance_Ex

import { MODULE_NAME } from "../consts.mjs";
import { createTemplate, templates } from "../handlebars-handlers/templates.mjs";
import { addNodeToRollBonus } from "../handlebars-handlers/add-bonus-to-item-sheet.mjs";
import { getDocDFlags } from "../util/flag-helpers.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { registerSetting } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'versatile-performance';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-performance';

registerSetting({ key });

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ journal, key }));

class Settings {
    static get versatilePerformance() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

const disabledKey = (
    /** @type {string} */ baseId,
    /** @type {string} */ skillId,
) => `vp_disable_${baseId}_${skillId}`;

registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemFeatPF)) return;
    const vps = getDocDFlags(item, key);

    const  /** @type {Hint[]} */ hints = [];

    try {
        for (let i = 0; i < vps.length; i++) {
            const [base, ...substitutes] = `${vps[i]}`.split(';').map(x => x.trim());
            const baseName = actor.getSkillInfo(base).name;
            const skills = substitutes.map((id) => actor.getSkillInfo(id).name).join(', ');
            const hint = hintcls.create(localize('versatilePerformance.hint', { base: baseName, skills }), [], {});
            hints.push(hint);
        }
    } catch {
        return hintcls.create(localize('versatilePerformance.error'), [], {});
    }

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

    const icon = document.createElement('a');
    icon.classList.add('fas', disabled ? 'fa-music-slash' : 'fa-music');
    icon.style.marginInlineStart = 'auto';
    icon.style.width = '1.5rem';
    icon.style.alignSelf = 'center';
    icon.style.textAlign = 'center';

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
    const vps = getDocDFlags(actor, key, { includeInactive: false });

    if (!vps?.length) return;

    html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
        const getSkillId = () => {
            const skillId = li.getAttribute('data-skill');
            const mainId = li.getAttribute('data-main-skill');
            return mainId
                ? `${mainId}.subSkills.${skillId}`
                : skillId;
        }

        const skillId = getSkillId();
        if (!skillId) return;

        vps.forEach((vp) => {
            const [baseId, ...targetIds] = `${vp}`.split(';');
            if (!targetIds.includes(skillId)) return;

            const icon = createVPIcon(actor, baseId, skillId);
            const name = li.querySelector('.skill-name');
            name?.appendChild(icon);
        });
    });
});

/**
 * @param {(skillId: string, options: object) => any} wrapped
 * @param {string} skillId
 * @param {Object} options
 * @this {ActorPF}
 * @returns {ChatMessagePF|object|void} The chat message if one was created, or its data if not. `void` if the roll was cancelled.
 */
function versatileRollSkill(wrapped, skillId, options) {
    const vps = getDocDFlags(this, key, { includeInactive: false });

    const journalLookup = (/** @type {string} */ skl) => {
        const link = this.getSkillInfo(skl.split('.subSkills')[0])?.journal || pf1.config.skillCompendiumEntries[skl.split('.subSkills')[0]] || '';
        if (link) {
            return `
<a data-tooltip="PF1.OpenAssociatedCompendiumEntry" data-action="open-compendium-entry" data-compendium-entry="${link}" data-document-type="JournalEntry">
    <i class="fas fa-book"></i>
</a>
`;
        }
        return '';
    };

    for (let i = 0; i < vps.length; i++) {
        const [baseId, ...substitutes] = `${vps[i]}`.split(';').map(x => x.trim());

        if (substitutes.includes(skillId) && !this.getFlag(MODULE_NAME, disabledKey(baseId, skillId))) {
            const baseName = this.getSkillInfo(baseId).name;

            Hooks.once('preCreateChatMessage', (
                /** @type {ChatMessagePF}*/ doc,
                /** @type {object}*/ _data,
                /** @type {object}*/ _options,
                /** @type {string}*/ _userId,
            ) => {
                const { content } = doc;
                const currentTitle = this.getSkillInfo(skillId).name;
                if (!currentTitle || !baseName || !content.includes(baseName)) {
                    return;
                }
                const updatedTitle = localize('PF1.SkillCheck', { skill: currentTitle });
                const vpTitle = localize('versatilePerformance.title', { skill: baseName });
                doc.updateSource({ content: doc.content.replace(baseName, `${journalLookup(skillId)} ${updatedTitle}<br />${journalLookup(baseId)} ${vpTitle}`) });
            });
            return wrapped(baseId, options);
        }
    }

    return wrapped(skillId, options);
}
Hooks.once('init', () => {
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.rollSkill', versatileRollSkill, libWrapper.WRAPPER);
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    if (!actor) return;

    const currentVP = item.system.flags.dictionary[key];
    if (!currentVP && currentVP !== '') {
        if (name === Settings.versatilePerformance) {
            item.setItemDictionaryFlag(key, '');
        }
        else {
            return;
        }
    }
    const [baseId, ...substitutes] = `${currentVP}`.split(';');
    const [skill1Id, skill2Id] = substitutes;
    let base, skill1, skill2;
    if (baseId) {
        base = actor.getSkillInfo(baseId);
    }
    if (skill1Id) {
        skill1 = actor.getSkillInfo(skill1Id);
    }
    if (skill2Id) {
        skill2 = actor.getSkillInfo(skill2Id);
    }

    const allSkills = (() => {
        const skills = [];
        for (const [id, s] of Object.entries(actor.getRollData().skills)) {
            const skill = deepClone(s);
            skill.id = id;
            skills.push(skill);
            skill.name = pf1.config.skills[id] ?? actor.system.skills[id].name;

            for (const [subId, subS] of Object.entries(s.subSkills ?? {})) {
                const subSkill = deepClone(subS);
                subSkill.id = `${id}.subSkills.${subId}`;
                skills.push(subSkill);
            }
        }
        return skills
            .filter(truthiness)
            .sort((a, b) => a.name.localeCompare(b.name));
    })();

    const performs = (() => {
        const skills = [];
        const perform = actor.getSkillInfo('prf');
        for (const [subId, subS] of Object.entries(perform.subSkills ?? {})) {
            const subSkill = deepClone(subS);
            subSkill.id = `prf.subSkills.${subId}`;
            skills.push(subSkill);
        }
        return skills
            .sort((a, b) => a.name.localeCompare(b.name));
    })();
    if (!performs.length) return;

    if (performs.length && !base) {
        item.setItemDictionaryFlag(key, `${performs[0].id}`);
    }

    const templateData = {
        allSkills,
        base,
        journal,
        label: localize('versatilePerformance.header'),
        performs,
        skill1,
        skill2,
        tooltip: localize('versatilePerformance.tooltip'),
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
    const baseSelect = div.querySelector('#vp-base-selector');
    const skill1Select = div.querySelector('#vp-skill1-selector');
    const skill2Select = div.querySelector('#vp-skill2-selector');
    baseSelect?.addEventListener('change', updateVP);
    skill1Select?.addEventListener('change', updateVP);
    skill2Select?.addEventListener('change', updateVP);

    addNodeToRollBonus(html, div, item);
});
