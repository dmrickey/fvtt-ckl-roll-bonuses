import { MODULE_NAME } from '../consts.mjs';
import { BaseMigrate } from './_migrate-base.mjs';

export class MigrateV23 extends BaseMigrate {
    /**
     * @override
     * @param {ItemPF} item
     * @returns {RecursivePartial<ItemPF> | undefined}
     */
    static getItemUpdateData(item) {
        const condition = item.getFlag(MODULE_NAME, 'target_condition');
        if (condition) {
            /** @type {Record<string, any>} */
            const updatedFlags = {};
            updatedFlags['target_condition'] = [condition];

            /** @type {RecursivePartial<ItemPF>} */
            const update = {
                _id: item.id,
                flags: {
                    [MODULE_NAME]: updatedFlags,
                },
            };
            return update;
        }
    }
}
