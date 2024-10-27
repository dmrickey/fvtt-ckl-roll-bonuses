import {
    armorFocusKey,
    improvedArmorFocusKey,
} from '../../src/bonuses/armor-focus/shared.mjs';
import { changeTypeOffsetKey } from '../../src/bonuses/change-type-modification.mjs';
import {
    elementalFocusKey,
    greaterElementalFocusKey,
    mythicElementalFocusKey,
} from '../../src/bonuses/spells/elemental-focus.mjs';
import {
    greaterSpellFocusKey,
    mythicSpellFocusKey,
    spellFocusKey,
} from '../../src/bonuses/spells/spell-focus.mjs';
import { versatilePerformanceKey } from '../../src/bonuses/versatile-performance.mjs';
import {
    greaterWeaponFocusKey,
    mythicWeaponFocusKey,
    racialWeaponFocusKey,
    weaponFocusKey,
} from '../../src/bonuses/weapon-focus/ids.mjs';
import { greaterWeaponSpecializationKey } from '../../src/bonuses/weapon-specialization/greater-weapon-specialization.mjs';
import { weaponSpecializationKey } from '../../src/bonuses/weapon-specialization/weapon-specialization.mjs';
import { MODULE_NAME } from '../../src/consts.mjs';
import { RangedIncrementPenaltyGlobalBonus } from '../../src/global-bonuses/attack-dialog-helper.mjs';
import { BaseBonus } from '../../src/targeted/bonuses/base-bonus.mjs';
import { BaseTargetOverride } from '../../src/targeted/target-overides/_base-target-override.mjs';
import { BaseTarget } from '../../src/targeted/targets/base-target.mjs';
import Document from '../foundry/common/abstract/document.mjs';

export {};

