import { log } from './migration-log.mjs';
import * as v1 from './migrate-v1.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { api } from '../util/api.mjs';
import { registerSetting } from '../util/settings.mjs';

class Settings {
    static get #migrationVersionKey() { return 'migration-version'; }

    static get migrationVersion() {
        const version = /** @type {number} */ (/** @type {unknown} */ Settings.#getSetting(this.#migrationVersionKey));
        return version;
    }

    static set migrationVersion(version) {
        game.settings.set(MODULE_NAME, this.#migrationVersionKey, version);
    }

    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key); }

    static {
        registerSetting({
            config: false,
            defaultValue: 0,
            key: this.#migrationVersionKey,
            scope: 'world',
            settingType: Boolean,
        })
    }
}

const currentMigrationVersion = 2;

export default async () => {
    if (game.users.activeGM !== game.user) {
        return;
    }

    const current = Settings.migrationVersion || 0;

    if (current !== currentMigrationVersion) {
        log('Starting overall migration');
    }

    if (current < 1) {
        log('Starting first migration');
        await v1.migrateV1();
    }

    if (current !== currentMigrationVersion) {
        log('Finalized migration');
    }

    Settings.migrationVersion = currentMigrationVersion;
}

api.migrate = {
    migrate: async () => {
        await v1.migrateV1();
    },
    v1: {
        migrateAmmoForActor: v1.migrateActor,
    },
};
