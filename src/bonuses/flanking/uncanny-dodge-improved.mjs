import { errorMessage } from '../../handlebars-handlers/bonus-inputs/error-message.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { api } from '../../util/api.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize } from '../../util/localize.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';

const rogueClasses = ['rogue', 'rogueUnchained'];
api.config.rogueClasses = rogueClasses;

export class UncannyDodgeImproved extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'uncanny-dodge-improved'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#improved-uncanny-dodge-(class-ability)'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'ZfnHhhTFQVo0Lj4P',
            isItemMatchFunc: name => LanguageSettings.isImproved(name, Settings.name),
            showInputsFunc: (item, html, isEditable) => {
                const isProperItem = item instanceof pf1.documents.item.ItemFeatPF
                    && item.system.subType === 'classFeat';
                const hasClass = !!item.system.class;

                if (isProperItem && hasClass) {
                    showEnabledLabel({
                        item,
                        journal: this.journal,
                        key: this.key,
                        parent: html,
                    }, {
                        canEdit: isEditable,
                        inputType: 'specific-bonus',
                    });
                }
                else if (!hasClass) {
                    errorMessage({
                        item,
                        journal: this.journal,
                        key: this.key,
                        errorMsg: localize('invalid-uncanny-dodge-class'),
                        parent: html,
                    }, {
                        canEdit: isEditable,
                        inputType: 'specific-bonus',
                    })
                }
                else {
                    errorMessage({
                        item,
                        journal: this.journal,
                        key: this.key,
                        errorMsg: localize('invalid-uncanny-dodge-item'),
                        parent: html,
                    }, {
                        canEdit: isEditable,
                        inputType: 'specific-bonus',
                    })
                }
            },
        };
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActorPF | TokenPF} doc
     * @returns {boolean}
     */
    static has(doc) {
        let has = super.has(doc);
        if (doc instanceof pf1.documents.item.ItemFeatPF) {
            has &&= doc.system.subType === 'classFeat';
            has &&= !!doc.system.class;
        }
        return has;
    }

    /**
     * @param {TokenPF | ActorPF} target
     * @param {TokenPF | ActorPF} attacker
     * @returns {boolean}
     */
    static isImmuneToFlank(target, attacker) {
        target = target instanceof pf1.canvas.TokenPF
            ? target.actor
            : target;
        attacker = attacker instanceof pf1.canvas.TokenPF
            ? attacker.actor
            : attacker;
        if (!target || !attacker || !this.has(target)) return false;

        /** @param {ActorPF} actor @returns {number} */
        const getDodgeLevel = (actor) => {
            const dodgeClasses = (actor.itemFlags?.boolean[this.key]?.sources ?? [])
                .filter((item) => this.has(item))
                .map((item) => item.system.class)
                .filter(truthiness);
            const classes = [...api.config.rogueClasses, ...dodgeClasses];
            const sum = classes
                .map((classTag) => actor.itemTypes.class.getId(classTag))
                .filter(truthiness)
                .map((classItem) => classItem.system.level || 0)
                .reduce((acc, curr) => acc + curr, 0);
            return sum;
        };

        const attackerDodgeLevel = getDodgeLevel(attacker);
        const targetDodgeLevel = getDodgeLevel(target);

        return !!targetDodgeLevel && attackerDodgeLevel - 4 < targetDodgeLevel;
    }
}

// register hint on source ability
registerItemHint((hintcls, _actor, item, _data) => {
    const has = UncannyDodgeImproved.has(item);
    if (has) {
        return hintcls.create('', [], { hint: UncannyDodgeImproved.tooltip, icon: 'ra ra-player-dodge' });
    }

    if (item.hasItemBooleanFlag(UncannyDodgeImproved.key)) {
        return hintcls.create(UncannyDodgeImproved.label, ['error'], { hint: localize('warning.uncanny-dodge-improved') });
    }
});

class Settings {
    static get name() { return LanguageSettings.getTranslation('uncanny-dodge'); }

    static {
        LanguageSettings.registerItemNameTranslation('uncanny-dodge');
    }
}
