import { api } from './api.mjs';
import { truthiness } from './truthiness.mjs';

/** @return {ActorPF[]} */
export const currentTargetedActors = () => {
    return currentTargets()
        .map(x => x.actor)
        .filter(truthiness);
}

/** @return {TokenPF[]} */
export const currentTargets = () => {
    return [...game.user.targets]
        .filter(truthiness);
}

api.utils.currentTargetedActors = currentTargetedActors;
api.utils.currentTargets = currentTargets;
