import { SpecificBonus } from '../_specific-bonus.mjs';
import { MODULE_NAME } from '../../consts.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { showActorInput } from '../../handlebars-handlers/targeted/targets/actor-input.mjs';
import { getSourceFlag } from '../../util/get-source-flag.mjs';

export class PackFlanking extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'pack-flanking'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#pack-flanking-(feat)'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} actorUuid
     * @returns {Promise<void>}
     */
    static async configure(item, actorUuid) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: actorUuid } },
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActorPF | TokenPF} doc
     * @param {ItemPF | ActorPF | TokenPF} target
     * @returns {boolean}
     */
    static has(doc, target) {
        if (!super.has(doc)) return false;

        /**
         * @param {ItemPF | ActorPF | TokenPF} _doc
         * @returns {ActorPF | undefined}
         */
        const toActor = (_doc) => _doc instanceof pf1.documents.actor.ActorPF
            ? _doc
            : _doc.actor;
        const selfActor = toActor(doc);
        const targetActor = toActor(target);

        if (!selfActor || !targetActor) return false;

        var packs = selfActor.itemFlags?.boolean[this.key]?.sources ?? [];
        return packs.some((pack) => {
            /** @type {UUID[]} */
            const uuids = getSourceFlag(pack, PackFlanking) || [];
            return uuids.some((uuid) => uuid === targetActor.uuid)
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'TGUFjwD7G8iBPRXc',
            isItemMatchFunc: name => name.includes(Settings.name),
            showInputsFunc: (item, html, isEditable) => {
                showActorInput({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                });
            },
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(PackFlanking.key); }

    static {
        LanguageSettings.registerItemNameTranslation(PackFlanking.key);
    }
}
