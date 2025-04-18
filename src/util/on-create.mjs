import { itemHasCompendiumId } from './has-compendium-id.mjs';

/**
 * @param {string} compendiumId
 * @param {() => string} defaultName
 * @param {string} key
 */
export const onCreate = (compendiumId, defaultName, key) => {
    /**
     * @param {ItemPF} item
     * @param {object} _data
     * @param {{temporary: boolean}} param2
     * @param {string} id
     */
    const handleOnCreate = (item, _data, { temporary }, id) => {
        if (!(item instanceof pf1.documents.item.ItemPF)) return;
        if (temporary) return;

        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        const hasBonus = item.hasItemBooleanFlag(key);

        if ((name === defaultName() || hasCompendiumId) && !hasBonus) {
            item.updateSource({
                [`system.flags.boolean.${key}`]: true,
            });
        }
    };
    Hooks.on('preCreateItem', handleOnCreate);
}
