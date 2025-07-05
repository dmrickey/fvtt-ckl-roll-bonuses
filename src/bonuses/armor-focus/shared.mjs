import { intersects } from '../../util/array-intersects.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusLabel } from '../../util/localize.mjs';
import { ArmorFocus } from './armor-focus.mjs';
import { ArmorFocusImproved } from './improved-armor-focus.mjs';

// register hint on focused item
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemEquipmentPF) || !actor) return;

    const isArmor = item.isActive && item.system.slot === 'armor';
    const baseTypes = item.system.baseTypes;
    if (!baseTypes?.length) return;

    const armorFocuses = ArmorFocus.getFocusedArmor(actor);
    const improvedFocuses = ArmorFocusImproved.getImprovedFocusedArmor(actor);
    const isFocused = intersects(armorFocuses, baseTypes);
    const isImprovedFocus = intersects(improvedFocuses, baseTypes);

    if (isArmor && isFocused) {
        const tips = [localizeBonusLabel(ArmorFocus.key), localize('ac-mod', { mod: '+1' })];
        if (isImprovedFocus) {
            tips.push('', localizeBonusLabel(ArmorFocusImproved.key), localize('acp-mod', { mod: -1 }));
        }
        const hint = hintcls.create('', [], { icon: 'ra ra-helmet', hint: tips.join('\n') });
        return hint;
    }
});