#### Class Features
- Gunslinger
  - Gun Training
    - Look for weapons within the "firearms" weapon group, then look for weapon types like Weapon Focus does.
    - Figure out if I want one input for mulitple choices - or multiple inputs with one choice each - Maybe use a trait selector for input given the choices
- Fighter
  - Weapon Training
    - Choose a weapons group for each stage
    - Figure out if I want one input for mulitple choices - or multiple inputs with one choice each - Maybe use a trait selector for input given the choices

#### Racial Features
- Air Affinity: Sylph sorcerers with the elemental (air) bloodline treat their Charisma scores as 2 points higher for the purposes of all sorcerer spells and class abilities
    - Specifically just "treat <ability score> higher/lower for <spell book>"
    - maybe also "treat <ability score> higher/lower for <class ability>" -- would need to be based off of class key and ability that has a parent as that class

#### Skills
- skill headband
  - configure an item to give you specific ranks (0.82.5 only gives bonus ranks, not ranks to specific skills)
- Make sure two versatile performances for the same skill work if only one is turned on

#### Misc
- add the formula class to skill inputs
- consumable buffs - requires later release (waiting on issue #1946) (did not make it into v9)
  - idea is to create a a flag on a buff that will add the bonus in "prehook" (and/or use built in changes) but use the new pf1 v.next posthook to disable the buff when it is consumed
