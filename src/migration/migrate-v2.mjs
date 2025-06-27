import { log } from './migration-log.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { createChange } from '../util/conditional-helpers.mjs';
import { isNotEmptyObject } from '../util/is-empty-object.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { truthiness } from '../util/truthiness.mjs';
import { difference } from '../util/array-intersects.mjs';

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

/** @type {[string, string][]} */
const migrateModuleFlagKeys = [];

const languageKeyMigrationKeys = [
    ['elementalFocus', 'elemental-focus'],
    ['spellFocus', 'spell-focus'],
];
export const migrateLanguageSettings = async () => {
    const current = /** @type {Record<string, any>} */ (game.settings.get(MODULE_NAME, LanguageSettings.itemNameTranslationsKey));
    let hasUpdate = false;
    languageKeyMigrationKeys.forEach(([old, updated]) => {
        const existing = current[old];
        if (existing) {
            current[`-=${old}`] = null;
            current[updated] = existing;
        }
        hasUpdate ||= !!existing;
    })
    if (hasUpdate) {
        await game.settings.set(MODULE_NAME, LanguageSettings.itemNameTranslationsKey, current);
    }
}

const settingsMigrationKeys = [
    ['racial-weapon-focus', 'weapon-focus-racial'],
    ['racial-weapon-focus-default-race', 'weapon-focus-racial-default-race'],
];
export const migrateClientSettings = async () => {
    for (const [old, updated] of settingsMigrationKeys) {
        const existing = JSON.parse(game.settings.storage.get('client')?.[`${MODULE_NAME}.${old}`] ?? '');
        if (existing) {
            await game.settings.set(MODULE_NAME, updated, existing);
        }
    }
}

class CritMappings {
    /**
     * @param {'dictionary' | 'boolean'} type
     * @param {string} legacy
     * @param {string} newTarget
     * @param {string} newBonus
     * @param {string} moduleFlag
     */
    constructor(type, legacy, newTarget, newBonus, moduleFlag) {
        this.type = type;
        this.legacy = legacy;
        this.newTarget = newTarget;
        this.newBonus = newBonus;
        this.moduleFlag = moduleFlag;
    }
}
const specificCritMappings = [
    new CritMappings('boolean', 'keen-self', 'target_self', 'bonus_crit', 'bonus_crit-keen'),
    new CritMappings('boolean', 'keen-all', 'target_all', 'bonus_crit', 'bonus_crit-keen'),
    new CritMappings('dictionary', 'crit-offset-self', 'target_self', 'bonus_crit', 'bonus_crit-offset'),
    new CritMappings('dictionary', 'crit-offset-all', 'target_all', 'bonus_crit', 'bonus_crit-offset'),
    new CritMappings('dictionary', 'crit-mult-offset-self', 'target_self', 'bonus_crit', 'bonus_crit-mult'),
    new CritMappings('dictionary', 'crit-mult-offset-all', 'target_all', 'bonus_crit', 'bonus_crit-mult'),
];

/**
 * @param {ItemPF} item
 * @returns {RecursivePartial<ItemPF> | undefined}
 */
