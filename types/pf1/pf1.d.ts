import { MODULE_NAME } from '../../src/consts.mjs';
import { BaseBonus } from '../../src/targeted/bonuses/base-bonus.mjs';
import { BaseTarget } from '../../src/targeted/targets/base-target.mjs';
import Document from '../foundry/common/abstract/document.mjs';

export {};

declare global {
    abstract class BaseDocument extends Document {
        getRollData(): RollData;
        getFlag(moduleName: string, key: string): any;
        async setFlag<T>(moduleName: string, key: string, value: T);
        updateSource(changes: Partial<this>, options?: object);
        uuid: string;
    }

    abstract class ItemDocument extends BaseDocument {}

    interface Abilities {
        str: 'Strength';
        dex: 'Dexterity';
        con: 'Constitution';
        int: 'Intelligence';
        wis: 'Wisdom';
        cha: 'Charisma';
    }

    type ActionType = 'msak' | 'mwak' | 'rsak' | 'rwak' | 'mcman' | 'rcman';

    class ActorPF extends BaseDocument {
        getSkillInfo(skillId: string): SkillRollData;

        [MODULE_NAME]: {
            [key: string]: number | string | object | array;
        };

        /**
         * Gets the actor's roll data.
         * @param refresh - pass true to force the roll data to recalculate
         * @returns The actor's roll data
         */
        getRollData(args?: { refresh?: boolean }): RollData;

        id: string;

        itemFlags: {
            /**
             * The tags for Items that are active with a boolean flag
             */
            boolean: { [key: string]: { sources: ItemPF[] } };
            dictionary: ItemDictionaryFlags;
        };

        items: EmbeddedCollection<ItemPF>;

        name: string;

        system: {
            details: {
                alignment: string;
            };
            skills: {
                [key: string]: {
                    name: string;
                    subSkills: {
                        [key: string]: {
                            name: string;
                        };
                    };
                };
            };
        };
    }

    type ConditionalPart = [number | string, TraitSelectorValuePlural, false];
    class ConditionalPartsResults {
        'attack.crit': string[];
        'attack.normal': string[];
        'damage.crit': ConditionalPart[];
        'damage.nonCrit': ConditionalPart[];
        'damage.normal': ConditionalPart[];
    }

    class ActionUseShared {
        action: any;
        attackBonus: string[];
        attacks: any;
        conditionalPartsCommon: any;
        conditionals: any;
        damageBonus: string[];
        dice: string;
        powerAttack: boolean;
        rollData: RollData;

        // custom data
        fortuneCount;
        misfortuneCount;
    }
    class ActionUse<T extends ItemPF = ItemPF> {
        action: Action;
        actor: ActorPF;
        item: T;
        shared: ActionUseShared;
    }

    class ChatAttack {
        action: ItemAction;
        attackNotes: string[];
        effectNotes: string[];
        rollData: RollData;
        attack: D20RollPF;

        d20: Die;
        dice: Die[];

        flavor: string;
        formula: string;
        isCrit: boolean;
        isDeterministic: boolean;
        isFumble: boolean;
        isNat1: boolean;
        isNat20: boolean;
        isNormal: boolean;
        isNumber: boolean;
        isStatic: boolean;
        natural: number;
        result: string;
        simplifiedFormula: string;
        total: number;
        totalHalved: number;
    }

    class Die {
        faces: number;
        isIntermediate: boolean;
        modifiers: string[];
        number: number;
        options: { flavor?: string };
        results: { result: number; active: boolean }[];
    }

    class D20RollPF {
        data: RollData;
        options: RollOptions;
        terms: RollTerm[];
        formula: string;
    }

    class ChatMessagePF extends BaseDocument {
        content: string;
    }

    class CombatantPF {
        actor: ActorPF;
    }

    /**
     * Colletion of dictionary flags
     * {key: Flag}
     */
    interface DictionaryFlags {
        [key: string]: FlagValue;
    }

    interface ItemDictionaryFlags {
        /**
         * Dictionary flags keyed by Item tags
         */
        [key: string]: DictionaryFlags;
    }

    type FlagValue = string | number;
    interface DamagePart {
        formula: string;
        type: TraitSelectorValuePlural;
    }

    class ItemAction {
        id: string;
        actor: ActorPF;
        data: {
            ability: {
                attack: string;
                critMult: number;
                critRange: number;
                damage: string;
                damageMult: number;
            };
            actionType: ActionType;
            damage: {
                parts: DamagePart[];
            };
        };
        item: ItemPF;
        static defaultDamageType: TraitSelectorValuePlural;
        hasAttack: boolean;
    }

    interface ItemChange {
        /** hardcoded bonus type to use instead of modifier */
        type: string | null | undefined;
        modifier: BonusModifers;
        parent: undefined | ItemPF;

        data: {
            flavor: undefined;
            formula: string;
            modifier: BonusModifers;
            operator: '+' | '-';
            priority: number;
            subTarget: 'skill.kna';
            target: BuffTarget = 'skillzz';
            value: number;
        };
    }

    /** used for weapons and attacks */
    interface TraitSelector {
        /** custom entries split by ; */
        custom: string;
        value: string[];
    }

    /** used for damage parts */
    interface TraitSelectorValuePlural {
        /** custom entries split by ; */
        custom: string;
        values: string[];
    }

    /** @see {CONST.TOKEN_DISPOSITIONS} */
    type DispositionLevel =
        | /** secret */ -2
        | /** hostile */ -1
        | /** neutral */ 0
        | /** friendly */ 1;

    /** @see {CONST.DOCUMENT_PERMISSION_LEVELS} */
    type PermissionLevel =
        | /** inherit */ -1
        | /** none */ 0
        | /** limited */ 1
        | /** observer */ 2
        | /** owner */ 3;

    interface TokenDocumentPF extends ItemDocument {
        id: string;
        actor: ActorPF;
        displayName: 0 | 10 | 20 | 30 | 40 | 50;
        disposition: DispositionLevel;
        name: string;
        permission: PermissionLevel;
        texture: { src: string };
        visible: boolean;
        object: TokenPF;
    }

    interface TokenPF {
        isVisible: boolean;
    }

    class ItemPF<
        SystemData extends SystemItemData = SystemItemData
    > extends ItemDocument {
        [MODULE_NAME]: {
            bonuses: (typeof BaseBonus)[];
            targets: (typeof BaseTarget)[];
            [key: string]: number | string | object | array;
        };

        get hasAction(): boolean;
        actions: EmbeddedCollection<ItemAction>;

        actor: ActorPF;
        firstAction: ItemAction;
        flags: {
            core: { sourceId: string };
            [key: string]: any;
        };
        id: string;
        img: string;
        isActive: boolean;
        name: string;

        parent: ActorPF | ItemPF;

        /**
         * @deprecated use @see actor
         */
        parentActor: ActorPF;
        system: SystemData;
        type: ItemType;

        /**
         * Gets value for the given dictionary flag key
         * @param key
         */
        getItemDictionaryFlag(key: string): string | number;

        // example output
        // item.getItemDictionaryFlags()
        // {
        //   "greaterElementalFocus": "cold",
        //   "schoolClOffset": "evo",
        //   "spellFocus": "",
        //   "schoolClOffsetFormula": "-3",
        //   "schoolClOffsetTotal": -3
        // }
        /**
         * Gets the Item's dictionary flags.
         */
        getItemDictionaryFlags(): DictionaryFlags;

        /**
         * Sets the given dictionary flag on the item
         * @param key
         * @param value
         */
        setItemDictionaryFlag(key: string, value: FlagValue);

        /**
         * @param key - THe key for the boolean flag
         * @returns True if the item has the boolean flag
         */
        hasItemBooleanFlag(key: string): boolean;
    }

    class ItemAttackPF extends ItemPF<SystemItemDataAttackPF> {}
    class ItemEquipmentPF extends ItemPF<SystemItemDataEquipmentPF> {}
    class ItemFeatPF extends ItemPF {}
    class ItemLootPF extends ItemPF {
        subType: 'gear' | 'ammo' | 'tradeGoods' | 'misc';
    }
    class ItemSpellPF extends ItemPF<SystemItemDataSpellPF> {
        learnedAt: {
            class: { [key: string]: number };
            domain: { [key: string]: number };
        };

        /** @deprecated Spells don't have tags */
        tag: string;
    }
    class ItemWeaponPF extends ItemPF<SystemWeaponPF> {}

    class SystemItemData {
        links: {
            children: { name: string; id: string }[];
            charges?: unknown[];
        };
        broken: boolean;
        flags: {
            boolean: {};
            dictionary: DictionaryFlags;
        };
        tag: string;
        tags: string[];
    }
    class SystemItemDataAttackPF extends SystemItemData {
        baseTypes: string[];
        // links: { children: { name: string; id: string }[] };
        weaponGroups: TraitSelector?;
    }
    class SystemIteMDataBuffPF extends SystemItemData {}
    class SystemItemDataEquipmentPF extends SystemItemData {
        armor: {
            acp: number;
            dex: number | null;
            enh: number;
            value: number;
        };
        baseTypes: string[];
        // links: { children: { name: string; id: string }[] };
        proficient: boolean;
        slot: 'armor' | 'shield';
    }
    class SystemItemDataSpellPF extends SystemItemData {
        /** @deprecated not until v10 */
        descriptors: {
            value: string[];
            custom: string[];
        };
        school: string;

        /** @deprecated use until v10 */
        types: string;
    }
    class SystemWeaponPF extends SystemItemData {
        baseTypes: string[];
        enh: number;
        // links: { children: { name: string; id: string }[] };
        masterwork: boolean;
        proficient: boolean;
        weaponGroups: TraitSelector;
    }

    type ItemType =
        | 'attack'
        | 'base'
        | 'buff'
        | 'class'
        | 'consumable'
        | 'container'
        | 'equipment'
        | 'feat'
        | 'loot'
        | 'race'
        | 'spell'
        | 'weapon';

    interface AbilityRollData {
        base: number;
        baseMod: number;
        checkMod: number;
        damage: number;
        drain: number;
        mod: number;
        penalty: number;
        total: number;
        userPenalty: number;
        value: number;
    }
    interface ACRollData {
        base: number;
        enh: number;
        misc: number;
        total: number;
    }
    interface CurrencyRollData {
        pp: number;
        gp: number;
        sp: number;
        cp: number;
    }
    interface AttributeRollData {
        // todo
    }
    interface ClassRollData {
        bab: 'low' | 'med' | 'high';
        fc: { hp: number; skill: number; alt: number };
        hd: number;
        hitDice: number;
        hp: boolean;
        level: number;
        mythicTier: number;
        name: string;
        savingThrows: { fort: number; ref: number; will: number };
    }
    interface DetailsRollData {
        age: string;
        alignment: 'lg' | 'ln' | 'le' | 'ng' | 'tn' | 'ne' | 'cg' | 'cn' | 'ce';
        biography: { value: string };
        bonusFeatFormula: string;
        bonusSkillRankFormula: string;
        carryCapacity: {
            bonus: { user: number; total: number };
            multiplier: { base: number; user: number; total: number };
        };
        cr: { base: number };
        deity: string;
        gender: string;
        height: string;
        level: { value: number; min: number; max: number };
        mythicTier: number;
        notes: { value: string };
        tooltip: {
            hideArmor: boolean;
            hideBuffs: boolean;
            hideClothing: boolean;
            hideConditions: boolean;
            hideHeld: boolean;
            hideName: boolean;
            name: string;
        };
        weight: string;
        xp: { value: number; max: number; pct: number };
    }
    interface ResourceRollData {
        max: number;
        value: number;
        _id: string;
    }
    interface SkillRollData {
        ability: keyof Abilities;
        acp: boolean;
        changeBonus: number;
        cs: boolean;
        rank: number;
        rt: boolean;
        subSkills?: SkillRollData[];

        /** custom skills */
        background?: boolean;
        /** compendium link */
        journal?: string;
        name?: string;
    }
    interface TraitsRollData {
        // TODO
        armorProf: {
            custom: string;
            customTotal: string;
            total: ('lgt' | 'med' | 'hvy' | 'shl' | 'twr')[];
            value: [];
        };
        aura: { custom: string };
        ci: { value: string[]; custom: string };
        cres: string;
        di: { value: string[]; custom: string };
        dr: { value: string[]; custom: string };
        dv: { value: string[]; custom: string };
        eres: { value: string[]; custom: string };
        fastHealing: string;
        humanoid: true;
        languages: {
            value: string[];
            custom: string;
            total: string[];
            customTotal: string;
        };
        regen: string;
        senses: {
            bs: number;
            bse: number;
            custom: string;
            dv: number;
            ll: { enabled: true; multiplier: { dim: number; bright: number } };
            sc: number;
            si: boolean;
            sid: boolean;
            tr: boolean;
            ts: number;
        };
        size: ActorSize;
        stature: ActorStature;
        type: string;
        weaponProf: {
            custom: string;
            customTotal: string;
            total: string[];
            value: string[];
        };
    }
    interface SpellBookRollData {
        ability: keyof Abilities;
        abilityMod: number;
        altName: string;
        arcaneSpellFailure: true;
        autoSpellLevelCalculation: true;
        autoSpellLevels: true;
        baseDCFormula: string;
        castPerDayAllOffsetFormula: string;
        casterType: SpellcastingLevelType;
        cl: {
            formula: string;
            autoSpellLevelCalculationFormula: string;
            total: number;
            autoSpellLevelTotal: number;
        };
        clNotes: string;
        class: string;
        concentration: { total: number };
        concentrationFormula: string;
        concentrationNotes: string;
        domainSlotValue: number;
        hasCantrips: true;
        inUse: true;
        label: string;
        name: string;
        preparedAllOffsetFormula: string;
        psychic: false;
        range: { close: number; medium: number; long: number; cl: number };
        spellPoints: {
            useSystem: false;
            value: number;
            maxFormula: string;
            restoreFormula: string;
            max: number;
        };
        spellPreparationMode: SpellcastingType;
        spellSlotAbilityBonusFormula: string;
    }
    interface SpellRollData {
        // TODO
    }

    /**
     * Roll Data used for resolving formulas
     */
    interface RollData<T extends SystemItemData = SystemItemData> {
        [MODULE_NAME]: {
            [key: string]: number | string | object | array;
        };
        abilities: Record<keyof Abilities, AbilityRollData>;
        ac: ACRollData;
        altCurrency: CurrencyRollData;
        armor: {
            ac: number;
            enh: number;
            total: number;
            type: number;
        };
        attributes: AttributeRollData;
        classes: Record<string, ClassRollData>;
        conditions: { loseDexToAC: boolean };
        currency: CurrencyRollData;
        customSkills: Record<unknown, unknown>;
        dFlags: ItemDictionaryFlags;
        dc: number;
        details: DetailsRollData;
        range: {
            melee: number;
            reach: number;
        };
        resources: Record<string, ResourceRollData>;

        shield: {
            ac: number;
            enh: number;
            total: number;
            type: number;
        };
        size: number;
        skills: Record<string, SkillRollData>;
        spells: Record<string, SpellBookRollData>;
        traits: TraitsRollData;
        // [key: string]: any,

        // TODO where does this come from?
        conditionals?: any;

        // item roll data
        dFlags?: DictionaryFlags;
        item: T;

        // buff roll data
        level?: number;

        // spell roll data
        cl?: number;
        sl?: number;
        classLevel?: number;
        ablMod?: number;

        // action roll data
        action?: {
            _id: string;
            ability: {
                attack: keyof Abilities;
                critMult: number | string;
                critRange: number;
                damage: keyof Abilities;
                damageMult: number;
            };
            damage: {
                parts: { formula: string; type: TraitSelectorValuePlural }[];
            };
        };

        // action use roll data
        attackCount: number;
        chargeCostBonus?: number;
        d20?: string;
        dcBonus?: number;
        powerAttackBonus?: number;
        powerAttackPenalty?: number;
    }

    interface ItemActionRollAttackHookArgs {
        formula: string;
        options: RollOptions;
    }
    interface RollOptions {
        bonus: string;
        critical: number;
        flavor: string;
        fumble: number;
        staticRoll?: string?;
    }

    interface RollPF extends Roll {
        /** returns true if formula has no flavor and no dice (i.e. reduces to a single number) */
        isNumber: boolean;
        simplifiedFormula: string;

        prototype: typeof RollPF;

        /**
         * Safely get the result of a roll, returns 0 if unsafe.
         * @param formula - The string that should resolve to a number
         * @param rollData - The roll data used for resolving any variables in the formula
         */
        static safeTotal(
            formula: string | number,
            rollData?: Nullable<RollData>
        ): number;

        /**
         * Safely get the result of a roll, returns 0 if unsafe.
         * @param formula - The string that should resolve to a number
         * @param rollData - The roll data used for resolving any variables in the formula
         */
        static safeRoll(
            formula: string | number,
            rollData?: Nullable<RollData>
        ): RollPF;
    }

    type BonusModifers =
        | 'alchemical'
        | 'base'
        | 'circumstance'
        | 'competence'
        | 'deflection'
        | 'dodge'
        | 'enh'
        | 'haste'
        | 'inherent'
        | 'insight'
        | 'luck'
        | 'morale'
        | 'penalty'
        | 'profane'
        | 'racial'
        | 'resist'
        | 'sacred'
        | 'size'
        | 'trait'
        | 'untyped'
        | 'untypedPerm';

    type BuffTarget =
        | '~attackCore'
        | 'aac'
        | 'ac'
        | 'acpA'
        | 'acpS'
        | 'allChecks'
        | 'allSavingThrows'
        | 'allSpeeds'
        | 'attack'
        | 'bab'
        | 'bonusFeats'
        | 'bonusSkillRanks'
        | 'burrowSpeed'
        | 'carryMult'
        | 'carryStr'
        | 'cha'
        | 'chaChecks'
        | 'chaMod'
        | 'chaSkills'
        | 'cl'
        | 'climbSpeed'
        | 'cmb'
        | 'cmd'
        | 'con'
        | 'concentration'
        | 'conChecks'
        | 'conMod'
        | 'conSkills'
        | 'critConfirm'
        | 'damage'
        | 'dex'
        | 'dexChecks'
        | 'dexMod'
        | 'dexSkills'
        | 'ffac'
        | 'ffcmd'
        | 'flySpeed'
        | 'fort'
        | 'init'
        | 'int'
        | 'intChecks'
        | 'intMod'
        | 'intSkills'
        | 'landSpeed'
        | 'mattack'
        | 'mDexA'
        | 'mDexS'
        | 'mhp'
        | 'nac'
        | 'rattack'
        | 'ref'
        | 'sac'
        | 'sdamage'
        | 'skills'
        | 'spellResist'
        | 'str'
        | 'strChecks'
        | 'strMod'
        | 'strSkills'
        | 'swimSpeed'
        | 'tac'
        | 'unskills'
        | 'vigor'
        | 'wdamage'
        | 'will'
        | 'wis'
        | 'wisChecks'
        | 'wisMod'
        | 'wisSkills'
        | 'wounds';

    interface DamageType {
        category: 'physical' | 'energy';
        color: string;
        flags: { [key: string]: any };
        icon: string;
        isModifier: boolean;
        name: string;
        namepsace: 'pf1' | string;
        get id(): string;
    }

    interface ItemChange {
        constructor(
            args: {
                flavor: string;
                formula: string | number;
                modifier: BonusModifers;
                operator?: 'add' | 'function' | 'set';
                priority?: number;
                subTarget: BuffTarget;
                value?: string | number;
            },
            parent = null
        );

        static create();
    }

    class ItemConditional {
        _id: string;
        data?: any;
        default: boolean;
        id?: string;
        modifiers: ItemConditionalModifier[];
        name: string;
        static get defaultData(): any;

        constructor(obj: { [modifiers]: object[] }): ItemConditional;
        static create(
            modifiers: object[],
            options: {
                parent: {
                    data: {
                        conditionals: any[];
                    };
                    update: any;
                };
            }
        ): ItemConditional;
    }

    class ItemConditionalModifier {
        _id: string;
        critical: Mullable<'crit' | 'nonCrit' | 'normal'>; // all for 'damage', 'crit' and 'normal' also for attack
        damageType: Nullable<TraitSelectorValuePlural>;
        data?: any;
        formula: string;
        id?: string;
        subTarget:
            | 'hasteAttack'
            | 'rapidShotAttack'
            | 'attack_0'
            | 'allAttack' // when target is 'attack'
            | 'hasteDamage'
            | 'rapidShotDamage'
            | 'attack_0'
            | 'allDamage' // when target is 'damage'
            | 'dc' // when target is 'effect'
            | 'charges' // when target is 'misc'
            | '' // size
            | undefined; // no subtarget for 'size'
        target: 'attack' | 'damage' | 'effect' | 'misc' | 'size';
        type: Nullable<BonusModifers | string>;

        targets?: {
            attack: string;
            damage: string;
            size: string;
            effect: string;
            misc?: string;
        };
        subTargets?: { [x: string]: string };
        conditionalModifierTypes?: { [x: string]: string };
        conditionalCritical?: {
            normal?: 'PF1.Normal';
            crit?: 'PF1.CritDamageBonusFormula';
            nonCrit?: 'PF1.NonCritDamageBonusFormula';
        };

        constructor(any);
        static get defaultData(): any;
    }

    interface ItemSheetPF {
        appId: number;
        editors: { [key: string]: object };
        filepickers: unknown[];
        object: ItemPF;
        options: unknown;
        position: {
            height: number;
            left: number;
            scale: number;
            top: number;
            width: number;
            zIndex: number;
        };
        id: string;
        actor: ActorPF | null;
        closing: boolean;
        document: ItemPF;
        element: HTMLElement;
        isEditable: boolean;
        item: ItemPF;
        popOut: boolean;
        rendered: boolean;
        template: string;
        title: string;
    }

    declare type ActorSize =
        | 'fine'
        | 'dim'
        | 'tiny'
        | 'sm'
        | 'med'
        | 'lg'
        | 'huge'
        | 'grg'
        | 'col';

    declare type ActorStature = 'tall' | 'long';

    declare type SpellcastingType = 'spontaneous' | 'prepared' | 'hybrid';
    declare type SpellcastingLevelType = 'low' | 'med' | 'high';

    interface ActorTraitSelector {
        setPosition(position?: Position);
        get position(): Position;
        render(show: boolean);
    }

    interface pf1 {
        actorSizes: Record<ActorSize, string>;
        actorStatures: Record<ActorStature, string>;
        applications: {
            ActorTraitSelector: {
                new (doc: BaseDocument, options: object): ActorTraitSelector;
            };
            DamageTypeSelector: {
                new (
                    object: { id: string; update({ [dataPath]: object }) },
                    dataPath: string,
                    data: {},
                    options = {}
                ): DamageTypeSelector;
            };
        };
        components: {
            ItemConditional: typeof ItemConditional;
            ItemConditionalModifier: typeof ItemConditionalModifier;
            ItemAction: typeof ItemAction;
            // ItemAction: ItemAction ;
            ItemChange: {
                new (
                    args: {
                        flavor: string;
                        formula: string | number;
                        modifier?: BonusModifers | string;
                        operator?: 'add' | 'function' | 'set';
                        priority?: number;
                        subTarget: BuffTarget;
                        /** The evaluation of the formula */
                        value?: string | number;
                    },
                    parent = null
                ): ItemChange;
            };
        };
        config: {
            conditionalTargets: {
                attack: {
                    _label: 'Attack Rolls';
                    allAttack: 'All';
                    hasteAttack: 'Haste';
                    rapidShotAttack: 'Rapid Shot';
                };
                damage: {
                    _label: 'Damage';
                    allDamage: 'All';
                    hasteDamage: 'Haste';
                    rapidShotDamage: 'Rapid Shot';
                };
                size: {
                    _label: 'Size';
                };
                effect: {
                    _label: 'Effects';
                };
                misc: {
                    _label: 'Misc';
                };
            };
            abilities: Abilities;
            bonusModifiers: { [key in BonusModifers]: string };
            damageResistances: {
                magic: 'Magic';
                epic: 'Epic';
                lawful: 'Lawful';
                chaotic: 'Chaotic';
                good: 'Good';
                evil: 'Evil';
            };
            damageTypes: {
                untyped: 'Untyped';
                slashing: 'Slashing';
                piercing: 'Piercing';
                bludgeoning: 'Bludgeoning';
                fire: 'Fire';
                cold: 'Cold';
                electric: 'Electricity';
                acid: 'Acid';
                sonic: 'Sonic';
                force: 'Force';
                negative: 'Negative';
                positive: 'Positive';
                precision: 'Precision';
                nonlethal: 'Nonlethal';
            };
            savingThrows: SavingThrows;
            skillCompendiumEntries: { [key: string]: string };
            skills;
            spellSchools: { [key: string]: string };
            weaponGroups: { [key: string]: string };
        };
        documents: {
            actor: {
                ActorPF: { new (): ActorPF };
            };
            item: {
                ItemAttackPF: { new (): ItemAttackPF };
                ItemEquipmentPF: { new (): ItemEquipmentPF };
                ItemFeatPF: { new (): ItemFeatPF };
                ItemLootPF: { new (): ItemLootPF };
                ItemPF: { new (): ItemPF };
                ItemSpellPF: { new (): ItemSpellPF };
                ItemWeaponPF: { new (): ItemWeaponPF };
            };
        };
        registry: {
            damageTypes: EmbeddedCollection<DamageType>;
        };
        spellcasting: {
            type: SpellcastingType;
        };
        utils: {
            createTag(name: string): string;
        };
    }

    interface SavingThrows {
        fort: 'Fortitude';
        ref: 'Reflex';
        will: 'Will';
    }
}
