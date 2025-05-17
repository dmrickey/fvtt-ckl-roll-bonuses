import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
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
                const actor = fromUuidSync(uuid)?.object;
                if (!actor) return;

                this.addEventListener('pointerenter', (e) => actor._onHoverIn(e, { hoverOutOthers: false }));
                this.addEventListener('pointerleave', (e) => actor._onHoverOut(e));
            });
    }

    /** @override */
    async getData() {
        const item = this.object;
        const templateData = {
            item,
            path: this.path,
            isGm: game.user.isGM,
            groupedActors: {},
        };

        /** @param {ActorPF} actor */
        const toTargetData = (actor) => ({
            id: actor.id,
            disposition: actor.prototypeToken.disposition,
            img: actor.thumbnail,
            name: actor.name,
            uuid: actor.uuid,
            checked: false,
        });

        const disposition = item.actor?.prototypeToken.disposition ?? CONST.TOKEN_DISPOSITIONS.FRIENDLY
        const allActors = game.actors.filter(x => x.prototypeToken.disposition === disposition);

        // const playerActors = game.actors
        //     .filter((actor) => Object.entries(actor.ownership)
        //         .filter(([id, _ownership]) => game.user.isGM || !(game.users.get(id) && game.users.get(id)?.isGM))
        //         .some(([_id, ownership]) => ownership >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)
        //     )
        //     .filter(x => x.uuid !== item.actor?.uuid);

        const playerActors = game.actors
            .filter((a) => game.users
                .filter(u => game.user.isGM || !u.isGM)
                .some(u => a.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER))
            )
            .filter(x => x.uuid !== item.actor?.uuid);

        // const playerCharacters = game.users
        //     .map((user) => user.character)
        //     .filter(truthiness)
        //     .filter(x => x.uuid !== item.actor?.uuid);

        if (game.user.isGM) {
            templateData.groupedActors = {
                ['Friendly Actors']: playerActors.map(toTargetData),
            };
        }
        else {
            // handle player characters when players can't see NPCs
        }
        // else {
        //     // handle player characters when players can also see NPCs
        //     if (game.user.isGM || Settings.allowFriendlyNpcSelection) {
        //         const characterIds = playerActors.map(x => x.uuid);
        //         const npcs = allActors
        //         .filter((actor) => !characterIds.includes(actor.uuid))
        //         .filter(x => x.uuid !== item.actor?.uuid);
        //         // @ts-ignore
        //         templateData.groupedActors['Friendly NPCs'] = npcs.map(toTargetData);
        //     }
        // }

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

api.applications.ActorSelectorApp = ActorSelectorApp;