const getItemUpdateData = (item) => {

    /** @type {Record<string, boolean>} */
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

    const migrateCrit = () => {
        specificCritMappings.forEach((x) => {
            switch (x.type) {
                case 'boolean':
                    if (item.hasItemBooleanFlag(x.legacy)) {
                        boolean[`-=${x.legacy}`] = false;
                        boolean[x.newBonus] = true;
                        boolean[x.newTarget] = true;
                        moduleFlags[x.moduleFlag] = true;
                    }
                    break;
                case 'dictionary':
                    const value = item.getItemDictionaryFlag(x.legacy)
                    if (value) {
                        dictionary[`-=${x.legacy}`] = null;
                        boolean[x.newBonus] = true;
                        boolean[x.newTarget] = true;
                        moduleFlags[x.moduleFlag] = value;
                    }
                    break;
            }
        });

        const { actor } = item;
        if (!actor) return;

        const handleKeenTargetIds = () => {
            const legacy = Object.keys(item.system.flags.boolean)
                .filter((x) => x.startsWith('keen_'));
            if (!legacy.length) return;

            const ids = legacy.map((x) => x.split('_')[1]);

            const itemIds = ids.filter((id) => !!actor.items.get(id));

            /** @type {ItemAction[]} */
            let actions = [];
            const potentialActionIds = difference(ids, itemIds);
            if (potentialActionIds.length) {
                const allActions = actor.items
                    .filter((x) => x.hasAction)
                    .flatMap((x) => [...x.actions]);
                actions = potentialActionIds
                    .map(id => allActions.find((action) => action.id === id))
                    .filter(truthiness);
            }

            boolean['bonus_crit'] = true;
            moduleFlags['bonus_crit-keen'] = true;
            legacy.forEach((id) => boolean[`-=${id}`] = false);
            if (itemIds.length) {
                const current = item.getFlag(MODULE_NAME, 'target_item') || [];
                current.push(...itemIds);

                boolean['target_item'] = true;
                moduleFlags['target_item'] = current;
            }
            if (actions.length) {
                const current = item.getFlag(MODULE_NAME, 'target_action') || [];
                current.push(...actions.map((a) => `${a.item.id}.${a.id}`));

                boolean['target_action'] = true;
                moduleFlags['target_action'] = current;
            }
        }

        /**
         * @param {string} start
         * @param {string} formulaKey
         */
        const handleOffsetTargetIds = (start, formulaKey) => {
            const legacy = Object.keys(item.system.flags.dictionary)
                .filter((x) => x.startsWith(start));
            if (!legacy.length) return;

            /** @type { { id: string, formula: string }[] } */
            const itemFormulas = [];
            /** @type { { id: string, formula: string }[] } */
            const actionIdFormulas = [];
            legacy.forEach((str) => {
                const id = str.split('_')[1];
                if (!!actor.items.get(id)) {
                    itemFormulas.push({ id, formula: `${item.getItemDictionaryFlag(str)}` });
                }
                else {
                    actionIdFormulas.push({ id, formula: `${item.getItemDictionaryFlag(str)}` });
                }
            });

            /** @type { { action: ItemAction, formula: string }[] } */
            let actionFormulas = [];
            if (actionIdFormulas.length) {
                const allActions = actor.items
                    .filter((x) => x.hasAction)
                    .flatMap((x) => [...x.actions]);
                // @ts-ignore
                actionFormulas = actionIdFormulas
                    .map(({ id, formula }) => ({ action: allActions.find((action) => action.id === id), formula }))
                    .filter((x) => !!x.action);
            }

            boolean['bonus_crit'] = true;
            legacy.forEach((id) => dictionary[`-=${id}`] = null);
            if (itemFormulas.length) {
                const current = item.getFlag(MODULE_NAME, 'target_item') || [];
                current.push(...itemFormulas.map(({ id }) => id));
                moduleFlags[formulaKey] = itemFormulas[0].formula;
                boolean['target_item'] = true;
                moduleFlags['target_item'] = current;
            }
            if (actionFormulas.length) {
                const current = item.getFlag(MODULE_NAME, 'target_action') || [];
                current.push(...actionFormulas.map(({ action: a }) => `${a.item.id}.${a.id}`));
                moduleFlags[formulaKey] = actionFormulas[0].formula;
                boolean['target_action'] = true;
                moduleFlags['target_action'] = current;
            }
        }

        handleKeenTargetIds();
        handleOffsetTargetIds('crit-offset_', 'bonus_crit-offset');
        handleOffsetTargetIds('crit-mult-offset_', 'bonus_crit-mult');
    }
    migrateCrit();

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
    const legacyExpandedKey = `expanded-${vpKey}`;
    const expandedKey = `${vpKey}-expanded`;

    const vp = item.getItemDictionaryFlag(vpKey);
    if (vp) {
        const [baseId, ...substitutes] = `${vp}`.split(';').map(x => x.trim());

        boolean[vpKey] = true;
        if (item.hasItemBooleanFlag(legacyExpandedKey)) {
            moduleFlags[`-=${legacyExpandedKey}`] = null;
            boolean[`-=${legacyExpandedKey}`] = false;
            boolean[expandedKey] = true;
        }

        dictionary[`-=${vpKey}`] = null;
        moduleFlags[vpKey] = [{
            base: baseId,
            choice1: substitutes[0],
            choice2: substitutes[1],
            expanded: item.getFlag(MODULE_NAME, legacyExpandedKey),
        }];
    }

    if (isNotEmptyObject(dictionary)
        || isNotEmptyObject(moduleFlags)
        || isNotEmptyObject(boolean)
        || isNotEmptyObject(changes)
    ) {
        /** @type {RecursivePartial<ItemPF>} */
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

export const migrateWorldV2 = async () => {
    await migrateLanguageSettings();
    await migrateWorldItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
};

export const migrateClientV2 = async () => {
    const doIt = async () => await migrateClientSettings();

    if (game.ready) {
        await doIt();
    }
    else {
        Hooks.on('ready', async () => {
            await doIt();
        });
    }
}
