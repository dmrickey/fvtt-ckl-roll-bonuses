/**
 * @param {(actor: ActorPF) => SkillId[]} getSkillIds
 * @param {(actor: ActorPF, skillId: SkillId) => HTMLElement} getIcon
 * @param {(id: SkillId, listItem: HTMLElement ) => void} [rowCallback]
 */
export const onSkillSheetRender = (getSkillIds, getIcon, rowCallback = undefined) => {
    Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ { actor }
    ) => {
        const selectedSkills = getSkillIds(actor);

        if (!selectedSkills?.length) return;

        html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
            /** @returns {SkillId} */
            const getSkillId = () => {

                const skillId = li.getAttribute('data-skill');
                const subId = li.getAttribute('data-sub-skill');
                return /** @type {SkillId} */ (/** @type {any} */
                    subId
                        ? `${skillId}.${subId}`
                        : skillId
                );
            }

            const skillId = getSkillId();
            if (!skillId) return;
            if (!selectedSkills.includes(skillId)) return;

            const icon = getIcon(actor, skillId);
            const name = li.querySelector('.skill-name');
            name?.appendChild(icon);

            rowCallback?.(skillId, li);
        });
    });
}
