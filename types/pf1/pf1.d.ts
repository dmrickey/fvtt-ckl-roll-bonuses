export { }

declare global {
    abstract class BaseDocument {
        getFlag(moduleName: string, key: string): any;
        async setFlag<T>(moduleName: string, key: string, value: T);
        updateSource(changes: Partial<this>, options?: object);
    }

    abstract class ItemDocument extends BaseDocument { }

    interface Abilities {
        str: 'Strength',
        dex: 'Dexterity',
        con: 'Constitution',
        int: 'Intelligence',
        wis: 'Wisdom',
        cha: 'Charisma'
    }

    type ActionType = 'msak'
        | 'mwak'
        | 'rsak'
        | 'rwak'
        | 'mcman'
        | 'rcman'

    class ActorPF extends BaseDocument {
        getSkillInfo(skillId: string): SkillRollData;

        /**
         * Gets the actor's roll data.
         * @param refresh - pass true to force the roll data to recalculate
         * @returns The actor's roll data
         */
        getRollData(args?: {
            refresh?: boolean
        }): RollData;

        itemFlags: {
            /**
             * The tags for Items that are active with a boolean flag
             */
            boolean: { [key: string]: { sources: ItemDocument[] } },
            dictionary: ItemDictionaryFlags,
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
                        }
                    };
                }
            }
        };
    }

    class ActionUse {
        action: Action;
        actor: ActorPF;
        item: ItemPF;
        shared: Shared;
    }

    class ChatAttack {
        action: Action;
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
        [key: string]: FlagValue,
    }

    interface ItemDictionaryFlags {
        /**
         * Dictionary flags keyed by Item tags
         */
        [key: string]: DictionaryFlags,
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
                parts: { formula: string, type: { custom: string, values: string[], } }[]
            }
        }
        item: ItemPF;
    }

    interface ItemAttackPF extends ItemPF {
        system: SystemItemAttackPF,
    }
    interface ItemEquipmentPF extends ItemPF {
        system: SystemItemEquipmentPF,
    }
    interface ItemSpellPF extends ItemPF {
        system: SystemItemSpellPF,
    }

    interface ItemFeatPF extends ItemPF {

    }

    interface ItemChange {
        modifier: BonusModifers,
        parent: undefined | ItemPF;
    }

    interface SystemItem {
        broken: boolean;
        flags: {
            boolean: {},
            dictionary: DictionaryFlags;
        };
        tag: string;
        tags: string[];
    }
    interface SystemItemAttackPF extends SystemItem {
        baseTypes: string[];
        weaponGroups: TraitSelector?;
    }
    interface SystemItemEquipmentPF extends SystemItem {
        armor: {
            acp: number,
            dex: number | null,
            enh: number,
            value: number,
        },
        baseTypes: string[];
        proficient: boolean,
        slot: 'armor' | 'shield',
        weaponGroups: TraitSelector;
    }
    interface SystemItemSpellPF extends SystemItem {
        school: string;
    }

    interface TraitSelector {
        /** custom entries split by ; */
        custom: string;
        value: string[];
    }

    interface ItemPF extends ItemDocument {
        actions: EmbeddedCollection<Action>;

        actor: ActorPF;
        firstAction: Action;
        flags: {
            core: {
                sourceId: string
            }
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
        'attack'
        | 'buff'
        | 'class'
        | 'consumable'
        | 'equipment'
        | 'feat'
        | 'loot'
        | 'spell'
        | 'weapon';

    interface SkillRollData {
        ability: keyof Abilities,
        acp: boolean,
        changeBonus: number,
        cs: boolean,
        rank: number,
        rt: boolean,

        name?: string,
        subSkills?: SkillRollData[],
    }

    /**
     * Roll Data used for resolving formulas
     */
    interface RollData {
        skills: { [key: string]: SkillRollData },
        action: {
            id: string,
            damage: {
                parts: { formula: string, type: TraitSelector }[]
            }
            ability: {
                attack: string;
                critMult: number;
                critRange: number;
                damage: string;
                damageMult: number;
            }
        },
        armor: {
            ac: number,
            enh: number,
            total: number,
            type: number,
        },
        cl: number,
        dFlags: ItemDictionaryFlags,
        item: ItemPF,
        shield: {
            ac: number,
            enh: number,
            total: number,
            type: number,
        },
        spells: any,
        // [key: string]: any,
    }

    class RollPF {
        /**
         * Safely get the result of a roll, returns 0 if unsafe.
         * @param formula - The string that should resolve to a number
         * @param rollData - The roll data used for resolving any variables in the formula
         */
        static safeTotal(formula: string | number, rollData: RollData): number;
    }

    type BonusModifers =
        'alchemical'
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
        '~attackCore'
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
        category: 'physical' | 'energy',
        color: string,
        flags: { [key: string]: any },
        icon: string,
        isModifier: boolean,
        name: string,
        namepsace: 'pf1' | string,
    }

    interface ItemChange {
        constructor(args: {
            flavor: string,
            formula: string | number,
            modifier: BonusModifers,
            operator?: 'add' | 'function' | 'set',
            priority?: number,
            subTarget: BuffTargets,
            value?: string | number,
        }, parent = null);

        static create();
    }

    interface pf1 {
        components: {
            ItemAction: { new(): ItemAction },
            ItemChange: {
                new(args: {
                    flavor: string,
                    formula: string | number,
                    modifier: BonusModifers,
                    operator?: 'add' | 'function' | 'set',
                    priority?: number,
                    subTarget: BuffTargets,
                    value?: string | number,
                }, parent = null): ItemChange
            },
        };
        config: {
            weaponGroups: { [key: string]: string },
            bonusModifiers: BonusModifers,
            abilities,
            savingThrows: SavingThrows,
            skills,
            spellSchools
        };
        documents: {
            actor: {
                ActorPF: { new(): ActorPF }
            },
            item: {
                ItemSpellPF: { new(): ItemSpellPF }
                ItemPF: { new(): ItemPF }
                ItemAttackPF: { new(): ItemAttackPF }
                ItemEquipmentPF: { new(): ItemEquipmentPF }
                ItemFeatPF: { new(): ItemFeatPF }
            }
        };
        registry: {
            damageTypes: EmbeddedCollection<DamageType>,
        };
    }

    interface SavingThrows {
        fort: 'Fortitude',
        ref: 'Reflex',
        will: 'Will'
    }
}
