

- [TODO](#todo)
- [UI](#ui)
- [Bonus Targets](#bonus-targets)
  - [Bonuses](#bonuses)
  - [Targets](#targets)
- [Class Features](#class-features)
  - [Cleric](#cleric)
  - [Fighter](#fighter)
  - [Psychic](#psychic)
  - [Ranger](#ranger)
- [Feats](#feats)
  - [Bomber's eye](#bombers-eye)
  - [Longshot](#longshot)
  - [Snake Sidewind](#snake-sidewind)
  - [Spell Perfection](#spell-perfection)
  - [Spirited Charge](#spirited-charge)
- [Racial Features](#racial-features)
  - [Sylph](#sylph)
  - [Kobold](#kobold)
- [Skills](#skills)
  - [Int Headband](#int-headband)
- [Misc](#misc)
  - [I am targeted](#i-am-targeted)
  - [Magic](#magic)
  - [Misc](#misc-1)
  - [UX](#ux)
  - [Bonuses](#bonuses-1)
  - [Targeting](#targeting)
- [Housekeeping](#housekeeping)
- [Checklist for new (and existing features)](#checklist-for-new-and-existing-features)
- [Deprecate](#deprecate)
- [Add Auto Config](#add-auto-config)
- [Add Quench Testings](#add-quench-testings)
- [Add create hooks for initializing some items (like anything based off of name/id)](#add-create-hooks-for-initializing-some-items-like-anything-based-off-of-nameid)
- [in pf1 V10](#in-pf1-v10)
- [Not Possible](#not-possible)
- [This release must include](#this-release-must-include)

# TODO
- Figure out a way to support multiple target groups on a single Item (so I can add `Favored Enemy (Human) +4` and `Favored Enemy (goblin) +2` on a single Item)
  - (see 3.0 scaffolding branch for a super rought start on this)

# UI
- Add readonly mode to all inputs so you can still see the configuration if you can't edit (i.e. in a compendium)
- ### Add text filter to item input target

# Bonus Targets
## Bonuses
- add <ability> to damage for other ability scores (like agile but can be customized)
- add <ability> to attack for other ability scores (like finesse but can be customized)
- Attack bonus needs to give optional "crit only" attack bonuses
- AC bonus

## Targets
- Have creature type/subtype based targeting - would support [Ranger](#ranger)'s Favored Enemy
- Ally/Hostile/Neutral multiselect
- All healing
- Armor Target (useful for something like Magic Vestment)
- Distance-based targeting (point-blank shot)
  - same logic for range penalties
- Spellbook target
- Spell preparation Qty
- Skill Target
  - Include "smart groups" that will give options e.g.
    - specific ability skills (e.g. all int skills)
    - The default layout will group subskills under the base skill and checking the base skill will automatically check all subskills
- While in Combat
  - [Scarred by War](https://www.aonprd.com/TraitDisplay.aspx?ItemName=Scarred%20by%20War) (used to grant diplomacy bonus while not in combat)
- add a way to affect other tokens (i.e. cavalier challenge which gives them -2 attack vs other targets)
- inverse target - effect all tokens _except_ the tokens I have targets
  - Not super useful until v3

# Class Features
## Cleric
### Healing Domain - Healer's Blessing
- Cure Spells are treated as if they're empowered (+50% healing)
## Fighter
### [Versatile Training](https://www.d20pfsrd.com/classes/core-classes/fighter/#:~:text=that%20he%20throws.-,Versatile%20Training,-(Ex)%20The)
- Use BAB instead of ranks for given skills (see Versatile Performance implementation)
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
## Bomber's eye
- Increase throwing range
## Longshot
- Increase bow range
## Snake Sidewind
- does a lot, but specifically swap Sense Motive for attack roll to confirm critical hits when Sense Motive mod is higher than current attack bonus (Agile bonus might give insight on this)
## Spell Perfection
- https://www.d20pfsrd.com/feats/general-feats/spell-perfection/
## Spirited Charge
- Double Damage without critting


# Racial Features
## Sylph
### Air Affinity
- sorcerers with the elemental (air) bloodline treat their Charisma scores as 2 points higher for the purposes of all sorcerer spells and class abilities
  - Specifically just "treat <ability score> higher/lower for <spell book>"
  - maybe also "treat <ability score> higher/lower for <class ability>" -- would need to be based off of class key and ability that has a parent as that class
## Kobold
### Frightener
  - +1 DC for `fear` spells

# Skills
## Int Headband
- configure an item to give you specific ranks (0.82.5 only gives bonus ranks, not ranks to specific skills)
  - See versatile performance for ideas.
- Show icon next to skills that roll inspiration for free
  - permanent-skill-bonuses

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

## UX
- Add item hints for ammo
- Add method for sources to say "I have a source key but no value" and show a broken item hint

## Bonuses
- "x per dice"

## Targeting
- show warning if target has an inappropriate bonus
- add checkbox to toggle between union (current implementation) and intersection (item has to supply all targeting requirements)

# Housekeeping
- reduce duplication of `Improved` and `Greater` in so many different settings - they always use the same word in both German and Spanish (and English) so they don't need unique settings per usage
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
- Weapon Focus (use bonus targets instead)
- Martial Focus (use bonus targets instead)
- Weapon Specialization (use bonus targets instead)
- as of v9, PF1 now defers Roll Bonuses. So that means that the `Bonus` on the Skill settings can go away
- It should create a new Feature with a change that includes the current formula as part of migration for deleting this
- all specific DC/CL bonuses (after v10 once descriptor-based targeting is available)
- specific crit bonuses

# Add Auto Config
- Improved Critical

# Add Quench Testings
# Add create hooks for initializing some items (like anything based off of name/id)

# in pf1 V10
- Ammo
  - Attack Notes to add to individual attacks
    - This should be doable via patching pf1.actionUse.ChatAttack.prototype. addEffectNotes (formerly setEffectNotesHTML)
      - (assuming my PR is merged)
- Targeting
  - descriptor-based targeting
  - sub-school target

# Not Possible
- Attempt to create a "resource offset"
  - includes showing anything modifying a given resource in the resource's sheet near the formula so it can see why the total is not what that sheet says it should be
  - Sad day. Not possible for basically the same reason custom changes aren't possible
- Custom changes that effect only specific targets :(
  - changes are generated and applied too early and too broadly in the system prep. I can either create a change that applies to everything (pointless) or I can create a specific change that exists for the specified target, but it's created too late to both be reduced to the best bonus type and actually be added to the roll

# This release must include
- Investigate
  - Creating "Conditionals" which are targets that give global bonuses if a "condition" is true. This will update the following
    - Has BFlag Target
    - IsActive Target
    - Target Alignment
    - Target Token
  - Add limit to checklist
  - Add subtext to checklist (could potentially default to the tooltip hint)
- Ammo
  - finish implementing stacking vs non-stacking enhancement bonus
- Investigate
  - "target ammo" to see if I can add bonuses to individual attacks as part of using ammo
  - using Conditional Targets as a UI category for the picker
- Documentation
  - Ammo - stacking bonus
  - Bonus
    - Effective Size
      - Formula should result in how many steps up/down the chart it goes
    - Enhancement Bonus
  - Specific Bonus
    - Skill Rank Override
    - Snake Sidewind
    - Versatile Training
  - Target
    - Has Boolean Flag (Conditional)
    - Is Active (Conditional)
  - update Furious Focus to signify it always works _first_ outside of combat.
- Warrior Versatile Performance
- Item that grants skill ranks
- Update documentation for Furious Focus to show that it always works outside of combat (except on iteratives)
- Localize Versatile Training
- Verify
  - Make sure Furious Focus still works
  - string-select with no choices (e.g. Weapon Focus)
  - Snake Sidewind
  - Has Boolean Flag Target
  - Is Active Target
  - Make sure works after removing current from showing input
    - Armor Focus input
    - Element Focus
    - Improved Armor Focus input
    - Spell Specialization
    - Weapon Specialization
  - `itemActionRollAttack` and `itemActionRollDamage` local hooks still work for `join` after removing their return types which didn't seem to be used.
  - That Versatile Performance and Training both roll skills properly with the hook
