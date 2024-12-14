import { api } from './api.mjs';

/**
 * @param {string[]} list
 * @param {'and' | 'or'} join
 * @returns {string}
 */
export const listFormat = (list, join) => {
    const formatter = new Intl.ListFormat(game.i18n.lang, {
        style: 'long',
        type: join === 'and' ? 'conjunction' : 'disjunction',
    });
    return formatter.format(list);
};

api.utils.array.listFormat = listFormat;
