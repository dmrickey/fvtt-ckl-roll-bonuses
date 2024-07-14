import { api } from './api.mjs';
import { truthiness } from './truthiness.mjs';

/** @return {ActorPF[]} */
export const currentTargetedActors = () => {
    return [...game.user.targets]
        .map(x => x.actor)
        .filter(truthiness);
}

api.utils.currentTargetedActors = currentTargetedActors;
