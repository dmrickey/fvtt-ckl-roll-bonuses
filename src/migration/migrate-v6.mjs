import { MODULE_NAME } from '../consts.mjs';
import { BaseMigrate } from './_migrate-base.mjs';

const settingsMigrationKeys = [
    ['target_race', 'target_creature-type'],
    ['target_race-subtype', 'target_creature-subtype'],
];

export class MigrateV6 extends BaseMigrate {
    /**
     * @override
     * @param {ItemPF} item
     * @returns {RecursivePartial<ItemPF> | undefined}
     */
    static getItemUpdateData(item) {

        /** @type {Record<string, true | null>} */
        const boolean = {};

        /** @type {Record<string, any>} */
        const updatedFlags = {};

        let hasUpdate = false;

        settingsMigrationKeys.forEach(([ori, updated]) => {
            if (item.hasItemBooleanFlag(ori)) {
                boolean[`-=${ori}`] = null;
                boolean[updated] = true;
                updatedFlags[`-=${ori}`] = null;
                updatedFlags[updated] = item.getFlag(MODULE_NAME, ori);

                hasUpdate = true;
            }
        });

        if (hasUpdate) {
            /** @type {RecursivePartial<ItemPF>} */
            const update = {
                _id: item.id,
                system: {
                    flags: {
                        // @ts-ignore
                        boolean
                    }
                },
                flags: {
                    [MODULE_NAME]: updatedFlags,
                },
            };
            return update;
        }
    }
}
