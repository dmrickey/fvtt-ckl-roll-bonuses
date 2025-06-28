import { MODULE_NAME } from '../consts.mjs';
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { showActorInput } from '../handlebars-handlers/targeted/targets/actor-input.mjs';
import { getSourceFlag } from '../util/get-source-flag.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

export class SoloTactics extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'solo-tactics'; }
    static get alliesKey() { return `${this.key}-allies`; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#solo-tactics'; }

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

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: '10EysX8x5hvz48lr',
            isItemMatchFunc: name => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                showEnabledLabel({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
                showActorInput({
                    item,
                    journal: this.journal,
                    key: this.alliesKey,
                    label: localizeBonusLabel(this.alliesKey),
                    parent: html,
                    tooltip: localizeBonusTooltip(this.alliesKey),
                }, {
                    isSubLabel: true,
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }

    /**
     * @param {ItemPF | ActorPF | TokenPF} doc
     * @param {ItemPF | ActorPF | TokenPF} [ally]
     * @returns {boolean}
     */
    static hasSoloTacticsWith(doc, ally) {
        if (!super.has(doc)) return false;

        /**
         * @param {ItemPF | ActorPF | TokenPF} _doc
         * @returns {ActorPF | undefined}
         */
        const toActor = (_doc) => _doc instanceof pf1.documents.actor.ActorPF
            ? _doc
            : _doc.actor;
        const selfActor = toActor(doc);
        const allyActor = ally && toActor(ally);

        if (!selfActor) return false;

        var solos = selfActor.itemFlags?.boolean[this.key]?.sources ?? [];
        return solos.some((solo) => {
            /** @type {UUID[]} */
            const uuids = getSourceFlag(solo, this.alliesKey) || [];
            return !uuids.length
                || (!!allyActor && uuids.some((uuid) => uuid === allyActor.uuid));
        });
    }
}

// register hint on source ability
registerItemHint((hintcls, _actor, item, _data) => {
    const has = SoloTactics.has(item);
    if (has) {
        return hintcls.create('', [], { hint: SoloTactics.tooltip, icon: 'ra ra-divert' });
    }
});

class Settings {
    static get name() { return LanguageSettings.getTranslation(SoloTactics.key); }

    static {
        LanguageSettings.registerItemNameTranslation(SoloTactics.key);
    }
}
