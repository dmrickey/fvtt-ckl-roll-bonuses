export { }

declare global {
    abstract class BaseDocument {
        getFlag(moduleName: string, key: string): any;
        async setFlag<T>(moduleName: string, key: string, value: T);
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

    class Action {
        id: string;
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
                parts: [string, { custom: string, values: string[] }][]
            }
        }
        item: ItemAttackPF;
    }

    class ActorPF extends BaseDocument {
        /**
         * Gets the actor's roll data.
         * @param refresh - pass true to force the roll data to recalculate
         * @returns The actor's roll data
         */
        getRollData(args?: {
            refresh?: boolean
        }): RollData;

        itemFlags: Flags;

        items: EmbeddedCollection<ItemPF>;

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
        actor: ActorePF;
        item: ItemPF;
        shared: Shared;
    }

    class ChatAttack {
        action: Action;
        attackNotes: string[];
        effectNotes: string[];
        rollData: RollData;
    }

    /**
     * Colletion of dictionary flags
     * {key: Flag}
     */
    interface DictionaryFlags {
        [key: string]: FlagValue,
    }

    interface ItemDictionaryFlags {
        [key: string]: DictionaryFlags,
    }

    type FlagValue = string | number;

    interface Flags {
        dictionary: ItemDictionaryFlags,

        /**
         * The tags for Items that are active with a boolean flag
         */
        boolean: { [key: string]: { sources: ItemDocument[] } },
    }

    interface ItemAction { }

    interface ItemAttackPF extends ItemPF { }
    interface ItemEquipmentPF extends ItemPF {
        system: {
            armor: {
                acp: number,
                dex: number | null,
                enh: number,
                value: number,
            },
            slot: 'shield',
        }
    }

    interface ItemChange {
        modifier: BonusModifers,
        parent: undefined | ItemPF;
    }

    interface ItemPF extends ItemDocument {
        actions: EmbeddedCollection<Action>;

        /**
         * @deprecated use @see parentActor
         */
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

        /**
         * @deprecated use @see parentActor
         */
        parent: ActorPF;
        parentActor: ActorPF;
        system: {
            // ItemSpellPF
            school: string;

            broken: boolean;
            flags: Flags,
        };
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

    /**
     * Roll Data used for resolving formulas
     */
    interface RollData {
        action: {
            id: string,
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
        dFlags: ItemDictionaryFlags,
        item: any,
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

    interface pf1 {
        components: {
            ItemAction: { new(): ItemAction }
            ItemChange: {
                new(args: {
                    flavor: string,
                    formula: string | number,
                    modifier: BonusModifers,
                    operator?: 'add' | 'function' | 'set',
                    priority?: number,
                    subTarget: BuffTargets,
                }): ItemChange
            }
        };
        config: {
            bonusModifiers: BonusModifers,
            abilities,
            damageTypes: { [key: string]: string },
            savingThrows: SavingThrows,
            skills,
            spellSchools
        };
        documents: {
            actor: {
                ActorPF: { new(): ActorPF }
            },
            item: {
                ItemPF: { new(): ItemPF }
                ItemEquipmentPF: { new(): ItemEquipmentPF }
            }
        };
    }

    interface SavingThrows {
        fort: 'Fortitude',
        ref: 'Reflex',
        will: 'Will'
    }
}
