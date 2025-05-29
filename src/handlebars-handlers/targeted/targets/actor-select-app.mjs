import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localize } from '../../../util/localize.mjs';
import { registerSetting } from '../../../util/settings.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { templates } from "../../templates.mjs";

class Settings {
    static get #actorSettingKey() { return 'allow-friendly-npc-selection'; }
    static get allowFriendlyNpcSelection() { return Settings.#getSetting(this.#actorSettingKey); }
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key); }

    static {
        registerSetting({
            key: this.#actorSettingKey,
            scope: 'world',
            settingType: Boolean,
            defaultValue: false,
        });
    }
}

/**
 * @typedef {object} ActorSelectorOptions
 * @property {string[]} current
 * @property {string} key
 */

/**
 * In the html, all of the classes are "token-..." because it uses the same styles as the token selector app.
 */

// @ts-ignore
/** @extends {DocumentSheet<ActorSelectorOptions, ItemPF>} */
export class ActorSelectorApp extends DocumentSheet {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.classes = ['token-based-list'];
        options.height = 'auto';
        options.template = templates.actorSelectApp;

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

        html.find('.individual-token').each(
            /** @this {HTMLElement} */
            function () {
                const uuid = this.dataset.tokenUuid || '';
                /** @type {ActorPF} */
                const actor = fromUuidSync(uuid);
                if (!actor) return;

                actor.getActiveTokens().forEach((token) => {
                    this.addEventListener('pointerenter', (e) => token._onHoverIn(e, { hoverOutOthers: false }));
                    this.addEventListener('pointerleave', (e) => token._onHoverOut(e));
                });
            });
    }

    /**
     * @typedef {object} SpecficActorSelectTemplateData
     * @property {string} id
     * @property {DispositionLevel} disposition
     * @property {string} img
     * @property {string} name
     * @property {string} uuid
     * @property {boolean} checked
     *
     * @typedef {object} ActorGroupTemplateData
     * @property {string} label
     * @property {SpecficActorSelectTemplateData[]} actors
     *
     * @typedef {object} ActorSelectTemplateData
     * @property {ItemPF} item
     * @property {string} path
     * @property {boolean} isGm
     * @property { ActorGroupTemplateData[]} groupedActors
     */

    /** @override */
    async getData() {
        const item = this.object;
        /** @type {ActorSelectTemplateData} */
        const templateData = {
            item,
            path: this.path,
            isGm: game.user.isGM,
            groupedActors: [],
        };

        /**
         * @param {ActorPF} actor
         * @returns {SpecficActorSelectTemplateData}
         */
        const toTargetData = (actor) => ({
            id: actor.id,
            disposition: actor.prototypeToken.disposition,
            img: actor.thumbnail,
            name: actor.name,
            uuid: actor.uuid,
            checked: this.options.current.includes(actor.uuid),
        });

        const disposition = item.actor?.prototypeToken.disposition ?? CONST.TOKEN_DISPOSITIONS.FRIENDLY
        const friendlyActors = game.actors.filter(x =>
            x.prototypeToken.disposition === disposition
            && x.uuid !== item.actor?.uuid
        );

        const playerActors = friendlyActors.filter(x => x.hasPlayerOwner);
        templateData.groupedActors.push({
            label: localize('applications.actor.players'),
            actors: playerActors.map(toTargetData),
        });

        // uncomment for empty testing
        // templateData.groupedActors.push({
        //     label: 'Empty test actors',
        //     actors: [],
        // });

        const observedActors = friendlyActors
            .filter((a) => game.users.players.some((u) => a.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)))
            .filter((a) => !playerActors.some(x => x.uuid === a.uuid));
        if (observedActors.length) {
            templateData.groupedActors.push({
                label: localize('applications.actor.observed'),
                actors: observedActors.map(toTargetData),
            });
        }

        if (game.user.isGM || Settings.allowFriendlyNpcSelection) {
            const npcs = friendlyActors
                .filter((a) => !playerActors.some(x => x.uuid === a.uuid))
                .filter((a) => !observedActors.some(x => x.uuid === a.uuid));
            templateData.groupedActors.push({
                label: localize('applications.actor.npcs'),
                actors: npcs.map(toTargetData),
            });
        }

        templateData.groupedActors.forEach((group) => group.actors.sort((a, b) => a.name.localeCompare(b.name)));

        return templateData;
    }

    /**
     * @override
     * @param {any} updateData
     */
    _getSubmitData(updateData) {
        const path = this.path;

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

api.applications.ActorSelectorApp = ActorSelectorApp;
