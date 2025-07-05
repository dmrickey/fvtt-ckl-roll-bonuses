import { MODULE_NAME } from '../consts.mjs';
import { api } from './api.mjs';
import { itemHasCompendiumId } from './has-compendium-id.mjs';

/**
 * @param {string} compendiumId
 * @param {() => string} defaultName
 * @param {object} options
 * @param {string | string[]} [options.booleanKeys]
 * @param {Record<string, any>} [options.flagValues]
 * @param {(item: ItemPF) => boolean} [options.ignoreFunc]
 */
export const onCreate = (
    compendiumId,
    defaultName,
    {
        booleanKeys = [],
        flagValues = undefined,
        ignoreFunc = () => false,
    }
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
        if (ignoreFunc(item)) return;

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
 * @param {string} key
 * @param {string} compendiumId
 * @param {(name: string, item?: ItemPF) => boolean} isItemFunc
 * @param {object} [options]
 * @param {(item: ItemPF, html: HTMLElement, isEditable: boolean) => void} [options.showInputsFunc]
 * @param {string[]} [options.extraBooleanFlags]
 * @param {(item: ItemPF) => Record<string, any> | undefined} [options.defaultFlagValuesFunc]
 * @param {(item: ItemPF) => boolean} [options.ignoreFunc]
 */
export const onRenderCreate = (
    key,
    compendiumId,
    isItemFunc,
    {
        showInputsFunc,
        extraBooleanFlags = [],
        defaultFlagValuesFunc,
        ignoreFunc = () => false,
    } = {}
) => {
    Hooks.on(
        'renderItemSheet',
        (
            /** @type {ItemSheetPF} */ { isEditable, item },
            /** @type {[HTMLElement]} */[html],
            /** @type {unknown} */ _data
        ) => {
            if (!(item instanceof pf1.documents.item.ItemPF)) return;

            const allBooleanKeys = [key, ...extraBooleanFlags];
            const hasFlag = allBooleanKeys.every((k) => item.hasItemBooleanFlag(k));
            if (!hasFlag) {
                if (isEditable && !ignoreFunc(item)) {
                    const name = item?.name?.toLowerCase() ?? "";
                    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
                    const isItemMatch = isItemFunc(name, item);

                    if (isItemMatch || hasCompendiumId) {
                        /** @type {Record<string, any>} */
                        const update = {};
                        allBooleanKeys.forEach((k) => update[`system.flags.boolean.${k}`] = true);
                        try {
                            const flagValues = defaultFlagValuesFunc?.(item);
                            if (flagValues) {
                                update.flags ||= {}
                                update.flags[MODULE_NAME] ||= {};
                                update.flags[MODULE_NAME] = { ...update.flags[MODULE_NAME], ...flagValues };
                            }
                        }
                        catch (e) {
                            console.error("unexpected error looking up default flag values on item", item, e);
                        }
                        item.update(update);
                    }
                }

                return;
            }

            showInputsFunc?.(item, html, isEditable);
        }
    );

    /**
     * @param {ItemPF} item
     * @param {object} _data
     * @param {{temporary: boolean}} param2
     * @param {string} id
     */
    const handleOnCreate = (item, _data, { temporary }, id) => {
        if (!(item instanceof pf1.documents.item.ItemPF)) return;
        if (temporary) return;
        if (ignoreFunc(item)) return;

        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        const isItemMatch = isItemFunc(name, item);
        const allBooleanKeys = [key, ...extraBooleanFlags];
        const hasBonus = allBooleanKeys.every((k) => item.hasItemBooleanFlag(k));

        if ((isItemMatch || hasCompendiumId) && !hasBonus) {
            /** @type {Record<string, any>} */
            const update = {};
            allBooleanKeys.forEach((k) => update[`system.flags.boolean.${k}`] = true);
            try {
                const flagValues = defaultFlagValuesFunc?.(item);
                if (flagValues) {
                    update.flags ||= {}
                    update.flags[MODULE_NAME] ||= {};
                    update.flags[MODULE_NAME] = { ...update.flags[MODULE_NAME], ...flagValues };
                }
            }
            catch (e) {
                console.error("unexpected error looking up default flag values on item", item, e);
            }
            item.updateSource(update);
        }
    };
    Hooks.on('preCreateItem', handleOnCreate);
}

api.utils.onCreate = onCreate;
api.utils.onRenderCreate = onRenderCreate;
