export { }

declare global {

    interface WarpgateButton {
        label: string,
        value: boolean,
    }
    interface WarpgateInput {
        label: string,
        type: string,
        options: string | boolean,
    }

    class Warpgate {
        async menu(
            prompts: {
                buttons: WarpgateButton[],
                inputs: WarpgateInput[],
            },
            config: {
                title: string,
            }
        ): Promise<{ inputs: string[], buttons: boolean }>;
    }

    let warpgate: Warpgate;
}
