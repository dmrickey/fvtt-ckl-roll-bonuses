export {};

declare global {
    interface WarpgateButton {
        label: string;
        value?: boolean | string;
        default?: true;
    }
    interface WarpgateInput {
        label: string;
        type: string;
        options?: string | boolean | Array;
        value?: any;
    }

    class Warpgate {
        async menu(
            prompts: {
                buttons: WarpgateButton[];
                inputs: WarpgateInput[];
            },
            config: {
                title: string;
            }
        ): Promise<{ inputs: (string | boolean)[]; buttons: boolean }>;
    }

    let warpgate: Warpgate;
}
