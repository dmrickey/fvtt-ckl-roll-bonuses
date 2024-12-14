# Roll Bonuses

# This documentation is no longer kept up to date. All documentation can be found in the in-game compendium included with this mod.

Provides bonuses to various types of rolls. Some of these are for variable changes that the system can't handle (like Inspiration). Some are a fake implementation of changes that the system just doesn't support. All configuration is done in the Feat's Advanced Tab (or buff, class feature, etc.). Support for Mana's mod [Item Hints](https://gitlab.com/koboldworks/pf1/item-hints) has been included so that things are automatically tagged in the character sheet.

Supports PF1 v9+

### Table of contents

- [This documentation is no longer kept up to date. All documentation can be found in the in-game compendium included with this mod.](#this-documentation-is-no-longer-kept-up-to-date-all-documentation-can-be-found-in-the-in-game-compendium-included-with-this-mod)
    - [Table of contents](#table-of-contents)
- [Class Features](#class-features)
  - [Versatile Performance](#versatile-performance)
- [Generic Targets](#generic-targets)
  - [Alignment Target](#alignment-target)
  - [All](#all)
  - [Finesse](#finesse)
  - [Item Target](#item-target)
  - [Item Type Target](#item-type-target)
  - [Self Target](#self-target)
  - [Spell Target](#spell-target)
  - [Token Target](#token-target)
  - [Weapon Group Target](#weapon-group-target)
  - [Weapon Target](#weapon-target)
  - [Weapon Type Target](#weapon-type-target)
- [Generic Bonuses](#generic-bonuses)
  - [Agile](#agile)
  - [Attack Bonus](#attack-bonus)
  - [Critical Bonuses](#critical-bonuses)
  - [Damage Bonus](#damage-bonus)
  - [Effective Size Bonus](#effective-size-bonus)
  - [Finesse](#finesse-1)
  - [Fortune/Misfortune](#fortunemisfortune)
- [Targeted Bonus Examples](#targeted-bonus-examples)
    - [Fighter Weapon Training](#fighter-weapon-training)
    - [Gunslinginer Gun Training](#gunslinginer-gun-training)
    - [Lead Blades, Gravity Bow, Strong Jaw, and Impact Weapon](#lead-blades-gravity-bow-strong-jaw-and-impact-weapon)
    - [Magus Arcane Weapon Enhcancement](#magus-arcane-weapon-enhcancement)
    - [Paladin Smite](#paladin-smite)
    - [Slayer's Studied Target](#slayers-studied-target)
    - [Unchained Rogue's Finesse Training](#unchained-rogues-finesse-training)
- [Feats](#feats)
  - [Armor Focus](#armor-focus)
    - [Armor Focus](#armor-focus-1)
    - [Improved Armor Focus](#improved-armor-focus)
  - [Elemental Focus](#elemental-focus)
  - [Furious Focus](#furious-focus)
  - [Martial Focus](#martial-focus)
  - [Spell Focus](#spell-focus)
  - [Spell Specialization](#spell-specialization)
  - [Weapon Focus](#weapon-focus)
    - [Weapon Focus](#weapon-focus-1)
    - [Greater Weapon Focus](#greater-weapon-focus)
    - [Mythic Weapon Focus](#mythic-weapon-focus)
    - [Racial Weapon Focus](#racial-weapon-focus)
  - [Weapon Specialization](#weapon-specialization)
    - [Weapon Specialization](#weapon-specialization-1)
    - [Greater Weapon Specialization](#greater-weapon-specialization)
- [Misc](#misc)
  - [Ammunition](#ammunition)
  - [Change Offset](#change-offset)
  - [Fate's Favored](#fates-favored)
  - [Fortune and Misfortune](#fortune-and-misfortune)
    - [Everything](#everything)
    - [Only for the Item that has the flag](#only-for-the-item-that-has-the-flag)
    - [Ability Checks](#ability-checks)
    - [Attacks](#attacks)
    - [Base Attack Bonus](#base-attack-bonus)
    - [Caster Level Checks](#caster-level-checks)
    - [Combat Maneuver Checks](#combat-maneuver-checks)
    - [Concentration Checks](#concentration-checks)
    - [Initiative Checks](#initiative-checks)
    - [Saving Throws](#saving-throws)
    - [Skill Checks](#skill-checks)
  - [Skill Bonuses (Almost entirely uneccesary because of v9 updates. May be removed at some point)](#skill-bonuses-almost-entirely-uneccesary-because-of-v9-updates-may-be-removed-at-some-point)
- [Spells](#spells)
  - [Modify Spell Caster Level for specific element](#modify-spell-caster-level-for-specific-element)
    - [For Specific Element](#for-specific-element)
  - [Modify Spell DC for specific element](#modify-spell-dc-for-specific-element)
    - [For Specific Element](#for-specific-element-1)

---

# Class Features

## Versatile Performance
Choose your perform. Choose the two skills it replaces. Whenever you roll those skills they'll automatically use your perform skill.

<details>
  <summary>How to configure Versatile PerformanceFocus (click to expand)</summary>

  - The input will automatically be added for any ability named `Versatile Performance`
    - This is configurable in the settings for different translations
    - If it doesn't show up (or you want to use this on a different ability), you can add the dictionary flag `versatile-performance` and the inputs will automatically be added
      - due to its complexity, the inputs will not show up if you're viewing the item from the 
  - To configure
    - choose the perform skill you want to use in the first input
    - choose the two skills in the next two inputs
  - This adds a music note icon in the skills list next to the skills that are replaced
    - You can click on the music note to disable the "perform override" and roll the skill normally. Clicking again resumes the versatile performance functionality.

![image](https://github.com/dmrickey/fvtt-ckl-roll-bonuses/assets/3664822/d6ad8b53-6d02-45b3-88b5-504678a0d563)
![image](https://github.com/dmrickey/fvtt-ckl-roll-bonuses/assets/3664822/3e1b7e9f-8a59-4c35-8219-12478445d598)

</details>

---

# Generic Targets
This is a system for pairing bonuses (see [Generic Bonuses](#generic-bonuses)) with different targets. There are various categories of targets. You can combine multiple targets, then each buff will apply to Items that match all of those targets. E.g. you can combine "Weapon Group - Hammers" but also include "Weapon - _My Custom Sword +1_"  and then you'd get the chosen bonus for all hammers and your custom sword. You could even add in "Weapon Type - Dagger" to target all your daggers. And maybe even "Spell - Fireball".

If you combine multiple targets, then the Item/Action being used must match all targets. For example, if you target both "Weapon Group - Natural" and "Is Ranged" then the bonus will apply only to ranged natural weapons. If you combine "Is Melee" and "Is Weapon" then you'll get a bonus to all melee attacks--but not spells or combat maneuvers.

## Alignment Target
This will make any [Generic Bonuses](#generic-bonuses) kick in only when the action is being used while a token with the specific alignment is targeted (targeted via "T" (foundry default button) with crosshairs -- not "selected" which means the token simply has a selected border). Use with `target_alignment`.

## All
This will make any [Generic Bonuses](#generic-bonuses) configured on this Item apply to any Action that they are able to. Use with `target_all`. 

## Finesse
This will make any [Generic Bonuses](#generic-bonuses) configured on this Item apply to any finesse-able attacks. Configure with the boolean flag `target_finesse` This is intended for use alongside the Weapon Finesse feat. For any Item to be considered finesse-able, it needs to fulfill at least one of the following three criteria
- it must be a weapon that has the `Finesse` Weapon property checked on the weapon's details tab
- it must be an attack or a weapon that has the Natural weapon group selected
- it must have its own boolean flag `finesse-override`
  - this last case is to cover "Attacks" that are made from weapons. Once an Attack has been created from a weapon, it no longer has a "Finesse" weapon property available to it as the PF1 system has those reserved purely for Weapons and no other Item types.

## Item Target
An "Item" within Foundry basically means anything that you can drag onto your character sheet. So as far as Foundry is concerned, an Item can your class, spell, feat, trait, buff, attack, weapon, inventory item, etc. This target will let you choose any of those items that are configured to have an action (because only actions are rolled and can have roll bonuses). To configure add a boolean flag `target_item` and the input will show up below.

## Item Type Target
These will apply [Generic Bonuses](#generic-bonuses) to Actions that are configured for specific kinds of attacks.
- `target_is-melee` will target melee weapons, spells, and combat maneuvers
- `target_is-ranged` will target ranged weapons, spells, combat maneuvers, and thrown weapons (thrown is only avilable in pf1 v10)
- `target_is-spell` will target spells
- `target_is-weapon` will target weapon attacks

## Self Target
Any [Generic Bonuses](#generic-bonuses) defined on this item will only apply to rolls made with this item. This is most useful for for [Fortune/Misfortune](#fortunemisfortune) as that cant' be done on the item itself. But it can also be used for extra [damage](#damage-bonus) or an [effective size bonus](#effective-size-bonus) (or any other bonus) if you don't want to modify the formulas on the weapon itself. Use with boolean flag `target_self`.

## Spell Target
Exactly like [Item Target](#item-target) but filtered to show only Spells. Use with boolean flag `target_spell`.

## Token Target
This makes it so any [Generic Bonus](#generic-bonuses) are only enabled when the specified tokens are targeted (targeted via "T" (foundry default button) with crosshairs -- not "selected" which means the token simply has a selected border). It is configured by adding the `target_token` boolean flag. This is primarily useful for buffs that have a short duration and conditional targeting -- abilities like a Paladin's Smite, Cavalier's Challenge, or a Slayer's Studied Target. After setting the target, whenever an ability is used while the token is targeted, then it will be rolled with the specified bonus.

Whenever a buff (or other ability with this configured) is activated, a dialog will pop up letting you select your target from all visible tokens (for the GM this will include not-visible tokens, for the players it will not). By default, any tokens you currently have targeted will be preselected and you can verify and hit ok. There is a client setting that will skip this dialog if you already have tokens selected and it will just assume your current targets are your desired targets--while this setting is enabled, if you have no targets the dialog will still open.

## Weapon Group Target
This allows you to target specific Weapon Groups. All weapon groups are available to choose from, plus any custom weapon groups defined on anything in your inventory. Use with boolean flag `target_weapon-group`

## Weapon Target
Exactly like [Item Target](#item-target) but filtered to show only Attacks and Weapons. Use with boolean flag `target_weapon`. Any weapons targeted will automatically include any attacks created from that weapon.

## Weapon Type Target
This allows you to target specific Weapon Types. When choosing a type, it looks through all Attacks/Weapons in your inventory and presents those choices to you. The Attacks/Weapons must have their `Equipment Base Types` filled out (this is new in PF1 v9). Use with boolean flag `target_weapon-type`

---

# Generic Bonuses
Paired with targets above (see [Generic Targets](#generic-targets)), will grant your chosen targets the specified bonuses.

## Agile
Automatically makes targeted attacks use Dex instead of Str for damage rolls. Use with boolean flag `bonus_agile`.

## Attack Bonus
Give a flat value or a formula to increase the target's attack roll. Use with boolean flag `bonus_attack`.

## Critical Bonuses
This comes with three different options. Keen, Critical Range Modifier, and Critical Multiplier Modifier. Keen will double the threat range of the target. The range modifier will allow you to increase or decrease the range modifier (useful for homebrew or 3.5 adaptations), or increase the critical multiplier (useful for abilities such as a Swashbuckler's level 20 ability). Use with boolean flag `bonus_crit`. Multiple buffs affecting crit do work together, however the Item Hints will look a bit weird--but the resulting roll will be using the correct total. _This handles everything already done by [Critical Helpers](#critical-helpers) but allows for better fine-tuning. At this point there's no reason to use critical helpers_.

## Damage Bonus
Input multiple damage formula (including types) to increase the target's damage. Use with boolean flag `bonus_damage`.

## Effective Size Bonus
Increase the value used by any `sizeRoll` formula in the target (typically in the damage formula). Use with boolean flag `bonus_effective-size`. This is useful for spells like Gravity Bow, Lead Blades, Strong Jaw, temporarily granting the Impact quality to a specific weapon, etc.

## Finesse
Automatically makes targeted attacks use Dex instead of Str for attack rolls. Use with boolean flag `bonus_finesse`.

## Fortune/Misfortune
Applies a fortune effect (`2d20kh`) (or misfortune (`2d20kl`)) to the [targeted](#generic-targets) actions. This will only work for actions, but not for generic abilities such as skills, ability checks, etc. If you need a fortune effect for _everything_ or a _specific type of roll that can't be targeted_, then use the non-targeted [Fortune and Misfortune](#fortune-and-misfortune) option.

---
 
# Targeted Bonus Examples
- [Fighter Weapon Training](#fighter-weapon-training)
- [Gunslinginer Gun Training](#gunslinginer-gun-training)
- [Lead Blades, Gravity Bow, Strong Jaw, and Impact Weapon](#lead-blades-gravity-bow-strong-jaw-and-impact-weapon)
- [Magus Arcane Weapon Enhcancement](#magus-arcane-weapon-enhcancement)
- [Paladin Smite](#paladin-smite)
- [Slayer's Studied Target](#slayers-studied-target)
- [Unchained Rogue's Finesse Training](#unchained-rogues-finesse-training)

### Fighter Weapon Training

<details>
  <summary>How to configure Fighter Weapon Training (click to expand)</summary>

  - To configure the feature add the boolean flags `target_weapon-group`, `bonus_attack`, and `bonus_damage`. You'll need a new feature for each tier so you can appropriately target each separate weapon group with the appropriate bonus.
  - Damage/Attack
    - If you don't use Advanced Weapon Training (which keeps your attack/damage bonuses from improving) then your formula is `max(0, floor((@classes.fighter.level - 1) / 4))` for your first tier. This formula will keep improving as you level up. For your second tier you can use the same formula but subtract 1, then for your third subtract 2, etc. You can also just use plain numbers - but you'll have to update those as you level up.
  - For your weapon group simply hit the edit button and select your group

![image](https://github.com/dmrickey/fvtt-ckl-roll-bonuses/assets/3664822/369e808e-ce8e-4006-a73c-5358a27784ea)

</details>

---

### Gunslinginer Gun Training

<details>
  <summary>How to configure Gunslinginer Gun Training (click to expand)</summary>

  - To configure the feature add the boolean flags `target_weapon-type`, and `bonus_damage`. Unlike fighter weapon training, because the bonus is the same, you can use a single feature for this.
  - Damage formula is `@abilities.dex.mod`
  - For your Weapon Type simply hit the edit button and select your type -- you will have to have an Attack/Weapon on your actor with the appropriate `Equipment Base Types` filled out (this is new in PF1 v9). You can select multiple types for when you level up.

</details>

---

### Lead Blades, Gravity Bow, Strong Jaw, and Impact Weapon

<details>
    <summary>How to configure</summary>

  These buffs are a combination of [Effective Size Bonus](#effective-size-bonus) and [Item Type Target](#item-type-target).
  - Bonus
    - Add the flag `bonus_effective-size` ans set the formula to `1` (use `2` for Strong Jaw)
  - Target - use one of the following depending on which buff you're creating.
    - For Lead Blades, add the target flags `target_is-melee` and `target_is-weapon`
    - For Gravity Bow, add the target flags `target_is-ranged` and `target_is-weapon`
    - For Strong Jaw, add the target flag `target_weapon-group` and choose the group `natural`
    - Impact Weapon is a bit different, you'll probably want to use [Weapon Target](#weapon-target) to target a specific weapon. Or [Self Target](#self-target) if you're putting the bonus on the item itself and don't want to change the default formula.

</details>

### Magus Arcane Weapon Enhcancement

<details>
  <summary>How to configure Magus Arcane Weapon Enhcancement (click to expand)</summary>

  - Create a buff with the boolean flags `target_weapon`, plus `bonus_attack`/`bonus_damage` (one or both as appropriate).
    - Be sure to set the buff to appropriately time out after 1 minute.
  - Input any number of damage formulas (for Flaming, Frost, Shock, etc). Or a static number if you're increasing your enhancement bonus (the bonus will not specifically be typed as enhancement though)
  - For your weapon, hit the edit button and select your specific weapon from the list.
  - If you often use different weapon abilities, then I suggest configuring multiple buffs and just enabling the correct one instead of reconfiguring a single buff every time you use it.

![image](https://github.com/dmrickey/fvtt-ckl-roll-bonuses/assets/3664822/433025ee-cfbd-4b61-a1d1-76c07fb48e47)

</details>

### Paladin Smite

<details>
  <summary>How to configure Paladin Smite (click to expand)</summary>

  - Create a buff with the boolean flags `target_token`, `bonus_attack`, and `bonus_damage`.
    - attack bonus: `@abilities.cha.mod`
    - damage bonus: `@classes.paladin.level`
    - caveat - there is currently no way to automate the "double damage on first attack" against certain foes. If that ever changes, this will be updated to reflect that.

</details>

### Slayer's Studied Target

<details>
  <summary>How to configure Slayer's Studied Target (click to expand)</summary>

  - Create a buff with the boolean flags `target_token`, `bonus_attack`, and `bonus_damage`.
    - attack/damage bonus: `1 + floor(@classes.slayer.level / 5)`

</details>

### Unchained Rogue's Finesse Training

<details>Unchained Rogue's Finesse Training's Studied Target (click to expand)</summary>

  - This is a combination of [Agile](#agile) (`bonus_agile`) and [Weapon Type Target](#weapon-type-target) (`target_weapon-type`)
    - Don't forget that to correctly configure the weapon type target, the weapon you want to use must be configured with a `Base Equipment Type`

</details>

---
 
# Feats

## Armor Focus 
Increase the AC of your chosen armor type by +1 (`Armor Focus`) and additionally decrease the ACP by 1 (`Improved Armor Focus`).
 
<details>
  <summary>How to configure Armor Focus (click to expand)</summary>

  ### Armor Focus
  Adds +1 AC to hit to the chosen armor type.
  - Will automatically include the select input in the feat advanced tab if the feat is named `Weapon Focus`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `armor-focus` to the feat (or any other Item)
  - The choices are auto populated based on what Armor belong to the actor
    - The Armor must have its `Equipment Base Types` filled out (this is new in PF1 v9)
    - If you know exactly what base type you're looking for, you can fill it into the dictionary flag value directly

  ### Improved Armor Focus
  Reduced ACP by 1 for the chosen armor type
  - Will automatically include the select input in the feat advanced tab if the feat name includes both `Armor Focus` and `Improved`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `improved-armor-focus` to the feat (or any other Item)
    - The choices will be based off of any other `Armor Focus` feats you already have configured.
  
</details>

---

## Elemental Focus
Increase the DC by +1 of any spell you're casting for a specific element.

<details>
  <summary>How to customize Elemental Focus (click to expand)</summary>

  - Follows the same basic setup as [Spell Focus](#spell-focus).
  - You can manually configure it by setting a dictionary flag on the feat with a key of `elementalFocus`, `greaterElementalFocus`, or `mythicElementalFocus` and the mod will automatically add the inputs for you below the dictionary flags section.
  - The accepted values are `acid`, `cold`, `electric`, or `fire`.
  - The damage for the spell you're casting must be configured using one of the system's predefined types.

</details>

---

## Furious Focus
Negate the Power Attack penalty for the first attack of each round.

<details>
  <summary>How to enable Furious Focus (click to expand)</summary>

  - Add the boolean flag `furious-focus`. This should be detected automatically the first time you go into the feat to edit it--if it is not then you can manually add the flag.
  - This only works once each round. If your GM is not advancing game time (happens automatically when advancing rounds in combat), then the penalty will not be taken away with following power attacks.

</details>

---

## Martial Focus
Automatically increase damage by +1 for any weapon in the chosen weapon group.

<details>
  <summary>How to configure Martial Focus (click to expand)</summary>

  - Will automatically include the select input in the feat advanced tab if the feat is named `Martial Focus`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `martial-focus` to the feat (or any other Item)
  - The choices are auto populated based on what Attacks and Weapons belong to the actor
    - The Attacks/Weapons must have their `Weapon Groups` filled out (this is new in PF1 v9)
  - It will also include any custom weapon groups found on any attack or weapon within the actor's inventory.

</details>

---

## Spell Focus

Spell Focus, Greater Spell Focus, and Mythic Spell Focus now all have a drop down on the advanced tab that lets you select a school. When you cast a spell of that school, the DC will automatically be increased.

<details>
  <summary>How to configure Spell Focus (click to expand)</summary>

  - The feat name has to match the mod configuration (already set up to match the expected English feat names) _*or*_ if it's one of those two feats added to your character sheet from the compendium (it doesn't matter if it's been renamed if it was added from a compendium).
    - If the drop down doesn't show up because the name does not exactly match, or some other reason, you can still add a dictionary flag with the name `spellFocus`/`greaterSpellFocus` and the mod will automatically add the inputs for you below the dictionary flags section.
    - Also handles Mythic Spell Focus, if the auto-dropdown doesn't show up, you can add the flag `mythicSpellFocus` following the same rules outline above
  - Greater and Mythic options in the dropdown are limited by choices you've made for spell focus. If you want to get around that dropdown limitation, the flag can be manually added per above.
  - Because of a bug in pf1 0.82.5, the save button on the chat card will show the correct DC, but the info note at the bottom of the chat card will your base DC -- this is the same bug that happens if you use a conditional modifier to increase an individual spell's DC.

  ![image](https://user-images.githubusercontent.com/3664822/216522228-0968c234-3b89-47c0-b0e9-addf9accad34.png)

</details>

---

## Spell Specialization
Increase chosen spell CL by +2.

<details>
  <summary>How to configure Spell Specialization (click to expand)</summary>

  - The input will automatically be added for any ability named `Spell Specialization` (configurable in the mod settings)
  - You can manually add the `spell-specialization` dictionary flag for the input to show up
  - Only spells in your actor's spellbooks will be available as choices
    - if you want a different spell that your actor doesn't have, you can manually type the spell's `name` in as the value of the dictionary flag
  - The spell's `name` is the key. If you have multiple versions of the same spell in your spellbook and want this to work with all of them, then pick the `name` that is in both items.
    - e.g. If you have two differnt spells in your spellbook that are the same spell, but one is different because it has metamagic details pre-defined in it, `Fireball` and `Maximized Fireball`, then choose `Fireball` and it will apply to both spells
  - If `Spell Specialization` is accidentally applying to an extra spell because it includes the chosen spell's name, then you can add exclusionary rules, too. Add the dictionary flag `spell-specialization-exclusions` and add in any extra parts of other spell names that should be excluded - each separate term split by a `;`.
    - This is a manual process - you have to edit the dictionary flag directly, there's no special input that will show up for this.
    - e.g. You have chosen the spell `Alarm`, but also have other spells `Selective Alarm` and `Escape Alarm`. By default those other two will also be specialized. But you can add the exclusion flag with the value `Selective; Escape` and those will now be excluded.

</details>

---

## Weapon Focus
Automatically add +1 to attack rolls to weapons with `Weapon Focus`. Includes `Greater Weapon Focus` and `Gnomish Weapon Focus`.

<details>
  <summary>How to configure Weapon Focus (click to expand)</summary>

  ### Weapon Focus
  Adds +1 to hit to the chosen weapon types.
  - Will automatically include the select input in the feat advanced tab if the feat is named `Weapon Focus`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `weapon-focus` to the feat (or any other Item)
  - The choices are auto populated based on what Attacks and Weapons belong to the actor
    - The Attacks/Weapons must have their `Equipment Base Types` filled out (this is new in PF1 v9)
    - If you know exactly what base type you're looking for, you can fill it into the dictionary flag value directly

  ### Greater Weapon Focus
  Adds a second +1 on top of `Weapon Focus`
  - Will automatically include the select input in the feat advanced tab if the feat name includes both `Weapon Focus` and `Greater`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `greater-weapon-focus` to the feat (or any other Item)
    - The choices will be based off of any other `Weapon Focus` feats you already have configured.

  ### Mythic Weapon Focus
  Doubles the bonus from `Weapon Focus` and `Greater Weapon Focus`
  - Will automatically include the select input in the feat advanced tab if the feat name includes both `Weapon Focus` and `Mythic`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `mythic-weapon-focus` to the feat (or any other Item)
    - The choices will be based off of any other `Weapon Focus` feats you already have configured.

  ### Racial Weapon Focus
  Adds +1 to hit to racial weapons - those weapons must have appropriate racial tags.
  - Will Automatically include the select input in the feat advanced tab if the feat is named `Gnome Weapon Focus` (only official racial weapon feat)
    - This is configurable in the settings if you want to homebrew a different race
    - detection for this is kind of messy and it usually also detects it as `Weapon Focus` too. Just delete the weapon focus dictionary flag and it will behave itself once it's already configured for racial weapon focus.
  - The dropdown will be added automatically if you add the dicationary flag `racial-weapon-focus`
  - You must type in one of the `tags` that exists on racial weapons. The chosen race must exist on weapons and attacks for this feat to automatically add +1 to attack rolls.

</details>

---

## Weapon Specialization
Automatically add +2 damage to chosen weapons types for `Weapon Specialization` and `Greater Weapon Specialization`.

<details>
  <summary>How to configure Weapon Specialization (click to expand)</summary>

  ### Weapon Specialization
  Adds +2 damage to the chosen weapon types.
  - Will automatically include the select input in the feat advanced tab if the feat is named `Weapon Specialization`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `weapon-specialization` to the feat (or any other Item)
  - The choices are auto populated based on all of your configured [Weapon Focus](#weapon-focus) feats

  ### Greater Weapon Specialization
  Adds an extra +2 damage to the chosen weapon types.
  - Will automatically include the select input in the feat advanced tab if the feat name includes both `Weapon Specialization` and `Greater`
    - This is configurable in the settings to account for different translations
  - The dropdown will be added automatically if you add a dictionary flag `greater-weapon-specialization` to the feat (or any other Item)
  - The choices are auto populated based on all of your configured `Weapon Specialization` and [Greater Weapon Focus](#weapon-focus) feats

</details>

---

# Misc

## Ammunition
Ammunition now has inputs for masterwork, enhancement, attack, and damage bonuses. You can find these on the item's advanced tab.

---

## Change Offset
Modify the results of any `change` type. This is essentially a very generic form of [Fate's Favored](#fates-favored) -- but this will allow you to increase or decrease any `change` type instead of only modifying luck bonuses by +1.

<details>
  <summary>How to change offset (click to expand)</summary>

  - Add dictionary flag `change-type-offset` to your buff/feature/etc.
    - Text input will appear for your formula
    - Dropdown selector will show up with options for your chosen change type

</details>

---

## Fate's Favored
One of the best traits in the game. It will automatically increase any configured `change` luck bonus to increase that bonus by 1.

<details>
  <summary>How to customize Fate's Favored (click to expand)</summary>

  - Add a boolean flag `fates-favored` to your trait (or any other Item) and it will automatically increase any luck bonuses received from any other Change by 1.
    - Sorry, this one has no automatic configuration because it's literally just adding `fates-favored` into a boolean flag.

</details>

---

## Fortune and Misfortune
Fortune and Misfortune can now be added as flags onto your buffs, feats, abilities, etc. Simply add a boolean flag `fortune` or `misfortune`. If you have a specific Weapon, Attack, Ability, Feat that only rolls twice for itself, you can add `fortune-self-item` (or `misfortune-self-item`).  There are lots of ways to configure this for individual features. You can have misfortune only for saves or even a specific save. For all skills, an indvidual skill, etc. The following has all of the details on how you can configure it. There is one special case `fortune-warsight-init` that makes it so you roll three times on initiative for the oracle ability (must have "fortune stacks" setting enabled (it is enabled by default) for this ability to work).

<details>
  <summary>How to customize fortune/misfortune (click to expand)</summary>

  <details>
  <summary>Show configuration picture</summary>

  ![image](https://github.com/dmrickey/ckl-foundry-modules/assets/3664822/66d2135b-27e4-44de-8098-f6a5ed4572df)
  </details>

  For brevity, I'll only list `fortune-`, but everything also applies to `misfortune-`.

  ### Everything
  * `fortune`
  * `misfortune`
    * all of these are boolean flags

  ### Only for the Item that has the flag
  * `fortune-self-item`

  ### Ability Checks
  * `fortune-ability`
    * You can fortune a specific ability by appending its 3-letter abbreviation `fortune_ability_xxx`
    * e.g. `fortune-ability_str`

  ### Attacks
  * `fortune-attack`
    * `fortune-attack_melee` 
    * `fortune-attack_ranged`
  * attacks also use bab
  * if the action is configured as a Melee/Ranged Combat Maneuver, it will also use cmb

  ### Base Attack Bonus
  * `fortune-bab`

  ### Caster Level Checks
  * `fortune-cl`
    * `fortune-cl_primary`
    * `fortune-cl_secondary`
    * `fortune-cl_tertiary`
    * `fortune-cl_spelllike`
    * can also use the class configured for the spell book e.g. `fortune-cl_druid`

  ### Combat Maneuver Checks
  * `fortune-cmb`
    * `fortune-cmb_melee`
    * `fortune-cmb_ranged`
      * melee/ranged only work for Actions configured as melee/ranged CMB, not for when rolling "CMB" directly off the character sheet because there's no way to tell if  that's for melee or one of the few ranged options
  * cmb also use bab

  ### Concentration Checks
  * `fortune-concentration`
    * `fortune-concentration_primary`
    * `fortune-concentration_secondary`
    * `fortune-concentration_tertiary`
    * `fortune-concentration_spelllike`
    * can also use the class configured for the spell book e.g. `fortune-concentration_druid`

  ### Initiative Checks
  * `fortune-init`
  * `fortune-warsight-init`
    * special oracle ability that allows choosing one of the three dice (I have no way let you choose a lower dice, it picks the highest, you can delay if you want)
    * must have the setting "fortune stacks" enabled (GM setting for the mod, this is enabled by default)

  ### Saving Throws
  * `fortune-save`
    * `fortune-save_fort`
    * `fortune-save_ref`
    * `fortune-save_will`

  ### Skill Checks
  * `fortune-skill`
    * You can fortune a specific ability by appending its 3-letter abbreviation `fortune_skill_xxx`
      * e.g. `fortune-skill_ken`
    * It will work with perform/craft/profession subskills
      * e.g. `fortune-skill_crf.subSkills.crf1`
    * It will work with custom skills
      * e.g. `fortune-skill_theIdYouPutInTheSkillInput`
      * e.g. `fortune-skill_newSkill2`

</details>

---

## Skill Bonuses (Almost entirely uneccesary because of v9 updates. May be removed at some point)
Various bonuses to skills. You can add Inspiration, change the base die, or add variable bonuses.

<details>
  <summary>How to customize Skills (click to expand)</summary>

  <details>
    <summary>Show configuration picture</summary>

  ![image](https://user-images.githubusercontent.com/3664822/183241183-9f899996-6f2a-455a-a711-054039365d31.png)
  </details>

  On the skills tab in the top right is a button for modifying your base inspiration die. It defaults to `1d6[Inspiration]`, it's modifiable here because investigators get the option of changing it to a d8 later, or even rolling twice and taking the higher.

  To the right of each skill there's now a cog you can click that will open a menu:

  - ~~Override the base die (only thing I know of that does this is the `Empathy` investigator talent that let's them roll twice and keep the higher, but there could be something else out there, or any homebrew rules)~~
    - `Empathy` can be accomplished via `fortune` by adding `fortune-skill_sen` boolean flag directly on the `Empathy` talent
  - ~~Bonus is for any other permanent bonuses you have that need a die roll~~
    - PF1 now handles variable skill bonuses. It used to be that if you had `1d6` for a skill change, then it was rolled once and then that was the permanent value for the bonus. As of v9, skill bonuses are evaluated on every roll so the system can handle this much better on its own.
    - This is still useful for the investiagator talent that increases your die from 1d6 to 1d8 as the system doesn't really have a way to link to a single place for "what's my investigator die"
  - ~~the checkbox reads the global skill config inspiration value~~
    - Individual talents (or the Inspiration class ability itself) can simply use PF1's change target to grant a permanent 1d6 bonus to a specific skill

  If you have static bonuses, use the built in change system -- this is only necessary to cover a limitation in that you can't have changes based on die rolls -- they're cachced when the buff is turned on. So if you have a 1d6 in a change, and turn the buff on, then it rolls immediately when you turn the buff on and keeps that specific value until the buff is toggled later.

</details>

---

# Spells

## Modify Spell Caster Level for specific element
  For buffs, abilities, or banes (or anything else) that modify spell Caster Levels.

<details>
  <summary>How to configure spell Caster Level modifications (click to expand)</summary>

  ### For Specific Element
  Useful for specific abilities such as [Gnome's Pyromaniac alternate racial trait](https://www.aonprd.com/RacesDisplay.aspx?ItemName=Gnome#:~:text=and%20illusion%20resistance.-,Pyromaniac,-Source%20Advanced%20Race).
  - Add dictionary flag `elemental-cl` to your buff/feature/etc.
    - Text input will appear for your formula
    - Dropdown selector will show up with options for `acid`, `cold`, `electric`, or `fire`

</details>

---

## Modify Spell DC for specific element
  For buffs, abilities, or banes (or anything else) that modify spell DCs.

<details>
  <summary>How to configure spell DC modifications (click to expand)</summary>

  ### For Specific Element
  - Add dictionary flag `elemental-dc` to your buff/feature/etc.
    - Text input will appear for your formula
    - Dropdown selector will show up with options for `acid`, `cold`, `electric`, or `fire`
  
</details>

---
