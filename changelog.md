## Roll Bonuses 2.23.0

### New Bonuses

- **Damage Multiplier**
  - Multiplies damage for the targeted action.
- **Damage Multiplier (Global Bonus)**
  - Adds a multiplier input on the attack dialog for adhoc multipliers. This includes support for mounted charging with a Lance and/or *Spirited Charge* -- this is supported with a new Specific Bonus and also with a new "Mounted" checkbox that appears after checking "charge". When both "charge" and "mounted" are checked, it then checks if the attacker has the feat and/or a lance to multiple the damage as expected.
- **Inspiration Bonus**
  - Add a bonus to all inspiration rolls. E.g. Gain a +1/4 bonus on all inspiration rolls from Half-Elf investigator favored class option. Investigator macros provided have been upgraded -- if you have made local copies you will need to update those copies to make use of this bonus.

### New Conditional Targets

- **Combat State**
  - Previously you could define a target to be active while you were in combat. Now you can flip that and have a bonus defined for when you're out of combat. E.g. [Scarred by War](https://www.aonprd.com/TraitDisplay.aspx?ItemName=Scarred%20by%20War)
- **Relative Size Target**
  - Target tokens based off of their size relative to your own current size.
- **Size Target**
  - Activate bonus when targeting a token of a specific size.
