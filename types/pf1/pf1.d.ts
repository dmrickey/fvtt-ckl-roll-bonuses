export { };

declare global {
    abstract class BaseDocument extends Document {
        getFlag(moduleName: string, key: string): any;
        async setFlag<T>(moduleName: string, key: string, value: T);
        updateSource(changes: Partial<this>, options?: object);
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

        itemFlags: {
            /**
             * The tags for Items that are active with a boolean flag
             */
            boolean: { [key: string]: { sources: ItemDocument[] } };
            dictionary: ItemDictionaryFlags;
        };

        items: EmbeddedCollection<ItemPF>;

        name: string;

        system: {
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

    class ActionUseShared {
        damageBonus: string[];
        action: any;
        conditionals: any;
        rollData: RollData;
        conditionalPartsCommon: any;
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

    interface ItemAction {
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
                parts: {
                    formula: string;
                    type: { custom: string; values: string[] };
                }[];
            };
        };
        item: ItemPF;
        static defaultDamageType: TraitSelectorValuePlural;
    }

    interface ItemAttackPF extends ItemPF {
        system: SystemItemAttackPF;
    }
    interface ItemEquipmentPF extends ItemPF {
        system: SystemItemEquipmentPF;
    }
    interface ItemSpellPF extends ItemPF {
        learnedAt: {
            class: { [key: string]: number };
            domain: { [key: string]: number };
        };
        system: SystemItemSpellPF;

        /** @deprecated Spells don't have tags */
        tag: string;
    }
    interface ItemFeatPF extends ItemPF { }
    interface ItemWeaponPF extends ItemPF {
        system: SystemWeaponPF;
    }

    interface ItemChange {
        modifier: BonusModifers;
        parent: undefined | ItemPF;
    }

    interface SystemItem {
        broken: boolean;
        flags: {
            boolean: {};
            dictionary: DictionaryFlags;
        };
        tag: string;
        tags: string[];
    }
    interface SystemItemAttackPF extends SystemItem {
        baseTypes: string[];
        links: { children: { name: string, id: string }[] };
        weaponGroups: TraitSelector?;
    }
    interface SystemItemEquipmentPF extends SystemItem {
        armor: {
            acp: number;
            dex: number | null;
            enh: number;
            value: number;
        };
        baseTypes: string[];
        links: { children: { name: string, id: string }[] };
        proficient: boolean;
        slot: 'armor' | 'shield';
    }
    interface SystemItemSpellPF extends SystemItem {
        school: string;
        types: string;
    }
    interface SystemWeaponPF extends SystemItem {
        baseTypes: string[];
        links: { children: { name: string, id: string }[] };
        proficient: boolean;
        weaponGroups: TraitSelector;
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

    interface ItemPF extends ItemDocument {
        actions: EmbeddedCollection<ItemAction>;

        actor: ActorPF;
        firstAction: ItemAction;
        flags: {
            core: {
                sourceId: string;
            };
            [key: string]: any;
        };
        id: string;
        isActive: boolean;
        name: string;

        parent: ActorPF | ItemPF;

        /**
         * @deprecated use @see actor
         */
        parentActor: ActorPF;
        system: SystemItem;
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
         * Sets teh given dictionary flag on the item
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
         * Safely get the result of a roll, returns 0 if unsafe.
         * @param formula - The string that should resolve to a number
         * @param rollData - The roll data used for resolving any variables in the formula
         */
        static safeTotal(formula: string | number, rollData: RollData): number;
    }

    type BonusModifers =
        | 'alchemical'
        | 'base'
        | 'circumstance'
        | 'competence'
        | 'deflection'
        | 'dodge'
        | 'enh'
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

    type BuffTargets =
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
    }

    interface ItemChange {
        constructor(
            args: {
                flavor: string;
                formula: string | number;
                modifier: BonusModifers;
                operator?: 'add' | 'function' | 'set';
                priority?: number;
                subTarget: BuffTargets;
                value?: string | number;
            },
            parent = null
        );

        static create();
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
            ActorTraitSelector: { new(doc: Document, options: object): ActorTraitSelector };
            DamageTypeSelector: {
                new(
                    object: { id: string, async update({ [dataPath]: object }) },
                    dataPath: string,
                    data: {},
                    options = {},
                ): DamageTypeSelector
            }
        };
        components: {
            ItemAction: { new(): ItemAction };
            // ItemAction: ItemAction ;
            ItemChange: {
                new(
                    args: {
                        flavor: string;
                        formula: string | number;
                        modifier: BonusModifers;
                        operator?: 'add' | 'function' | 'set';
                        priority?: number;
                        subTarget: BuffTargets;
                        /** The evaluation of the formula */
                        value?: string | number;
                    },
                    parent = null
                ): ItemChange;
            };
        };
        config: {
            weaponGroups: { [key: string]: string };
            bonusModifiers: BonusModifers;
            abilities;
            savingThrows: SavingThrows;
            skills;
            spellSchools: { [key: string]: string };
        };
        documents: {
            actor: {
                ActorPF: { new(): ActorPF };
            };
            item: {
                ItemAttackPF: { new(): ItemAttackPF };
                ItemEquipmentPF: { new(): ItemEquipmentPF };
                ItemFeatPF: { new(): ItemFeatPF };
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
