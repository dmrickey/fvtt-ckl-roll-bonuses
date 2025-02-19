## Roll Bonuses 2.18.0

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
