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
- [Range/Positional ideas](#rangepositional-ideas)
- [Other Ideas](#other-ideas)
- [vnext](#vnext)
    - [Specific Bonuses](#specific-bonuses)

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

# Housekeeping
- Consolidate weapon hints (Weapon Focus, Specialization, Martial) - find a way to make them more concise

## Remove Skill Config
- currently deprecated as of Apr 26, 2025
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

# Range/Positional ideas
- Flank
  - Also includes a "cannot be flanked" flag that would go on an Item to signify when an actor can't be flanked
  - has to do with melee
  - Needs a "Target" so that I can give out extra bonuses when flanking
    - Dirty Fighter Trait
    - Outflank (would need extra info about flank target) 
- IsAdjacent
- IsSharingSquare

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

# vnext
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
- Add Fortune/Misfortune checkboxes to attack/roll dialogs

- Add `getSourceFlag` to api so mod authors don't have to save my mod id
  - e.g. no `source.getFlag("ckl-roll-bonuses", this.key)`
  - but instead `getSourceFlag(source, this.key)`
  - remove `Record<any, any>` from API type definition and make sure all individual references are imported
  - Add "configure" method to each bonus and target that takes whatever args it needs to save itself
- Flanking
  - Add `enlarged: hasImprovedOutflank` to each private PositionalHelper method
  - Add bonuses for various feats/abilities that grant flank (see FlankHelper)
    - fill in logic in FlankHelper for reading the various bonuses
  - Add journal entries for all of the bonuses it needs to account for
  - Add bonuses for abiltities that deny flanking
  - Add "only specific allies" input to is-flanking bonus
    - Add "Actor Picker" app
  - Add "cannot be flanked" ability
- Add "While adjacent to" bonus
  - use actor picker app
- Verify that Precise Shot and Devastating Strike (plus imrpoved) still work after creatre/render refactor
### Specific Bonuses
- Migrate all keys to start with `specific_`
  - update all journal entries to indicate what the key is
- Make sure everything referencing keys is doing so off of the class so it is actually using the correct key