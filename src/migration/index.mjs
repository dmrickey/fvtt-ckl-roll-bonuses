import { log } from './migration-log.mjs';
import * as v1 from './migrate-v1.mjs';
import * as v2 from './migrate-v2.mjs';
import * as v3 from './migrate-v3.mjs';
import * as v4 from './migrate-v4.mjs';
import * as v5 from './migrate-v5.mjs';
import { MigrateV6 as v6 } from './migrate-v6.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { api } from '../util/api.mjs';
import { registerSetting } from '../util/settings.mjs';

class Settings {
    static get #migrationVersionKey() { return 'migration-version'; }
    static get #clientMigrationVersionKey() { return 'migration-version'; }

    static get worldMigrationVersion() {
        const version = /** @type {number} */ (/** @type {unknown} */ Settings.#getSetting(this.#migrationVersionKey));
        return version;
    }

    static set worldMigrationVersion(version) {
        game.settings.set(MODULE_NAME, this.#migrationVersionKey, version);
    }

    static get clientMigrationVersion() {
        const version = /** @type {number} */ (/** @type {unknown} */ Settings.#getSetting(this.#clientMigrationVersionKey));
        return version;
    }

    static set clientMigrationVersion(version) {
        game.settings.set(MODULE_NAME, this.#clientMigrationVersionKey, version);
    }

    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key); }

    static {
        registerSetting({
            config: false,
            defaultValue: -1,
            key: this.#migrationVersionKey,
            scope: 'world',
            settingType: Number,
        });
        registerSetting({
            config: false,
            defaultValue: -1,
            key: this.#clientMigrationVersionKey,
            scope: 'client',
            settingType: Number,
        });
    }
}

/** @type { { label: string, migrate: () => Promise<void> }[] } */
const migrations = [
    // first migration
    { label: 'aboleths', migrate: v1.migrateV1 },

    // v2.15
    { label: 'bugbears', migrate: v2.migrateWorldV2 },

    // v2.16
    { label: 'catoblepas', migrate: v3.migrateWorldV3 },

    //  2.18 (pf1 v11 // foundry v12 update)
    { label: 'duergar', migrate: v4.migrateWorldV4 },

    //  2.19 (ammo mw)
    { label: 'ettin', migrate: v5.migrateWorldV5 },

    // 2.20 (race type -> creature type)
    { label: 'frost worm', migrate: () => v6.migrateWorld() },
];

// should always be one more than the
const currentMigrationVersion = migrations.length + 1;

const migrateWorld = async () => {
    const current = Settings.worldMigrationVersion || 0;

    if (current !== currentMigrationVersion && current !== -1) {
        log('Starting world migration');

        for (let i = 1; i <= migrations.length; i++) {
            if (current <= i) {
                const { label, migrate } = migrations[i - 1];
                log(`Migrating ${label}`);
                await migrate();
                Settings.worldMigrationVersion = i + 1;
            }
        }

        log('Finalized world migration');
    }

    Settings.worldMigrationVersion = currentMigrationVersion;
};

const migrateClient = async () => {
    const current = Settings.clientMigrationVersion || 0;

    if (current !== currentMigrationVersion && current !== -1) {
        log('Starting client migration');

        if (current <= 2) {
            log('Migrating bugbears');
            await v2.migrateClientV2();
        }

        log('Finalized client migration');
    }

    Settings.clientMigrationVersion = currentMigrationVersion;
};

const migrate = async () => {
    if (game.users.activeGM === game.user) {
        await migrateWorld();
    }

    await migrateClient();
}

export default migrate;

api.migrate = {
    migrate,
    v1,
    v2,
    v3,
    v4,
    v5,
    v6,
};
