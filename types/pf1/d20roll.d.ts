
export { }

declare global {
    async function d20Roll(options?: {
        skipDialog?: boolean,
        staticRoll?: null,
        chatTemplateData?: Object,
        chatMessage?: boolean,
        compendium?: unknown,
        noSound?: boolean,
        flavor?: string,
        parts?: unknown[],
        dice?: string,
        rollData?: RollData,
        subject?: unknown,
        rollMode?: unknown,
        bonus?: string,
        speaker?: unknown,
    });
}
