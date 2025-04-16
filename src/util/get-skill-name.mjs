/**
 * @param {Nullable<ActorPF>} actor
 * @param {SkillId} id
 * @returns {string}
 */
export const getSkillName = (actor, id) => pf1.config.skills[id] ?? actor?.getSkillInfo(id).name ?? id;
