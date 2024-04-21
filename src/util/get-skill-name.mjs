/**
 * @param {Nullable<ActorPF>} actor
 * @param {keyof typeof pf1.config.skills} id
 * @returns {string}
 */
export const getSkillName = (actor, id) => pf1.config.skills[id] ?? (actor ? getProperty(actor, `system.skills.${id}.name`) : id);
