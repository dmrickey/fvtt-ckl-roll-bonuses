import { MODULE_NAME } from "../../../consts.mjs";
import { localize } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @param {TokenPF} token
 * @returns {string}
 */
const getDisplayName = (token) => {
    return token.displayName === 30 || token.permission > 0
        ? token.name
        : '???';
};

/**
 * @param {object} args
 * @param {ItemPF} args.item,
 * @param {string} args.key,
 * @param {string} args.label,
 * @param {HTMLElement} args.parent
 */
export function showTokenInput({
    item,
    key,
    label,
    parent,
}) {
    /** @type {string[]} */
    const savedTargets = item.getFlag(MODULE_NAME, key) || [];
    const current = savedTargets
        .map((uuid) => fromUuidSync(uuid))
        .filter(truthiness)
        .map((token) => ({
            img: token.texture.src,
            name: getDisplayName(token),
            id: token.id,
        }));

    const availableTargets = game.scenes.active.tokens
        .filter((token) => token.visible && token.actor.id !== item.actor.id)
        .map((token) => ({
            id: token.id,
            disposition: token.disposition,
            img: token.texture.src,
            name: getDisplayName(token),
            uuid: token.uuid,
        }));

    const templateData = {
        label,
        current,
    };
    const div = createTemplate(templates.editableIcons, templateData);

    div.querySelectorAll('li,a').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const options = {
                availableTargets,
                path: `flags.${MODULE_NAME}.${key}`,
            };
            new TokenActorSelector(item, options).render(true);
        });
    });

    addNodeToRollBonus(parent, div);
}


/** @extends {DocumentSheet<TokenActorSelectorOptions, ItemPF>} */
class TokenActorSelector extends DocumentSheet {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.height = 'auto';
        options.template = templates.tokenApp;
        options.title = localize('token-app.title');

        return options;
    }

    /** @override */
    async getData() {
        /** @type {{ item: ItemPF, path: string, groupedTokens: {[key: string]: TokenActorSelectorOptions['availableTargets'][]} }} */
        const templateData = {
            item: this.object,
            path: this.options.path,
            groupedTokens: {},
        };

        /**
         * @param {number} disposition
         * @returns {string}
         */
        const getDispositionLabel = (disposition) =>
            game.i18n.localize('TOKEN.DISPOSITION.' + Object.entries(CONST.TOKEN_DISPOSITIONS).find(([ /** @type{string */_, value]) => value === disposition)?.[0] || '');

        const availableTargets = this.options.availableTargets;
        const currentTargetUuids = [...game.user.targets].map(x => x.document.uuid);
        availableTargets.forEach((target) => {
            target.checked = currentTargetUuids.includes(target.uuid);
            target.dispositionLabel = getDispositionLabel(target.disposition);
        });

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

    /** @override */
    _getSubmitData(updateData) {
        const path = this.options.path;

        // /** @type {{[key: string]: Nullable<string> | Nullable<string>[]}} */
        // /** @type {Record<string, string | string[]>} */
        const formData = super._getSubmitData(updateData);
        formData[path] = Array.isArray(formData[path])
            ? formData[path]
            : [formData[path]];
        formData[path] = formData[path].filter(truthiness);

        const submitData = foundry.utils.expandObject(formData);
        return submitData;
    }
}
