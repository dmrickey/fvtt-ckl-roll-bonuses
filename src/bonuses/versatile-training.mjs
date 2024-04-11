import { MODULE_NAME } from "../consts.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeBonusTooltip } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';
import { api } from '../util/api.mjs';
import { keyValueSelect } from '../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { showChecklist } from '../handlebars-handlers/targeted/targets/checklist-input.mjs';
import { getDocFlags } from '../util/flag-helpers.mjs';

const key = 'versatile-training';
const selectedKey = 'versatile-training-selected';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-training';

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ journal, key, type: 'boolean' }));

class Settings {
    static get versatileTraining() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

(() => {
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
        // @ts-ignore
        'siegeEngines': sort([...allChoices, 'clm', 'pro.subSkills.driver']),
        'spears': sort([...allChoices, 'han', 'rid']),
        'thrown': sort([...allChoices, 'acr', 'per']),
        'tribal': sort([...allChoices, 'clm', 'sur']),
    };
})();

registerItemHint((hintcls, actor, item, _data) => {
    const vts = getDocFlags(actor, selectedKey, { includeInactive: false })
        .flatMap(x => x)
        .filter(truthiness);

    if (!vts.length) {
        return;
    }

    const hints = vts.map((vt) => {
        const skills = vts.map((id) => actor.getSkillInfo(id).name).join(', ');
        const hint = hintcls.create(localize('versatile-training.hint', { skills }), [], {});
        return hint;
    });

    return hints;
});

/**
 * @returns {HTMLElement}
 */
function createVTIcon() {
    const icon = document.createElement('a');
    icon.classList.add('fas', 'fa-swords');
    icon.style.marginInlineStart = 'auto';
    icon.style.width = '1.5rem';
    icon.style.alignSelf = 'center';
    icon.style.textAlign = 'center';

    const tip = localize('versatile-training.skillTip');
    icon.setAttribute('data-tooltip', tip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    return icon;
}

Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ { actor }
) => {
    const vts = getDocFlags(actor, selectedKey, { includeInactive: false })
        .flatMap(x => x)
        .filter(truthiness);

    if (!vts?.length) return;

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
        if (!vts.includes(skillId)) return;

        const icon = createVTIcon();
        const name = li.querySelector('.skill-name');
        name?.appendChild(icon);
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
    const vts = getDocFlags(this, selectedKey, { includeInactive: false })
        .flatMap(x => x)
        .filter(truthiness);

    if (vts.includes(skillId)) {
        Hooks.once('preCreateChatMessage', (
                /** @type {ChatMessagePF}*/ doc,
                /** @type {object}*/ _data,
                /** @type {object}*/ _options,
                /** @type {string}*/ _userId,
        ) => {
            const name = this.getSkillInfo(skillId).name;
            if (!name) {
                return;
            }
            const vtTitle = localize('versatile-training.title', { skill: name });
            // doc.updateSource({ content: doc.content.replace(baseName, `${journalLookup(skillId)} ${updatedTitle}<br />${journalLookup(baseId)} ${vtTitle}`) });
            doc.updateSource({ content: doc.content.replace(name, vtTitle) });
        });
    }

    return wrapped(skillId, options);
}
/**
 * @param {(skillId: string, options?: { rollData?: RollData }) => SkillRollData} wrapped
 * @param {keyof typeof pf1.config.skills} skillId
 * @param {object} [options]
 * @param {RollData} [options.rollData]
 * @this {ActorPF}
 * @return {SkillRollData}
 */
function getSkillInfo(wrapped, skillId, { rollData } = {}) {
    rollData ||= this.getRollData();
    var info = wrapped(skillId, { rollData });
    const vts = getDocFlags(this, selectedKey, { includeInactive: false })
        .flatMap(x => x)
        .filter(truthiness);
    if (vts.includes(skillId)) {
        info.rank = rollData.attributes.bab.total;
        info.cs = true;
    }

    return info;
}
Hooks.once('init', () => {
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.rollSkill', versatileRollSkill, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.getSkillInfo', getSkillInfo, libWrapper.WRAPPER);
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';

    if (!(name === Settings.versatileTraining || item.system.flags.boolean[key] !== undefined)) {
        return;
    }

    let currentVT = /** @type {keyof typeof pf1.config.weaponGroups} */ (item.getFlag(MODULE_NAME, key));

    /** @type {{[key: string]: string}} */
    const skillChoices = {};
    if (isEditable) {
        if (!actor) return;

        if (!currentVT) {
            currentVT =  /** @type {keyof typeof pf1.config.weaponGroups} */ (Object.keys(api.config.versatileTraining.mapping)[0]);
        }

        const actorSkills = actor.getRollData().skills;
        const getName = (/** @type {keyof typeof pf1.config.skills} */ skillId) => {
            const [_id, sub] = skillId.split('.subSkills.');
            const name =
                sub
                    ? getProperty(actorSkills, skillId).name
                    : (pf1.config.skills[skillId] || actorSkills[skillId]?.name);
            return name ||
                // @ts-ignore
                (skillId === 'pro.subSkills.driver'
                    ? 'Profession (driver)'
                    : skillId);
        }
        api.config.versatileTraining.mapping[currentVT].forEach((skillId) => skillChoices[skillId] = getName(skillId));
    }

    keyValueSelect({
        // @ts-ignore
        choices: pf1.config.weaponGroups,
        current: currentVT,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });
    showChecklist({
        item,
        journal,
        key: selectedKey,
        options: skillChoices,
        parent: html,
        tooltip: localizeBonusTooltip(selectedKey),
    }, {
        canEdit: isEditable,
    });
});
