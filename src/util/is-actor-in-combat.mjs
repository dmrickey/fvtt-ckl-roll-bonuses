import { api } from './api.mjs';

/**
 * @param {ActorPF} actor
 * @returns {boolean}
 */
export const isActorInCombat = ({ id }) =>
    !!game.combats.active?.round && !!game.combats.active?.combatants.some(x => x.actorId === id);

api.utils.isActorInCombat = isActorInCombat;
