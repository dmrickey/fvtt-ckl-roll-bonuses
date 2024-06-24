// https://www.d20pfsrd.com/classes/core-classes/bard/#Versatile_Performance_Ex

import { MODULE_NAME } from "../consts.mjs";
import { createTemplate, templates } from "../handlebars-handlers/templates.mjs";
import { addNodeToRollBonus } from "../handlebars-handlers/add-bonus-to-item-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags, getDocFlags } from "../util/flag-helpers.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { difference } from '../util/array-intersects.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { keyValueSelect } from '../handlebars-handlers/bonus-inputs/key-value-select.mjs';

const key = 'versatile-performance';
const expandedKey = 'expanded-versatile-performance';
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
    SpecificBonuses.registerSpecificBonus({ journal, key });
    SpecificBonuses.registerSpecificBonus({ journal, key: expandedKey, parent: key, type: 'boolean' });
});

class Settings {
    static get versatilePerformance() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

const disabledKey = (
    /** @type {string} */ baseId,
    /** @type {string} */ skillId,
) => `vp_disable_${baseId}_${skillId}`;

registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemFeatPF)) return;
    const vps = getDocDFlags(item, key)[0];
    if (!vps) return;

    const expanded = item.getFlag(MODULE_NAME, expandedKey);

    const  /** @type {Hint[]} */ hints = [];

    const [base, ...substitutes] = /** @type {(keyof typeof pf1.config.skills)[]} */
        (/** @type {unknown} */ `${vps}`.split(';').map(x => x.trim()));

    if (expanded) {
        substitutes.push(expanded);
    }

    const baseName = getSkillName(actor, base);
    const skills = substitutes.map((id) => getSkillName(actor, id)).join(', ');
    const hint = hintcls.create(localize('versatilePerformance.hint', { base: baseName, skills }), [], {});
    hints.push(hint);

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
    icon.classList.add('fas', disabled ? 'fa-music-slash' : 'fa-music', 'ckl-skill-icon');

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
    const helper = new KeyedDFlagHelper(actor, { includeInactive: false, }, key);
    const items = helper.itemsForFlag(key);

    if (!items.length) return;

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

        items.forEach((item) => {
            const [vp] = getDocDFlags(item, key, { includeInactive: false });
            const [baseId, ...targetIds] = `${vp}`.split(';');

            const expanded = item.getFlag(MODULE_NAME, expandedKey);
            if (expanded) {
                targetIds.push(expanded);
            }

            if (!targetIds.includes(skillId)) return;

            const icon = createVPIcon(actor, baseId, skillId);
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
    const helper = new KeyedDFlagHelper(actor, { includeInactive: false, }, key);
    const items = helper.itemsForFlag(key);

    if (!items.length) return;

    items.forEach((item) => {
        const [vp] = getDocDFlags(item, key, { includeInactive: false });
        const [baseId, ...targetIds] = `${vp}`.split(';');

        const expanded = item.getFlag(MODULE_NAME, expandedKey);
        if (expanded) {
            targetIds.push(expanded);
        }

        if (!targetIds.includes(skillInfo.id) || !!actor.getFlag(MODULE_NAME, disabledKey(baseId, skillInfo.id))) {
            return skillInfo;
        }

        const baseSkill = actor.getSkillInfo(baseId);

        skillInfo.ability = baseSkill.ability;
        skillInfo.acp = baseSkill.acp;
        skillInfo.cs = baseSkill.cs;
        // skillInfo.fullName = baseSkill.fullName;
        skillInfo.fullName = localize('versatilePerformance.replace-label', { skill: skillInfo.fullName, base: baseSkill.fullName });
        // skillInfo.id = baseSkill.id;
        // skillInfo.journal = baseSkill.journal;
        skillInfo.mod = baseSkill.mod;
        // skillInfo.name = baseSkill.name;
        skillInfo.rank = baseSkill.rank;
        skillInfo.rt = baseSkill.rt;
    });
}
/**
 * @param {{ skillId: string, options: object }} seed
 * @param {ActorPF} actor
 * @returns {void}
 */
function versatileRollSkill(seed, actor) {
    const { skillId } = seed;
    const items = new KeyedDFlagHelper(actor, { includeInactive: false }, key)
        .itemsForFlag(key);

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

    for (const item of items) {
        const [vp] = getDocDFlags(item, key, { includeInactive: false });
        const [baseId, ...substitutes] = `${vp}`.split(';').map(x => x.trim());

        const expanded = item.getFlag(MODULE_NAME, expandedKey);
        if (expanded) {
            substitutes.push(expanded);
        }

        if (substitutes.includes(seed.skillId) && !actor.getFlag(MODULE_NAME, disabledKey(baseId, seed.skillId))) {
            const baseName = actor.getSkillInfo(baseId).name;

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
            seed.skillId = baseId;
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
    const hasFlag = item.system.flags.dictionary?.hasOwnProperty(key);

    if (!(name === Settings.versatilePerformance || hasFlag)) {
        return;
    }

    const currentVP = item.system.flags.dictionary[key];

    const [baseId, ...substitutes] = /** @type {(keyof typeof pf1.config.skills)[]}*/(`${currentVP}`.split(';'));
    /** @type {(keyof typeof pf1.config.skills)[]}*/
    const [skill1Id, skill2Id] = substitutes;
    const skillLookup = (/** @type {keyof typeof pf1.config.skills}*/ id) => {
        try {
            return actor?.getSkillInfo(id) || pf1.config.skills[id] || { id, name: id };
        }
        catch {
            return null;
        }
    };

    let base, skill1, skill2;
    if (baseId) {
        base = skillLookup(baseId);
    }
    if (skill1Id) {
        skill1 = skillLookup(skill1Id);
    }
    if (skill2Id) {
        skill2 = skillLookup(skill2Id);
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
    const baseSelect = div.querySelector('#vp-base-selector');
    const skill1Select = div.querySelector('#vp-skill1-selector');
    const skill2Select = div.querySelector('#vp-skill2-selector');
    baseSelect?.addEventListener('change', updateVP);
    skill1Select?.addEventListener('change', updateVP);
    skill2Select?.addEventListener('change', updateVP);

    addNodeToRollBonus(html, div, item, isEditable);

    const hasExpanded = item.system.flags.boolean[expandedKey];
    if (hasExpanded) {
        const choices = difference(expandedChoices, [skill1Id, skill2Id])
            .reduce((acc, id) => ({ ...acc, [id]: getSkillName(actor, id) }), {});

        keyValueSelect({
            choices,
            item,
            journal,
            key: expandedKey,
            parent: html
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
    }
});
