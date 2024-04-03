

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
  - [Attacks](#attacks)
  - [Magic](#magic)
  - [Misc](#misc-1)
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

## Targets
- Have creature type/subtype based targeting - would support [Ranger](#ranger)'s Favored Enemy
- Ally/Hostile/Neutral multiselect
- All healing
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

## Attacks
- Add Bane button on chat card to modify the current chat card to add +2 attack and +2d6 damage

## Magic
- specialization schools (and opposed)

## Misc
- add the formula class to skill inputs
- consumable buffs - requires later release (waiting on issue #1946) (did not make it into v9)
  - idea is to create a a flag on a buff that will add the bonus in "prehook" (and/or use built in changes) but use the new pf1 v.next posthook to disable the buff when it is consumed

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
- make damage picker work with readonly
- Add readme info to "target item/spell/weapon" that gives info about targeting only works on the actor it's configured on and is not transferrable.
- verify
  - that bonus picker button is correctly hidden on sheets that can't be edited
  - make sure readonly works (add observer permissions for player1 actor to Player 2 and look at "has all bonuses" buff)
  - look at classes on "edit icons" and make sure they're the same so one isn't darker than the other
  - <label> on editable icons (it's not using label partial)
  - <label> on checked-items (it's wrapping the label partial in a form-group, delete that wrapper and verify if it's necessary or not)
  - damage target
  - double check input labels for all specific bonuses
  - racial weapon focus
    - make sure the default is recognized
    - make sure it gives +1 to expected racially tagged weapons
  - Open up "all bonus types" buff on `player1` and make sure everything is localized
  - make sure static setting registration works
  - Alphabetize specific bonuses in picker
  - organize `specific bonuses` on bonus picker
  - For `specific bonuses`, add "extra keys" as a sublist of child items
- Function
  - Update journal formatting so it has the same styling from below
- Maybe add example on how to target a specific Spell?
- Update Smite Evil example for "Target Evil"
- Add FAQ to readme
  - I can't find the weapon type I want for Weapon Focus?
    - When determining which types are available, **Roll Bonuses** looks at all of the attacks and weapons on your sheet, and uses those to provide options. If the option you're looking for is not availble, then your weapon is not properly configured with its **Base Equipment Type**. All weapons and natural attacks (found in Monster Abilities) provided by the system are pre-configured with the proper values. If you're using a custom-made item or using an item pulled out of a compendium before pf1 v9, then you'll need to make sure to configure this value yourself.
  - How can I add +1 DC to `fear` spells for a Kobold Frightener or +1 to `mind-affecting` spells for a Psychic with Phrenic Amplification?
    - See Function targeting.
  - I have an idea, can you make Roll Bonuses do it?
    - I have no idea. Maybe. I'm always updating my list with suggestions so feel free to ping me on discord and tell me what you have in mind.
  - Finesse Targeting isn't working
    - For a weapon to work with Finesse Targeting, it needs to fulfill one of these three criteria. 
      - It needs to be a weapon with the `finesse` property checked on the weapon itself. You can find this in the weapon's details. Unfortunately, once an attack has been created, there is no longer an option for this, you can specifically add a `finesse-override` boolean flag so that this mod can find it. Also, any weapon/attack in the Natural Weapons weapon group is finesse-able. As long as at least one of those three criteria are fulfilled, then finesse targeting should be able to find the proper target.

The `Custom Targeting Function` field takes a javascript function that is executed to determine what to target. This function takes a single argument. That argument can either be an ItemPF (`pf1.documents.item.ItemPF` or any of its subclasses as shown in the example below), an ActionUse (`pf1.actionUse.ActionUse`), or an ItemAction(`pf1.components.ItemAction`). You can type those into the debug console to get an idea of what's unique about each of them. So simply, the `Roll Bonuses` framework gives the function a "thing" and then the function returns true if the "thing" is a valid target (or false if it's a "thing" that shouldn't be targeted). This is essentially how all of Roll Bonuses targets work, but this makes it fully customizable.

If you know javascript, but don't know enough about the particulars of PF1 to know what your options for this are, I suggest doing the following.
1. Create a new actor
   - don't give the actor any classes or anything else 
2. Give that actor a specific weapon/spell/etc that you want to be affected.
3. Give that actor a new buff with a Function target boolean flag.
   - In the `Custom Targeting Function`, use this function `(doc) => console.log(doc)`. 
4. Then take a look at the output in the console and see what values you can use to target.

Here's a specific example that lets you target any spell that has `fear` in its descriptors (in v9 pf1 stores spell descriptors in `system.types`). Since the function accepts an `ItemAction` or an `ActionUse` (in addition to it being possibly being an `ItemPF`), the first line `const item = ...` is getting the item from either itself (if it's an item), or from the value's `item` property (i.e. if the passed in value is one of the two types of Actions).

After having a reference to the `item`, I'm further verifying that the item is an `ItemSpellPF` since I only want this to work for spells. After I know it's a spell, I return true if it has the `"fear"` descriptor, otherwise it returns false. You can easily modify this to target other descriptors by replacing `fear` with another one (e.g. `mind-affecting`).

(doc) => {
    const item = doc instanceof pf1.documents.item.ItemPF
        ? doc
        : doc.item;
    if (item instanceof pf1.documents.item.ItemSpellPF) {
        return !!(item.system?.types || '').includes('fear');
    }
}

Here's another example on how to have a Target based on the tokens the user is targeting. This checks the targets' race to see if any of them are a catfolk.

The method still accepts the item/action, but is not actually using it because this depends on targeted tokens. The javascript convention for that is to put an underscore in front of the argument name to indicate the argument isn't used in the method (it can also be omitted entirely). Then we grab all of the current user's targets, grab the actors from those targets, and then filter the list to just the actors that actually exist (there can be tokens on the map without actors, and if they don't have actors, then they obviously don't have a race). After we have the list or targeted actors, then we return true if any of them have the desired race.

(_doc) => {
    const currentTargets = [...game.user.targets]
        .map(x => x.actor)
        .filter(x => !!x);

    return currentTargets.some((actor) => actor.race?.name === 'Catfolk');
}

Here's an example where the Target is only active while the user's HP is below 50%.

(doc) => {
    const item = doc instanceof pf1.documents.item.ItemPF
        ? doc
        : doc.item;

    if (!item.actor) return false;

    const { value, max } = item.actor.system.attributes.hp;
    return value <= (max / 2);
}
