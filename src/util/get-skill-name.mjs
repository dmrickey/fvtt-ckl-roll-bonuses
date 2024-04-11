/**
 * @param {ActorPF} actor
 * @param {keyof typeof pf1.config.skills} id
 */
export const getSkillName = (actor, id) => pf1.config.skills[id] ?? getProperty(actor, `system.skills.${id}.name`);