declare global {
    abstract class BaseDocument extends Document {
        getRollData(): RollData;
        getFlag(moduleName: string, key: string): any;
        async setFlag<T>(
            moduleName: string,
            key: string,
            value: T
        ): Promise<void>;
        async unsetFlag(moduleName: string, key: string): Promise<Document>;
        updateSource(changes: Record<string, any>, options?: object);
        uuid: string;
        update(data: Record<string, any>);
        testUserPermission(user: User, OBSERVER: any): boolean;
        toObject(): any;
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

    type ActionType =
        | 'msak'
        | 'mwak'
        | 'rsak'
        | 'rwak'
        | 'mcman'
        | 'rcman'
        | 'twak'
        | 'spellsave'
        | 'save'
        | 'heal'
        | 'other';

    declare type SkillInfo = SkillRollData & {
        id: keyof typeof pf1.config.skills;
        name: string;
    };
    class ActorBasePF extends BaseDocument {
        itemFlags?: {
            /**
             * The tags for Items that are active with a boolean flag
             */
            boolean: { [key: string]: { sources: ItemPF[] } };
            dictionary: ItemDictionaryFlags;
        };
        sheet: {
            render(force: boolean, { focus: boolean } = {});
        };
    }

    type Item =
        | ItemAttackPF
        | ItemBuffPF
        | ItemClassPF
        | ItemConsumablePF
        | ItemContainerPF
        | ItemEquipmentPF
        | ItemFeatPF
        | ItemImplantPF
        | ItemLootPF
        | ItemRacePF
        | ItemSpellPF
        | ItemWeaponPF;

    class ActorPF extends ActorBasePF {
        allItems: ItemPF[];
        hasItemBooleanFlag(key: string): boolean;
        hasWeaponProficiency(item: ItemPF, { override = true } = {}): boolean;
        allSkills: Array<keyof typeof pf1.config.skills>;
        get isOwner(): boolean;
        itemTypes!: {
            [T in Item as T['type']]: T[];
        };
        getActiveTokens(): Array<TokenPF>;
        getSkillInfo(skillId: string): SkillInfo;
        hasCondition(key: keyof Conditions): boolean;

        /**
         * Gets the actor's roll data.
         * @param refresh - pass true to force the roll data to recalculate
         * @returns The actor's roll data
         */
        getRollData(args?: { refresh?: boolean }): RollData;

        id: string;

        items: EmbeddedCollection<ItemPF>;

        name: string;

        rollSkill(
            skillId: string,
            arg1: { skipDialog: boolean }
        ): Promise<ChatMessagePF>;

        system: SystemActorData;

        updateEmbeddedDocuments(
            type: 'Item',
            updates: RecursivePartial<ItemPF<SystemItemData>>[]
        );
    }

    class ActorCharacterPF extends ActorPF {}

    type ArmorType = 'lgt' | 'med' | 'hvy' | 'shl' | 'twr';

    type ConditionalPart = [number | string, TraitSelectorValuePlural, false];
    class ConditionalPartsResults {
        'attack.crit': string[];
        'attack.normal': string[];
        'damage.crit': ConditionalPart[];
        'damage.nonCrit': ConditionalPart[];
        'damage.normal': ConditionalPart[];
    }

    interface Conditions {
        bleed: 'Bleed';
        blind: 'Blind';
        confused: 'Confused';
        cowering: 'Cowering';
        dazed: 'Dazed';
        dazzled: 'Dazzled';
        dead: 'Dead';
        deaf: 'Deaf';
        disabled: 'Disabled';
        dying: 'Dying';
        entangled: 'Entangled';
        exhausted: 'Exhausted';
        fatigued: 'Fatigued';
        flatFooted: 'Flat-Footed';
        frightened: 'Frightened';
        grappled: 'Grappled';
        helpless: 'Helpless';
        incorporeal: 'Incorporeal';
        invisible: 'Invisible';
        nauseated: 'Nauseated';
        panicked: 'Panicked';
        paralyzed: 'Paralyzed';
        petrified: 'Petrified';
        pinned: 'Pinned';
        prone: 'Prone';
        shaken: 'Shaken';
        sickened: 'Sickened';
        sleep: 'Sleep';
        squeezing: 'Squeezing';
        stable: 'Stable';
        staggered: 'Staggered';
        stunned: 'Stunned';
        unconscious: 'Unconscious';

        // Nevela's PF1 Improved Conditions
        fascinated: 'Fascintated';
    }

    interface SpellDescriptors {
        acid: 'acid';
        air: 'air';
        chaotic: 'chaotic';
        cold: 'cold';
        curse: 'curse';
        darkness: 'darkness';
        death: 'death';
        disease: 'disease';
        draconic: 'draconic';
        earth: 'earth';
        electricity: 'electricity';
        emotion: 'emotion';
        evil: 'evil';
        fear: 'fear';
        fire: 'fire';
        force: 'force';
        good: 'good';
        languageDependent: 'language-dependent';
        lawful: 'lawful';
        light: 'light';
        meditative: 'meditative';
        mindAffecting: 'mind-affecting';
        pain: 'pain';
        poison: 'poison';
        ruse: 'ruse';
        shadow: 'shadow';
        sonic: 'sonic';
        water: 'water';
    }

    interface FlyManeuverabilities {
        average: 'Average';
        clumsy: 'Clumsy';
        good: 'Good';
        perfect: 'Perfect';
        poor: 'Poor';
    }

    interface ActionUseAttack {
        ammo?: { document: ItemLootPF };
    }

    interface ActionUseFormData {
        'attack-bonus': string;
        'cl-check': undefined;
        d20: string;
        'damage-ability-multiplier': undefined;
        fullAttack: boolean;
        'haste-attack': boolean;
        manyshot: undefined | boolean;
        'measure-template': undefined | boolean;
        'power-attack': undefined | boolean;
        'primary-attack': undefined | boolean;
        'rapid-shot': undefined | boolean;
        rollMode: 'publicroll' | RollMode;

        [key: string]: undefined | boolean;
    }

    class ActionUseShared<T extends SystemItemData = SystemItemData> {
        action: any;
        attackBonus: string[];
        attacks: ActionUseAttack[];
        conditionalPartsCommon: any;
        conditionals: any;
        damageBonus: string[];
        dice: string;
        powerAttack: boolean;
        reject: boolean;
        rollData: RollData<T>;

        templateData: {
            footnotes?: string[];
        };

        // custom data
        fortuneCount;
        misfortuneCount;
    }
    class ActionUse<T extends ItemPF = ItemPF> {
        action: ItemAction;
        actor: ActorPF;
        item: T;
        shared: ActionUseShared;
        formData: ActionUseFormData;
        token: TokenDocumentPF;
    }
    class AttackDialogData {
        action: ItemAction;
        item: ItemPF;
        ammo: AmmoData[];
        attacks: [ActionUseAttack];
        attributes: {
            ['attack-bonus']: '';
            ['cl-offset']: '0';
            ['d20']: '';
            ['damage-ability-multiplier']: 1;
            ['damage-bonus']: '';
            ['held']: 'normal';
            ['rollMode']: 'publicroll';
            ['sl-offset']: '0';
        };
        canConfigureHeld: false;
        conditionals: {};
        config: pf1['config'];
        data: RollData;
        flags: {
            ['cl-check']: boolean;
            ['haste-attack']: boolean | undefined;
            ['manyshot']: boolean | undefined;
            ['measure-template']: boolean;
            ['power-attack']: boolean;
            ['primary-attack']: boolean;
            ['rapid-shot']: boolean | undefined;
        };
        hasAttack: false;
        hasDamage: true;
        hasDamageAbility: '';
        hasTemplate: true;
        isAttack: false;
        isFeat: false;
        isHealing: false;
        isMeleeWeaponAttackAction: false;
        isNaturalAttack: false;
        isRanged: false;
        isRangedWeaponAttackAction: false;
        isSpell: true;
        isWeapon: false;
        isWeaponAttack: false;
        rollMode: 'publicroll';
        rollModes: {
            publicroll: 'CHAT.RollPublic';
            gmroll: 'CHAT.RollPrivate';
            blindroll: 'CHAT.RollBlind';
            selfroll: 'CHAT.RollSelf';
        };
        usesAmmo: false;
    }

    class ChatAttack {
        action: ItemAction;
        attack?: D20RollPF;
        attackNotes: string[];
        critConfirm: D20RollPF;
        d20: Die;
        dice: Die[];
        effectNotes: string[];
        effectNotesHTML: string;
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
        rollData: RollData;
        simplifiedFormula: string;
        total: number;
        totalHalved: number;
        actor: ActorCharacterPF;
        ammo: {
            id: string;
            img: string;
            misfire: boolean;
            name: string;
        };
    }

    interface CombatPF {
        combatants: CombatantPF[];
        round: number;
    }

    interface CombatantPF {
        actorId: string;
    }

    class Die {
        faces: number;
        isIntermediate: boolean;
        modifiers: string[];
        number: number;
        options: { flavor?: string };
        results: { result: number; active: boolean }[];
    }

    class D20RollPF<
        T extends RollData = RollData<SystemItemData>
    > extends RollPF<T> {
        isCrit: boolean;
    }

    class ChatMessagePF extends BaseDocument {
        content: string;
        flags?: {
            pf1?: {
                subject?: {
                    skill: keyof typeof pf1.config.skills;
                };
            };
        };
        roll: D20RollPF;
        get actionSource(): ItemAction;
        get itemSource(): ItemPF;
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
        getRollData(): RollData;
        getRange({
            type: string = 'single' | 'min' | 'max',
            rollData: RollData = null,
        } = {}): number;
        [MODULE_NAME]: {
            enhancement?: {
                base: number;
                stacks: number;
                total: number;
            };
            [key: string]: number | string | object | array;
        };
        id: string;
        actor: ActorPF;
        data: {
            naturalAttack: {
                primaryAttack: boolean;
                secondary: {
                    attackBonus: string;
                    damageMult: number;
                };
            };
            ability: {
                attack: string;
                critMult: number;
                critRange: number;
                damage: keyof Abilities;
                damageMult: number;
            };
            actionType: ActionType;
            damage: {
                critParts: DamagePart[];
                nonCritParts: DamagePart[];
                parts: DamagePart[];
            };
            range: {
                maxIncrements: number;
                minUnits: '';
                minValue: null;
                units: 'ft' | 'm' | 'reach';
                value: string;
            };
        };
        item: ItemPF;
        img: string;
        static defaultDamageType: TraitSelectorValuePlural;
        hasAttack: boolean;
        isCombatManeuver: boolean;
        isRanged: boolean;
        get enhancementBonus(): number;
        maxRange: number;
        minRange: number;
        name: string;
        range: number;
        sheet: ItemActionSheet;

        defaultDamageType: {
            values: string[];
            custom: '';
        };

        get hasSave(): boolean;
    }

    /** used for weapons and attacks */
    interface TraitSelector<T extends string = string> {
        custom: string[];
        value: T[];
        total: Set<string>;
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
        actor: ActorCharacterPF;
        displayName: 0 | 10 | 20 | 30 | 40 | 50;
        disposition: DispositionLevel;
        elevation: number;
        isLinked: boolean;
        name: string;
        permission: PermissionLevel;
        texture: { src: string };
        visible: boolean;
        object: TokenPF;

        sheet: {
            _canUserView(user: User): boolean;
            render(force: boolean, { focus: boolean } = {});
        };
    }

    interface TokenPF {
        id: string;
        actor: ActorCharacterPF;
        document: TokenDocumentPF;
        h: number;
        isVisible: boolean;
        w: number;
        x: number;
        y: number;
        bounds: Rect;
        scene: Scene;
    }

    class ItemPF<
        SystemData extends SystemItemData = SystemItemData
    > extends ItemDocument {
        scriptCalls: Collection<pf1['components']['ItemScriptCall']>;
        _prepareDependentData(final: boolean): void;
        [MODULE_NAME]: {
            bonuses: (typeof BaseBonus)[];
            targets: (typeof BaseTarget)[];
            targetOverrides: (typeof BaseTargetOverride)[];
            conditionals?: ItemConditionalModifierData[];
            [key: string]: number | string | object | array;
        };

        get hasAction(): boolean;
        get isPhysical(): boolean;

        actions: EmbeddedCollection<ItemAction>;

        activeState: boolean;
        actor?: ActorPF;
        canUse: boolean;
        defaultAction: ItemAction;
        flags: {
            core?: { sourceId: string };
            [key: string]: any;
        };
        _id: string;
        id: string;
        img: string;
        get isActive(): boolean;
        isOwner: boolean;
        links: {
            parent?: ItemPF;
        };
        name: string;
        pack: string;

        parent: ActorPF | ItemPF;

        /**
         * @deprecated use @see actor
         */
        parentActor: ActorPF;
        subType: string;
        system: SystemData;
        type!: ItemType;

        /**
         * Sets a boolean flag on this item.
         *
         * @param {string} flagName - The name/key of the flag to set.
         * @param {object} context Update context
         * @returns {Promise<boolean>} Whether something was changed.
         */
        async addItemBooleanFlag(
            flagName: string,
            context: object = {}
        ): Promise<boolean>;

        /**
         * Removes a boolean flag from this item.
         *
         * @param {string} flagName - The name/key of the flag to remove.
         * @param {object} context Update context
         * @returns {Promise<boolean>} Whether something was changed.
         */
        async removeItemBooleanFlag(
            flagName: string,
            context: object = {}
        ): Promise<boolean>;

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
        setItemDictionaryFlag(key: string, value: FlagValue): Promise<void>;

        /**
         * @param key - THe key for the boolean flag
         * @returns True if the item has the boolean flag
         */
        hasItemBooleanFlag(key: string): boolean;

        sheet: ItemSheetPF;
    }

    class ItemAttackPF extends ItemPF<SystemItemDataAttackPF> {
        type = 'attack' as const;
    }
    class ItemBuffPF extends ItemPF<SystemItemDataBuffPF> {
        type = 'buff' as const;
    }
    class ItemClassPF extends ItemPF<SystemItemDataClassPF> {
        type = 'class' as const;
    }
    class ItemConsumablePF extends ItemPF<SystemItemDataConsumablePF> {
        type = 'consumable' as const;
    }
    class ItemContainerPF extends ItemPF<SystemItemDataContainerPF> {
        items: Collection<ItemPF>;
        type = 'container' as const;
    }
    class ItemEquipmentPF extends ItemPF<SystemItemDataEquipmentPF> {
        type = 'equipment' as const;
    }
    class ItemFeatPF extends ItemPF {
        type = 'feat' as const;
    }
    class ItemImplantPF extends ItemPF<SystemItemDataImplantPF> {
        get isActive(): boolean;
        get activeState(): boolean;
        async setActive(active: boolean, context: object): Promise<void>;
        type = 'implant' as const;
    }
    class ItemLootPF extends ItemPF {
        subType: 'gear' | 'ammo' | 'tradeGoods' | 'misc';
        type = 'loot' as const;
    }
    class ItemRacePF extends ItemPF<SystemItemDataRacePF> {
        type = 'race' as const;
    }
    class ItemSpellPF extends ItemPF<SystemItemDataSpellPF> {
        learnedAt: {
            class: { [key: string]: number };
            domain: { [key: string]: number };
        };

        /** @deprecated Spells don't have tags */
        tag: string;
        type = 'spell' as const;
    }
    class ItemWeaponPF extends ItemPF<SystemItemDataWeaponPF> {
        type = 'weapon' as const;
    }

    class SkillData {
        ability: keyof Abilities;
        acp: boolean;
        background?: boolean;
        changeBonus: number;
        cs: boolean;
        mod: number;
        name?: string;
        rank: number;
        rt: boolean;
        subSkills?: Record<string, SkillData & { journal: string }>;
        // properties: Record<keyof WeaponProperties, boolean>;
    }

    declare type SpellbookKey =
        | 'primary'
        | 'secondary'
        | 'tertiary'
        | 'spelllike';

    class SpellRanges {
        close: number;
        medium: number;
        long: number;
        cl: number;
    }

    class SpellbookData {
        ability: keyof Abilities;
        altName: string;
        arcaneSpellFailure: boolean;
        autoSpellLevelCalculation: boolean;
        autoSpellLevels: boolean;
        baseDCFormula: string;
        castPerDayAllOffsetFormula: string;
        casterType: SpellcastingLevelType;
        cl: {
            formula: string;
            autoSpellLevelCalculationFormula: string;
            total: number;
        };
        clNotes: string;
        class: string;
        concentration: { total: number };
        concentrationFormula: string;
        concentrationNotes: string;
        domainSlotValue: number;
        hasCantrips: boolean;
        inUse: boolean;
        label: string;
        name: string;
        preparedAllOffsetFormula: string;
        psychic: boolean;
        range: SpellRanges;
        spellPoints: {
            useSystem: boolean;
            value: number;
            maxFormula: string;
            restoreFormula: string;
            max: number;
        };
        spellPreparationMode: SpellcastingType;
        spellSlotAbilityBonusFormula: string;
        spells: Record<
            SpellLevel,
            {
                base: Nullable<number>;
                castPerDayOffsetFormula: string;
                max: number;
                preparedOffsetFormula: string;
                value: number;
            }
        >;
        spontaneous: boolean;
    }

    class SystemActorData {
        abilities: Record<
            keyof Abilities,
            {
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
        >;
        ac: {
            natural: {
                total: number;
                base: number;
                misc: number;
                enh: number;
            };
            normal: {
                total: number;
                base: number;
                enh: number;
                misc: number;
            };
            shield: {
                total: number;
                base: number;
                enh: number;
                misc: number;
            };
        };
        altCurrency: { pp: number; gp: number; sp: number; cp: number };
        attributes: {
            ac: {
                flatFooted: { total: number };
                normal: { ability: keyof Abilities; total: number };
                touch: { ability: keyof Abilities; total: number };
            };
            acNotes: '';
            acp: {
                armorBonus: number;
                attackPenalty: number;
                encumbrance: number;
                gear: number;
                shieldBonus: number;
                total: number;
            };
            attack: {
                critConfirm: number;
                general: number;
                melee: number;
                meleeAbility: keyof Abilities;
                ranged: number;
                rangedAbility: keyof Abilities;
                shared: number;
            };
            bab: { total: number; value: number };
            clCheck: false;
            cmb: { bonus: number; total: number; value: number };
            cmbAbility: keyof Abilities;
            cmd: {
                strAbility: keyof Abilities;
                dexAbility: keyof Abilities;
                total: number;
                flatFootedTotal: number;
            };
            cmdNotes: string;
            conditions: Record<keyof Conditions, boolean>;
            damage: {
                general: number;
                shared: number;
                spell: number;
                weapon: number;
            };
            encumbrance: {
                carriedWeight: number;
                level: number;
                levels: {
                    light: number;
                    medium: number;
                    heavy: number;
                    carry: number;
                    drag: number;
                };
            };
            energyDrain: number;
            hd: { total: number };
            hp: {
                base: number;
                max: number;
                nonlethal: number;
                offset: number;
                temp: number;
                value: number;
            };
            hpAbility: keyof Abilities;
            init: {
                value: number;
                ability: keyof Abilities;
                bonus: number;
                total: number;
            };
            mDex: { armorBonus: number; shieldBonus: number };
            maxDexBonus: number;
            naturalAC: number;
            quadruped: false;
            saveNotes: string;
            savingThrows: {
                fort: { base: number; ability: keyof Abilities; total: number };
                ref: { base: number; ability: keyof Abilities; total: number };
                will: { base: number; ability: keyof Abilities; total: number };
            };
            speed: {
                burrow: { base: number; total: number };
                climb: { base: number; total: number };
                fly: {
                    base: number;
                    maneuverability: keyof FlyManeuverabilities;
                    total: number;
                };
                land: { base: number; total: number };
                swim: { base: number; total: number };
            };
            spells: {
                spellbooks: Record<SpellbookKey, SpellbookData>;
                usedSepllbooks: SpellbookKey[];
            };
            sr: { formula: string; total: number };
            srNotes: string;
            vigor: {
                base: number;
                max: number;
                min: number;
                offset: number;
                temp: number;
                value: number;
            };
            woundThresholds: {
                level: number;
                mod: number;
                override: number;
                penaltyBase: number;
                penalty: number;
            };
            wounds: {
                base: number;
                max: number;
                min: number;
                offset: number;
                value: number;
            };
        };

        currency: { pp: number; gp: number; sp: number; cp: number };
        customSkills: unknown;
        details: {
            age: string;
            alignment: string;
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
        };
        resources: Record<
            string,
            {
                value: number;
                max: number;
                _id: string;
            }
        >;
        skills: Record<string, SkillData>;
        traits: {
            armorProf: {
                value: [];
                custom: string;
                total: ArmorType[];
                customTotal: 'No Metal Armors';
            };
            aura: { custom: string };
            ci: { value: []; custom: string };
            cres: string;
            di: { value: []; custom: string };
            dr: {
                value: [
                    {
                        amount: number;
                        operator: boolean;
                        types: ['slashing', ''];
                    }
                ];
                custom: string;
            };
            dv: { value: []; custom: string };
            eres: { value: []; custom: '10 cold' };
            fastHealing: string;
            humanoid: boolean;
            languages: {
                value: [];
                custom: string;
                total: ['common'];
                customTotal: 'Catfolk';
            };
            regen: string;
            senses: {
                bs: number;
                bse: number;
                custom: string;
                dv: number;
                ll: {
                    enabled: boolean;
                    multiplier: { bright: number; dim: number };
                };
                sc: number;
                si: boolean;
                sid: boolean;
                tr: boolean;
                ts: number;
            };
            size: ActorSize;
            stature: ActorStature;
            type: 'humanoid';
            weaponProf: {
                value: [];
                custom: string;
                total: (keyof WeaponProficiencies)[];
                customTotal: 'Club;Dagger;Dart;Quarterstaff;Scimitar;Scythe;Sickle;Shortspear;Sling;Spear;Natural attacks';
            };
        };
    }

    class SystemItemData {
        links: {
            children: { name: string; uuid: string }[];
            charges?: unknown[];
        };
        broken: boolean;
        flags: {
            boolean: Record<string, boolean>;
            dictionary: DictionaryFlags;
        };
        subType: 'natural';
        tag: string;
        tags: string[];
        changes: ItemChange[];

        /** These properties are not natively on all item types, but I'm adding them during data prep to better target _unintended_ items */
        /** weapon */
        properties?: Partial<Record<keyof WeaponProperties, boolean>>;
        /** attack, equipment, weapon */
        baseTypes?: string[];
        /** attack, weapon */
        weaponGroups?: Partial<TraitSelector<keyof WeaponGroups>>;
        /** attack, equipment, weapon */
        proficient: boolean;
    }
    class SystemItemDataAttackPF extends SystemItemData {
        baseTypes: string[];
        enh: number;
        // links: { children: { name: string; id: string }[] };
        masterwork: boolean;
        weaponGroups: TraitSelector<keyof WeaponGroups>;
    }
    class SystemItemDataContainerPF extends SystemItemData {}
    class SystemIteMDataBuffPF extends SystemItemData {}
    class SystemItemDataClassPF extends SystemItemData {}
    class SystemItemDataConsumablePF extends SystemItemData {}
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
    class SystemItemDataImplantPF extends SystemItemData {
        implanted: boolean;
        slot: string;
    }
    class SystemItemDataRacePF extends SystemItemData {}
    class SystemItemDataSpellPF extends SystemItemData {
        descriptors: {
            value: Array<keyof SpellDescriptors>;
            custom: string[];
            total: string[];
        };
        school: keyof typeof pf1.config.spellSchools;

        /** @deprecated use until v10 (then use @see {descriptors} ) */
        types: string;
    }
    class SystemItemDataWeaponPF extends SystemItemData {
        baseTypes: string[];
        enh: number;
        // links: { children: { name: string; id: string }[] };
        masterwork: boolean;
        proficient: boolean;
        properties: Record<keyof WeaponProperties, boolean>;
        weaponGroups: TraitSelector<keyof WeaponGroups>;
    }

    type ItemType = Item['type'];

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
        ac: {
            flatFooted: { total: number };
            normal: { ability: keyof Abilities; total: number };
            touch: { ability: keyof Abilities; total: number };
        };
        acNotes: string;
        acp: {
            armorBonus: number;
            attackPenalty: number;
            encumbrance: number;
            gear: number;
            shieldBonus: number;
            total: number;
        };
        attack: {
            critConfirm: number;
            general: number;
            melee: number;
            meleeAbility: keyof Abilities;
            ranged: number;
            rangedAbility: keyof Abilities;
            shared: number;
        };
        bab: {
            total: number;
            value: number;
        };
        clCheck: boolean;
        cmb: {
            bonus: number;
            total: number;
            value: number;
        };
        cmbAbility: keyof Abilities;
        cmd: {
            strAbility: keyof Abilities;
            dexAbility: keyof Abilities;
            total: number;
            flatFootedTotal: number;
        };
        cmdNotes: string;
        conditions: Record<keyof Conditions, boolean>;
        damage: {
            general: number;
            shared: number;
            spell: number;
            weapon: number;
        };
        encumbrance: {
            carriedWeight: number;
            level: number;
            levels: {
                carry: number;
                drag: number;
                heavy: number;
                light: number;
                medium: number;
            };
        };
        energyDrain: number;
        hd: { total: number };
        hp: {
            base: number;
            max: number;
            nonlethal: number;
            offset: number;
            temp: number;
            value: number;
        };
        hpAbility: keyof Abilities;
        init: {
            ability: keyof Abilities;
            bonus: number;
            total: number;
            value: number;
        };
        mDex: {
            armorBonus: number;
            shieldBonus: number;
        };
        maxDexBonus: number;
        naturalAC: number;
        quadruped: boolean;
        saveNotes: string;
        savingThrows: {
            fort: { base: number; ability: keyof Abilities; total: number };
            ref: { base: number; ability: keyof Abilities; total: number };
            will: { base: number; ability: keyof Abilities; total: number };
        };
        speed: {
            burrow: { base: number; total: number };
            climb: { base: number; total: number };
            fly: {
                base: number;
                maneuverability: keyof FlyManeuverabilities;
                total: number;
            };
            land: { base: number; total: number };
            swim: { base: number; total: number };
        };
        spells: {
            spellbooks: Record<
                SpellbookKey,
                SpellbookData & { abilityMod: number }
            >;
            usedSepllbooks: SpellbookKey[];
        };
        sr: { formula: string; total: number };
        srNotes: string;
        vigor: {
            base: number;
            max: number;
            min: number;
            offset: number;
            temp: number;
            value: number;
        };
        woundThresholds: {
            level: number;
            mod: number;
            override: number;
            penaltyBase: number;
            penalty: number;
        };
        wounds: {
            base: number;
            max: number;
            min: number;
            offset: number;
            value: number;
        };
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
        fullName: string;
        mod: number;
        name: string;
        rank: number;
        rt: boolean;
        subSkills?: SkillRollData[];

        /** custom skills */
        background?: boolean;
        /** compendium link */
        journal?: string;
    }
    interface TraitsRollData {
        // TODO
        armorProf: {
            custom: string;
            customTotal: string;
            total: ArmorType[];
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
        rb: {
            rangePenalty?: {
                maxIncrements: number;
                penalty: number;
                penaltyOffset: number;
                range: number;
            };
        };
        range: {
            melee: string;
            reach: number;
        };
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
        skills: Record<keyof typeof pf1.config.skills, SkillRollData>;
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
                critParts: DamagePart[];
                nonCritParts: DamagePart[];
                parts: DamagePart[];
            };
            range: {
                maxIncrements: number;
                minUnites: string;
                minValue: string | null;
                units: string;
                value: string;
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

        // used in evaluate (and only by me in rolling damage (currently), the system doesn't do this)
        maximize?: boolean;
        minimize?: boolean;
    }

    export class DamageRoll<
        T extends RollData = RollData<SystemItemData>
    > extends RollPF<T> {
        get damageType(): string;
        get isCritical(): boolean;
        get type(): 'crit' | 'nonCrit' | 'normal';
    }

    export class RollPF<
        T extends RollData = RollData<SystemItemData>
    > extends Roll<T> {
        /** returns true if formula has no flavor and no dice (i.e. reduces to a single number) */
        isNumber: boolean;
        simplifiedFormula: string;

        static create(
            formula: string,
            data?: D,
            options?: InexactPartial<Options>
        ): RollPF;

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
        static safeRollSync(
            formula: string | number,
            rollData?: Nullable<RollData>
        ): RollPF;

        evaluate(
            options: InexactPartial<Options & { async: false }>
        ): Evaluated<this>;
        evaluate(
            options?: InexactPartial<Options> & { async: true }
        ): Promise<Evaluated<this>>;
    }

    interface DamageRoll extends RollPF {}

    type BonusTypes =
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
        | 'dc'
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
        abbr: string;
        category: 'physical' | 'energy' | 'misc';
        color: string;
        flags: Record<string, any>;
        icon: string;
        isModifier: boolean;
        name: string;
        namepsace: 'pf1' | string;
        get id():
            | 'untyped'
            | 'slashing'
            | 'piercing'
            | 'bludgeoning'
            | 'fire'
            | 'cold'
            | 'electric'
            | 'acid'
            | 'sonic'
            | 'force'
            | 'negative'
            | 'positive'
            | 'precision'
            | 'nonlethal';
    }

    interface ItemChangeArgs {
        flavor: string | undefined;
        formula: string | number;
        operator?: 'add' | 'function' | 'set';
        priority?: number;
        target: BuffTarget;
        type: BonusTypes | string;
        value?: string | number;
    }
    interface ItemChangeOptions {
        parent?: ItemPF | ActorPF;
    }
    class ItemChange {
        constructor(args: ItemChangeArgs, options: ItemChangeOptions = {});

        static create(args: ItemChangeArgs, options: ItemChangeOptions = {});

        /** hardcoded bonus type to use instead of modifier */
        formula: string;
        flavor?: string;
        name?: string;
        parent?: undefined | ItemPF;
        priority: number;
        target: string;
        type?: Nullable<BonusTypes | DamageTypes | string>;
        value: number | string;

        data: {
            flavor: string;
            formula: string;
            type: BonusTypes | DamageTypes | string;
            operator: '+' | '-';
            priority: number;
            get subTarget(): string;
            target: BuffTarget = 'skill';
            value: number;
        };

        toObject(): object;
    }

    class ItemConditionalData {
        default: boolean;
        modifiers: ItemConditionalModifierData[];
        name: string;
        _id: string;
    }
    class ItemConditional {
        // _id: string;
        data: ItemConditionalData;

        get id(): string;
        get modifiers(): Readonly<Collection<ItemConditionalModifier>>;
        get name(): string;
        get parent(): undefined | ItemPF;
        static get defaultData(): {
            _id: string;
            default: false;
            modifiers: ItemConditionalModifierData[];
            name: '';
        };

        constructor(
            obj: ItemConditionalData,
            parent?: ItemAction
        ): ItemConditional;
        /** @deprecated do not use within this mod */
        static async create(
            data: ItemConditionalData[],
            options: {
                parent: ItemAction;
            }
        ): Promise<Array<ItemConditional>>;
    }

    class ItemConditionalModifierData {
        critical: Nullable<'crit' | 'nonCrit' | 'normal' | ''>; // all for 'damage', 'crit' and 'normal' also for attack
        damageType: Nullable<TraitSelectorValuePlural>;
        formula: string;
        subTarget:
            | 'hasteAttack'
            | 'rapidShotAttack'
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
        type: Nullable<BonusTypes | DamageTypes | string>;
        _id: string;

        /** PREPPED DATA FOR SHEET */
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
            crit?: 'PF1.OnCritBonusFormula';
            nonCrit?: 'PF1.NonMultBonusFormula';
        };
        /** END PREPPED DATA FOR SHEET */
    }
    class ItemConditionalModifier {
        get id(): string;
        set id(value: string);

        data: ItemConditionalModifierData;
        parent: ItemConditional;

        constructor(any);
        static get defaultData(): {
            critical: '';
            damageType: ItemAction['defaultDamageType'];
            formula: '';
            subTarget: '';
            target: '';
            type: '';
            _id: string;
        };
    }

    class ItemScriptCall {}

    interface ActorSheetPF {
        get actor(): ActorPF;
        get isEditable(): boolean;
    }

    interface ItemActionSheet {
        render(force: boolean, { focus: boolean } = {});
    }

    interface ItemSheetPF {
        _canUserView(user: User): boolean;
        actor: ActorPF | null;
        appId: number;
        closing: boolean;
        document: ItemPF;
        editors: { [key: string]: object };
        element: HTMLElement;
        filepickers: unknown[];
        id: string;
        isEditable: boolean;
        item: ItemPF;
        object: ItemPF;
        options: unknown;
        popOut: boolean;
        position: {
            height: number;
            left: number;
            scale: number;
            top: number;
            width: number;
            zIndex: number;
        };
        rendered: boolean;
        template: string;
        title: string;

        render(force: boolean, { focus: boolean } = {});
        _render(): Promise;
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
    declare type SpellLevel =
        | 'spell0'
        | 'spell1'
        | 'spell2'
        | 'spell3'
        | 'spell4'
        | 'spell5'
        | 'spell6'
        | 'spell7'
        | 'spell8'
        | 'spell9';

    interface WeaponProficiencies {
        mar: 'Martial Weapons';
        sim: 'Simple Weapons';
    }

    interface AttackDialog {
        actionUse: ActionUse;
        ammoUsage: Record<string, { quantity: number; used: number }>;
        appId: number;
        attacks: Array<ActionUseAttack>;
        attributes: {
            [attack - bonus]: '';
            [cl - offset]: '0';
            [d20]: '';
            [damage - ability - multiplier]: 1;
            [damage - bonus]: '';
            [held]: 'normal';
            [rollMode]: 'publicroll';
            [sl - offset]: '0';
        };
        base: { cl: 0; sl: 0 };
        conditionals: {};
        flags: ActionUseFormData;
        object: ItemAction;
        options: {};
        position: {};
        resolve: () => {};
        rollData: RollData;
        setPosition(): void;
        shared: {};
        useOptions: {};

        get action(): ItemAction;
        get title(): string;
    }

    interface ActorTraitSelector {
        setPosition(position?: Position);
        get position(): Position;
        render(show: boolean);
    }

    class Condition {
        flags: {};
        journal: string;
        name: string;
        namespace: string;
        showInAction: boolean;
        showInDefense: boolean;
        texture: string;
        track: string;
        id: string;
    }

    class DamageTypes {
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
    }

    interface pf1 {
        dice: {
            DamageRoll: typeof DamageRoll;
            D20RollPF: typeof D20RollPF;
        };
        actionUse: {
            ActionUse: typeof ActionUse;
            ChatAttack: typeof ChatAttack;
        };
        actorSizes: Record<ActorSize, string>;
        actorStatures: Record<ActorStature, string>;
        applications: {
            AttackDialog: { new (): AttackDialog };
            ActorTraitSelector: {
                new (doc: BaseDocument, options: object): ActorTraitSelector;
            };
            DamageTypeSelector: {
                new (
                    object: { id: string; update({ [dataPath]: object }) },
                    dataPath: string,
                    data: TraitSelectorValuePlural,
                    options = {}
                ): DamageTypeSelector;
            };
        };
        components: {
            ItemAction: typeof ItemAction;
            ItemChange: typeof ItemChange;
            ItemConditional: typeof ItemConditional;
            ItemConditionalModifier: typeof ItemConditionalModifier;
            ItemScriptCall: typeof ItemScriptCall;
        };
        config: {
            backgroundOnlySkills: (keyof typeof pf1.config.skills)[];
            conditions: Conditions;
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
            bonusTypes: { [key in BonusTypes]: string };
            damageResistances: {
                lawful: 'Lawful';
                chaotic: 'Chaotic';
                good: 'Good';
                evil: 'Evil';
            };
            measureUnits: {
                ft: 'Feet';
                mi: 'Miles';
                m: 'Meters';
                km: 'Kilometers';
            };
            measureUnitsShort: {
                ft: 'ft';
                mi: 'mi';
                m: 'm';
                km: 'km';
            };
            savingThrows: SavingThrows;
            skillCompendiumEntries: { [key: string]: string };
            skills: {
                acr: 'Acrobatics';
                apr: 'Appraise';
                art: 'Artistry';
                blf: 'Bluff';
                clm: 'Climb';
                crf: 'Craft';
                dev: 'Disable Device';
                dip: 'Diplomacy';
                dis: 'Disguise';
                esc: 'Escape Artist';
                fly: 'Fly';
                han: 'Handle Animal';
                hea: 'Heal';
                int: 'Intimidate';
                kar: 'Knowledge (Arcana)';
                kdu: 'Knowledge (Dungeoneering)';
                ken: 'Knowledge (Engineering)';
                kge: 'Knowledge (Geography)';
                khi: 'Knowledge (History)';
                klo: 'Knowledge (Local)';
                kna: 'Knowledge (Nature)';
                kno: 'Knowledge (Nobility)';
                kpl: 'Knowledge (Planes)';
                kre: 'Knowledge (Religion)';
                lin: 'Linguistics';
                lor: 'Lore';
                per: 'Perception';
                prf: 'Perform';
                pro: 'Profession';
                rid: 'Ride';
                sen: 'Sense Motive';
                slt: 'Sleight of Hand';
                spl: 'Spellcraft';
                ste: 'Stealth';
                sur: 'Survival';
                swm: 'Swim';
                umd: 'Use Magic Device';
            };
            spellDescriptors: SpellDescriptors;
            spellSchools: {
                abj: 'Abjuration';
                con: 'Conjuration';
                div: 'Divination';
                enc: 'Enchantment';
                evo: 'Evocation';
                ill: 'Illusion';
                misc: 'Miscellaneous';
                nec: 'Necromancy';
                trs: 'Transmutation';
                uni: 'Universal';
            };
            weaponGroups: WeaponGroups;
        };
        documents: {
            settings: {
                getSkipActionPrompt(): boolean;
            };
            actor: {
                ActorBasePF: { new (): ActorBasePF };
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
            TokenDocumentPF: { new (): TokenDocumentPF };
        };
        registry: {
            conditions: {
                get(condition: string): Condition;
                contents: Array<Condition>;
            };
            damageTypes: EmbeddedCollection<DamageType> & {
                getLabels(): DamgeTypes;
            };
        };
        spellcasting: {
            type: SpellcastingType;
        };
        utils: {
            getDistanceSystem(): 'metric' | 'imperial';
            createTag(name: string): string;
        };
    }

    type SavingThrows = {
        fort: 'Fortitude';
        ref: 'Reflex';
        will: 'Will';
    };

    type WeaponGroups = {
        axes: 'Axes';
        bladesHeavy: 'Blades, Heavy';
        bladesLight: 'Blades, Light';
        bows: 'Bows';
        close: 'Close';
        crossbows: 'Crossbows';
        double: 'Double';
        firearms: 'Firearms';
        flails: 'Flails';
        hammers: 'Hammers';
        monk: 'Monk';
        natural: 'Natural';
        polearms: 'Polearms';
        siegeEngines: 'Siege Engines';
        spears: 'Spears';
        thrown: 'Thrown';
        tribal: 'Tribal';
    };

    type WeaponProperties = {
        ato: 'Automatic';
        blc: 'Blocking';
        brc: 'Brace';
        dbl: 'Double';
        dea: 'Deadly';
        dis: 'Disarm';
        dst: 'Distracting';
        fin: 'Finesse';
        frg: 'Fragile';
        grp: 'Grapple';
        imp: 'Improvised';
        mnk: 'Monk';
        nnl: 'Non-lethal';
        prf: 'Performance';
        rch: 'Reach';
        sct: 'Scatter';
        slf: 'Slow-firing';
        sma: 'Semi-automatic';
        snd: 'Sunder';
        spc: 'Special';
        thr: 'Thrown';
        trp: 'Trip';
    };
}
