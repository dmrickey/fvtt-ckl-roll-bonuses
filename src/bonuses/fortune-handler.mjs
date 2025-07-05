import { MODULE_NAME } from '../consts.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localize } from '../util/localize.mjs';
import { registerSetting } from '../util/settings.mjs';

const fortune = 'fortune';
const misfortune = 'misfortune';

const abilityFortune = 'fortune-ability';
const abilityMisfortune = 'misfortune-ability';
const attackFortune = 'fortune-attack';
const attackMisfortune = 'misfortune-attack';
const babFortune = 'fortune-bab';
const babMisfortune = 'misfortune-bab';
const clFortune = 'fortune-cl';
const clMisfortune = 'misfortune-cl';
const cmbFortune = 'fortune-cmb';
const cmbMisfortune = 'misfortune-cmb';
const concentrationFortune = 'fortune-concentration';
const concentrationMisfortune = 'misfortune-concentration';
const initFortune = 'fortune-init';
const initWarsightFortune = 'fortune-warsight-init';
const initMisfortune = 'misfortune-init';
const saveFortune = 'fortune-save';
const saveMisfortune = 'misfortune-save';
const selfFortune = 'fortune-self-item';
const selfMisfortune = 'misfortune-self-item';
const skillFortune = 'fortune-skill';
const skillMisfortune = 'misfortune-skill';

/**
 * @type {{[key: string]: (key?: string, actor?: Nullable<ActorPF>) => string}}
 */
let fortuneHintLookup = {};

/**
 * Counts the amount of items that have a given boolean flags
 * @param {EmbeddedCollection<ItemPF>} items
 * @param {string[]} flags
 * @returns {{[key: string]: number}} - the count of items that have the given boolean flags
 */
const countBFlags = (items, ...flags) => {
    const count = Object.fromEntries(flags.map((flag) => [flag, 0]));

    (items || []).forEach((/** @type {ItemPF} */item) => {
        if (!item.isActive) return;

        flags.forEach((flag) => {
            if (item.hasItemBooleanFlag(flag)) {
                count[flag]++;
            }
        });
    });

    return count;
}

Hooks.once('ready', () => {
    fortuneHintLookup = {
        // @ts-ignore - because I typed Abilities too strongly and ignoring here is easier
        [abilityFortune]: (key) => key ? pf1.config.abilities[key] : localize('PF1.Ability'),
        [attackFortune]: (key) => !key ? localize('PF1.Attack') : key === 'melee' ? localize('PF1.Melee') : localize('PF1.Ranged'),
        [babFortune]: () => localize('PF1.BABAbbr'),
        [clFortune]: (_key) => localize('PF1.CasterLevel'),
        [cmbFortune]: (_key) => localize('PF1.CMBAbbr'),
        [concentrationFortune]: (_key) => localize('PF1.Concentration'),
        [initFortune]: () => localize('PF1.Initiative'),
        [initWarsightFortune]: () => localize('PF1.Initiative'),
        // @ts-ignore - because I typed SavingThrows too strongly and ignoring here is easier
        [saveFortune]: (key) => key ? pf1.config.savingThrows[key] : localize('PF1.Save'),
        [selfFortune]: () => localize('target-choice.self'),
        // @ts-ignore
        [skillFortune]:
            (/** @type {SkillId | undefined} */ key, actor) => !key ? localize('PF1.Skills') : pf1.config.skills[key] || getProperty(actor?.system.skills ?? {}, key)?.name,
    };
});


class Settings {
    static get #fortuneStacksKey() { return 'fortuneStacks'; }

