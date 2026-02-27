import { MODULE_NAME } from '../consts.mjs';
import { BaseMigrate } from './_migrate-base.mjs';

export class MigrateV23 extends BaseMigrate {
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

        const condition = item.getFlag(MODULE_NAME, 'target_condition');
        if (condition) {
            hasUpdate = true;
            updatedFlags['target_condition'] = [condition];
        }

        const alignment = item.getFlag(MODULE_NAME, 'target_alignment');
        if (alignment) {
            hasUpdate = true;
            /** @type{string[]} */
            let values = [];

            switch (alignment) {
                case 'lawful':
                    values = ['lg', 'ln', 'le'];
                    break;
                case 'chaotic':
                    values = ['cg', 'cn', 'ce'];
                    break;
                case 'good':
                    values = ['lg', 'ng', 'cg'];
                    break;
                case 'evil':
                    values = ['le', 'ne', 'ce'];
                    break;
            }

            updatedFlags['target_alignment'] = values;
        }

        const combat = item.hasItemBooleanFlag('target_when-in-combat');
        if (combat) {
            hasUpdate = true;
            boolean['-=target_when-in-combat'] = null;
            boolean['target_combat-state'] = true;
            updatedFlags['target_combat-state'] = 'in-combat';
        }

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
