- [TODO](#todo)
- [UI](#ui)
- [Bonus Targets](#bonus-targets)
  - [Bonuses](#bonuses)
  - [Targets](#targets)
- [Class Features](#class-features)
  - [Cleric](#cleric)
  - [Psychic](#psychic)
  - [Ranger](#ranger)
- [Feats](#feats)
  - [Bomber's eye](#bombers-eye)
  - [Longshot](#longshot)
  - [Shared Remembrance](#shared-remembrance)
  - [Spell Perfection](#spell-perfection)
  - [Spirited Charge](#spirited-charge)
- [Racial Features](#racial-features)
  - [Sylph](#sylph)
  - [Kobold](#kobold)
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
- [Add inpsiration checkbox to roll dialogs](#add-inpsiration-checkbox-to-roll-dialogs)
- [Improve Enhancement Bonuses](#improve-enhancement-bonuses)
- [in pf1 V10](#in-pf1-v10)
- [Not Possible](#not-possible)
- [vnext](#vnext)

# TODO
- Figure out a way to support multiple target groups on a single Item (so I can add `Favored Enemy (Human) +4` and `Favored Enemy (goblin) +2` on a single Item)
  - (see 3.0 scaffolding branch for a super rought start on this)

# UI
### Add text filter to item input target

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

# Class Features
## Cleric
### Healing Domain - Healer's Blessing
- Cure Spells are treated as if they're empowered (+50% healing)
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
## Shared Remembrance
- https://aonprd.com/FeatDisplay.aspx?ItemName=Shared%20Remembrance
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

## UX
- Add item hints for ammo
- Add method for sources to say "I have a source key but no value" and show a broken item hint

## Bonuses
- "x per dice"
- Extra Attacks

## Targeting
- show warning if target has an inappropriate bonus
- add checkbox to toggle between union (current implementation) and intersection (item has to supply all targeting requirements)

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

# Add inpsiration checkbox to roll dialogs
- https://gitlab.com/foundryvtt_pathfinder1e/foundryvtt-pathfinder1/-/merge_requests/2758
- > "So actionUse.formData for actions and overriding _getFormData() for d20rolls"

# Improve Enhancement Bonuses
- Add `getEnhancement` bonus to utils and api
  - this will allow for other mods to call into this mod to see what the total enhancement bonus for a given weapon is
- add checkbox for "applies for DR" (some spell buffs don't appy for DR (e.g. Greater Magic Weapon))

# in pf1 V10
- Ammo
  - Attack Notes to add to individual attacks
    - This should be doable via patching pf1.actionUse.ChatAttack.prototype. addEffectNotes (formerly setEffectNotesHTML)
      - (assuming my PR is merged)
- Targeting
  - descriptor-based targeting
  - sub-school target
- Update FAQ for custom target with current example (current example uses v9 custom)
- Use pf1's simplify util function instead of maintaining my own

# Not Possible
- Attempt to create a "resource offset"
  - includes showing anything modifying a given resource in the resource's sheet near the formula so it can see why the total is not what that sheet says it should be
  - Sad day. Not possible for basically the same reason custom changes aren't possible
- Custom changes that effect only specific targets :(
  - changes are generated and applied too early and too broadly in the system prep. I can either create a change that applies to everything (pointless) or I can create a specific change that exists for the specified target, but it's created too late to both be reduced to the best bonus type and actually be added to the roll

# vnext
- Add EitR toggle that will autoconfigure weapon focus for weapon groups instead of weapon focus
- Add FAQ for why some feats are automatically configured the way they are
- distance-based targeting
- Add FAQ about how to circumvent auto configuration
- update mw and enhancement to modify the attack roll
  - ```
    function pf1PreActionUse(actionUse) {
        actionUse.shared.attacks[0].chatAttack.ammo: {id: string}
        actionUse.shared.attacks[0].chatAttack.attack
    }
    Hooks.on('pf1PreActionUse', pf1PreActionUse);
   ```
- Look into adding an inline warning if targets/bonuses detected in an item sheet when the other is configured
- Add a super obvious configuration button in the item sheet when there are no bonuses configured
- Audit current wrappers and see which can be replaced with hooks
  - actionUseProcess should be able to be replaced with `pf1CreateActionUse` (currently used for fortune/misfortune)
    - try to use this for enh to see if the item's values can be modified now

#2.12.4
- targeted crit footnote
