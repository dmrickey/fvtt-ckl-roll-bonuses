
import { MODULE_NAME } from '../consts.mjs';
import { keyValueSelect } from '../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { showLabel } from '../handlebars-handlers/bonus-inputs/show-label.mjs';
import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { getSkillName } from '../util/get-skill-name.mjs';
import { getSkillChoices } from '../util/get-skills.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localize } from '../util/localize.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

export class VersatileSkill extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'versatile-skill'; }
    static get selectedKey() { return `${this.key}-selected`; }
    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#versatile-skill'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {SkillId} base
     * @param {SkillId[]} targets
     */
    static async configure(item, base, targets) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: base, [this.selectedKey]: targets } },
        });
    }

    /** @inheritdoc @override @returns {JustRender} */
    static get configuration() {
        return {
            type: 'just-render',
            showInputsFunc: (item, html, isEditable) => {
                const choices = getSkillChoices(item.actor, { includeAll: false, isEditable: true });
                const base = /** @type {SkillId | undefined} */ (item.getFlag(MODULE_NAME, this.key));

                showLabel({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    inputType: 'specific-bonus',
                });

                keyValueSelect({
                    choices,
                    current: isEditable ? base : /** @type {any} */ ({ label: base ? (choices[base] ?? base) : '' }),
                    item,
                    journal: this.journal,
                    key: this.key,
                    label: localize('versatile-skill.source'),
                    parent: html,
                    tooltip: this.tooltip,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                    isSubLabel: true,
                });

                traitInput({
                    choices,
                    description: localize('versatile-skill.description'),
                    hasCustom: false,
                    item,
                    journal: this.journal,
                    key: this.selectedKey,
                    label: localize('versatile-skill.targets'),
                    parent: html,
                    tooltip: this.tooltip,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                    isSubLabel: true,
                });
            },
        };
    }
}

/** @typedef {{base: SkillId, targets: SkillId[]}} VersatileSkillData */

/** @param {ItemPF} item @returns {VersatileSkillData | undefined} */
const getDataFromItem = (item) => {
    if (!VersatileSkill.has(item)) return;

    const base = /** @type {SkillId | undefined} */ (item.getFlag(MODULE_NAME, VersatileSkill.key));
    const targets = /** @type {SkillId[]} */ (item.getFlag(MODULE_NAME, VersatileSkill.selectedKey) ?? []);
    if (!base || !Array.isArray(targets) || !targets.length) return;

    return { base, targets };
};

/** @param {ActorPF} actor @returns {VersatileSkillData[]} */
const getDataFromActor = (actor) => getCachedBonuses(actor, VersatileSkill.key)
    .map(getDataFromItem)
    .filter((x) => !!x);

/** @param {SkillId} base @param {SkillId} target */
const disabledKey = (base, target) => `vs_disable_${base}_${target}`;

/** @param {ActorPF} actor @param {SkillId} target */
const getActiveMapping = (actor, target) => getDataFromActor(actor).find(({ base, targets }) =>
    base !== target && targets.includes(target) && !actor.getFlag(MODULE_NAME, disabledKey(base, target))
);

registerItemHint((hintcls, actor, item) => {
    const data = getDataFromItem(item);
    if (!data) return;

    const base = getSkillName(actor, data.base);
    const skills = data.targets.map((id) => getSkillName(actor, id)).join(', ');
    return hintcls.create(localize('versatile-skill.hint', { base, skills }), [], { hint: VersatileSkill.tooltip });
});

