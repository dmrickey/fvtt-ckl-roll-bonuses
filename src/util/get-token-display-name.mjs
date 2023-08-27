/**
 * @param {TokenPF} token
 * @returns {string}
 */
export const getTokenDisplayName = (token) => {
    return token.displayName === 30 || token.permission > 0
        ? token.name
        : '???';
};