    static get fortuneStacks() { return Settings.#getSetting(this.#fortuneStacksKey); }
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key); }

    static {
        registerSetting({ key: this.#fortuneStacksKey, settingType: Boolean, defaultValue: true });
    }
}

registerItemHint((hintcls, actor, item, _data) => {
    const bFlags = Object.entries(item.system?.flags?.boolean ?? {})
        .filter(([_, value]) => !!value)
        .map(([key, _]) => key);

    const fortunes = bFlags.filter(flag => flag.startsWith('fortune'));
    const misfortunes = bFlags.filter(flag => flag.startsWith('misfortune'));

    const  /** @type {Hint[]} */ hints = [];

    const buildHint = (
        /** @type {string[]} */ found,
        /** @type {boolean} */ isFortune,
    ) => {
        if (!found.length) return;

        const base = isFortune ? fortune : misfortune;
        let label = localize(base);
        let /**@type {string[]}*/ extra = [];

        found.forEach(f => {
            if (f === base) return;

            let [fType, ...rest] = f.split('_');
            const key = rest.join('_');
            extra.push(fortuneHintLookup[fType.slice(isFortune ? 0 : 3)](key, actor));
        });

        if (extra.length) {
            extra.sort();
            label = `${label} (${extra.join(', ')})`;
        }
        hints.push(hintcls.create(label, [], {}));
    }

    buildHint(fortunes, true);
    buildHint(misfortunes, false);

    return hints;
});

/**
 *
 * @param {object} options
 * @param {Nullable<string>} [options.dice]
 * @param {Nullable<number>} [options.fortuneCount]
 * @param {Nullable<number>} [options.misfortuneCount]
 * @returns
 */
export const handleFortune = (options) => {
    options.dice ||= '1d20';
    options.fortuneCount ||= 0;
    options.misfortuneCount ||= 0;

    const roll = RollPF.create(options.dice).evaluateSync({ maximize: true });
    const dice = roll.dice[0];
    if (!dice) {
        // no actual roll, a static number was probably given
        return;
    }
    const { modifiers, results } = dice;
    const totalThrown = results.length;
    if (roll.dice.length !== 1 // if there was more than a single dice term
        || dice.faces !== 20 // if the die is not a d20
        || modifiers.length > 1 // if there were somehow multiple dice modifier text on the throw
        || results.filter(x => !x.discarded).length !== 1 // if more than a single die was kept into the result
    ) {
        // then don't calculate fortune/misfortune because it's a weird roll that either I can't assume the rules for or the system won't allow
        return;
    }

    const mod = modifiers[0] || '';
    if (mod.includes('dh') || mod.includes('kl')) {
        options.misfortuneCount += (totalThrown - 1);
    }
    else if (mod.includes('kh') || mod.includes('dl')) {
        options.fortuneCount += (totalThrown - 1);
    }

    if (options.fortuneCount === options.misfortuneCount) {
        options.dice = '1d20';
        return;
    }

    const qty = Settings.fortuneStacks
        ? Math.abs(options.fortuneCount - options.misfortuneCount) + 1
        : 2;

    if (options.fortuneCount > options.misfortuneCount) {
        options.dice = `${qty}d20kh`;
    }
    else if (options.misfortuneCount > options.fortuneCount) {
        options.dice = `${qty}d20kl`;
    }
};

/**
 * @this {CombatantPF}
 * @param {string} d20
 * @returns {string}
 */
function handleInitiative(d20) {
    const defaultParts = [];

    const actor = this.actor;

    const options = this.actor?.getInitiativeOptions?.() ?? {};
    if (options.check !== false) {
        d20 ||= pf1.dice.D20RollPF.standardRoll;
        // #region MY OVERRIDE
        if (actor?.items?.size) {
            const options = {
                dice: d20,
                fortuneCount: 0,
                misfortuneCount: 0,
            };

            const count = countBFlags(actor.items, fortune, misfortune, initFortune, initMisfortune, initWarsightFortune);

            options.fortuneCount += count[fortune];
            options.misfortuneCount += count[misfortune];

            options.fortuneCount += count[initFortune];
            options.misfortuneCount += count[initMisfortune];

            if (count[initWarsightFortune]) {
                options.fortuneCount += 2;
            }

            handleFortune(options);
            d20 = options.dice;
        }

        defaultParts.push(d20);
    }

    // #region REMOVE LABEL so initiative bonus works
    defaultParts.push(`@attributes.init.total`);
    if (actor && game.settings.get("pf1", "initiativeTiebreaker")) {
        // #region wrap init in parens so init bonus works
        defaultParts.push(`((@attributes.init.total) / 100)[${game.i18n.localize("PF1.Tiebreaker")}]`);
    }
    const parts = CONFIG.Combat.initiative.formula ? CONFIG.Combat.initiative.formula.split(/\s*\+\s*/) : defaultParts;
    if (!actor) return parts[0] || "0";
    // @ts-ignore
    return parts.filter((p) => p !== null).join(" + ");
};

Hooks.once('init', () => {
    libWrapper.register(MODULE_NAME, 'pf1.documents.CombatantPF.prototype._getInitiativeFormula', handleInitiative, libWrapper.OVERRIDE);
});

// item use does not fire through this hook, so it needs its own dice handling below
Hooks.on(customGlobalHooks.d20Roll, ( /** @type {{ dice?: any; fortuneCount: any; misfortuneCount: any; actionID?: any; }} */ options) => handleFortune(options));

const actionUseProcessFortune = (
    /** @type {ActionUse} */ actionUse,
) => {
    const { action, item } = actionUse;
    if (!item?.actor) return;

    const options = {
        fortuneCount: 0,
        misfortuneCount: 0,
        dice: actionUse.shared.dice,
    }

    if (item.hasItemBooleanFlag(selfFortune)) {
        options.fortuneCount++;
    }
    else if (item.hasItemBooleanFlag(selfMisfortune)) {
        options.misfortuneCount++;
    }

    const fortunesToFind = [fortune, attackFortune];
    const misfortunesToFind = [misfortune, attackMisfortune];

    switch (action.actionType) {
        case 'msak':
        case 'mwak':
            fortunesToFind.push(`${attackFortune}_melee`);
            misfortunesToFind.push(`${attackMisfortune}_melee`);
            break;
        case 'rsak':
        case 'rwak':
            fortunesToFind.push(`${attackFortune}_ranged`);
            misfortunesToFind.push(`${attackMisfortune}_ranged`);
            break;
        case 'mcman':
            fortunesToFind.push(`${attackFortune}_melee`);
            fortunesToFind.push(cmbFortune);
            fortunesToFind.push(`${cmbFortune}_melee`);
            misfortunesToFind.push(`${attackMisfortune}_melee`);
            misfortunesToFind.push(cmbMisfortune);
            misfortunesToFind.push(`${cmbMisfortune}_melee`);
            break;
        case 'rcman':
            fortunesToFind.push(`${attackFortune}_ranged`);
            fortunesToFind.push(cmbFortune);
            fortunesToFind.push(`${cmbFortune}_ranged`);
            misfortunesToFind.push(`${attackMisfortune}_ranged`);
            misfortunesToFind.push(cmbMisfortune);
            misfortunesToFind.push(`${cmbMisfortune}_ranged`);
            break;
    }

    const count = countBFlags(item.actor.items, ...fortunesToFind, ...misfortunesToFind);

    fortunesToFind.forEach((f) => options.fortuneCount += count[f]);
    misfortunesToFind.forEach((f) => options.misfortuneCount += count[f]);

    handleFortune(options);
    actionUse.shared.dice = options.dice;
};
LocalHookHandler.registerHandler(localHooks.actionUseProcess, actionUseProcessFortune)

Hooks.on('pf1PreActorRollSkill', (
    /** @type {ActorPF} */ actor,
    /** @type {{ fortuneCount: number; misfortuneCount: number; }} */ options,
    /** @type {string} */ skillId
) => {
    let fortuneCount = 0;
    let misfortuneCount = 0;

    const count = countBFlags(actor?.items, fortune, misfortune, skillFortune, skillMisfortune, `${skillFortune}_${skillId}`, `${skillMisfortune}_${skillId}`);

    fortuneCount += count[fortune];
    misfortuneCount += count[misfortune];
    fortuneCount += count[skillFortune];
    misfortuneCount += count[skillMisfortune];

    fortuneCount += count[`${skillFortune}_${skillId}`];
    misfortuneCount += count[`${skillMisfortune}_${skillId}`];

    options.fortuneCount = fortuneCount;
    options.misfortuneCount = misfortuneCount;
});

Hooks.on('pf1PreActorRollAttack', (
    /** @type {ActorPF} */ actor,
    /** @type {{ melee: boolean, fortuneCount: number; misfortuneCount: number; }} */ options,
) => {
    let fortuneCount = 0;
    let misfortuneCount = 0;

    let rangeFortune = attackFortune;
    let rangeMisfortune = attackMisfortune;
    if (options.melee) {
        rangeFortune += '_melee';
        rangeMisfortune += '_melee';
    }
    else {
        rangeFortune += '_ranged';
        rangeMisfortune += '_ranged';
    }

    const count = countBFlags(actor?.items, fortune, misfortune, attackFortune, attackMisfortune, rangeFortune, rangeMisfortune);

    fortuneCount += count[fortune];
    misfortuneCount += count[misfortune];
    fortuneCount += count[attackFortune];
    misfortuneCount += count[attackMisfortune];
    fortuneCount += count[rangeFortune];
    misfortuneCount += count[rangeMisfortune];

    options.fortuneCount = fortuneCount;
    options.misfortuneCount = misfortuneCount;
});

Hooks.on('pf1PreActorRollBab', (
    /** @type {ActorPF} */ actor,
    /** @type {{ fortuneCount: number; misfortuneCount: number; }} */ options,
) => {
    let fortuneCount = 0;
    let misfortuneCount = 0;

    const count = countBFlags(actor?.items, fortune, misfortune, babFortune, babMisfortune);

    fortuneCount += count[fortune];
    misfortuneCount += count[misfortune];
    fortuneCount += count[babFortune];
    misfortuneCount += count[babMisfortune];

    options.fortuneCount = fortuneCount;
    options.misfortuneCount = misfortuneCount;
});

Hooks.on('pf1PreActorRollCl', (
    /** @type {{ items: EmbeddedCollection<ItemPF>; }} */ actor,
    /** @type {{ rollData: RollData; fortuneCount: number; misfortuneCount: number; }} */ options,
    /** @type {string | number} */ bookId,
) => {
    let fortuneCount = 0;
    let misfortuneCount = 0;

    const name = options.rollData.spells[bookId].name;
    const ids = Object.entries(options.rollData.spells)
        .filter(([_id, value]) => value.name === name)
        .map(([id, _value]) => id);

    const idFortunes = ids.map((id) => `${clFortune}_${id}`);
    const idMisfortunes = ids.map((id) => `${clMisfortune}_${id}`);

    const count = countBFlags(actor?.items, fortune, misfortune, clFortune, clMisfortune, ...idFortunes, ...idMisfortunes);

    fortuneCount += count[fortune];
    misfortuneCount += count[misfortune];
    fortuneCount += count[clFortune];
    misfortuneCount += count[clMisfortune];

    idFortunes.forEach((id) => fortuneCount += count[id]);
    idMisfortunes.forEach((id) => misfortuneCount += count[id]);

    options.fortuneCount = fortuneCount;
    options.misfortuneCount = misfortuneCount;
});

Hooks.on('pf1PreActorRollConcentration', (
    /** @type {ActorPF} */ actor,
    /** @type {{ rollData: RollData; fortuneCount: number; misfortuneCount: number; }} */ options,
    /** @type {string | number} */ bookId,
) => {
    let fortuneCount = 0;
    let misfortuneCount = 0;

    const name = options.rollData.spells[bookId].name;
    const ids = Object.entries(options.rollData.spells)
        .filter(([_id, value]) => value.name === name)
        .map(([id, _value]) => id);

    const idFortunes = ids.map((id) => `${concentrationFortune}_${id}`);
    const idMisfortunes = ids.map((id) => `${concentrationMisfortune}_${id}`);

    const count = countBFlags(actor?.items, fortune, misfortune, concentrationFortune, concentrationMisfortune, ...idFortunes, ...idMisfortunes);

    fortuneCount += count[fortune];
    misfortuneCount += count[misfortune];
    fortuneCount += count[concentrationFortune];
    misfortuneCount += count[concentrationMisfortune];

    idFortunes.forEach((id) => fortuneCount += count[id]);
    idMisfortunes.forEach((id) => misfortuneCount += count[id]);

    options.fortuneCount = fortuneCount;
    options.misfortuneCount = misfortuneCount;
});

const handleAbility = (
    /** @type {ActorPF} */ actor,
    /** @type {{ fortuneCount: number; misfortuneCount: number; }} */ options,
    /** @type {keyof Abilities} */ ability
) => {
    let fortuneCount = 0;
    let misfortuneCount = 0;

    const count = countBFlags(actor?.items, fortune, misfortune, abilityFortune, abilityMisfortune, `${abilityFortune}_${ability}`, `${abilityMisfortune}_${ability}`);

    fortuneCount += count[fortune];
    misfortuneCount += count[misfortune];
    fortuneCount += count[abilityFortune];
    misfortuneCount += count[abilityMisfortune];

    fortuneCount += count[`${abilityFortune}_${ability}`];
    misfortuneCount += count[`${abilityMisfortune}_${ability}`];

    options.fortuneCount = fortuneCount;
    options.misfortuneCount = misfortuneCount;
};
Hooks.on('pf1PreActorRollAbility', handleAbility);

const handleSavingThrow = (
    /** @type {ActorPF} */ actor,
    /** @type {{ fortuneCount: number; misfortuneCount: number; }} */ options,
    /** @type {keyof SavingThrows} */ savingThrowId
) => {
    let fortuneCount = 0;
    let misfortuneCount = 0;

    const count = countBFlags(actor?.items, fortune, misfortune, saveFortune, saveMisfortune, `${saveFortune}_${savingThrowId}`, `${saveMisfortune}_${savingThrowId}`);

    fortuneCount += count[fortune];
    misfortuneCount += count[misfortune];
    fortuneCount += count[saveFortune];
    misfortuneCount += count[saveMisfortune];

    fortuneCount += count[`${saveFortune}_${savingThrowId}`];
    misfortuneCount += count[`${saveMisfortune}_${savingThrowId}`];

    options.fortuneCount = fortuneCount;
    options.misfortuneCount = misfortuneCount;
};
Hooks.on('pf1PreActorRollSave', handleSavingThrow);

//** At some point I should use this afterwards instead of beforehand */
// const test = (...args) => {
//     debugger;
// }
// Hooks.on('pf1PreD20Roll', test);