- **While Equipped**
  - Activates bonus while a specified weapon or armor type is equipped (or while having a specified natural attack type) (this is useful for cases like "+2 Intimidate when using a Longsword)
    - Do not confuse this with "Weapon Type Target" which grants bonuses only to specific weapons -- this will grant bonuses _even if using a different weapon_ as long as you have the specified weapon type equipped in your inventory tab.
- **While Weapon Group Equipped**
  - Actives bonuses when a weapon from the specified weapon group(s) is equipped.
    - Like above, don't confuse this "Weapon Group Target"

### Improvements

- **Action Type Target**
  - Can also target Combat Maneuvers
- **Alignment target**
  - Can now target specific alignment combinations (including true neutral) instead of just good/evil/law/chaos. This allows you to also target things like "only good" (with no law/chaos) whereas before it would trigger off of any good alignment. A configuration of "any good" would now require selecting all three good alignments.
- **Condition Target**
  - Can now specify multiple conditions to trigger off of
- **Custom Function Target**
  - Now easier to write. You no longer have to use inline arrow function (e.g. `() => { ... }`), but now only have to write the `...`. You now write these the same you write a script macro or pf1's script calls. Four variables are passed directly to the function for you: `item`, `actor`, `action`, and `actionUse`. Check out the in game documentation for updated examples. _Old_ functions will still work, but the documentation no longer mentions the old syntax and only gives new examples.
- **Improved Critical**
  - Added Improved Critical auto-configuration. It will now automatically add Weapon Type Target (preconfigured for the first weapon it finds on the actor) and Critical Bonus (preconfigured for keen)
    - I thought I did this a while ago, sorry McGregor 😅
- **When in Combat**
  - Transformed into **Combat State**. See above.

### Misc

- Added `greatestDistanceBetween` helper function in the PositionalHelper util that can tell you the greatest distance between any two out of a group of tokens. There is a new macro available with examples on how to use this. One example on how to use this is to add a Use Script Call that does `if (RollBonuses.utils.PositionalHelper.greatestDistanceBetweenTokens(game.user.targets) > 30) shared.reject = true;`. This would cancel the spell if targets are too far apart (I'd also include a ui notification that warns the user the spell was rejected). And yes, this accounts for elevation.
- Promoted RollBonuses to the global namespace. You can now access the `api` directly from typing `RollBonuses` into the console (or a macro/script/etc). Included macros have been updated to reflect this.

### Bugfixes

- Token targets no long show tokens with SECRET disposition to players.
- Multiple skill bonuses now show up directly on the actor's skill sheet instead of just the first one found.

---

## Roll Bonuses 2.22.7

### Bugfixes

- Fixed v12 compatibility

---

## Roll Bonuses 2.22.6

### Improvements

- Show item input when bonus is activated -- Better handling for buffs that target weapons

### Bugfixes

- Better handling for abnormal formulas for Vital Strike
- When calculating flanking, ignore actions on spells for determining if an actor threatens the target

---

## Roll Bonuses 2.22.5

### Bugfixes

- Fixed uncanny dodge applying to rogues of all levels

---

## Roll Bonuses 2.22.4

### Bugfixes

- Fixed issue with conditional targets that would sometimes try to call code that wasn't implemented

---

## Roll Bonuses 2.22.3

### Bugfixes
- Finesse Target was incorrectly applying to attacks that didn't use Strength
- Updated bane api to accept passed in targets instead of solely relying on the player's current targets

---

## Roll Bonuses 2.22.2
Added German translation from McGregor

---

## Roll Bonuses 2.22.1
Updated Spanish translation from LeCuay (Chechu on discord)

---

## Roll Bonuses 2.22.0

### New Bonus Types
- Conditional Bonuses
  - Until now, every bonus has applied only to a specific action (more damage, different size, increased DC, etc). Now I've added these new "Conditional Bonuses" that grant bonuses to more generic actor actions that aren't just "attacks" or "spells". These bonuses work alongside any "Conditional Target" to enable those bonuses. Conditional Targets still work alongside all bonuses as before, they just also now work for Conditional Bonuses.
  - **Initiative Bonus**
    - When the specified Conditional Targets are met, get a bonus to initiative rolls.
  - **Saving Throw Conditional Bonus**
    - When the specified Conditional Targets are met, get a bonus to the chosen saving throws.
  - **Skill Conditional Bonus**
    - When the specified Conditional Targets are met, the rolled skills will receive the given bonus.

### New Macros
- **Flank Finder**
  - Helper macro to better explain why tokens are considered flanking or not.

### Misc
- **Solo Tactics** now supports an optional "with allies" input so that it can work only with those specified actors
- Updates to Item Hint integration for new versions

### Bugfixes
- Fixed Weapon Type selection so that it no longer shows armor types as options
- Fixed duration for spells in compendiums. Now shows full range instead of just smallest value
- Token Target picker now shows up again when enabling a buff
- Fixed Vital Strike label on attack dialog inconsistently matching which Vital Strike feat being used
- Fixed Elemental Focus not updating spell roll data (specifically noticed by the chat card DC not being updated)
- Better handling for tokens without actors when calculating certain features
- Weapon Focus and Weapon Specialization once again respect the EitR setting
- Fixed Snake Sidewind auto-configuring to Fate's Favored
- Restored functionality for ammo bonuses

### Misc
- More fleshed out type api for developers

---

## Roll Bonuses 2.21.2

### Bugfixes
- Fixed issue collecting weapon groups and equipment types from some items. This largely showed up when trying to use Weapon Focus with Attacks and other less common cases

### Misc
- Dice Transform Bonus now accepts `@q`/`@qty` for `@quantity`, `@f` for `@faces`, and `@b` for `@base`

---

## Roll Bonuses 2.21.1

### Bugfixes
- Fixed flank detection requiring the attacker has Improved Uncanny Dodge
- Fixed Pack Flanking checking the attacker twice for Pack Flanking and not checking if the "flank partner" also has it

---

## Roll Bonuses 2.21.0

### New Bonuses
- **Flanking**
  - **Flanking** (Global Bonus)
    - automatically pre-check Flanking in attack dialog - if attack dialog is skipped, flanking is automatically calculated
    - Includes support for automatically increasing flank bonus with **Outflank** and **Menacing**
  - **Is Flanking** (Conditional Target)
    - Activates paired Bonuses when you're flanking your target, can further configure to only activate bonuses while flanking with a specific ally
  - Supports 3-dimensional flanking
  - **Flanking Immunity** (Specific Bonus)
    - to cover abilities like All-Around Vision or creatures like Oozes or Elementals
  - **Improved Uncanny Dodge** (Specific Bonus)
    - to provide immunity when flanked by non-rogues. This must be configured on a class feature with a Class Assosiation properly configured.
  - Multiple Specific Bonuses to further enhance how flanking works
    - Supports various positional overrides like **Gang Up**, **Improved Outflank** Swashbuckler Mouser's **Underfoot Assault**, **Pack Flanking**, and Ratfolk **Swarming**
    - **Outflank** and **Improved Outflank** are also supported by **Solo Tactics**
- **While Adjacent To** (Target)
  - Activates bonuses while adjacent to a chosen ally
- **While Sharing Square With** (Target)
  - Activates bonuses while sharing a square with a chosen ally

### Misc
- Completely refactored how Specific Bonuses are added to my framework. Unifying and simplifying a lot of duplicated logic.
- All bonus classes now have a `configure` function so developers and/or advanced macro/script users can more easily programatically configure any bonus
  - (as always, this isn't necessary for any new item that is simply "enabled" and has no choices to be made (e.g. Fate's Favored has no choices to make and is automatically turned on when added to an actor))
- type docs improved for developers
- Expandeded previous change to less aggressively cache formula to Dice Transform Bonus (see 2.20.2 below)
- Actions with invalid ranges are now always assumed to threaten the target instead of treating its range as 0. Debug UI warning is now printed to console if console's debug setting is disabled.
- Bonus Picker dialog improvements - searching, sticky headers, and sorted Improved before Greater in Specific Bonus tab
- Token and Actor inputs - when hovering over the images, now highlight any tokens within the current scene

### Bugfixes
- `extraChanges` being added to attacks are no longer lost (e.g. the system's crit only attack changes now work as expected once again)
- Vital Strike once again correctly adds Improved and Greater bonuses as expected
- Fixed removing Bonuses via the picker in foundry v13 causing an error

---

## Roll Bonuses 2.20.3

### Misc
- Expandeded previous change to less aggressively cache formula to Conditional Bonus (see 2.20.2 below)

---

## Roll Bonuses 2.20.2

### Misc
- Added v2.19 and v2.20 Spanish strings (thanks Chechu!)

### Bugfixes
- Fixed issue with overagressive footnote parsing
- Updates to how damage and effect note bonuses (including ammo damage/effect notes) were caching formulas, will allow more roll variables to be used in those instances (e.g. action.ability.critMult)

---

## Roll Bonuses 2.20.1

### Bugfixes
- Fixed race type -> creature type migration from v2.19 to v2.20

---

## Roll Bonuses 2.20.0 (rquires pf1 11.4)

### New Bonuses
- **Bane Bonus**
  - Grants +2 stacking enhancement and 2d6 damage to targeted attacks when targeting a creature with the chosen creature types
  - Also has support within Ammo
- **Inspiration**
  - Now configured directly on the class ability. Includes support for various feats/talents such as Amazing Inspiration, Tenacious Inspiration, Focused Inspiration, and True Inspiration to automatically increase the inspiration die when necessary.
  - If you are an Investigator, please read the in-game documentation for your options plus a helpful script call available in the new macro compendium
- **Roll Skill Untrained**
  - Updates the actor's skill sheet to indicate that a given skill can now be used while untrained. Removes the `untrained` note when rolling as this is no longer the case.
- **Vital Strike additions**
  - Now also supports Devastating Strike, Improved Devastating Strike, and Mythic Vital Strike

### Misc
- Renamed "Race Target" to "Creature Type Target"
- Script Bonus - Added `this.source` as an option within the script call Bonus to grab a reference back to the source of the Bonus. Reminder: `item` references the "current item" that's being used that triggered the script.
- Updated True Strike Buff to have a script call that will disable itself that doesn't rely on Hooks (so it will now survive between sessions if enabled a previous session)
- Added Macro Compendium
  - A couple of Inspiration macros for investigators (don't forget to read the new documentation)
  - A script call that will turn off a Roll Bonus buff after a single use (see the True Strike buff for an example configuration)
  - An example on using Roll Bonuses distance finding api to measure the distance between two tokens
- ⚠⚠⚠ Setting Skill bonuses directly on the actor sheet is now deprecated and will be removed in a future update. Everything that this did can now be accomplished by setting Specific Bonuses directly on the feat/ability/buff granting those bonuses. (or with the system's skill changes as has been the case for a while now)

### Bugfixes
- Skill Rank Override once again actually overrides.
- Fixed detecting melee range for certain scenarios of larger creatures targeting larger creatures.
- More work on vertical height detection so it more accurately represents distance
- Script Bonus 
  - fixed "on use type" always showing the default "use" option when referencing a Macro instead of a local script
  - fixed bringing up editor for a compendium macro that hadn't been loaded into memory yet
- Function Target - no longer bricks the item sheet when an invalid function is saved and closed. Adds a very noisy console error when a broken function is detected.

---

## Roll Bonuses 2.19.0

### New Bonuses
- **Race (and racial subtype) Target**
  - Activate bonuses when the targeted tokens have one of the chosen races and/or subtypes.
- **Spell Subschool Target**
  - Activate bonuses when casting a spell from the given subschool(s).

### Misc
- Dice Transform now also adds a new `@base` roll variable when using it--this is includes the whole "base dice" E.g. if you want to repeat `2d6` instead of having to do `(@quantity)d(@faces)` you can now do something like `@base + @quantity` to get `2d6 + 2`. See the in game documentation for more examples.
- Replaced a few checkbox dialogs with the system's traits selector.
- Updated hint text for action/item selection dialogs
- Masterwork checkbox has been removed from ammo in favor of using the system's own masterwork option

### Bugfixes
- Furious Focus will now only trigger for melee attacks (i.e. no more triggering with Deadly Aim) and only with two-handed attacks.
- Replaced a few missing untranslated strings
- Targeting Tokens with the target token bonus once again works for players
- Footnotes didn't work for actors with lots of data

---

## Roll Bonuses 2.18.5

### Bugfixes
- Safely handle broken formulas so that they can still be edited. When a broken formula is found, an error is logged to the console and no bonus will be calculated for that formula.

---

## Roll Bonuses 2.18.4

### Bugfixes
- Fixed damage bonus caching when using dice within the formula and more roll caching to keep from using Foundry's faulty `safeEval`

---

## Roll Bonuses 2.18.3

### Bugfixes
- Fixed duplicated active effects

---

## Roll Bonuses 2.18.2

### Bugfixes
- Another fix for roll caching to prevent `undefined` from getting put it in there

---

## Roll Bonuses 2.18.1

### Bugfixes
- Added compatibility back into module.json
- Fixed formula caching as it no longer worked in a lot of cases due to changes in roll parsing in foundry v12

---

## Roll Bonuses 2.18.0 - pf1 v11 / foundry v12 release

### Misc
- Footnote Bonuses make use of the system's new source feature - meaning when you hover over a footnote provided by RB, it will show the source of the note
- Moved "All" Target to Conditional Targets since it does not target based on specific criteria
- Has Boolean Flag Conditional Target now has an option to be enabled based on whether or not your current targets have the flag, in addition to the previous functionality of it being based off of "just you"

### Bugfixes
- Fixed Damage Bonus item hint so that it's visible when either type of bonus is enabled instead of only when both types of damage bonuses are enabled
- Using ammo with enhancement bonuses with a masterwork ranged weapon now correctly accounts for the weapon's MW bonus when totaling the bonuses.
- Vital Strike no longer errors when enabled by default and rolling attacks without damage
- Improved Armor Focus no longer also shows the input for Armor Focus
- Versatile Performance and Versatile Training no longer provide bonuses when the providing Feature is disabled
- Dice Transform Bonus no longer shows up under "Specific Bonus" header on the Item Sheet

---

## Roll Bonuses 2.17.1

### New Language
Thanks to LeCuay (Chechu on discord) there's now a Spanish translation!

## Roll Bonuses 2.17.0

### New Bonuses
- **Dice Transform**
  - Alter dice quantity or faces for the base damage of targeted attcks. This lets you do things like double dice, add two more of the kind of die already being used, or even just replace the targeted dice with a simple `1` or any other formula you want. This is probably the most complex bonus I've created so please read the documentation (click the book icon next to the bonus name).
- **Vital Strike**
  - Added Specific Bonuses for Vital Strike (including Improved and Greater). There is now a Miscellaneous option (alongsize haste/power attack/etc) in the attack dialog for enabling Vital Strike. These feats have a toggle for enabling by default in the Roll Bonuses section of the feat itself (default to disabled otherwise they could be more easily accidentally included in Attacks of Opportunity).

### Misc
- Added Item Hints with tooltips to all Specific Bonuses
- Small bit of future-proofing regarding async rolls

### Bugfixes
- Invisible tokens can now correctly hit other tokens in melee
- Fixed some Spell DC bonuses being doubled on attack card "info"
- Fixed multiplying Conditional Modifiers when multiple were configured on a single Roll Bonus
- Made it so that "non crit" damage will apply to abilities that don't have attack rolls (i.e. like spells that force a save)

## Roll Bonuses 2.16.2

---

### Bugfixes
- Fixed potential benign error thrown when checking global override in attack dialog

### Misc
- Updated documentation for target overrides

---

## Roll Bonuses 2.16.1

### Bugfixes
- Removed formula class from Weapon Type Override. This made Little Helper try to resolve it which obviously shouldn't do anything

---

## Roll Bonuses 2.16.0

### New Bonuses
- **Action Type**
  - Removed individual Targets for various action types and reduced them to a single action. All of the following are now configured through this single Target.
    - `Is Melee`, `Is Natural`, `Is Natural Secondary`, `Is Ranged`, `Is Spell`, `Is Thrown`, `Is Weapon`
    - Added a new `Is Physical` option to be able to target physical items (e.g. weapon, armor, etc but not spell, ability, etc.) 
- **Conditional Modifier**
  - Configure conditional modifiers on buffs/features/etc and have them show up as if they were configured on the targeted actions.
    - This means you can create a "Sneak Attack" modifier and Target "Melee Attacks" to have a Conditional Modifier for it show up on every melee attack. Then you can disable/enable this modifier as needed from the Attack dialog without having to create the exact same Conditional Modifier on every individual attack it might apply to.
    - Do note that because of how Conditional Modifiers work within the system, the bonuses defined there always stack (yes even the system's own conditional modifiers stack with other same-type bonuses).
- **Script Call**
  - Runs an Item Script as if it were configured directly on targeted items. This allows you to configure a script exactly once and have it run when needed. If you have a script that you want to run on every melee attack, or any time you cast a spell, this allows you to configure that script exactly once and have it run for any of those abilities. Any `item` references within the script will refer to the item that is being used as part of the action (not the item that this script is configured on).

### Existing Bonuses
- **Attack Bonus**
  - Now includes a bonus type. This makes it so that stacking bonuses can be correctly configured.
  - Added option for "crit only" to be able to add targeted crit confirmation bonuses
- **Damage Bonus**
  - Now includes both effect damage (previously available) and "change types" (new addition). This allows configurations with types such as Alchemical, Luck, Morale, etc. that stack as expected 

### Target Overrides (New Feature)
These are new "bonuses" you can add to specific Items so that they can be "targeted" by the mod's Targets.
- **Finesse Override**
  - The system only allows you to mark Weapons with the Finesse property -- this does not extend to attacks. Adding this Finesse Override to an Attack (or a spell, feature, or anything else) automatically enables it as a finesseable target.
- **Proficiency Override**
  - Force profiency with something that is not weapon, attack, or equipment. This is mostly useful when paired with a Weapon Group Override that needs to work with Martial Focus or Weapon Specialization.
- **Weapon Type Override**
  - This allows you to add Weapon Types to Features and Spells (and any other Item). This is useful if you have `Weapon Focus (Bombs)` as it allows you to add a "Bomb" Weapon Type to a bomb class feature. Or if you have `Weapon Focus (Ray)` you can add a `Ray` weapon type to spells.
- **Weapon Group Override**
  - This allows you to add Weapon Groups to spells, features, or any other item type.

### Miscellaneous
- Feats and abilities that are specifically supported are now auto-configured (as much as can be) when added to an actor (e.g. Fate's Favored, Furious Focus, Extreme Mood Swings). Any that **have to be configured** will probably still need to modified -- I can't guarantee the correct choice for feats such as Weapon Focus or Spell Focus.

### Bugfixes
- Effective Size Bonuses once again show in the actor's sheet's Combat Damage column
- Fixed Actor's Combat's damage column not including targeted damage bonuses
- Fixed "Targets all Spells" not affecting some non-hostile spells
- Damage Bonuses are once again shown for Attacks in the actor's Combat tab
- Fixed accidental change that broke `Is Weapon` target (it was incorrectly targeting only natural attacks)

---

## Roll Bonuses 2.15.5

### Bugfixes
- include ranged spell attacks in ranged penalties for those spells that need it.

---

## Roll Bonuses 2.15.4

### Targets
- Added Natural Secondary Attack Target

### Misc
- Added Headers to each bonus section on item sheet
- Added Target Toggle to switch between any/all targets.
- Better support for items in containers 
  - Primarily when selecting Item/Weapon targets and when choosing what options are available for Weapon Type and custom Weapon Group targets
- Added autocomplete options for "Has Boolean Flag" conditional target based on currently active flags

### Bugfixes
- Fixed remaining warning for rolls (when checking for (mis)fortune bonuses)
- Added more cases for 10' diagonal reach
- Added workaround for misconfigured without range increment resulting in an attack with 0 reach

---

## Roll Bonuses 2.15.3

### Bugfixes
- Fixed Attack Bonus breaking Item Hints when the bonus totals 0

---

## Roll Bonuses 2.15.2

### Bugfixes
- Fixed "Specific Bonuses" throwing errors during startup for NPCs (specifically unlinked tokens)

---

## Roll Bonuses 2.15.1

### Bugfixes
Fixed an issue where values might not migrate properly if a player logged in before a GM.

---

## Roll Bonuses 2.15.0

_**Lots of data changed internally. Anything necessary should automatically migrate to the new format when the GM first logs in. I tried to test as thoroughly as I can and everything I tested is working, but it's always possible that I missed something. Please take advantage of foundry's backup and backup before updating just in case.**_

### Misc
- Addressed all warnings. Hopefully you'll never see a warning from Roll Bonuses about non async rolls being deprecated.
- Removed all usages of Dictionary Flags. You should never again see a warning from the system about multiple conflicting Weapon Focus flags.
- Tons of UX improvements.
  - Bonus Picker is now split into separate tabs for Targeted Bonuses versus Specific Bonuses
  - Item/Spell/Weapon/Attack/Action targets now have a filter so you can quickly find the exact item you're looking for
  - When viewing Item/Spell/Weapon/Attack/Action/Tokens targets you can now right click on them (icon in the Item sheet after selecting targets, or on the row in the picker dialog itself) to open the associated sheet (if you have the rights to be able to see the sheet to begin with)
  - Token Targeting UI highlights the corresponding tokens on the map so you can be sure the token you're selecting in the dialog is the correct token for the 
  - Most dialogs have helper text in them to give a bit more context about exactly how they work
- Modified 153 files. Added 4066 new lines. Removed 2954 lines.

### Global Bonuses
- Global bonuses that restricted actions from completing or applied penalties now have an optional checkbox in the attack dialog to suppress the check and allow the attack to happen regardless
  - You can optionally skip requiring melee range for melee attacks and also skip applying ranged penalties
    - These are available in the attack dialog so if you're skipping the dialolg by default but want to bypass them for an individual attack, be sure to hold shift to bring up the system's attack dialog.
    - When skipped, a footnote is added so the GM has visibility when a player skips a bonus like this
- The "disablers" on the actor settings now include a journal link to the documentation so you can verify if that's something you want to disable for this actor.
- Shooting into melee now ignores the penalty if the attacker has a condition which would preclude them from attacking

### New Targeted Bonuses
- Maximize Damage
  - This maximizes damage for anything it targets

### New Targeted Targets
- Action Target
  - You can now also target individual actions instead of just an entire item
- Natural Weapon Target
- Thrown Weapon Target

### Specific Bonuses
- Versatile Performance can now have multiple sets on a single feature
- Offset Modifier bonus now has a toggle-able "set" option so instead of modifying a given type of bonus, you can instead completely override the total bonus to a specific value (e.g. "add +1 to all luck bonuses" versus "set all morale bonuses to 0")
- Function Target now shows up in the bonus picker dialog when the user is a GM

### Buffs
- Added True Strike buff
- Added Misfortune (hex) debuff

### Bugfixes
- Fixed z-height calculations with reach attacks
- Fixed ammo enriching footnotes
- Fixed item targets when modifying an actor/item within a compendium
- Fixed Trap Actors (and other non-character actors) breaking during data prep
- The D20 icon in the Roll Bonuses header on items now correctly opens the in-game documentation
- Fixed Permanent skill bonus that broke with v10
- Fixed Versatile Performance targeting subskills

### Removed
- Some Specific Bonuses were removed as the system now directly supports them.
  - CL/DC bonuses for everything and specific schools have been migrated to the system's native changes
    - CL/DC bonuses for specific elements remain unchanged
- Some Specific bonuses were removed as they're better suited as Targeted Bonuses
  - Critical "specific bonuses" were removed and automatically migrated to targeted bonuses.

promote roll bonuses to the global scope
