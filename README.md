# Roll Bonuses

Provides bonuses to various types of rolls. Some of these are for variable changes that the system can't handle (like Inspiration). Some are a fake implementation of changes that the system just doesn't support. Support for Mana's mod [Item Hints](https://gitlab.com/koboldworks/pf1/item-hints) has been included.

## Skill Bonuses
![image](https://user-images.githubusercontent.com/3664822/183241183-9f899996-6f2a-455a-a711-054039365d31.png)

On the skills tab in the top right is a button for modifying your base inspiration die. It defaults to `1d6[Inspiration]`, it's modifiable here because investigators get the option of changing it to a d8 later, or even rolling twice and taking the higher.

To the right of each skill there's now a cog you can click that will open a menu:

- Override the base die (only thing I know of that does this is the `Empathy` investigator talent that let's them roll twice and keep the higher, but there could be something else out there, or any homebrew rules)
- Bonus is for any other permanent bonuses you have that need a die roll
- the checkbox reads the global skill config inspiration value

If you have static bonuses, use the built in change system -- this is only necessary to cover a limitation in that you can't have changes based on die rolls -- they're cachced when the buff is turned on. So if you have a 1d6 in a change, and turn the buff on, then it rolls immediately when you turn the buff on and keeps that specific value until the buff is toggled later.

## Fortune and Misfortune
![image](https://github.com/dmrickey/ckl-foundry-modules/assets/3664822/66d2135b-27e4-44de-8098-f6a5ed4572df)

Fortune and Misfortune can now be added as flags onto your buffs, feats, abilities, etc. Simply add a boolean flag `fortune` or `misfortune`. If you have a specific Weapon, Attack, Ability, Feat that only rolls twice for itself, you can add `fortune-self-item` (or `misfortune-self-item`).  There are lots of ways to configure this for individual features. You can have misfortune only for saves or even a specific save. For all skills, an indvidual skill, etc. The following has all of the details on how you can configure it. There is one special case `fortune-warsight-init` that makes it so you roll three times on initiative for the oracle ability (must have "fortune stacks" setting enabled (it is enabled by default) for this ability to work).

<details>
  <summary>How to customize fortune/misfortune (click to expand)</summary>

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

## Spell Focus
![image](https://user-images.githubusercontent.com/3664822/216522228-0968c234-3b89-47c0-b0e9-addf9accad34.png)

Spell Focus, Greater Spell Focus, and Mythic Spell Focus now all have a drop down on the advanced tab that lets you select a school. When you cast a spell of that school, the DC will automatically be increased.
- The feat name has to match the mod configuration (already set up to match the expected English feat names) _*or*_ if it's one of those two feats added to your character sheet from the compendium (it doesn't matter if it's been renamed if it was added from a compendium).
  - If the drop down doesn't show up because the name does not exactly match, or some other reason, you can still add a dictionary flag with the name `spellFocus`/`greaterSpellFocus` and the mod will automatically add the inputs for you below the dictionary flags section.
  - Also handles Mythic Spell Focus, if the auto-dropdown doesn't show up, you can add the flag `mythicSpellFocus` following the same rules outline above
- Greater and Mythic options in the dropdown are limited by choices you've made for spell focus. If you want to get around that dropdown limitation, the flag can be manually added per above.
- Because of a bug in pf1 0.82.5, the save button on the chat card will show the correct DC, but the info note at the bottom of the chat card will your base DC -- this is the same bug that happens if you use a conditional modifier to increase an individual spell's DC.

## Elemental Focus
Follows the same basic setup as Spell Focus above.
- You can manually configure it by setting a flag on the feat with a key of `elementalFocus`, `greaterElementalFocus`, or `mythicElementalFocus` and the mod will automatically add the inputs for you below the dictionary flags section.
- The accepted values are `acid`, `cold`, `electric`, or `fire`.
- The damage for the spell you're casting must be configured using one of the system's predefined types.

## Spell DC Bonuses (and penalties)
Add a new dFlag on any item named `genericSpellDC`, then drop in a number (positive or negative) or a formula and when you next cast a spell on that Actor the DC should be adjusted accordingly.

## Caster Level Offset for specified Magic School
Has a formula input which accepts roll data variables plus a dropdown for selecting the school of magic.
- You must add a dictionary flag `schoolClOffset` to your buff/feature/etc. Once you add that, the inputs will show up below.

## Critical Helpers
Attack's critical variables can now be dynamically adjusted. Crit can be modified with keen. It can also be modified by a static amount to account for certain 3.5 classes or other homebrew. The critical multipler can also be adjusted--this is useful for a Swashbuckler's capstone ability (and any homebrew that needs it).

<details>
  <summary>How to customize crit range or multiplier (click to expand)</summary>

  ### Keen - boolean flag
  * `keen-self`
    * place this flag on an attack/weapon/item/spell/etc. Any action for this Item will have its crit range doubled.
  * `keen-all`
    * place this flag on anything in your character to double the crit range of any action
  * `keen_<id>`
    * e.g. `keen_7hAXCo6sYfpIqeli`
    * Place this flag on anything, then when you use either the Item or Action associated with the id, it will be keen
    * This is useful for when you have a temporary buff that grants a specific weapon Keen

  ### Crit target modifications (dictionary flag)
  #### Positive numbers are good, so having a `3` will mean your "crits only on a 20" weapon will now crit on "17 or higher"
  * `crit-offset-self`
  * `crit-offset-all`
  * `crit-offset_<id>`
    * e.g. `crit-offset_7hAXCo6sYfpIqeli`
    * individual descriptions same as keen described above
    * The value of the dictionary flags can be either a number or a formula
    * if something is effect by both crit-offset and keen, then keen is applied first before an extra crit-offset is applied

  ### Crit multipliers (dictionary flag)
  * `crit-mult-offset-self`
  * `crit-mult-offset-all`
  * `crit-mult-offset_<id>`
    * e.g. `crit-mult-offset_7hAXCo6sYfpIqeli`
    * individual descriptions same as keen described above
    * The value of the dictionary flags can be either a number or a formula

</details>

## Fate's Favored
You can now configure the popular trait `Fate's Favored` to increase luck bonuses. To configure, just add a boolean flag `fatesFavored` to your trait (or any other Item) and it will automatically increase any luck bonuses received from any other Change by 1.
