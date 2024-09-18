import { createChange } from '../util/conditional-helpers.mjs';
import { log } from './migration-log.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { isNotEmptyObject } from '../util/is-empty-object.mjs';
import { truthiness } from '../util/truthiness.mjs';

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
     * @param {string} [extraBFlag]
     */
    constructor(key, newKey, skipBFlag, extraBFlag) {
        this.key = key;
        this.newKey = newKey || key;
        this.skipBFlag = skipBFlag || false;
        this.extraBFlag = extraBFlag;
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

    new DictionaryMigration('change-type-offset', 'change-modification-type', false, 'change-modification'),
    new DictionaryMigration('change-type-offset-formula', 'change-modification-formula', true),
];

const migrateModuleFlagKeys = [
    ['expanded-versatile-performance', 'versatile-performance-expanded'],
];

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

/**
 * @param {ItemPF} item
 * @returns {Partial<ItemPF> | undefined}
 */
const getItemUpdateData = (item) => {

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

    /** @param {DictionaryMigration} d */
    const migrateDflag = (d) => {
        const value = item.getItemDictionaryFlag(d.key);
        if (!value) return;

        const newKey = d.newKey || d.key;
        dictionary[`-=${d.key}`] = null;
        moduleFlags[newKey] = value;

        if (!d.skipBFlag) {
            boolean[newKey] = true;
        }
        if (d.extraBFlag) {
            boolean[d.extraBFlag] = true;
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

    dictionaryToModuleFlag.forEach(migrateDflag);
    migrateModuleFlagKeys.forEach(([key, newKey]) => migrateModuleFlag(key, newKey));

    const vpKey = 'versatile-performance';
    const vpKeyBase = `${vpKey}-base`;
    const vpKeyChoice1 = `${vpKey}-choice-1`;
    const vpKeyChoice2 = `${vpKey}-choice-2`;
    const vpKeyExpanded = `${vpKey}-expanded`;

    const legacyExpandedKey = `expanded-${vpKey}`;

    const vp = item.getItemDictionaryFlag(vpKey);
    if (vp) {
        const [baseId, ...substitutes] = `${vp}`.split(';').map(x => x.trim());

        /** @type{Record<string, boolean>} */
        boolean[vpKey] = true;
        if (item.hasItemBooleanFlag(legacyExpandedKey)) {
            boolean[vpKeyExpanded] = true;
        }

        dictionary[`-=${vpKey}`] = null;
        moduleFlags[vpKeyBase] = baseId;
        moduleFlags[vpKeyChoice1] = substitutes[0];
        moduleFlags[vpKeyChoice2] = substitutes[1];
        moduleFlags[vpKeyExpanded] = item.getFlag(MODULE_NAME, legacyExpandedKey);
        moduleFlags[`-=${legacyExpandedKey}`] = null;
    }

    if (isNotEmptyObject(dictionary)
        || isNotEmptyObject(moduleFlags)
        || isNotEmptyObject(boolean)
        || isNotEmptyObject(changes)
    ) {
        /** @type {Partial<ItemPF>} */
        const update = {
            _id: item.id,
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

const migrateWorldItems = async () => {
    log('migrating game items');

    for (const item of game.items ?? []) {
        await migrateItem(item);
    }

    log('...finished migrating game items');
};

const migratePacks = async () => {
    log('migrating unlocked packs');

    for (const pack of game.packs.filter(x => x.documentName === "Item" && !x.locked)) {
        // @ts-ignore don't care about defining Pack
        await pack.updateAll((item) => getItemUpdateData(item) || {});
    }

    for (const pack of game.packs.filter(x => x.documentName === "Actor" && !x.locked)) {
        const actors = await pack.getDocuments();
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

const migrateWorldActors = async () => {
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

const migrateSyntheticActors = async () => {
    log('migrating synthetic actors');

    const synthetics = [...game.scenes].flatMap(s => [...s.tokens].filter(t => !t.isLinked && t.actor?.items?.size));
    for (const synthetic of synthetics) {
        const updates = synthetic.actor.items.map(getItemUpdateData)
            .filter(truthiness);
        if (updates.length) {
            await synthetic.actor.updateEmbeddedDocuments("Item", updates);
        }
    }

    log('...finished migrating synthetic actors');
};

export const migrateV2 = async () => {
    await migrateLanguageSetting();
    await migrateWorldItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
    await migrateSettings();
};
