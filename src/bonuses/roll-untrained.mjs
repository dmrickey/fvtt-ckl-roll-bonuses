import { MODULE_NAME } from '../consts.mjs';
import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { getFlaggedSkillIdsFromActor, getSkillChoices } from '../util/get-skills.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localize, localizeBonusTooltip } from '../util/localize.mjs';
import { onSkillSheetRender } from '../util/on-skill-sheet-render-handler.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

export class RollSkillUntrained extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'roll-untrained'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#roll-skills-untrained'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {SkillId[]} skillIds
     * @returns {Promise<void>}
     */
    static async configure(item, skillIds) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: skillIds } },
        });
    }

    /** @inheritdoc @override @returns {JustRender} */
    static get configuration() {
        return {
            type: 'just-render',
            showInputsFunc: (item, html, isEditable) => {
                const choices = getSkillChoices(item.actor, { isEditable });
                traitInput({
                    choices,
                    hasCustom: false,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(RollSkillUntrained.key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(RollSkillUntrained.key), icon: 'fas fa-book-open' });
    return hint;
});

/**
 * @param {SkillInfo} skillInfo
 * @param {ActorPF} actor
 * @param {RollData} _rollData
 */
function getSkillInfo(skillInfo, actor, _rollData) {
    const ids = getFlaggedSkillIdsFromActor(actor, RollSkillUntrained.key);
    if (!ids.length) return;

    if (ids.includes(skillInfo.id)) {
        skillInfo.rt = false;
    }
}
LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);

onSkillSheetRender({
    key: RollSkillUntrained.key,
    rowCallback: (_id, li) => li.classList.remove('untrained'),
}, {
    classes: () => ['fas', 'fa-book-open', 'ckl-skill-icon'],
    getText: () => localize('skill-sheet.roll-untrained.skill-tip')
});
