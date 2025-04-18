/**
 * @param {Nullable<ActorPF>} actor
 * @param {SkillId} id
 * @param {'name' | 'fullName'} [nameProp]
 * @returns {string}
 */
export const getSkillName = (actor, id, nameProp = 'name') => pf1.config.skills[id] ?? actor?.getSkillInfo(id)[nameProp] ?? id;
