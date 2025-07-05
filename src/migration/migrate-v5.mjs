import { log } from './migration-log.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { truthiness } from '../util/truthiness.mjs';

/**
 * @param {ItemPF} item
 * @returns {RecursivePartial<ItemPF> | undefined}
 */
const getItemUpdateData = (item) => {

    /** @type {Record<string, any>} */
    const system = {};

    /** @type {Record<string, any>} */
    const updatedFlags = {};

    let hasUpdate = false;

    {
        const mw = item.getFlag(MODULE_NAME, 'ammo-mw');
        if (mw) {
            hasUpdate = true;
            updatedFlags['-=ammo-mw'] = null;
            system.masterwork = true;
        }
    }

    if (hasUpdate) {
        /** @type {RecursivePartial<ItemPF>} */
        const update = {
            _id: item.id,
            system,
            flags: {
                [MODULE_NAME]: updatedFlags,
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
        const actors = /** @type {EmbeddedCollection<ActorPF>} */ /** @type {any} */ (await pack.getDocuments());
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

export const migrateWorldV5 = async () => {
    await migrateWorldItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
};
