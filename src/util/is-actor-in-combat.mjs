/**
 * @param {ActorPF} actor
 * @returns
 */
export const isActorInCombat = ({ id }) =>
    !!game.combats.active?.round && !!game.combats.active?.combatants.some(x => x.actorId === id);
