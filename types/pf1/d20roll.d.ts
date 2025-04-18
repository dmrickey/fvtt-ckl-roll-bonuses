export {};

declare global {
    async function d20Roll(options?: {
        skipDialog?: boolean;
        staticRoll?: null;
        chatTemplateData?: Object;
        chatMessage?: boolean;
        compendium?: unknown;
        noSound?: boolean;
        flavor?: string;
        parts?: unknown[];
        dice?: string;
        rollData?: RollData;
        subject?: unknown;
        rollMode?: unknown;
        bonus?: string;
        speaker?: unknown;
    });

    interface D20RollConstructorOptions extends RollTerm.EvaluationOptions {
        /**
         * The number on the d20 that is considered a critical success.
         *
         * @defaultValue `20`
         */
        critical?: number;
        /**
         * The number and below on the d20 that is considered a misfire.
         *
         * @defaultValue `undefined`
         */
        misfire?: number;
        /**
         * The flavor of the roll
         */
        flavor?: string;
        /**
         * An additional bonus to be added to the roll.
         *
         * @deprecated - Include the bonus in the formula instead.
         */
        bonus?: string | number;
        /**
         * A number used as a static roll result of the d20.
         * If null, the d20 is rolled normally and the result is used.
         *
         * @defaultValue `undefined`
         */
        staticRoll?: number;
        /**
         * Is this actually a check.
         *
         * @defaultValue `true`
         */
        check?: boolean;
        /**
         * Record DC for this roll.
         */
        dc?: number;
    }

    interface D20RollOptions
        extends D20RollConstructorOptions,
            Pick<D20RollChatOptions, 'rollMode'> {}

    interface D20RollDialogOptions
        extends Pick<D20RollConstructorOptions, 'bonus'> {
        /**
         * The title of the dialog window.
         *
         * @defaultValue {@link D20RollConstructorOptions.flavor}
         */
        title?: string;
        /**
         * The template used to render the dialog's content.
         *
         * @defaultValue {@link D20RollPF.DIALOG_TEMPLATE}
         */
        template?: string;
        /**
         * Additional options passed to the dialog's creation.
         */
        dialogOptions?: object;
        /**
         * The rollMode that is preselected in the dialog
         *
         * @defaultValue `game.settings.get("core", "rollMode")`
         */
        rollMode?: string;
        /**
         * Speaker data
         */
        speaker?: foundry.data.ChatMessageData['_source']['speaker'];
    }

    interface D20RollContext {
        /**
         * Speaker data
         */
        speaker?: foundry.data.ChatMessageData['_source']['speaker'];
    }

    interface D20RollChatOptions {
        /**
         * The template used to render the chat message.
         *
         * @defaultValue {@link D20RollPF.CHAT_TEMPLATE}
         */
        chatTemplate?: string;
        /**
         * Additional data passed to the chat message's content's {@link renderTemplate}.
         */
        chatTemplateData?: object;
        /**
         * The speaker of the chat message.
         */
        speaker?: foundry.data.ChatMessageData['_source']['speaker'];
        /**
         * Whether no dice sound should be played when the chat message is created.
         *
         * @defaultValue `false`
         */
        noSound?: boolean;
        /**
         * The rollMode with which the chat message is created.
         *
         * @defaultValue `game.settings.get("core", "rollMode")`
         */
        rollMode?: string;
        /**
         * Whether a chat message should be created.
         *
         * @defaultValue `true`
         */
        create?: boolean;
        /**
         * Data used to create a link to a compendium entry in the chat message.
         */
        compendium?: { entry: string; type: string };
        /**
         * Data stored in the chat message's flags to allow for easier identification of the message's subject.
         */
        subject?: object;
    }

    interface D20ActorRollOptions
        extends Pick<
                D20RollConstructorOptions,
                'flavor' | 'bonus' | 'staticRoll'
            >,
            Pick<
                D20RollChatOptions,
                | 'noSound'
                | 'compendium'
                | 'rollMode'
                | 'chatTemplateData'
                | 'subject'
                | 'speaker'
            > {
        /**
         * Data object the roll is evaluated against.
         *
         * @defaultValue `{}`
         */
        rollData?: RollData;
        /**
         * An array of strings from which the roll's formula is created.
         *
         * @defaultValue `[]`
         */
        parts?: string[];
        /**
         * The roll's d20 die (replacement), or the static result the d20 should have.
         *
         * @defaultValue `"1d20"`
         */
        dice?: string;
        /**
         * Bonus to the roll.
         */
        bonus?: string;
        /**
         * Whether a chat message should be created.
         *
         * @defaultValue `true`
         */
        chatMessage?: boolean;
        /**
         * Whether a user facing dialog should be shown.
         *
         * @defaultValue `true`
         */
        skipDialog?: boolean;

        /**
         * Additional data to add to the chat message.
         */
        messageData?: object;

        /**
         * Associated token if any.
         */
        token?: TokenDocument;
        /**
         * DC threshold
         */
        dc?: number;
    }

    interface ActorRollOptions extends D20ActorRollOptions {}
}
