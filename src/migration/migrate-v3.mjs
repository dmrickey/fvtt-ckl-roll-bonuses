import { log } from './migration-log.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { truthiness } from '../util/truthiness.mjs';
import { isNotEmptyObject } from '../util/is-empty-object.mjs';

const legacyActionFlags = [
    'target_is-melee',
    'target_is-natural',
    'target_is-natural-secondary',
    'target_is-ranged',
    'target_is-spell',
    'target_is-thrown',
    'target_is-weapon',
];

const booleanFlagMigrations = [
    ['finesse-override', 'target-override_finesse-override'],
];

/**
 * Whether or not the document has any of the given boolean flags
 *
 * @param {Nullable<ItemPF>} doc
 * @returns {string[]} Retruns the b.flags on the item
 */
const getCurrentLegacyActionFlags = (
    doc,
) => {
    if (!doc) return [];
    return legacyActionFlags.filter((flag) => doc.hasItemBooleanFlag(flag));
}

const newActionTypeTargetKey = 'target_action-type';
const newActionTypeTargetRadioKey = 'target_action-type-radio';
const newActionTypeTargetTypesKey = 'target_action-type-types';

/**
 * @param {ItemPF} item
 * @returns {RecursivePartial<ItemPF> | undefined}
 */
const getItemUpdateData = (item) => {

    /** @type {Record<string, boolean>} */
    const boolean = {};
    /** @type {Record<string, any>} */
    const moduleFlags = {};

    booleanFlagMigrations.forEach(([legacy, updated]) => {
        if (item.hasItemBooleanFlag(legacy)) {
            boolean[legacy] = false;
            boolean[updated] = true;
        }
    });

    const current = getCurrentLegacyActionFlags(item);

    if (current.length) {
        current.forEach((flag) => boolean[`-=${flag}`] = false);
        boolean[newActionTypeTargetKey] = true;

        const isAll = item.getFlag(MODULE_NAME, 'target-toggle') === 'all';

        const newProps = current.map(x => x.split('_')[1]);
        moduleFlags[newActionTypeTargetTypesKey] = newProps;
        moduleFlags[newActionTypeTargetRadioKey] = isAll ? 'all' : 'any';
    }

    if (isNotEmptyObject(moduleFlags)
        || isNotEmptyObject(boolean)
    ) {
        /** @type {RecursivePartial<ItemPF>} */
        const update = {
            _id: item.id,
            system: {
                flags: {
                    boolean,
                }
            },
            flags: {
                [MODULE_NAME]: moduleFlags,
            },
        };
        return update;
    }
};

/** @param {ItemPF} item */
export const migrateItem = async (item) => {
    const data = getItemUpdateData(item);
    if (data) {
        await item.update(data);
    }
};

/** @param {ActorPF} actor */
export const migrateActor = async (actor) => {
    log(`migrating items for actor '${actor?.name}'`);
    if (actor?.items?.size) {
        const updates = actor.items.map(getItemUpdateData)
            .filter(truthiness);
        if (updates.length) {
            await actor.updateEmbeddedDocuments("Item", updates);
        }
    }
    log('...finished migrating actor');
};

export const migrateWorldItems = async () => {
    log('migrating game items');

    for (const item of game.items ?? []) {
        await migrateItem(item);
    }

    log('...finished migrating game items');
};

export const migratePacks = async () => {
    log('migrating unlocked packs');

    for (const pack of game.packs.filter(x => x.documentName === "Item" && !x.locked)) {
        await pack.updateAll((item) => getItemUpdateData(item) || {});
    }

    for (const pack of game.packs.filter(x => x.documentName === "Actor" && !x.locked)) {
        const actors = (/** @type {EmbeddedCollection<ActorPF>} */ /** @type {any} */ (await pack.getDocuments()));
        for (const actor of actors) {
            const updates = actor.items.map(getItemUpdateData)
                .filter(truthiness);
            if (updates.length) {
                await actor.updateEmbeddedDocuments("Item", updates);
            }
        }
    }

    log('...finished migrating unlocked packs');
};

export const migrateWorldActors = async () => {
    log('migrating world actors');

    for (const actor of game.actors) {
        const updates = actor.items.map(getItemUpdateData)
            .filter(truthiness);
        if (updates.length) {
            await actor.updateEmbeddedDocuments("Item", updates);
        }
    }

    log('...finished migrating world actors');
};

export const migrateSyntheticActors = async () => {
    log('migrating synthetic actors');

    const synthetics = [...game.scenes].flatMap(s => [...s.tokens].filter(t => !t.isLinked && t.actor?.items?.size));
    for (const synthetic of synthetics) {
        if (synthetic.actor) {
            const updates = synthetic.actor.items.map(getItemUpdateData)
                .filter(truthiness);
            if (updates.length) {
                await synthetic.actor.updateEmbeddedDocuments("Item", updates);
            }
        }
    }

    log('...finished migrating synthetic actors');
};

export const migrateWorldV3 = async () => {
    await migrateWorldItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
};
