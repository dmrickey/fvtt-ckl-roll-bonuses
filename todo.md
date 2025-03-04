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
    - [Creature type/subtype](#creature-typesubtype)
    - [By Disposition](#by-disposition)
    - [All healing](#all-healing)
    - [Armor Target (useful for something like Magic Vestment)](#armor-target-useful-for-something-like-magic-vestment)
    - [Die Result](#die-result)
    - [Skill Target](#skill-target)
    - [Spellbook target](#spellbook-target)
    - [Spell preparation Qty](#spell-preparation-qty)
- [Affect other tokens](#affect-other-tokens)
- [Figure out how to embed buffs directly into a scene](#figure-out-how-to-embed-buffs-directly-into-a-scene)
- [Class Features](#class-features)
  - [Cleric](#cleric)
    - [Healing Domain - Healer's Blessing](#healing-domain---healers-blessing)
  - [Psychic](#psychic)
    - [Phrenic Amplification](#phrenic-amplification)
  - [Ranger](#ranger)
    - [Favored Enemy](#favored-enemy)
    - [Favored Terrain](#favored-terrain)
- [Feats](#feats)
  - [Shared Remembrance](#shared-remembrance)
  - [Spell Perfection](#spell-perfection)
  - [Spirited Charge](#spirited-charge)
  - [Scarred by War](#scarred-by-war)
- [Buffs](#buffs)
  - [Bane](#bane)
- [Racial Features](#racial-features)
  - [Sylph](#sylph)
    - [Air Affinity](#air-affinity)
- [Weapon Abilities](#weapon-abilities)
  - [Bane](#bane-1)
- [Misc](#misc)
  - [I am targeted](#i-am-targeted)
  - [Magic](#magic)
  - [Misc](#misc-1)
  - [Ammo](#ammo)
  - [UX](#ux)
  - [Bonuses](#bonuses-1)
  - [Bonus Improvements](#bonus-improvements)
  - [Targeting](#targeting)
- [Housekeeping](#housekeeping)
- [Checklist for new (and existing features)](#checklist-for-new-and-existing-features)
- [Deprecate](#deprecate)
- [Add Quench Testings](#add-quench-testings)
- [Add create hooks for initializing some items (like anything based off of name/id)](#add-create-hooks-for-initializing-some-items-like-anything-based-off-of-nameid)
- [Add inpsiration checkbox to roll dialogs](#add-inpsiration-checkbox-to-roll-dialogs)
- [Skills](#skills)
- [in pf1 V10](#in-pf1-v10)
- [Not Possible](#not-possible)
- [Range/Positional ideas](#rangepositional-ideas)
- [Other Ideas](#other-ideas)
- [PF1 v11](#pf1-v11)
- [vnext](#vnext)
- [pf1 v11 update](#pf1-v11-update)
- [Verify](#verify)

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
### Creature type/subtype
- Is possible now with v11 now that creature types/subtypes are hard data points
  - would support [Ranger](#ranger)'s Favored Enemy and [Bane](https://www.d20pfsrd.com/magic-items/magic-weapons/magic-weapon-special-abilities/bane/)
### By Disposition
- Ally/Hostile/Neutral multiselect
  - multi select
  - "ally" means same disposition
  - "hostile" means `*-1`
  - "neutral" still means 0
### All healing
### Armor Target (useful for something like Magic Vestment)
- see Armor Focus for similar
### Die Result
- When the die is (some value range)
  - Would allow for "1s turn to 2s" (e.g. target die = 1; bonus + 1)
### Skill Target
- Include "smart groups" that will give options e.g.
  - specific ability skills (e.g. all int skills)
  - The default layout will group subskills under the base skill and checking the base skill will automatically check all subskills
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
## Psychic
### Phrenic Amplification
  - increases DC of `mind-affecting` spells by 1/2/3
## Ranger
### Favored Enemy
  - Add a button to chat cards to modify ranger damage for favored enemy 
    - Perhaps do it automatically depending on target
### Favored Terrain
  - Add a button to chat cards to increase the skill/initiative/whatever roll when applicable

# Feats
## [Shared Remembrance](https://aonprd.com/FeatDisplay.aspx?ItemName=Shared%20Remembrance)
## [Spell Perfection](https://www.d20pfsrd.com/feats/general-feats/spell-perfection/)
## Spirited Charge
- Double Damage without critting
## [Scarred by War](https://www.aonprd.com/TraitDisplay.aspx?ItemName=Scarred%20by%20War)
 - (used to grant diplomacy bonus while not in combat)

# Buffs
## Bane
- use the new [Bane][#bane] feature - add an action on the Buff that when used, prompts a script to change the creature type
- when activated, prompt for creature type and targeted weapon

# Racial Features
## Sylph
### Air Affinity
- sorcerers with the elemental (air) bloodline treat their Charisma scores as 2 points higher for the purposes of all sorcerer spells and class abilities
  - Specifically just "treat <ability score> higher/lower for <spell book>"
  - maybe also "treat <ability score> higher/lower for <class ability>" -- would need to be based off of class key and ability that has a parent as that class

# Weapon Abilities
## Bane
- choose one of the following types, humanoids and outsiders also require a subtype
  > Aberrations
  >
  > Animals
  >
  > Constructs
  >
  > Dragons
  >
  > Fey
  >
  > Humanoids (pick one subtype)
  >
  > Magical beasts
  >
  > Monstrous humanoids
  >
  > Oozes
  >
  > Outsiders (pick one subtype)
  >
  > Plants
  >
  > Undead
  >
  > Vermin
- +2 to existing enhancement bonus and 2d6 against chosen type

# Misc
## I am targeted
- add bonuses / penalties to attacks that are specifically against me
  - include percentile miss chance

## Magic
- specialization schools (and opposed)

## Misc
- add the formula class to skill inputs
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

## Bonuses
- "x per dice"
- Extra Attacks

## Bonus Improvements
- Enhancement Bonus
  - add checkbox for "applies for DR" (some spell buffs don't appy for DR (e.g. Greater Magic Weapon))

## Targeting
- show warning if target has an inappropriate bonus

# Housekeeping
- Consolidate weapon hints (Weapon Focus, Specialization, Martial) - find a way to make them more concise
- Remove Inspiration from being added into the dialog and instead create a change as part of rolling the skill

# Checklist for new (and existing features)
- Has hint on keyed ability
- Has hint on affected Item (Weapon/Attack/Spell/etc)
- Has info/attack note
- Actually affects what it's supposed to (duh)
- Has journal
- Has tooltip

# Deprecate
- as of v9, PF1 now defers Roll Bonuses. So that means that the `Bonus` on the Skill settings can go away
- It should create a new Feature with a change that includes the current formula as part of migration for deleting this

# Add Quench Testings
# Add create hooks for initializing some items (like anything based off of name/id)

# Add inpsiration checkbox to roll dialogs
- https://gitlab.com/foundryvtt_pathfinder1e/foundryvtt-pathfinder1/-/merge_requests/2758
  - > "So actionUse.formData for actions and overriding _getFormData() for d20rolls"

# Skills
- Condtional Bonus when taking 10
  - Needs to be able to target individual skills
    - (or groups of skills)
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
- Vital Strike (Mythic)
  - Damage has already been stripped and added, I don't know which damage is crit only or not when I'm making my changes

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

# PF1 v11
- Type/Subtype targets are now viable.

# vnext
- Create new "Roll Bonuses" section for attack dialog inputs
- Replace "checklist-input" with a proper Item application instead of a warpgate menu
- Add "Fortune configuration app" to help with configuring specific fortune abilities
- Targeting
  - Add a configuration error if "this target is not configured"
- Roll Bonuses button in header that goes "show me a list of items with bonuses". This can also have a button to auto-populate any that it thinks should have bonuses added
  - See example [https://gitlab.com/mxzf/adventure-uninstaller/-/blob/master/adventure-uninstaller.mjs](here)

- Add "Weapon Focus" hint hook so Weapon Focus, Weapon Specialization, and Martial Focus can all use the sword icon hint
- Audit Specific Bonus "click to expand" rules and make sure they're concise enough (_specifically_ looking at you, Weapon Focus)
- Specific Bonuses
  - Inspiration
    - Has a traits selector for various skills
    - Expanded Inspiration
      - Lets you pick more skills that automatically include inspiration
    - Change Inspiration Die
      - Allows you to change the base die from 1d6 to 1d8 or 2d8 (Amazing Inspiration talent)
    - Inspiration "Fortune" 
      - e.g. Empathy Talent, when rolling inspiration for sense motive, roll twice and take the higher
- Add "ignore me" boolean flag to turn off auto configuration (stronger "hammer" for EitR-type stuff where it incorrectly makes assumptions)

# pf1 v11 update
- make "This item type natively includes this property." more of an error message so it's obvious it's not doing anything
- make common "has source compendium id" function and make sure it reads from new place in addition to old
- Automatically check high ground on the attack dialog when applicable
- Add documentation into "Has BFlag" to include toggle (copy from "has condition")
  
# Verify
- mw bow with magic ammo now works correctly
- "Has Condition" and "Has BFlag" both need to be verified for targeting self vs. actor
