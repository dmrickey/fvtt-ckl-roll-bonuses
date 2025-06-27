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
} from '../../src/bonuses/weapon-focus/weapon-focus.mjs';
import { greaterWeaponSpecializationKey } from '../../src/bonuses/weapon-specialization/greater-weapon-specialization.mjs';
import { weaponSpecializationKey } from '../../src/bonuses/weapon-specialization/weapon-specialization.mjs';
import { MODULE_NAME } from '../../src/consts.mjs';
import { RangedIncrementPenaltyGlobalBonus } from '../../src/global-bonuses/attack-dialog-helper.mjs';
import { BaseBonus } from '../../src/targeted/bonuses/_base-bonus.mjs';
import { BaseTargetOverride } from '../../src/targeted/target-overides/_base-target-override.mjs';
import { BaseTarget } from '../../src/targeted/targets/_base-target.mjs';
import { SpellSubschoolTarget } from '../../src/targeted/targets/spell-subschool-target.mjs';
import Document from '../foundry/common/abstract/document.mjs';

export {};

declare global {
    abstract class BaseDocument extends Document {
        uuid: string;
        ownership: Record<UUID, OwnerShipLevel> & { default: OwnerShipLevel };

        getRollData(): RollData;
        getFlag(moduleName: string, key: string): any;
        async setFlag<T>(
            moduleName: string,
            key: string,
            value: T
        ): Promise<void>;
        async unsetFlag(moduleName: string, key: string): Promise<Document>;
        updateSource(changes: Record<string, any>, options?: object);
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

    declare type SkillId = keyof typeof pf1.config.skills;
    declare type SkillInfo = SkillRollData & {
        id: SkillId;
        name: string;
    };
    class ActorBasePF extends BaseDocument {
        itemFlags?: {
            /** The tags for Items that are active with a boolean flag */
            boolean: { [key: string]: { sources: ItemPF[] } };
            dictionary: ItemDictionaryFlags;
        };
        sheet: {
            render(force: boolean, { focus: boolean } = {});
        };

        get hasPlayerOwner(): boolean;
        prototypeToken: { disposition: DispositionLevel};
    }

    class Macro extends BaseDocument {
        sheet: {
            render(force: boolean, { focus: boolean } = {});
        };
        name: string;

        constructor(args?:{
            type: 'script' | 'macro',
            command: string,
            name: string,
        });

        /** ROLL BONUS custom data */
        source: ItemPF<SystemItemData>;
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

    type ItemTypeArrayCache<T> = T[] & { getId(string): T; getName(string): T };

    class ActorPF extends ActorBasePF {
        getInitiativeOptions(): { check?: boolean };
        id: string;

        allItems: ItemPF[];
        allSkills: Array<SkillId>;
        changes?: Collection<ItemChange>;
        items: EmbeddedCollection<ItemPF>;
        itemTypes!: { [T in Item as T['type']]: ItemTypeArrayCache<T>; };
        name: string;
        race: ItemRacePF | null;
        statuses: { has(key: keyof Conditions): boolean; }
        system: SystemActorData;
        thumbnail: string;

        getActiveTokens(): Array<TokenPF>;
        getSkillInfo(skillId: string): SkillInfo;
        hasItemBooleanFlag(key: string): boolean;
        hasWeaponProficiency(item: ItemPF, { override = true } = {}): boolean;
        get isOwner(): boolean;


        /**
         * Gets the actor's roll data.
         * @param refresh - pass true to force the roll data to recalculate
         * @returns The actor's roll data
         */
        getRollData(args?: { refresh?: boolean }): RollData;

        rollSkill(
            skillId: string,
            arg1: { skipDialog: boolean }
        ): Promise<ChatMessagePF>;

        updateEmbeddedDocuments(
            type: 'Item',
            updates: RecursivePartial<ItemPF<SystemItemData>>[]
        );

        /**
         * Retrieve source details regarding a change target.
         *
         * @example
         * ```js
         * actor.getSourceDetails("system.attributes.hp.max");
         * ```
         * @todo - Merge `sourceInfo` into the change system to reduce underlying system complexity
         * @param {string} path - Change target path
         * @returns {SourceInfo[]}
         */
        getSourceDetails(path: string): SourceInfo;
    }

    class ActorCharacterPF extends ActorPF {}

    type ArmorType = 'lgt' | 'med' | 'hvy' | 'shl' | 'twr';

    type ConditionalPart = [
        Formula,
        ItemConditionalModifierSourceData['damageType'],
        false
    ];
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
        burrow: 'Burrowing';
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
        fly: 'Flying';
        frightened: 'Frightened';
        grappled: 'Grappled';
        helpless: 'Helpless';
        hover: 'Hovering';
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
        swim: 'Swiming';
        unconscious: 'Unconscious';

        // Nevela's PF1 Improved Conditions
        fascinated: 'Fascintated';
    }

    type SpellDescriptor = keyof SpellDescriptors;
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
        action: ItemAction;
        attackBonus: string[];
        attacks: ActionUseAttack[];
        casterLevelCheck: boolean;
        category?: ItemScriptCategory;
        chatAttacks?: ChatAttack[];
        chatMessage?: boolean;
        concentrationCheck?: undefined;
        conditionalPartsCommon: any;
        conditionals: string[];
        cost?: null;
        damageBonus: string[];
        dice: string;
        fullAttack?: boolean;
        item: ItemPF;
        reject: boolean;
        rollData: RollData<T>;
        rollMode?: string;
        save?: string;
        saveDC?: number;
        scriptData: unknown;
        skipDialog?: boolean;
        targets?: unknown[];
        templateData: {
            action?: ItemAction;
            item?: ItemPF;
            footnotes?: ParsedContextNoteEntry[];
        };
        token?: TokenDocumentPF;
        useMeasureTemplate?: boolean;
        useOptions: {
            abilityMult?: number;
            charge?: boolean;
            clCheck?: boolean;
            flanking?: boolean;
            haste?: boolean;
            held?: '1h' | '2h' | 'oh';
            highGround?: boolean;
            manyshot?: boolean;
            measureTemplate?: boolean;
            pointBlankShot?: boolean;
            powerAttack?: boolean;
            primaryAttack?: boolean;
            rapidShot?: boolean;
        };

        // chat attack dialog checkboxes
        charge?: boolean;
        flanking?: boolean;
        highGround?: boolean;
        powerAttack?: boolean;

        get attackData(): unknown;

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
        effectNotes: ParsedContextNoteEntry[];
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
        _getInitiativeFormula: (d20?: string) => string;
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
        static standardRoll: '1d20';
    }

    class ChatMessagePF extends BaseDocument {
        content: string;
        flags?: {
            pf1?: {
                subject?: {
                    skill: SkillId;
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

    class DamagePartModelData {
        formula: string;
        types: Set<string>;
    }

    type FlagValue = string | number;
    class DamagePartModel extends DamagePartModelData {
        /**
         * Copy and transform the DataModel into a plain object.
         * Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.
         * @param {boolean} [source=true]     Draw values from the underlying data source rather than transformed values
         * @param {boolean} [clean=true]      Whether or not to prune default data
         * @returns {object}                  The extracted primitive object
         */
        toObject(
            arg0: boolean,
            arg1: boolean
        ): {
            formula?: string;
            types: Array<string>;
        };
        get custom(): Set<string>;
        get names(): string[];
        get standard(): Set<unknown>;

        constructor(args?: {
            formula?: string;
            types?: Array<GenericDamageType>;
        });
    }
    interface DamagePartRollData {
        formula: string;
        types: Array<string>;
    }

    type CritType = 'crit' | 'nonCrit' | 'normal';

    interface PreDamageRollPart {
        base: string;
        damageType?: ItemConditionalModifierSourceData['damageType'];
        extra?: Array;
        type?: CritType;
    }

    class ItemAction {
        [MODULE_NAME]: {
            enhancement?: {
                base: number;
                stacks: number;
                total: number;
            };
            conditionals?: ItemConditionalModifierSourceData[];
            /** Cached damage formula for actor sheet */
            formula?: string;
            [key: string]: number | string | object | array;
        };

        ability: {
            attack: undefined | keyof Abilities;
            critMult: null | number;
            critRange: null | number;
            damage: undefined | keyof Abilities;
            damageMult: null | number;
            max: null | number;
        };
        actionType: ActionType;
        actor: ActorPF;
        allDamageSources: Array<ActionDamageSource>;
        conditionals: Collection<ItemConditional>;
        damage: {
            critParts: DamagePartModel[];
            nonCritParts: DamagePartModel[];
            parts: DamagePartModel[];
        };
        held?: keyof pf1['config']['abilityDamageHeldMultipliers'];
        id: string;
        hasAttack: boolean;
        hasDamage: boolean;
        img: string;
        isCombatManeuver: boolean;
        isRanged: boolean;
        item: ItemPF;
        maxRange: number;
        minRange: number;
        name: string;
        naturalAttack: {
            primary: boolean;
            secondary: {
                attackBonus: string;
                damageMult: number;
            };
        };
        range: {
            maxIncrements: number;
            minUnits: '' | undefined;
            minValue: null | undefined;
            units: 'ft' | 'm' | 'reach' | 'close' | 'medium' | 'long';
            value: undefined | string;
        };
        sheet: ItemActionSheet;

        get enhancementBonus(): number;
        get hasSave(): boolean;
        get uuid(): UUID;

        getRollData(): RollData;
        getRange({
            type = 'single',
            rollData = null,
        }: {
            type: 'single' | 'min' | 'max'
            rollData: RollData | undefined,
        } = {}): number;
    }

    /** used for weapons and attacks */
    interface TraitSelector<T extends string = string> {
        /** Raw value saved on the actor/item */
        base: T[];
        /** Traits added by the user */
        custom: Set<string>;
        /** Translated names for standard plus custom */
        names: Array<string>;
        /** Traits defined by the system*/
        standard: Set<T>;
        /** Combined set of both custom and standard */
        total: Set<string>;
    }

    /** @see {CONST.TOKEN_DISPOSITIONS} */
    type DispositionLevel =
        | /** secret */ -2
        | /** hostile */ -1
        | /** neutral */ 0
        | /** friendly */ 1;

    /** @see {CONST.DOCUMENT_OWNERSHIP_LEVELS} */
    type OwnerShipLevel =
        | /** inherit */ -1
        | /** none */ 0
        | /** limited */ 1
        | /** observer */ 2
        | /** owner */ 3;

    interface TokenDocumentPF extends ItemDocument {
        id: string;
        actor?: ActorCharacterPF;
        displayName: TOKEN_DISPLAY_MODES;
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

    class TokenPF {
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

        _onHoverIn(e: PointerEvent, arg1: { hoverOutOthers: boolean; });
        _onHoverOut(e: PointerEvent);
    }

    class ItemPF<
        SystemData extends SystemItemData = SystemItemData
    > extends ItemDocument {
        apps: EmbeddedCollection<Application>;
        scriptCalls: Collection<ItemScriptCall>;
        _stats: { compendiumSource: UUID };
        changes?: Collection<ItemChange>;
        _prepareDependentData(final: boolean): void;
        [MODULE_NAME]: {
            bonuses: (typeof BaseBonus)[];
            targets: (typeof BaseTarget)[];
            targetOverrides: (typeof BaseTargetOverride)[];
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
            core?: { sourceId: UUID };
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
         * @param key - The key for the boolean flag
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
        subschool: TraitSelector<keyof SpellSubschools>;

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
            size: { base: ActorSize, value: number};
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
        changes: ItemChange[];
        /** tag identifier for class associated with this item */
        class: string;
        flags: {
            boolean: Record<string, boolean>;
            dictionary: DictionaryFlags;
        };
        masterwork: boolean;
        subType: 'natural' | 'classFeat';
        tag: string;
        tags: string[];

        /** These properties are not natively on all item types, but I'm adding them during data prep to better target _unintended_ items */
        /** weapon */
        properties?: Partial<Record<keyof WeaponProperties, boolean>>;
        /** attack, equipment, weapon */
        baseTypes?: string[];
        /** attack, weapon */
        weaponGroups?: Partial<TraitSelector<keyof WeaponGroups>>;
        /** attack, equipment, weapon */
        proficient: boolean;
        held?: keyof pf1['config']['abilityDamageHeldMultipliers'];
        size: number;
        sources: { id: string, pages: string | number }[];
    }
    class SystemItemDataAttackPF extends SystemItemData {
        baseTypes: string[];
        enh: number;
        // links: { children: { name: string; id: string }[] };
        masterwork: boolean;
        weaponGroups: TraitSelector<keyof WeaponGroups>;
    }
    class SystemItemDataContainerPF extends SystemItemData {}
    class SystemItemDataBuffPF extends SystemItemData {
        level: number;
    }
    class SystemItemDataClassPF extends SystemItemData {
        level: number;
    }
    class SystemItemDataConsumablePF extends SystemItemData {}
    class SystemItemDataEquipmentPF extends SystemItemData {
        armor: {
            acp: number;
            dex: number | null;
            enh: number;
            value: number;
            material : {
                addon: Array<unknown>
                base: {value: string, custom: boolean}
                normal: {value: string, custom: boolean}
            }
            total : number;
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
    class SystemItemDataRacePF extends SystemItemData {
        creatureSubtypes: TraitSelector<CreatureSubtype>;
        creatureTypes: TraitSelector<CreatureType>;
    }
    class SystemItemDataSpellPF extends SystemItemData {
        descriptors: TraitSelector<keyof SpellDescriptors>;
        school: SpellSchool;
        subschool: TraitSelector<SpellSubschool>;

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
            skill: number;
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
            level: keyof pf1['config']['woundThresholdConditions'];
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
        id: string;
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
    }

    /**
     * Roll Data used for resolving formulas
     */
    interface RollData<T extends SystemItemData = SystemItemData> {
        critMultBonus: number;
        range: {
            melee: string;
            reach: number;
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
        class?: ClassRollData;
        classes: Record<string, ClassRollData>;
        conditions: { loseDexToAC: boolean, [string: keyof Conditions]: boolean };
        /** Conditionals being used as part of this action */
        conditionals?: { [key: string]: Record<string, number> };
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
        skills: Record<SkillId, SkillRollData>;
        spells: Record<string, SpellBookRollData>;
        traits: TraitsRollData;
        // [key: string]: any,

        // bonus built up during initiative rolls
        bonus?: number;

        // item roll data
        dFlags?: DictionaryFlags;
        item: T;

        // spell roll data
        cl?: number;
        sl?: number;
        ablMod?: number;

        // action roll data
        action?: {
            _id: string;
            ability: {
                attack: keyof Abilities;
                critMult: Formula;
                critRange: number;
                damage: keyof Abilities;
                damageMult: number;
            };
            damage: {
                critParts: DamagePartRollData[];
                nonCritParts: DamagePartRollData[];
                parts: DamagePartRollData[];
            };
            held: '1h' | '2h' | 'oh';
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

        // custom properties
        rb: {
            inspiration?: {
                /** Investigator inspiration die. Default 1d6 */
                base: string;
                /** Roll one more and keep high. Default 2d6kh */
                baseExtra: string;
                /** Investigator upgraded inspiration die. Default 1d8 */
                improved: string;
                /** One higher and keep high. Default 2d8kh */
                improvedExtra: string;
            }
            rangePenalty?: {
                maxIncrements: number;
                penalty: number;
                penaltyOffset: number;
                range: number;
            };
        };
        [MODULE_NAME]: {
            [key: string]: number | string | object | array;
        };
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
        get type(): CritType;;
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
         * Synchronous and thrown error consuming roll evaluation.
         *
         * @remarks
         * - Returned roll has `.err` set if an error occurred during evaluation.
         * - If error occurs, the returned roll will have its formula replaced.
         * @param {string} formula - Roll formula
         * @param {object} rollData - Data supplied to roll
         * @param {any} context - If error occurs, this will be included in the error message.
         * @param {object} [options] - Additional options
         * @param {boolean} [options.suppressError=false] - If true, no error will be printed even if one occurs.
         * @param {object} [evalOpts] - Additional options to pass to Roll.evaluate()
         * @returns {Promise<RollPF & { total: number }>} - Evaluated roll, or placeholder if error occurred.
         */
        static async safeRoll(
            formula: string,
            rollData: object = {},
            context: any,
            { suppressError = false }: { suppressError?: boolean; } = {},
            evalOpts: object = {}
        ): Promise<RollPF & { total: number }>;

        /**
         * Synchronous version of {@link safeRoll safeRoll()}
         *
         * {@inheritDoc safeRoll}
         *
         * @param {string} formula - Formula to evaluate
         * @param {object} [rollData] - Roll data
         * @param {*} [context] - Context data to log if error occurs
         * @param {object} [options] - Additional options
         * @param {boolean} [options.suppressError] - If true, no error will be printed
         * @param {object} [evalOpts] - Options to pass to Roll.evaluate()
         * @returns {RollPF & { total: number }} - Evaluated roll
         */
        static safeRollSync(formula: string,
            rollData: object = {},
            context: any,
            { suppressError = false }: { suppressError?: boolean; } = {},
            evalOpts: object = {}
        ): RollPF & { total: number };

        evaluate(options?: InexactPartial<Options>): Promise<Evaluated<this>>;
        evaluate(
            options?: InexactPartial<Options> & { forceSync: true }
        ): Evaluated<this>;

        evaluateSync(options: (RecursivePartial<Option> & { forceSync: true } | { maximize: true } | { minimize: true })): Evaluated<this>;
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
        | 'wounds'
        | `skill.${SkillId}`
        | `skill.~${SkillId}`;

    interface DamageType {
        abbr: string;
        category: 'physical' | 'energy' | 'misc';
        color: string;
        flags: Record<string, any>;
        icon: string;
        isModifier: boolean;
        name: string;
        namepsace: 'pf1' | string;
        get id(): keyof DamageTypes;
    }

    interface ItemChangeArgs {
        flavor: string | undefined;
        formula: string | number;
        operator?: 'add' | 'function' | 'set';
        priority?: number;
        target: BuffTarget;
        type: BonusTypes | string;
        value?: string | number;
        _id?: string,
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
        value: Formula;

        get id(): string;

        data: {
            flavor: string;
            formula: string;
            type: BonusTypes | DamageTypes | string;
            operator: '+' | '-';
            priority: number;
            target: BuffTarget = 'skill';
            value: number;
        };

        getTargets(actor: ActorPF): Array<string>;

        toObject(): object;
    }

    class ItemConditionalSourceData {
        default: boolean;
        modifiers: ItemConditionalModifierSourceData[];
        name: string;
        _id: string;
    }
    class ItemConditional {
        get id(): string;
        get modifiers(): Readonly<Collection<ItemConditionalModifier>>;
        get name(): string;
        get parent(): undefined | ItemPF;
        get default(): boolean;

        get _source(): ItemConditionalSourceData;

        constructor(
            obj?: RecursivePartial<ItemConditionalSourceData>,
            parent?: ItemAction
        ): ItemConditional;
        /** @deprecated do not use within this mod */
        static async create(
            data: ItemConditionalSourceData[],
            options: {
                parent: ItemAction;
            }
        ): Promise<Array<ItemConditional>>;
        toObject(): object;
    }

    type GenericDamageType = Nullable<BonusTypes | keyof DamageTypes | string>;

    class ItemConditionalModifierSourceData {
        critical: Nullable<CritType | ''>; // all for 'damage', 'crit' and 'normal' also for attack
        damageType: (keyof DamageTypes | string)[];
        formula: string;
        subTarget:
            | 'hasteAttack'
            | 'rapidShotAttack'
            | 'allAttack' // when target is 'attack'
            | 'hasteDamage'
            | 'rapidShotDamage'
            | 'attack_0'
            | 'allDamage' // when target is 'damage'
            | 'charges' // when target is 'misc'
            | '' // size
            | undefined; // no subtarget for 'size'
        target:
        | 'attack'
        | 'charges'
        | 'cl'
        | 'critMult'
        | 'damage'
        | 'dc'
        | 'size';
        type: GenericDamageType;
        _id: string;
    }

    interface ConditionalTarget {
        id: string;
        sort: number;
        label: string;
        simple?: boolean;
        disabled?: boolean;
        choices?: Record<string, any>;
    }
    /** Includes fields that are prepped when showing the action sheet */
    class ItemConditionalModifierSourceDataPrepped extends ItemConditionalModifier {
        targets: {
            attack: ConditionalTarget;
            charges?: ConditionalTarget;
            cl: ConditionalTarget;
            critMult: ConditionalTarget;
            damage: ConditionalTarget;
            dc: ConditionalTarget;
            size: ConditionalTarget;
        }?;
        targetEntry?: ConditionalTarget;
        subTargets: { [x: string]: string }?;
        conditionalModifierTypes: { [x: string]: string }?;
        conditionalCritical: {
            normal?: 'PF1.Normal';
            crit?: 'PF1.OnCritBonusFormula';
            nonCrit?: 'PF1.NonMultBonusFormula';
        }?;
        damage: DamagePartModel;
    }
    class ItemConditionalModifier {
        critical: undefined | CritType;
        damageType: Set<string>;
        formula: string | number;
        subTarget: undefined;
        target: ItemConditionalModifierSourceData['target'];
        type: BonusTypes | DamageTypes;

        get id(): string;
        get partID(): string;

        get _source(): ItemConditionalModifierSourceData;
        parent: ItemConditional;

        constructor(arg?: Partial<ItemConditionalModifierSourceData>);
    }

    class ItemScriptCallData {
        _id: string;
        name: string;
        img: string;
        type: 'macro' | 'script';
        value: string;
        category: string;
        hidden: boolean;
    }
    class ItemScriptCall {
        id: string;
        get parent(): ItemPF<SystemItemData>;
        get hide(): boolean;
        get category(): string;

        constructor(data: Partial<ItemScriptCallData>, options: { parent: ItemPF});
        execute(
            shared: Partial<ActionUseShared<SystemItemData>>,
            extraParams: { [x: string]: object } = {}
        ): Promise;

        type: 'script' | 'macro';
        value: string;
        name: string;

        /** ROLL BONUS CUSTOM */
        /** in-memory value to determine if this mod created this */
        rollBonus?: boolean;
        source?: ItemPF;
    }

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

    type ActorTraitSelectorOptions = ApplicationOptions & {
        choices: Record<string, string>;
        /** This is my custom data */
        description: string;
        document: ActorPF | ItemPF;
        hasCustom: boolean,
        /** This is my custom data */
        limit: number;
        name: string;
        subject: string;
    };
    class ActorTraitSelector extends ApplicationV2 {
        options: ActorTraitSelectorOptions;
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

    interface ActionDamageSource {
        flavor: string;
        formula: string;
        modifier?: BonusTypes;
        type?: BonusTypes;
        value: string | number;
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
        areaOfEffect: 'Area of Effect';
        precision: 'Precision';
        nonlethal: 'Nonlethal';
    }

    interface pf1 {
        models: {
            action: {
                DamagePartModel: typeof DamagePartModel;
            };
        };
        dice: {
            DamageRoll: typeof DamageRoll;
            D20RollPF: typeof D20RollPF;
        };
        actionUse: {
            ActionUse: typeof ActionUse;
            ChatAttack: typeof ChatAttack;
        };
        applications: {
            ScriptEditor: any;
            AttackDialog: { new (): AttackDialog };
            ActorTraitSelector: {
                new (options: Partial<ActorTraitSelectorOptions>): ActorTraitSelector;
            };
            DamageTypeSelector: {
                new (
                    object: { uuid: string },
                    dataPath: string,
                    data: ItemConditionalModifierSourceData['damageType'],
                    options = { updateCallback({ [dataPath]: object }) },
                ): DamageTypeSelector;
            };
        };
        canvas: {
            TokenPF: typeof TokenPF;
        }
        components: {
            ItemAction: typeof ItemAction;
            ItemChange: typeof ItemChange;
            ItemConditional: typeof ItemConditional;
            ItemConditionalModifier: typeof ItemConditionalModifier;
            ItemScriptCall: typeof ItemScriptCall;
        };
        config: {
            woundThresholdConditions: {
                0: "Healthy Condition"
                1: "Grazed Condition"
                2: "Wounded Condition"
                3: "Critical Condition"
            };
            classSkillBonus: number;
            abilityDamageHeldMultipliers: { oh: 0.5; '1h': 1; '2h': 1.5 };
            actorSizes: Record<ActorSize, string>;
            actorStatures: Record<ActorStature, string>;
            backgroundOnlySkills: (SkillId)[] = ['art', 'lor'];
            conditions: Conditions;
            conditionalTargets: {
                attack: {
                    _label: 'Attack Rolls';
                    allAttack: 'All';
                    hasteAttack: 'Haste';
                    rapidShotAttack: 'Rapid Shot';
                };
                critMult: {
                    _label: 'Attack Rolls';
                };
                damage: {
                    _label: 'Damage';
                    allDamage: 'All';
                    hasteDamage: 'Haste';
                    rapidShotDamage: 'Rapid Shot';
                };
                effect: {
                    _label: 'Effects';
                };
                size: {
                    _label: 'Size';
                };
            };
            creatureSubtypes: CreatureSubTypes;
            creatureTypes: CreatureTypes;
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
                // [key: `crf.${string}`]: 'Craft (Sub)';
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
                // [key: `prf.${string}`]: 'Perform (Sub)';
                pro: 'Profession';
                // [key: `pro.${string}`]: 'Profession (Sub)';
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
            spellSchools: SpellSchools;
            spellSubschools: SpellSubschools;
            weaponGroups: WeaponGroups;
        };
        documents: {
            settings: {
                getSkipActionPrompt(): boolean;
            };
            actor: {
                changes: {
                    /**
                     * @param {ItemChange[]} changes - An array containing all changes to check. Must be called after they received a value (by ItemChange.applyChange)
                     * @param {object} [options] - Additional options
                     * @param {boolean} [options.ignoreTarget] - Whether to only check for modifiers such as enhancement, insight (true) or whether the target (AC, weapon damage) is also important (false)
                     * @returns {ItemChange[]} - A list of processed changes, excluding the lower-valued ones inserted (if they don't stack)
                     */
                    getHighestChanges(changes, options = { ignoreTarget: false }): ItemChange[];
                }
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
            scriptCalls: ScriptCallRegistry;
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
            i18n: {
                /**
                 * Convert string array into joined string according to current language.
                 *
                 * @param {Array<string>} strings - Array of strings to join
                 * @param {"c"|"d"|"u"} [type] - conjunction = and, disjunction = or, unit = neither. Only the first letter matters.
                 * @param {boolean} [short] - If true, effectively same as type being set to "u"
                 * @returns {string} - Formatted string of all traits.
                 */
                join(strings, type = "u", short = true): string;
            };
            formula: {
                actionDamage: (action: ItemAction, { simplify, strict }?: {
                    simplify?: boolean | undefined;
                    strict?: boolean | undefined;
                }) => string;
                compress(arg0: string): string;
                simplify(
                    formula: string,
                    rollData?: RollData,
                    options?: { strict?: boolean }
                ): string;
            };
            getDistanceSystem(): 'metric' | 'imperial';
            createTag(name: string): string;
        };
    }

    class ScriptCallCategory {
        _id: string;
        hidden: boolean;
        itemTypes: string[];
        name: string;
        get id(): string;
        get name(): string;
        get info(): string;
    }
    class ScriptCallRegistry extends Collection<ScriptCallCategory> {}

    type CreatureSubtype = keyof CreatureSubtypes;
    type CreatureSubtypes = {
        adlet: 'Adlet';
        aeon: 'Aeon';
        aether: 'Aether';
        agathion: 'Agathion';
        air: 'Air';
        android: 'Android';
        angel: 'Angel';
        aquatic: 'Aquatic';
        archon: 'Archon';
        astomoi: 'Astomoi';
        asura: 'Asura';
        augmented: 'Augmented';
        azata: 'Azata';
        behemoth: 'Behemoth';
        blight: 'Blight';
        catfolk: 'Catfolk';
        changeling: 'Changeling';
        chaotic: 'Chaotic';
        clockwork: 'Clockwork';
        cold: 'Cold';
        colossus: 'Colossus';
        daemon: 'Daemon';
        darkFolk: 'Dark Folk';
        deepOne: 'Deep One';
        demodand: 'Demodand';
        demon: 'Demon';
        derro: 'Derro';
        devil: 'Devil';
        div: 'Div';
        dwarf: 'Dwarf';
        earth: 'Earth';
        elemental: 'Elemental';
        elf: 'Elf';
        evil: 'Evil';
        extraplanar: 'Extraplanar';
        fire: 'Fire';
        giant: 'Giant';
        gnome: 'Gnome';
        goblinoid: 'Goblinoid';
        good: 'Good';
        gray: 'Gray';
        greatOldOne: 'Great Old One';
        grippli: 'Grippli';
        halfling: 'Halfling';
        herald: 'Herald';
        hive: 'Hive';
        human: 'Human';
        incorporeal: 'Incorporeal';
        inevitable: 'Inevitable';
        kaiju: 'Kaiju';
        kami: 'Kami';
        kasatha: 'Kasatha';
        kitsune: 'Kitsune';
        kyton: 'Kyton';
        lawful: 'Lawful';
        leshy: 'Leshy';
        manasaputra: 'Manasaputra';
        mortic: 'Mortic';
        munavri: 'Munavri';
        mythic: 'Mythic';
        native: 'Native';
        nightshade: 'Nightshade';
        oni: 'Oni';
        orc: 'Orc';
        phantom: 'Phantom';
        protean: 'Protean';
        psychopomp: 'Psychopomp';
        qlippoth: 'Qlippoth';
        rakshasa: 'Rakshasa';
        ratfolk: 'Ratfolk';
        reptilian: 'Reptilian';
        robot: 'Robot';
        sahkil: 'Sahkil';
        samsaran: 'Samsaran';
        sasquatch: 'Sasquatch';
        shapechanger: 'Shapechanger';
        skinwalker: 'Skinwalker';
        spawnOfRovagug: 'Spawn of Rovagug';
        swarm: 'Swarm';
        troop: 'Troop';
        vanara: 'Vanara';
        vishkanya: 'Vishkanya';
        water: 'Water';
        wayang: 'Wayang';
        wildHunt: 'Wild Hunt';
    };
    type CreatureType = keyof CreatureTypes;
    type CreatureTypes = {
        aberration: 'Aberration';
        animal: 'Animal';
        construct: 'Construct';
        dragon: 'Dragon';
        fey: 'Fey';
        humanoid: 'Humanoid';
        magicalBeast: 'Magical Beast';
        monstrousHumanoid: 'Monstrous Humanoid';
        ooze: 'Ooze';
        outsider: 'Outsider';
        plant: 'Plant';
        undead: 'Undead';
        vermin: 'Vermin';
    };

    type SavingThrow = keyof SavingThrows;
    type SavingThrows = {
        fort: 'Fortitude';
        ref: 'Reflex';
        will: 'Will';
    };

    type SpellSchool = keyof typeof pf1.config.spellSchools;
    type SpellSchools = {
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
    }

    type SpellSubschool = keyof typeof pf1.config.spellSubschools;
    type SpellSubschools = {
        calling: 'Calling';
        charm: 'Charm';
        compulsion: 'Compulsion';
        creation: 'Creation';
        figment: 'Figment';
        glamer: 'Glamer';
        haunted: 'Haunted';
        healing: 'Healing';
        pattern: 'Pattern';
        phantasm: 'Phantasm';
        polymorph: 'Polymorph';
        scrying: 'Scrying';
        shadow: 'Shadow';
        summoning: 'Summoning';
        teleportation: 'Teleportation';
    };

    type WeaponGroup = keyof typeof pf1.config.weaponGroups;
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

    interface ParsedContextNoteEntry  {
        /** Source label if any */
        source?: string;

        /** Enriched note text */
        text: string;
    }
}
