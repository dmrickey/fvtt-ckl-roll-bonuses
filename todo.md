Focus Feats -- requires 0.83.0
- Martial Focus
- Gnome Weapon Focus
- Weapon Focus
  - Greater Weapon Focus

AC Bonus -- requires 0.83.0
- Armor Focus
  - Improved Armor Focus

Skills
- Bard's Versatile Performance
  - configure a skill to be based on another skill
- skill headband
  - configure an item to give you specific ranks (0.82.5 only gives bonus ranks, not ranks to specific skills)

- add the formula class to skill inputs
- consumable buffs - requires foundry v10 / pf1 0.83.0
    - idea is to create a a flag on a buff that will add the bonus in "prehook" (and/or use built in changes) but use the new pf1 v.next posthook to disable the buff when it is consumed

- Air Affinity: Sylph sorcerers with the elemental (air) bloodline treat their Charisma scores as 2 points higher for the purposes of all sorcerer spells and class abilities
    - Specifically just "treat <ability score> higher/lower for <spell book>"
    - maybe also "treat <ability score> higher/lower for <class ability>" -- would need to be based off of class key and ability that has a parent as that class
