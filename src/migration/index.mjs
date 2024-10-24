import { log } from './migration-log.mjs';
import * as v1 from './migrate-v1.mjs';
import * as v2 from './migrate-v2.mjs';
import * as v3 from './migrate-v3.mjs';
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

const currentMigrationVersion = 4;

const migrateWorld = async () => {
    const current = Settings.worldMigrationVersion || 0;

    if (current !== currentMigrationVersion && current !== -1) {
        log('Starting world migration');

        if (current <= 1) {
            log('Migrating aboleths');
            await v1.migrateV1();
        }

        // v2.15
        if (current <= 2) {
            log('Migrating bugbears');
            await v2.migrateWorldV2();
        }

        // v2.16
        if (current <= 3) {
            log('Migrating catoblepas');
            await v3.migrateWorldV2();
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
};
