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
  - This maximizes damage for anything it tagets

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
