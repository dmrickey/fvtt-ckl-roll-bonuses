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

const migrateModuleFlagKeys = [
    ['expanded-versatile-performance', 'versatile-performance-expanded'],
];

/**
 * @param {ItemPF} item
 */
export const migrateVersatilePerformance = async (item) => {
    const key = 'versatile-performance';
    const keyBase = `${key}-base`;
    const keyChoice1 = `${key}-choice-1`;
    const keyChoice2 = `${key}-choice-2`;
    const keyExpanded = `${key}-expanded`;

    const legacyExpandedKey = `expanded-${key}`;

    const vp = item.getItemDictionaryFlag(key);
    if (vp) {
        const [baseId, ...substitutes] = `${vp}`.split(';').map(x => x.trim());

        /** @type{Record<string, boolean>} */
        const boolean = {
            [key]: true,
        };
        if (item.hasItemBooleanFlag(legacyExpandedKey)) {
            boolean[keyExpanded] = true;
        }

        /** @type {Partial<ItemPF>} */
        const update = {
            system: {
                flags: {
                    boolean,
                    dictionary: {
                        // @ts-ignore it doesn't like the de-assign (setting to null)
                        [`-=${key}`]: null,
                    },
                }
            },
            flags: {
                [MODULE_NAME]: {
                    [keyBase]: baseId,
                    [keyChoice1]: substitutes[0],
                    [keyChoice2]: substitutes[1],
                    [keyExpanded]: item.getFlag(MODULE_NAME, legacyExpandedKey),
                    [`-=${legacyExpandedKey}`]: null,
                },
            },
        };
        await item.update(update);
    }
}

// TODO don't forget this
const languageKeyMigrationKeys = [
    ['elementalFocus', 'elemental-focus'],
    ['spellFocus', 'spell-focus'],
    ['racial-weapon-focus', 'weapon-focus-racial'],
    ['racial-weapon-focus-default-race', 'weapon-focus-racial-default-race'],
];

// TODO don't forget this
const settingsMigrationKeys = [
    ['elementalFocus', 'elemental-focus'],
    ['spellFocus', 'spell-focus'],
    ['racial-weapon-focus', 'weapon-focus-racial'],
    ['racial-weapon-focus-default-race', 'weapon-focus-racial-default-race'],
];

export const migrateLanguageSetting = async () => {
    // TODO don't forget to fill this in
};

export const migrateSettings = async () => {
    // TODO don't forget to fill this in
}

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
        const value = item.getItemDictionaryFlag(key);
        if (!value) return;

        newKey ||= key;
        dictionary[`-=${key}`] = null;
        moduleFlags[newKey] = value;

        if (!skipBFlag) {
            boolean[newKey] = true;
        }
    }

    /**
     * @param {string} key
     * @param {string} newKey
     */
    const migrateModuleFlag = (key, newKey) => {
        const value = item.getFlag(MODULE_NAME, key);
        if (!value) return;

        moduleFlags[`-=${key}`] = null;
        moduleFlags[newKey] = value;
    }

    dictionaryToModuleFlag.forEach(({ key, newKey, skipBFlag }) => migrateDflag(key, newKey, skipBFlag));
    migrateModuleFlagKeys.forEach(([key, newKey]) => migrateModuleFlag(key, newKey));

    if (isNotEmptyObject(dictionary)
        || isNotEmptyObject(moduleFlags)
        || isNotEmptyObject(boolean)
        || isNotEmptyObject(changes)
    ) {
        /** @type {Partial<ItemPF>} */
        const update = {
            system: {
                changes,
                flags: {
                    boolean,
                    // @ts-ignore it doesn't like the de-assign (setting to null)
                    dictionary: dictionary,
                }
            },
            flags: {
                [MODULE_NAME]: moduleFlags,
            },
        };
        await item.update(update);
    }
    await migrateVersatilePerformance(item);
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
    await migrateSettings();
};
