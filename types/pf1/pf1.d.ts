import { MODULE_NAME } from '../../src/consts.mjs';
import Document from '../foundry/common/abstract/document.mjs';

export { };

declare global {
    abstract class BaseDocument extends Document {
        getRollData(): RollData;
        getFlag(moduleName: string, key: string): any;
        async setFlag<T>(moduleName: string, key: string, value: T);
        updateSource(changes: Partial<this>, options?: object);
        uuid: string;
    }

    abstract class ItemDocument extends BaseDocument { }

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
        conditionals: any;
        attackBonus: string[];
        damageBonus: string[];
        rollData: RollData;
        conditionalPartsCommon: any;
        attacks: any;
    }
    class ActionUse {
        action: Action;
        actor: ActorPF;
        item: ItemPF;
        shared: ActionUseShared;
    }

    class ChatAttack {
        action: ItemAction;
        attackNotes: string[];
        effectNotes: string[];
        rollData: RollData;
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

    interface TokenPF extends ItemDocument {
        id: string;
        actor: ActorPF;
        displayName: 0 | 10 | 20 | 30 | 40 | 50;
        disposition: DispositionLevel;
        name: string;
        permission: PermissionLevel;
        texture: { src: string };
        visible: boolean;
    }

    class ItemPF<
        SystemData extends SystemItemData = SystemItemData
    > extends ItemDocument {
        [MODULE_NAME]: { [key: string]: number | string | object | array };

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

    class ItemAttackPF extends ItemPF<SystemItemDataAttackPF> { }
    class ItemEquipmentPF extends ItemPF<SystemItemDataEquipmentPF> { }
    class ItemFeatPF extends ItemPF { }
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
    class ItemWeaponPF extends ItemPF<SystemWeaponPF> { }

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
        // links: { children: { name: string; id: string }[] };
        proficient: boolean;
        weaponGroups: TraitSelector;
    }

    type ItemType =
        | 'attack'
        | 'buff'
        | 'class'
        | 'consumable'
        | 'equipment'
        | 'feat'
        | 'loot'
        | 'spell'
        | 'weapon';

    interface SkillRollData {
        ability: keyof Abilities;
        acp: boolean;
        changeBonus: number;
        cs: boolean;
        /** compendium link returned for custom skills */
        journal: string | undefined;
        rank: number;
        rt: boolean;

        name?: string;
        subSkills?: SkillRollData[];
    }

    /**
     * Roll Data used for resolving formulas
     */
    interface RollData {
        action: {
            _id: string;
            damage: {
                parts: { formula: string; type: TraitSelectorValuePlural }[];
            };
            ability: {
                attack: string;
                critMult: number | string;
                critRange: number;
                damage: string;
                damageMult: number;
            };
        };
        armor: {
            ac: number;
            enh: number;
            total: number;
            type: number;
        };
        chargeCostBonus: number;
        cl: number;
        conditionals: any;
        dcBonus: number;
        dFlags: ItemDictionaryFlags;
        item: ItemPF;
        shield: {
            ac: number;
            enh: number;
            total: number;
            type: number;
        };
        size: number;
        skills: { [key: string]: SkillRollData };
        spells: any;
        // [key: string]: any,
    }

    interface RollPF {
        /**
         * A standardized helper function for simplifying the constant parts of a multipart roll formula.
         *
         * @param {string} formula                          The original roll formula.
         * @param {object} [options]                        Formatting options.
         * @param {boolean} [options.preserveFlavor=false]  Preserve flavor text in the simplified formula.
         * @param {boolean} [options.deterministic]         Strip any non-deterministic terms from the result.
         *
         * @returns {string}  The resulting simplified formula.
         */
        simplifyFormula: (formula: string, { preserveFlavor, deterministic }?: { preserveFlavor?: boolean | undefined; deterministic?: boolean | undefined; } | undefined) => string;

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
        ): {
            formula: string;
            isDeterministic: boolean;
            total: number;
        };
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

    interface ActorTraitSelector {
        setPosition(position?: Position);
        get position(): Position;
        render(show: boolean);
    }
    interface pf1 {
        applications: {
            ActorTraitSelector: {
                new(doc: Document, options: object): ActorTraitSelector;
            };
            DamageTypeSelector: {
                new(
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
                new(
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
            abilities;
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
                ActorPF: { new(): ActorPF };
            };
            item: {
                ItemAttackPF: { new(): ItemAttackPF };
                ItemEquipmentPF: { new(): ItemEquipmentPF };
                ItemFeatPF: { new(): ItemFeatPF };
                ItemLootPF: { new(): ItemLootPF };
                ItemPF: { new(): ItemPF };
                ItemSpellPF: { new(): ItemSpellPF };
                ItemWeaponPF: { new(): ItemWeaponPF };
            };
        };
        registry: {
            damageTypes: EmbeddedCollection<DamageType>;
        };
    }

    interface SavingThrows {
        fort: 'Fortitude';
        ref: 'Reflex';
        will: 'Will';
    }
}
