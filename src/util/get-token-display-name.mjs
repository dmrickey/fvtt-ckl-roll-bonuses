/**
 * @param {TokenDocumentPF} token
 * @returns {string}
 */
export const getTokenDisplayName = (token) => {
    if (!game.user.isGM) {
        const worldConfig = /** @type {{hideActorNameByDisposition: number, hideActorNameReplacement: boolean }} */
            (/** @type {any} */ game.settings.get('pf1', 'tooltipWorldConfig'));
        const config = actorConfig(token);

        if (config.hideName || token.disposition <= worldConfig.hideActorNameByDisposition) {
            return config.name || worldConfig.hideActorNameReplacement || defaultName();
        }
        else if (config.name) {
            return config.name;
        }
    }

    return token.name;
};

const defaultName = () => game.settings.settings.get('pf1.tooltipWorldConfig').default.hideActorNameReplacement;
const actorConfig = (/** @type{TokenDocumentPF} */token) => token?.actor?.system.details?.tooltip ?? {};
