Mana's example for changing an already rolled attack before it's finalized. This is in a script call. Something similar could also be done in the current hook. But this won't be necessary in v10 with the new hooks I've added that will be able to modify damage before it's rolled.

```js
const attack = shared.attackData.chatAttacks[0];
const damage = await new pf1.dice.DamageRoll("3d6", {}, {
  damageType: attack.damage.rolls[0].options.damageType
}).evaluate({ async: true });
attack.damage.rolls.push(damage);
attack.damage.total += damage.total;
```

```js
const firstRoll = attack.damage.rolls[0]; 
const dice = firstRoll.dice.reduce((t,d) => t + d.number, 0);
const damage = await new pf1.dice.DamageRoll(`${dice}d6`, {}, {
  damageType: firstRoll.options.damageType
}).evaluate({ async: true });
```
