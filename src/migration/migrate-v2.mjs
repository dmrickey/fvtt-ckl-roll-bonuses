import { createChange } from '../util/conditional-helpers.mjs';
import { log } from './migration-log.mjs';

const clAllKey = 'all-spell-cl';

const clSchoolKey = 'schoolClOffset';
const clSchoolFormulaKey = 'schoolClOffsetFormula';

const dcAllKey = 'genericSpellDC';

const dcSchoolKey = 'school-dc';
const dcSchoolFormulaKey = 'school-dc-formula';

/** @param {ItemPF} item */
const migrateItem = async (item) => {

    /** @type {Record<string, null>} */
    const dictionary = {};
    const changes = item.toObject().system.changes || [];
    let requiresUpdate = false;

    if (item.getItemDictionaryFlag(clAllKey)) {
        requiresUpdate = true;
        dictionary[`-=${clAllKey}`] = null;

        const value = item.getItemDictionaryFlag(clAllKey);
        const change = createChange({
            value,
            target: 'cl',
            type: 'untyped',
        }).toObject();
        changes.push(change);
    }

    if (item.getItemDictionaryFlag(dcAllKey)) {
        requiresUpdate = true;
        dictionary[`-=${dcAllKey}`] = null;

        const value = item.getItemDictionaryFlag(dcAllKey);
        const change = createChange({
            value,
            target: 'dc',
            type: 'untyped',
        }).toObject();
        changes.push(change);
    }

    if (item.getItemDictionaryFlag(clSchoolKey)) {
        requiresUpdate = true;
        dictionary[`-=${clSchoolKey}`] = null;
        dictionary[`-=${clSchoolFormulaKey}`] = null;

        const school = item.getItemDictionaryFlag(clSchoolKey);
        const formula = item.getItemDictionaryFlag(clSchoolFormulaKey) || '';
        const change = createChange({
            value: formula,
            //@ts-ignore
            target: `cl.school.${school}`,
            type: 'untyped',
        }).toObject();
        changes.push(change);
    }

    if (item.getItemDictionaryFlag(dcSchoolKey)) {
        requiresUpdate = true;
        dictionary[`-=${dcSchoolKey}`] = null;
        dictionary[`-=${dcSchoolFormulaKey}`] = null;

        const school = item.getItemDictionaryFlag(dcSchoolKey);
        const formula = item.getItemDictionaryFlag(dcSchoolFormulaKey) || '';
        const change = createChange({
            value: formula,
            //@ts-ignore
            target: `dc.school.${school}`,
            type: 'untyped',
        }).toObject();
        changes.push(change);
    }

    if (requiresUpdate) {
        const update = {
            system: {
                changes,
                flags: {
                    dictionary,
                }
            }
        };
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
    log('...finished migrating items');
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
        const docs = await pack.getDocuments();
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

    game.scenes;
    const synthetics = [...game.scenes].flatMap(s => [...s.tokens].filter(t => !t.isLinked && t.actor?.items?.size));
    for (const synthetic of synthetics) {
        for (const item of synthetic.actor.items) {
            await migrateItem(item);
        }
    }

    log('...finished migrating synthetic actors');
};

export const migrateV2 = async () => {
    await migrateGameItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
}
