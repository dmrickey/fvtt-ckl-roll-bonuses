export { }

declare global {
    namespace Handlebars {
        function TemplateDelegate(
            templateData: { [key: string]: any },
            options: {
                allowProtoMethodsByDefault?: boolean,
                allowProtoPropertiesByDefault?: boolean,
            }
        ): string;

        let partials: { [key: string]: function(object, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true }) };
    }

    namespace SearchFilter {
        function cleanQuery(string): string;
    }

    class EmbeddedCollection<T> extends Array<T> {
        /**
         * Same as array.length
         */
        size: number;

        /** @deprecated - use {@link size} */
        length: unknown;
        contents: Array<T>;

        get(id: string): T | undefined;

        toObject(): { [key: string]: any };
    }

    class HbsTemplate {}
    interface RenderOptions {
        notes: string[];
        css: string;
        title: string;
    }
    function renderTemplate(
        hbsPath: string,
        options: RenderOptions,
    ): Promise<string>;

    interface EnrichOptions {
        rollData?: RollData,
        async: true,
        relativeTo?: ActorPF,
    }
    class TextEditor {
        static enrichHTML(
            context: string,
            options: EnrichOptions,
        ): Promise<string>;
    }

    class DialogButtonData {
        label: string;
        callback: () => void;
    }
    class Dialog {
        constructor({
            buttons: { [string]: DialogButton},
            content: string,
            default: string,
            title: string,
        }) {}
        render(boolean): void;
    }

    interface Set<T> {
        union<T, U>(set: Set<U>): Set<T|U>;

        /**
         * Create a new Set where every element is modified by a provided transformation function.
         * @see {@link Array#map}
         * @param transform - The transformation function to apply.Positional arguments are the value, the index of iteration, and the set being transformed.
         * @returns A new Set of equal size containing transformed elements.
         */
        map<V>(transform: (value: T, index: number, set: Set<T>) => V): Set<V>;
    }
}
