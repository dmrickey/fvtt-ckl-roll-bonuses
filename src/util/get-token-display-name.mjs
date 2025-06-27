const hovered = [CONST.TOKEN_DISPLAY_MODES.HOVER, CONST.TOKEN_DISPLAY_MODES.ALWAYS];

/**
 * @param {TokenDocumentPF} token
 * @returns {string}
 */
export const getTokenDisplayName = (token) => {
    const tokenName = token.name;
    const actorName = token.actor?.name;

    const name = tokenName === actorName
        ? tokenName
        : `${tokenName} (${actorName})`;

    if (game.user.isGM) {
        return name;
    }

    if (token.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED)) {
        return name;
    }

    if (hovered.includes(token.displayName)) {
        return tokenName;
    }

    return '???';
};
