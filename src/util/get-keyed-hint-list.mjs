import { listFormat } from './list-format.mjs';
import { toArray } from './to-array.mjs';

/**
 * @param {ArrayOrSelf<string>} current
 * @param {Record<any, string>} choices
 * @param {'and' | 'or'} [combination]
 */
export const getKeyedHintList = (current, choices, combination) => {
    current = toArray(current);

    const values = current.map(x => choices[x] || x);

    return !combination
        ? values.join(', ')
        : listFormat(values, combination);
}
