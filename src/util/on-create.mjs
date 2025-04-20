import { MODULE_NAME } from '../consts.mjs';
import { itemHasCompendiumId } from './has-compendium-id.mjs';

/**
 * @param {string} compendiumId
 * @param {() => string} defaultName
 * @param {object} options
 * @param {string | string[]} [options.booleanKeys]
 * @param {(item: ItemPF) => boolean} [options.extraVerification]
 * @param {Record<string, any>} [options.flagValues]
 */
export const onCreate = (
    compendiumId,
    defaultName,
    {
        booleanKeys = [],
        extraVerification,
        flagValues = undefined }
) => {
    /**
     * @param {ItemPF} item
     * @param {object} _data
     * @param {{temporary: boolean}} param2
     * @param {string} id
     */
    const handleOnCreate = (item, _data, { temporary }, id) => {
        if (!(item instanceof pf1.documents.item.ItemPF)) return;
        if (temporary) return;

        if (extraVerification && !extraVerification(item)) {
            return;
        }

        if (!Array.isArray(booleanKeys)) {
            booleanKeys = booleanKeys ? [booleanKeys] : [];
        }

        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        const hasBonus = booleanKeys.some((key) => item.hasItemBooleanFlag(key));

        if ((name === defaultName() || hasCompendiumId) && !hasBonus) {
            /** @type {Record<string, any>} */
            const update = {};
            booleanKeys.forEach((key) => update[`system.flags.boolean.${key}`] = true);
            if (flagValues) {
                update.flags ||= {}
                update.flags[MODULE_NAME] ||= {};
                update.flags[MODULE_NAME] = { ...update.flags[MODULE_NAME], ...flagValues };
            }
            item.updateSource(update);
        }
    };
    Hooks.on('preCreateItem', handleOnCreate);
}

/**
 * @param {ItemPF} item
 * @param {string} key
 * @param {string} compendiumId
 * @param {((name: string) => boolean) | string | boolean} nameFunc
 * @param {boolean} isEditable
 * @param {() => object} [flagValueFunc]
 *
 * @returns {boolean}
 */
export const onRenderCreate = (item, key, compendiumId, nameFunc, isEditable, flagValueFunc) => {
    const hasFlag = item.hasItemBooleanFlag(key);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? "";
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);

        const nameMatch = typeof nameFunc === 'string'
            ? nameFunc === name
            : typeof nameFunc === 'boolean'
                ? nameFunc
                : nameFunc(name);
        if (isEditable && (nameMatch || hasCompendiumId)) {
            item.addItemBooleanFlag(key);
            if (flagValueFunc) {
                try {
                    const value = flagValueFunc()
                    item.setFlag(MODULE_NAME, key, value);
                    return true;
                }
                catch (e) {
                    console.error("Shouldn't happen", e);
                }
            }
        }
        return false;
    }
    return true;
}
