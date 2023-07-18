/**
 * A helper class which assists with localization and string translation
 */
class Localization {
    /**
     * Localize a string by drawing a translation from the available translations dictionary, if available
     * If a translation is not available, the original string is returned
     * @param stringId - The string ID to translate
     * @returns The translated string
     *
     * @example <caption>Localizing a simple string in JavaScript</caption>
     * ```typescript
     * {
     *   "MYMODULE.MYSTRING": "Hello, this is my module!"
     * }
     * game.i18n.localize("MYMODULE.MYSTRING"); // Hello, this is my module!
     * ```
     *
     * @example <caption>Localizing a simple string in Handlebars</caption>
     * ```handlebars
     * {{localize "MYMODULE.MYSTRING"}} <!-- Hello, this is my module! -->
     * ```
     */
    localize(stringId: string): string;

    /**
     * Localize a string including variable formatting for input arguments.
     * Provide a string ID which defines the localized template.
     * Variables can be included in the template enclosed in braces and will be substituted using those named keys.
     *
     * @param stringId - The string ID to translate
     * @param data     - Provided input data
     *                   (defaultValue: `{}`)
     * @returns The translated and formatted string
     *

     * @example <caption>Localizing a formatted string in JavaScript</caption>
     * ```typescript
     * {
     *   "MYMODULE.GREETING": "Hello {name}, this is my module!"
     * }
     * game.i18n.format("MYMODULE.GREETING" {name: "Andrew"}); // Hello Andrew, this is my module!
     * ```
     *
     * @example <caption>Localizing a formatted string in Handlebars</caption>
     * ```handlebars
     * {{localize "MYMODULE.GREETING" name="Andrew"}} <!-- Hello, this is my module! -->
     * ```
     */
    format(stringId: string, data?: Record<string, unknown>): string;
}
