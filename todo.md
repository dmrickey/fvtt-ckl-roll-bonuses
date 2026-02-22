- [TODO](#todo)
- [UI](#ui)
    - [Add text filter to item input target](#add-text-filter-to-item-input-target)
- [Bonus Targets](#bonus-targets)
  - [Bonuses](#bonuses)
    - [Swap Ability for Damage Rolls](#swap-ability-for-damage-rolls)
    - [Swap Ability for Attack Rolls](#swap-ability-for-attack-rolls)
    - [Add/Swap Damage Types](#addswap-damage-types)
    - [AC bonus](#ac-bonus)
    - [Alignment](#alignment)
    - [Consume Item/Charge](#consume-itemcharge)
    - [Maximized Critical](#maximized-critical)
  - [Targets](#targets)
    - [By Disposition](#by-disposition)
    - [All healing](#all-healing)
    - [Armor Target (useful for something like Magic Vestment)](#armor-target-useful-for-something-like-magic-vestment)
    - [Spellbook target](#spellbook-target)
    - [Spell preparation Qty](#spell-preparation-qty)
- [Affect other tokens](#affect-other-tokens)
- [Figure out how to embed buffs directly into a scene](#figure-out-how-to-embed-buffs-directly-into-a-scene)
- [Class Features](#class-features)
  - [Cleric](#cleric)
    - [Healing Domain - Healer's Blessing](#healing-domain---healers-blessing)
  - [Ranger](#ranger)
    - [Favored Terrain](#favored-terrain)
- [Feats](#feats)
  - [Spell Perfection](#spell-perfection)
  - [Spirited Charge](#spirited-charge)
  - [Scarred by War](#scarred-by-war)
- [Buffs](#buffs)
- [Racial Features](#racial-features)
  - [Sylph](#sylph)
    - [Air Affinity](#air-affinity)
- [Misc](#misc)
  - [I am targeted](#i-am-targeted)
  - [Magic](#magic)
  - [Misc](#misc-1)
  - [Ammo](#ammo)
  - [UX](#ux)
    - [Targeting](#targeting)
  - [Bonuses](#bonuses-1)
  - [Bonus Improvements](#bonus-improvements)
- [Housekeeping](#housekeeping)
  - [Remove Skill Config](#remove-skill-config)
- [Checklist for new (and existing features)](#checklist-for-new-and-existing-features)
- [Add Quench Testings](#add-quench-testings)
- [Add create hooks for initializing some items (like anything based off of name/id)](#add-create-hooks-for-initializing-some-items-like-anything-based-off-of-nameid)
- [Skills](#skills)
- [in pf1 V10](#in-pf1-v10)
- [Not Possible](#not-possible)
- [Other Ideas](#other-ideas)
- [vnext](#vnext)
    - [Global Bonuses](#global-bonuses)
    - [Target](#target)
    - [Specific Bonuses](#specific-bonuses)
    - [Idea](#idea)
    - [Bonus Types](#bonus-types)
  - [BugFixes](#bugfixes)

# TODO
- Figure out a way to support multiple target groups on a single Item (so I can add `Favored Enemy (Human) +4` and `Favored Enemy (goblin) +2` on a single Item)
  - (see 3.0 scaffolding branch for a super rought start on this)

# UI
### Add text filter to item input target

# Bonus Targets
## Bonuses
### Swap Ability for Damage Rolls
- add <ability> to damage for other ability scores (like agile but can be customized)
  - waiting on 10.5
### Swap Ability for Attack Rolls
- add <ability> to attack for other ability scores (like finesse but can be customized)
  - waiting on 10.5
### Add/Swap Damage Types
- e.g. swap fire to acid
### AC bonus
- See armor focus for how I first implemented it
### Alignment
- Actually align the weapon/attack instead of just adding typed damage
  - I can make it work but it won't do anything (the system doesn't show it in the attack, it's kinda pointless without extra functionality)
### Consume Item/Charge
- consume a charge from <pick Item> when used
### Maximized Critical
- [link](https://www.d20pfsrd.com/alternative-rule-systems/mythic/mythic-heroes/mythic-paths-paizo-inc/champion/champion-path-abilities/maximized-critical-ex/)

## Targets
### By Disposition
- Ally/Hostile/Neutral multiselect
  - multi select
  - "ally" means same disposition
  - "hostile" means `*-1`
  - "neutral" still means 0
### All healing
### Armor Target (useful for something like Magic Vestment)
- see Armor Focus for similar
### Spellbook target
### Spell preparation Qty
- Don't see how it's possible with my framework

# Affect other tokens
- add a way to affect other tokens (e.g. cavalier challenge which gives them -2 attack vs other targets) - this might just be a buff assi

# Figure out how to embed buffs directly into a scene

# Class Features
## Cleric
### Healing Domain - Healer's Blessing
- Cure Spells are treated as if they're empowered (+50% healing)
  - IsHealing target
  - Empowered Bonus
## Ranger
### Favored Terrain
  - Add a button to chat cards to increase the skill/initiative/whatever roll when applicable

# Feats
## [Spell Perfection](https://www.d20pfsrd.com/feats/general-feats/spell-perfection/)
## Spirited Charge
- Double Damage without critting
## [Scarred by War](https://www.aonprd.com/TraitDisplay.aspx?ItemName=Scarred%20by%20War)
 - (used to grant diplomacy bonus while not in combat)

# Buffs

# Racial Features
## Sylph
### Air Affinity
- sorcerers with the elemental (air) bloodline treat their Charisma scores as 2 points higher for the purposes of all sorcerer spells and class abilities
  - Specifically just "treat <ability score> higher/lower for <spell book>"
  - maybe also "treat <ability score> higher/lower for <class ability>" -- would need to be based off of class key and ability that has a parent as that class

# Misc
## I am targeted
- add bonuses / penalties to attacks that are specifically against me
  - include percentile miss chance

## Magic
- specialization schools (and opposed)

## Misc
- consumable buffs - requires later release (waiting on issue #1946) (did not make it into v9)
  - idea is to create a a flag on a buff that will add the bonus in "prehook" (and/or use built in changes) but use the new pf1 v.next posthook to disable the buff when it is consumed
- Alter bonus effect for crit confirmation only
  - https://www.aonprd.com/MonsterTemplates.aspx?ItemName=Commando%20Construct#:~:text=to%20this%20ability.-,Precision,-(Ex)%3A%20A

## Ammo
- Try and refactor ammo so that it takes any "bonus" and then pumps that into the ranged weapon
  - If not, add size bonus for ammo
- Add item hints for ammo

## UX
- Add method for sources to say "I have a source key but no value" and show a broken item hint
### Targeting
- show warning if target has an inappropriate bonus

## Bonuses
- Extra Attacks

## Bonus Improvements
- Enhancement Bonus
  - add checkbox for "applies for DR" (some spell buffs don't appy for DR (e.g. Greater Magic Weapon))
- Lepidstadt Thrust (Ustalavic Duelist)

# Housekeeping
- Consolidate weapon hints (Weapon Focus, Specialization, Martial) - find a way to make them more concise

## Remove Skill Config
- also remove warpgate as this is the last part using it.

# Checklist for new (and existing features)
- Has hint on keyed ability
- Has hint on affected Item (Weapon/Attack/Spell/etc)
- Has info/attack note
- Actually affects what it's supposed to (duh)
- Has journal
- Has tooltip

# Add Quench Testings
# Add create hooks for initializing some items (like anything based off of name/id)

# Skills
- Condtional Bonus when taking 10
  - example usage: https://aonprd.com/TraitDisplay.aspx?ItemName=Analytical
    - Have to wrap `pf1.dice.D20RollPF.prototype._onDialogSubmit` and look at `static roll` and `this.options.staticRoll === 10` and then modify the formula (and possibly also update `this._formula`)

# in pf1 V10
- ~~Use pf1's simplify util function instead of maintaining my own~~ PF1's automatically strips flavor text

# Not Possible
- Attempt to create a "resource offset"
  - includes showing anything modifying a given resource in the resource's sheet near the formula so it can see why the total is not what that sheet says it should be
  - Sad day. Not possible for basically the same reason custom changes aren't possible
- Custom changes that effect only specific targets :(
  - changes are generated and applied too early and too broadly in the system prep. I can either create a change that applies to everything (pointless) or I can create a specific change that exists for the specified target, but it's created too late to both be reduced to the best bonus type and actually be added to the roll

# Other Ideas
- Add Concealment
  - This would allow me to automatically add effect notes for each roll to automatically roll for concealment
  - And would allow automating rerolls for abilities like Weapon of the Chosen
- Add bonuses to attacker based on a "when targets me" buff defined on an actor
  - Could include options like
    - when targeted by ally
    - when targeted by any enemy
      - or when targeted by specific enemy
      - or when targeted by any enemy except specified enemy
- Initial popup with brief tutorial/explanation 
  - Specifically include "automatic" things like Global Bonuses
- Alignment Target
  - Refactor so that it's an array
  - allow neutral to be chosen
- Create new "Roll Bonuses" section for attack dialog inputs
- Add "Fortune configuration app" to help with configuring specific fortune abilities
- Targeting
  - Add a configuration error if "this target is not configured"
- Roll Bonuses button in header that goes "show me a list of items with bonuses". This can also have a button to auto-populate any that it thinks should have bonuses added
  - See example [https://gitlab.com/mxzf/adventure-uninstaller/-/blob/master/adventure-uninstaller.mjs](here)
- Add "Weapon Focus" hint hook so Weapon Focus, Weapon Specialization, and Martial Focus can all use the sword icon hint
- Add "ignore me" boolean flag to turn off auto configuration (stronger "hammer" for EitR-type stuff where it incorrectly makes assumptions)
  - Or possibly just add a flag that says "this has already been configured" and then don't do it again
- Look into changing a lot of my older bonuses into the system's newer changes - will hopefully be less processing if I'm not manually injecting stuff
  - e.g. (Improved) Armor Focus
    - AF - `+1` untyped Armor AC
    - IAF - `-1` untyped ACP (Armor)
  - CL
  - DC

# vnext
- Add Fortune/Misfortune checkboxes to attack/roll dialogs

- Remove `greater`/`improved`/`mythic` getters from LanguageSettings and use the new `is` methods

### Global Bonuses
- Mounted Charge Global Bonus
  - Refactor `VitalStrikeData.buildMythicConditional` because that already has the logic necessary
  - Include Spirited Charge Specific Bonus (when global bonus is enabled) to double damage
  - Detect "lance" weapon type and double damage
  - Global Bonus will need to add a "mounted" checkbox
  - Global Bonus kicks off when both "mounted" and "charge" is checked

### Target
- `Size Target` (trait target) kicks in if target is a given size
- `Relative Size` (kicks in if target is at least or exactly _N_ steps different from you larger/smaller)
- While "Equipment Type" is equipped
- While "Weapon Group" is equipped

### Specific Bonuses
- ~~Migrate all keys to start with `specific_`~~ Do this later after SBC has a chance to update to only use the API
- Add "get item hint" function to base class
- **Damage Multiplier**
  - Brace - adhoc situations like the global charge bonus above
  - Litany of Righteousness (probably can't do but putting here for reference)

Add journal links to target/bonus headers within item sheet

### Idea
- turn `LanguageSettings` into a base class that other classes extend (or create a base class that has shared logic)
- **System Changes Bonus**
  - Define system changes as a bonus - mirror the inputs for Changes and then when the targets are correct, add those changes into the actor's prepped data (may possibly need to remove them if the targeting criteria is somehow lost without data prep triggering -- need to investigate)
    - These would essentially work only with Conditional Targets (and self/all)
    - This would allow for things like "+4 intimidate when targeting a creature type"
      - or "+4 initiative when in a city (using Fair's target)"
      - or possibly literally any change ¯\_(ツ)_/¯

### Bonus Types
- AC
  - figure out appropriate way to apply AC bonus

Figure out a way to better communicate what changes are being affected by "Change Modifier Bonus". E.g.:
- add an item hint on the item that has the affected change
- indicate on an items changes tab next to an affected change
- list out the currently targeted abilities
- maybe add a context note on the roll itself, but if the above is done, probably the least helpful
    - all of these are assuming the change stems from the system, if it stems from RB those won't work

- Add an "ignore Item Hints" util flag

TODO - mounted charge and lance conditionals
