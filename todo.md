

- [TODO](#todo)
- [UI](#ui)
  - [Add In-Game Documentation](#add-in-game-documentation)
- [Bonus Targets](#bonus-targets)
  - [Bonuses](#bonuses)
  - [Targets](#targets)
- [Class Features](#class-features)
  - [Ranger](#ranger)
  - [Psychic](#psychic)
- [Feats](#feats)
  - [Bomber's eye](#bombers-eye)
  - [Extreme Mood Swings](#extreme-mood-swings)
  - [Improved Critical](#improved-critical)
  - [Longshot](#longshot)
  - [Spell Perfection](#spell-perfection)
  - [Spirited Charge](#spirited-charge)
- [Racial Features](#racial-features)
  - [Sylph](#sylph)
  - [Kobold](#kobold)
- [Skills](#skills)
  - [Int Headband](#int-headband)
- [Misc](#misc)
  - [I am targeted](#i-am-targeted)
  - [Attacks](#attacks)
  - [Magic](#magic)
  - [Misc](#misc-1)
  - [Bonuses](#bonuses-1)
  - [Targeting](#targeting)
- [Housekeeping](#housekeeping)
- [Checklist for new (and existing features)](#checklist-for-new-and-existing-features)
- [Deprecate](#deprecate)

# TODO
- Figure out a way to support multiple target groups on a single item (so I can add "Holy" and "Flaming" on a single weapon)

# UI
## Add In-Game Documentation
- create a compendium with details on how to configure each bonus
  - link to specific compendium page for this bonus when it's detected on the sheet
- create "id getter" ui for things like keen or fortune (fortune will need a lot more as well)
- Always show roll bonuses header in the advanced tab, and add a Cog to itself to configure which bonuses should be on this item (useful for bonuses that can't be auto-detected base on the Feat name/id)
- Add some kind of preview to targeting UI to show all currently effect Items

# Bonus Targets
## Bonuses
- formula input
  - Spell level
    - target spells 0-9, all
  - CL Bonus*
  - DC Bonus*
    - *Would deprecate everything under "spells"
- Move Crit to Bonus (would deprecate crit)

## Targets
- Have target for "me" item, so I can create buffs bonuses that are available only with this weapon
- Have creature type/subtype based targeting - would support [Ranger](#ranger)'s Favored Enemy
- Have alignment-based targeting
- All healing
- Spellbook target
- Spell preparation Qty
- Spell School target*
- Damage Type target*
- Subschool Target*
- Spell Type Target*
  - *Would deprecate everything under "spells"

# Class Features 
## Ranger
- Favored Enemy
  - Add a button to chat cards to modify ranger damage for favored enemy 
    - Perhaps do it automatically depending on target
- Favored Terrain
  - Add a button to chat cards to increase the skill/initiative/whatever roll when applicable
## Psychic
- Phrenic Amplification
  - increases DC of `mind-affecting` spells by 1/2/3

# Feats
## Bomber's eye
- Increase throwing range
## Extreme Mood Swings
- Increase each morale bonus you receive by 1.
- https://www.d20pfsrd.com/feats/general-feats/extreme-mood-swings/
## Improved Critical
- Selects individual weapon types (like Weapon Focus) and grants keen to all of those
## Longshot
- Increase bow range
## Spell Perfection
- https://www.d20pfsrd.com/feats/general-feats/spell-perfection/
## Spirited Charge
- Double Damage without critting


# Racial Features
## Sylph
- Air Affinity sorcerers with the elemental (air) bloodline treat their Charisma scores as 2 points higher for the purposes of all sorcerer spells and class abilities
  - Specifically just "treat <ability score> higher/lower for <spell book>"
  - maybe also "treat <ability score> higher/lower for <class ability>" -- would need to be based off of class key and ability that has a parent as that class
## Kobold
- Frightener
  - +1 DC for `fear` spells

# Skills
## Int Headband
- configure an item to give you specific ranks (0.82.5 only gives bonus ranks, not ranks to specific skills)
  - See versatile performance for ideas.

# Misc
## I am targeted
- add bonuses / penalties to attacks that are specifically against me
  - include percentile miss chance

## Attacks
- Add Bane button on chat card to modify the current chat card to add +2 attack and +2d6 damage

## Magic
- specialization schools (and opposed)

## Misc
- add the formula class to skill inputs
- consumable buffs - requires later release (waiting on issue #1946) (did not make it into v9)
  - idea is to create a a flag on a buff that will add the bonus in "prehook" (and/or use built in changes) but use the new pf1 v.next posthook to disable the buff when it is consumed

## Bonuses
- Size increase (a.k.a. Gravity Bow or Lead Blades)
- "x per dice"

## Targeting
- show warning if target has an inappropriate bonus
- add ui to select targets/bonuses
- add checkbox to toggle between union (current implementation) and intersection (item has to supply all targeting requirements)

# Housekeeping
- reduce duplication of `Greater` in so many different settings
- Consolidate weapon hints (Weapon Focus, Specialization, Martial) - find a way to make them more concise
- Remove Inspiration from being added into the dialog and instead create a change as part of rolling the skill

# Checklist for new (and existing features)
- Has hint on keyed ability
- Has hint on affected Item (Weapon/Attack/Spell/etc)
- Has info/attack note
- Actually affects what it's supposed to (duh)

# Deprecate
- Weapon Focus (use bonus targets instead)
- Martial Focus (use bonus targets instead)
- Weapon Specialization (use bonus targets instead)
- as of v9, PF1 now defers Roll Bonuses. So that means that the `Bonus` on the Skill settings can go away
- It should create a new Feature with a change that includes the current formula as part of migration for deleting this
