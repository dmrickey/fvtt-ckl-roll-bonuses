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

    class EmbeddedCollection<T> extends Array<T> {
        /**
         * Same as array.length
         */
        size: number;

        /** @deprecated - use {@link size} */
        length: unknown;

        get(id: string): T;

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
        async?: boolean,
        relativeTo?: ActorPF,
    }
    class TextEditor {
        static enrichHTML(
            context: string,
            options?: EnrichOptions,
        ): Promise<string>;
    }
}
