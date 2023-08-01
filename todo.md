- [UI](#ui)
- [Class Features](#class-features)
- [Feats](#feats)
- [Racial Features](#racial-features)
- [Skills](#skills)
- [Misc](#misc)
- [Housekeeping](#housekeeping)
- [Checklist for new (and existing features)](#checklist-for-new-and-existing-features)

## UI
### Add In-Game Documentation
- create a compendium with details on how to configure each bonus
  - link to specific compendium page for this bonus when it's detected on the sheet
- create "id getter" ui for things like keen or fortune (fortune will need a lot more as well)
- Always show roll bonuses header in the advanced tab, and add a Cog to itself to configure which bonuses should be on this item (useful for bonuses that can't be auto-detected base on the Feat name/id)

## Class Features
### Gunslinger
- Gun Training
  - Look for weapons within the "firearms" weapon group, then look for weapon types like Weapon Focus does.
  - Figure out if I want one input for mulitple choices - or multiple inputs with one choice each - Maybe use a trait selector for input given the choices
### Fighter
- Weapon Training
  - Choose a weapons group for each stage
  - Figure out if I want one input for mulitple choices - or multiple inputs with one choice each - Maybe use a trait selector for input given the choices

## Feats
### Weapon Focus (Elephant in the Room)
- Works off of a weapon group toggle and gives bonuses to all of the weapons in the group

## Racial Features
### Air Affinity
- Sylph sorcerers with the elemental (air) bloodline treat their Charisma scores as 2 points higher for the purposes of all sorcerer spells and class abilities
  - Specifically just "treat <ability score> higher/lower for <spell book>"
  - maybe also "treat <ability score> higher/lower for <class ability>" -- would need to be based off of class key and ability that has a parent as that class

## Skills
### Int Headband
- configure an item to give you specific ranks (0.82.5 only gives bonus ranks, not ranks to specific skills)
  - See versatile performance for ideas.

## Misc
### Attacks
- Add damage to specific Item/Attack
  - basically configured like fortune
  - saves a list of formula paired with damage types

### Deprecation
- as of v9, PF1 now defers Roll Bonuses. So that means that the `Bonus` on the Skill settings can go away
- It should create a new Feature with a change that includes the current formula as part of migration for deleting this

### Misc
- add the formula class to skill inputs
- consumable buffs - requires later release (waiting on issue #1946) (did not make it into v9)
  - idea is to create a a flag on a buff that will add the bonus in "prehook" (and/or use built in changes) but use the new pf1 v.next posthook to disable the buff when it is consumed

## Housekeeping
- reduce duplication of `Greater` in so many different settings
- Consolidate weapon hints (Weapon Focus, Specialization, Martial) - find a way to make them more concise
- Remove Inspiration from being added into the dialog and instead create a change as part of rolling the skill

## Checklist for new (and existing features)
- Has hint on keyed ability
- Has hint on affected Item (Weapon/Attack/Spell/etc)
- Has info/attack note
- Actually affects what it's supposed to (duh)