/** @param {ActorPF} actor @param {SkillId} base @param {SkillId} target */
function createSkillIcon(actor, base, target) {
    const disabled = !!actor.getFlag(MODULE_NAME, disabledKey(base, target));
    const icon = document.createElement('a');

    if (disabled) {
        icon.classList.add('ckl-skill-icon-container');

        const classes = [
            ['fas', 'fa-right-left', 'ckl-skill-icon'],
            ['fas', 'fa-slash', 'ckl-skill-icon', 'ckl-skill-icon-slash1'],
            ['fas', 'fa-slash', 'ckl-skill-icon', 'ckl-skill-icon-slash2'],
        ];

        for (const classNames of classes) {
            const elem = document.createElement('i');
            elem.classList.add(...classNames);
            icon.appendChild(elem);
        }
    } else {
        icon.classList.add('fas', 'fa-right-left', 'ckl-skill-icon');
    }

    icon.setAttribute('data-tooltip', localize('versatile-skill.skill-tip', {
        base: getSkillName(actor, base),
        enabled: localize(disabled ? 'PF1.Disabled' : 'PF1.Enabled'),
    }));
    icon.setAttribute('data-tooltip-direction', 'UP');
    icon.addEventListener('click', () => actor.setFlag(MODULE_NAME, disabledKey(base, target), !disabled));
    return icon;
}

Hooks.on('renderActorSheetPF', (
    /** @type {unknown} */ _app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{actor: ActorPF}} */ { actor },
) => {
    const mappings = getDataFromActor(actor);
    if (!mappings.length) return;

    html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
        const id = li.getAttribute('data-skill');
        const subId = li.getAttribute('data-sub-skill');
        if (!id) return;

        const skillId = /** @type {SkillId} */ (subId ? `${id}.${subId}` : id);
        for (const { base, targets } of mappings) {
            if (base === skillId || !targets.includes(skillId)) continue;
            li.querySelector('.skill-name')?.appendChild(createSkillIcon(actor, base, skillId));
        }
    });
});

/** @type {WeakMap<ActorPF, Set<SkillId>>} */
const resolving = new WeakMap();

/** @param {SkillInfo} skillInfo @param {ActorPF} actor @param {RollData} _rollData */
function getSkillInfo(skillInfo, actor, _rollData) {
    const mapping = getActiveMapping(actor, skillInfo.id);
    if (!mapping) return;

    let inProgress = resolving.get(actor);
    if (!inProgress) {
        inProgress = new Set();
        resolving.set(actor, inProgress);
    }
    if (inProgress.has(skillInfo.id) || inProgress.has(mapping.base)) return;

    inProgress.add(skillInfo.id);
    try {
        const baseSkill = actor.getSkillInfo(mapping.base);
        skillInfo.ability = baseSkill.ability;
        skillInfo.acp = baseSkill.acp;
        skillInfo.cs = baseSkill.cs;
        skillInfo.fullName = localize('versatile-skill.replace-label', {
            skill: skillInfo.fullName,
            base: baseSkill.fullName,
        });
        skillInfo.mod = baseSkill.mod;
        skillInfo.rank = baseSkill.rank;
        skillInfo.rt = baseSkill.rt;
    } finally {
        inProgress.delete(skillInfo.id);
    }
}

/** @param {{skillId: SkillId, options: object}} seed @param {ActorPF} actor */
function versatileRollSkill(seed, actor) {
    const { skillId } = seed;
    const mapping = getActiveMapping(actor, skillId);
    if (!mapping) return;

    const baseName = actor.getSkillInfo(mapping.base).name;
    Hooks.once('preCreateChatMessage', (/** @type {ChatMessagePF} */ doc) => {
        if (!baseName || !doc.content.includes(baseName)) return;

        const skillInfo = actor.getSkillInfo(skillId);
        const link = skillInfo.journal
            ? `<a data-tooltip="PF1.OpenAssociatedCompendiumEntry" data-action="open-compendium-entry" data-compendium-entry="${skillInfo.journal}" data-document-type="JournalEntry"><i class="fas fa-book"></i></a>`
            : '';
        const title = localize('versatile-skill.title', {
            skill: localize('PF1.Check', { type: skillInfo.name }),
        });
        doc.updateSource({ content: `<span class="flavor-text">${link}${title}</span>${doc.content}` });
    });
    seed.skillId = mapping.base;
}

Hooks.once('init', () => {
    LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);
    LocalHookHandler.registerHandler(localHooks.actorRollSkill, versatileRollSkill);
});
