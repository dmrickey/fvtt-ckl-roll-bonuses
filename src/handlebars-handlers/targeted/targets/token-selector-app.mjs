import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { getTokenDisplayName } from "../../../util/get-token-display-name.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { templates } from "../../templates.mjs";

/** @extends {DocumentSheet<TokenActorSelectorOptions, ItemPF>} */
export class TokenSelectorApp extends DocumentSheet {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.height = 'auto';
        options.template = templates.tokenApp;

        return options;
    }

    get path() { return `flags.${MODULE_NAME}.${this.options.key}`; }

    /**
     * @override
     * @param {JQuery} html
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[type=reset]')?.click(this.close.bind(this));
    }

    /** @override */
    async getData() {
        const item = this.object;
        const templateData = {
            item,
            path: this.path,
            groupedTokens: {},
        };

        /**
         * @param {number} disposition
         * @returns {string}
         */
        const getDispositionLabel = (disposition) =>
            game.i18n.localize('TOKEN.DISPOSITION.' + Object.entries(CONST.TOKEN_DISPOSITIONS).find(([ /** @type{string */_, value]) => value === disposition)?.[0] || '');

        const currentTargetUuids = [...game.user.targets].map(x => x.document.uuid);
        const availableTargets = game.user.viewedScene.tokens
            .filter((token) => token.actor && token.object.isVisible && token.actor.id !== item.actor?.id)
            .map((token) => ({
                id: token.id,
                disposition: token.disposition,
                img: token.texture.src,
                name: getTokenDisplayName(token),
                uuid: token.uuid,
                dispositionLabel: getDispositionLabel(token.disposition),
                checked: currentTargetUuids.includes(token.uuid),
            }));

        availableTargets.sort((a, b) => {
            const first = a.disposition - b.disposition;
            return first
                ? first
                : a.name.localeCompare(b.name);
        });

        const labels = uniqueArray(availableTargets.map(({ dispositionLabel }) => dispositionLabel).filter(truthiness));
        templateData.groupedTokens = labels
            .reduce((acc, curr) => ({ ...acc, [curr]: availableTargets.filter(({ dispositionLabel }) => curr === dispositionLabel) }), {});

        return templateData;
    }

    /**
     * @override
     * @param {any} updateData
     */
    _getSubmitData(updateData) {
        const path = this.path;

        // /** @type {{[key: string]: Nullable<string> | Nullable<string>[]}} */
        // /** @type {Record<string, string | string[]>} */
        const formData = super._getSubmitData(updateData);
        formData[path] = Array.isArray(formData[path])
            ? formData[path]
            : [formData[path]];
        // @ts-ignore
        formData[path] = formData[path].filter(truthiness);

        const submitData = foundry.utils.expandObject(formData);
        return submitData;
    }
}

api.applications.TokenSelectorApp = TokenSelectorApp;
