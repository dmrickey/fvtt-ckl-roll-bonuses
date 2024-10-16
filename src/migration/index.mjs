import { log } from './migration-log.mjs';
import * as v1 from './migrate-v1.mjs';
import * as v2 from './migrate-v2.mjs';
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

        /**
         * @param {object} setting
         * @param {boolean} [setting.config]
         * @param {string} setting.key
         * @param {any} [setting.defaultValue]
         * @param {'world' | 'client'} [setting.scope]
         * @param {BooleanConstructor | StringConstructor | NumberConstructor | ObjectConstructor} [setting.settingType]
         * @param {object} [options]
         * @param {boolean} [options.skipReady]
         */
        const registerSetting = ({
            config = true,
            defaultValue = null,
            key,
            scope = 'world',
            settingType = String,
        }, {
            skipReady = false
        } = {}) => {
            const doIt = () =>
                game.settings.register(MODULE_NAME, key, {
                    name: `${MODULE_NAME}.settings.${key}.name`,
                    hint: `${MODULE_NAME}.settings.${key}.hint`,
                    default: defaultValue === null ? game.i18n.localize(`settings.${key}.default`) : defaultValue,
                    scope,
                    requiresReload: false,
                    config,
                    type: settingType
                });

            game.ready || skipReady
                ? doIt()
                : Hooks.once('ready', doIt);
        };

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

const currentMigrationVersion = 3;

const migrateWorld = async () => {
    const current = Settings.worldMigrationVersion || 0;

    if (current !== currentMigrationVersion && current !== -1) {
        log('Starting world migration');

        if (current <= 1) {
            log('Migrating aboleths');
            await v1.migrateV1();
        }

        if (current <= 2) {
            log('Migrating bugbears');
            await v2.migrateWorldV2();
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

export default async () => {
    if (game.users.activeGM === game.user) {
        await migrateWorld();
    }

    await migrateClient();
}

api.migrate = {
    migrate: async () => {
        await v1.migrateV1();
        await v2.migrateWorldV2();
    },
    v1,
    v2,
};
