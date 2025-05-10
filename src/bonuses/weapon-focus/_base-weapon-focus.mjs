import { SpecificBonus } from '../_specific-bonus.mjs';

export const weaponFocusKey = 'weapon-focus';
export const greaterWeaponFocusKey = 'weapon-focus-greater';
export const mythicWeaponFocusKey = 'weapon-focus-mythic';
export const racialWeaponFocusKey = 'weapon-focus-racial';

export const weaponFocusCompendiumId = 'n250dFlbykAIAg5Z';
export const greaterWeaponFocusCompendiumId = 'IER2MzJrjSvxMlNS';
export const mythicWeaponFocusCompendiumId = 'stJ6Jp1ALN6qgGBr';
export const gnomeWeaponFocusCompendiumId = '8RzIeYtbx0UtXUge';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-focus';

export class WeaponFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return weaponFocusKey; }

    /** @inheritdoc @override */
    static get journal() { return journal; }
}
export class WeaponFocusGreater extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return greaterWeaponFocusKey; }

    /** @inheritdoc @override */
    static get journal() { return journal; }

    /** @inheritdoc @override */
    static get parent() { return WeaponFocus.key; }
}
export class WeaponFocusMythic extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return mythicWeaponFocusKey; }

    /** @inheritdoc @override */
    static get journal() { return journal; }

    /** @inheritdoc @override */
    static get parent() { return WeaponFocus.key; }
}

export class WeaponFocusRacial extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return racialWeaponFocusKey; }

    /** @inheritdoc @override */
    static get journal() { return journal; }
}
