import { log } from './migration-log.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { truthiness } from '../util/truthiness.mjs';

/**
 * @param {ItemPF} item
 * @returns {RecursivePartial<ItemPF> | undefined}
 */
const getItemUpdateData = (item) => {

    /** @type {Record<string, any>} */
    const updatedFlags = {};

    let hasUpdate = false;

    /**
     * @typedef {{ custom: string, values: string[] }} LegacyDamageTypes
     */

    /**
     * @param {LegacyDamageTypes} t
     * @returns {string[]}
     */
    const updateTypes = (t) => Array.isArray(t)
        ? t
        : [...(t?.custom?.split(';') ?? ''), ...(t?.values ?? [])].filter(truthiness);

    {
        const basicDamages = ['bonus_damage', 'ammo-damage'];

        basicDamages.forEach((key) => {
            /** @type {{ crit: any, formula: any, type: LegacyDamageTypes }[]} */
            const damages = item.getFlag(MODULE_NAME, key);
            if (damages?.length) {
                hasUpdate = true;
                updatedFlags[key] = damages.map(({ crit, formula, type }) => ({
                    crit,
                    formula,
                    types: updateTypes(type),
                }));
            }
        });
    }

    {
        /**
         * @typedef {object} LegacyConditionalModifier
         * @property {'attack' | 'damage'} target
         * @property {LegacyDamageTypes} damageType
         *
         * @typedef {object} LegacyConditional
         * @property {LegacyConditionalModifier[]} modifiers
         */
        /** @type {LegacyConditional[]} */
        const conditionals = item.getFlag(MODULE_NAME, 'bonus_conditional-modifiers');
        if (conditionals?.length && conditionals.some((c) => c?.modifiers?.some((m) => m?.target === 'damage'))) {
            hasUpdate = true;
            updatedFlags['bonus_conditional-modifiers'] = conditionals.map((c) => ({
                ...c,
                modifiers: c.modifiers.map((m) => m.target !== 'damage'
                    ? m
                    : {
                        ...m,
                        damageType: updateTypes(m.damageType)
                    })
            }));
        }
    }

    if (hasUpdate) {
        /** @type {RecursivePartial<ItemPF>} */
        const update = {
            _id: item.id,
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

export const migrateWorldV4 = async () => {
    await migrateWorldItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
};
