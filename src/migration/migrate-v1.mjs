import { MODULE_NAME } from "../consts.mjs";
import { log } from './migration-log.mjs';

const legacyAmmoDamageKey = 'bonus_damage';
const legacyAmmoAttackKey = 'bonus_attack';
const ammoDamageKey = 'ammo-damage';
const ammoAttackKey = 'ammo-attack';

/** @param {ItemPF} item */
const migrateItem = async (item) => {
    if (!(item instanceof pf1.documents.item.ItemLootPF) || item.subType !== 'ammo') {
        return;
    }

    const obj = (item.flags?.[MODULE_NAME] || {});
    if (obj.hasOwnProperty(legacyAmmoAttackKey) || obj.hasOwnProperty(legacyAmmoDamageKey)) {
        const legacyAttack = item.getFlag(MODULE_NAME, legacyAmmoAttackKey) ?? [];
        const legacyDamage = item.getFlag(MODULE_NAME, legacyAmmoDamageKey) ?? [];

        const update = {
            flags: {
                [MODULE_NAME]: {
                    [`-=${legacyAmmoAttackKey}`]: null,
                    [`-=${legacyAmmoDamageKey}`]: null,
                    [ammoAttackKey]: legacyAttack,
                    [ammoDamageKey]: legacyDamage,
                }
            }
        }
        await item.update(update);
    }
};

/** @param {ActorPF} actor */
export const migrateActor = async (actor) => {
    log(`migrating items for actor '${actor?.name}'`);
    if (actor?.items?.size) {
        for (const item of actor.items) {
            await migrateItem(item);
        }
    }
    log('...finished migrating actor');
}

const migrateGameItems = async () => {
    log('migrating game items');

    for (const item of game.items ?? []) {
        await migrateItem(item);
    }

    log('...finished migrating game items');
};

const migratePacks = async () => {
    log('migrating unlocked packs');

    for (const pack of game.packs.filter(x => x.documentName === "Item" && !x.locked)) {
        const docs = /** @type {EmbeddedCollection<ItemPF>} */ /** @type {any} */ (await pack.getDocuments());
        for (const item of docs) {
            await migrateItem(item);
        }
    }

    log('...finished migrating unlocked packs');
};

const migrateWorldActors = async () => {
    log('migrating world actors');

    for (const actor of game.actors) {
        if (actor.items?.size) {
            for (const item of actor.items) {
                await migrateItem(item);
            }
        }
    }

    log('...finished migrating world actors');
};

const migrateSyntheticActors = async () => {
    log('migrating synthetic actors');

    const synthetics = [...game.scenes].flatMap(s => [...s.tokens].filter(t => !t.isLinked && t.actor?.items?.size));
    for (const synthetic of synthetics) {
        for (const item of synthetic.actor?.items ?? []) {
            await migrateItem(item);
        }
    }

    log('...finished migrating synthetic actors');
};

export const migrateV1 = async () => {
    await migrateGameItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
}
