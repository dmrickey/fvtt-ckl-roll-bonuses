import { api } from './api.mjs';
import { getFlaggedSkillIdsBySourceFromActor } from './get-skills.mjs';

/**
 * @param {object} args
 * @param {(actor: ActorPF, flag: string, skillKey?: string) => { source: ItemPF, ids: string[]}[]} [args.getSkillIds]
 * @param {string} args.key
 * @param {string} [args.skillKey]
 * @param {(id: SkillId, listItem: HTMLElement ) => void} [args.rowCallback]
 * @param {object} [tooltip]
 * @param {(actor: ActorPF, skillId: SkillId, source: ItemPF) => string} tooltip.getText
 * @param {(actor: ActorPF, skillId: SkillId, source: ItemPF) => string[]} tooltip.classes
 * @param {(actor: ActorPF, skillId: SkillId, source: ItemPF) => void} [tooltip.onClick]
 */
export const onSkillSheetRender = ({
    key,
    getSkillIds = getFlaggedSkillIdsBySourceFromActor,
    skillKey = undefined,
    rowCallback = undefined
}, tooltip) => {
    Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ _app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ { actor }
    ) => {
        const sourceItems = getSkillIds(actor, key, skillKey);

        if (!sourceItems?.length) return;

        html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
            const getSkillId = () => {
                const skillId = li.getAttribute('data-skill');
                const subId = li.getAttribute('data-sub-skill');
                return /** @type {SkillId} */ (
                    subId
                        ? `${skillId}.${subId}`
                        : skillId
                );
            }

            const skillId = getSkillId();
            if (!skillId) return;
            const source = sourceItems.find((source) => source.ids.includes(skillId))?.source;
            if (!source) return;

            if (tooltip) {
                const icon = createSkillIcon(
                    tooltip.getText(actor, skillId, source),
                    tooltip.classes(actor, skillId, source),
                    source,
                );

                if (tooltip.onClick) {
                    icon.addEventListener(
                        'click',
                        () => tooltip.onClick?.(actor, skillId, source),
                    );
                }

                const name = li.querySelector('.skill-name');
                name?.appendChild(icon);
            }

            rowCallback?.(skillId, li);
        });
    });
}

/**
 * @param {string} toolTip
 * @param {string[]} classes
 * @param {ItemPF} source
 * @returns {HTMLElement}
 */
const createSkillIcon = (toolTip, classes, source) => {
    const icon = document.createElement('a');
    icon.classList.add(...classes);

    icon.setAttribute('data-tooltip', toolTip);
    icon.setAttribute('data-tooltip-direction', 'UP');
    icon.addEventListener('contextmenu', () => source.sheet.render(true));

    return icon;
}

api.utils.onSkillSheetRender = onSkillSheetRender;
