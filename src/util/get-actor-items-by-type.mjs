/**
 * @template {ItemType} T
 * @param {ActorPF | null | undefined} actor
 * @param {...T} types
 * @returns {Extract<Item, { type: T }>[]}
 */
export const getActorItemsByTypes = (actor, ...types) => {
    if (!actor) return [];
    const { itemTypes } = actor;

    // @ts-expect-error
    const typedItems = (types.flatMap((t) => itemTypes[t]));

    const containerItems = itemTypes.container.flatMap((c) => [...c.items])
        // @ts-expect-error
        .filter((ci) => types.includes(ci.type));

    return [...typedItems, ...containerItems];
}
