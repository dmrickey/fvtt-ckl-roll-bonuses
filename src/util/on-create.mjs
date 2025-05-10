import { MODULE_NAME } from '../consts.mjs';
import { api } from './api.mjs';
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
 * @param {(item: ItemPF) => boolean} itemFilter will not operate if false
 * @param {string} key
 * @param {string} compendiumId
 * @param {(name: string, item?: ItemPF) => boolean} isItemFunc
 * @param {(item: ItemPF, html: HTMLElement, isEditable: boolean) => void} showInputsFunc
 * @param {object} [options]
 * @param {string[]} [options.extraBooleanFlags]
 * @param {(item?: ItemPF) => object} [options.flagValueFunc]
 */
export const onRenderCreate = (
    itemFilter,
    key,
    compendiumId,
    isItemFunc,
    showInputsFunc,
    {
        extraBooleanFlags = [],
        flagValueFunc,

    } = {}
) => {
    var allBooleanKeys = [key, ...extraBooleanFlags];

    Hooks.on(
        'renderItemSheet',
        (
            /** @type {ItemSheetPF} */ { isEditable, item },
            /** @type {[HTMLElement]} */[html],
            /** @type {unknown} */ _data
        ) => {
            if (!itemFilter(item)) return;

            const hasFlag = allBooleanKeys.every((key) => item.hasItemBooleanFlag(key));
            if (!hasFlag && isEditable) {
                const name = item?.name?.toLowerCase() ?? "";
                const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
                const isItemMatch = isItemFunc(name, item);

                if (isItemMatch || hasCompendiumId) {
                    /** @type {Record<string, any>} */
                    const update = {};
                    allBooleanKeys.forEach((key) => update[`system.flags.boolean.${key}`] = true);
                    try {
                        const flagValues = flagValueFunc ? flagValueFunc(item) : undefined;
                        if (flagValues) {
                            update.flags ||= {}
                            update.flags[MODULE_NAME] ||= {};
                            update.flags[MODULE_NAME] = { ...update.flags[MODULE_NAME], ...flagValues };
                        }
                    }
                    catch (e) {
                        console.error("Shouldn't happen", e);
                    }
                    item.update(update);
                }
                return;
            }

            showInputsFunc(item, html, isEditable);
        }
    );

    /**
     * @param {ItemPF} item
     * @param {object} _data
     * @param {{temporary: boolean}} param2
     * @param {string} id
     */
    const handleOnCreate = (item, _data, { temporary }, id) => {
        if (!itemFilter(item) || temporary) return;

        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        const isItemMatch = isItemFunc(name, item);
        const hasBonus = allBooleanKeys.every((key) => item.hasItemBooleanFlag(key));

        if ((isItemMatch || hasCompendiumId) && !hasBonus) {
            /** @type {Record<string, any>} */
            const update = {};
            allBooleanKeys.forEach((key) => update[`system.flags.boolean.${key}`] = true);
            const flagValues = flagValueFunc ? flagValueFunc(item) : undefined;
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

api.utils.onCreate = onCreate;
api.utils.onRenderCreate = onRenderCreate;
