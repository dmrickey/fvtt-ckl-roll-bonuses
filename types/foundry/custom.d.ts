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
    }

    class EmbeddedCollection<T> extends Array<T> {
        /**
         * Same as array.length
         */
        size: number;

        /**
         * @deprecated - do not use
         */
        length: unknown;

        get(id: string): T;
    }
}
