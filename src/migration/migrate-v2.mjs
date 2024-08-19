import { createChange } from '../util/conditional-helpers.mjs';
import { log } from './migration-log.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { isNotEmptyObject } from '../util/is-empty-object.mjs';

/** BEGIN to system changes */
const clAllKey = 'all-spell-cl';

const clSchoolKey = 'schoolClOffset';
const clSchoolFormulaKey = 'schoolClOffsetFormula';

const dcAllKey = 'genericSpellDC';

const dcSchoolKey = 'school-dc';
const dcSchoolFormulaKey = 'school-dc-formula';
/** END to system changes */

class DictionaryMigration {
    /**
     * @param {string} key
     * @param {string} [newKey]
     * @param {boolean} [skipBFlag]
     */
    constructor(key, newKey, skipBFlag) {
        this.key = key;
        this.newKey = newKey || key;
        this.skipBFlag = skipBFlag || false;
    }
}
/** @type {DictionaryMigration[]} */
const dictionaryToModuleFlag = [
    new DictionaryMigration('spellFocus', 'spell-focus'),
    new DictionaryMigration('greaterSpellFocus', 'spell-focus-greater'),
    new DictionaryMigration('mythicSpellFocus', 'spell-focus-mythic'),

    new DictionaryMigration('elementalFocus', 'elemental-focus'),
    new DictionaryMigration('greaterElementalFocus', 'elemental-focus-greater'),
    new DictionaryMigration('mythicElementalFocus', 'elemental-focus-mythic'),

    new DictionaryMigration('weapon-focus'),
    new DictionaryMigration('greater-weapon-focus', 'weapon-focus-greater'),
    new DictionaryMigration('mythic-weapon-focus', 'weapon-focus-mythic'),
    new DictionaryMigration('racial-weapon-focus', 'weapon-focus-racial'),

    new DictionaryMigration('spell-specialization'),

    new DictionaryMigration('martial-focus'),

    new DictionaryMigration('armor-focus'),
    new DictionaryMigration('improved-armor-focus', 'armor-focus-improved'),

    new DictionaryMigration('weapon-specialization'),
    new DictionaryMigration('greater-weapon-specialization', 'weapon-specialization-greater'),

    new DictionaryMigration('change-type-offset'),
    new DictionaryMigration('change-type-offset-formula', 'change-type-offset-formula', true),
];

// TODO don't forget this
const languageKeyMigration = [
    ['elementalFocus', 'elemental-focus'],
    ['spellFocus', 'spell-focus'],
]

export const migrateLanguageSetting = async () => {
    // TODO don't forget to fill this in
};

/** @param {ItemPF} item */
export const migrateItem = async (item) => {

    /** @type {Record<string, true>} */
    const boolean = {};
    const changes = item.toObject().system.changes || [];
    /** @type {Record<string, null>} */
    const dictionary = {};
    /** @type {Record<string, any>} */
    const moduleFlags = {};

    if (item.getItemDictionaryFlag(clAllKey)) {
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

    /**
     * @param {string} key
     * @param {string} [newKey]
     * @param {boolean} [skipBFlag]
     */
    const migrateDflag = (key, newKey, skipBFlag) => {
        newKey ||= key;
        dictionary[`-=${key}`] = null;
        const value = item.getItemDictionaryFlag(key);
        moduleFlags[newKey] = value;

        if (!skipBFlag) {
            boolean[newKey] = true;
        }
    }

    dictionaryToModuleFlag.forEach(({ key, newKey, skipBFlag }) => migrateDflag(key, newKey, skipBFlag));

    if (isNotEmptyObject(dictionary)) {
        /** @type {Partial<ItemPF>} */
        const update = {
            system: {
                changes,
                flags: {
                    boolean,
                    // @ts-ignore it doesn't like the de-assign (setting to null)
                    dictionary,
                }
            },
            flags: {
                [MODULE_NAME]: moduleFlags,
            },
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
};

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
    await migrateLanguageSetting();
    await migrateGameItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
};
