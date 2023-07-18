
let _templateCache: Record<string, Handlebars.TemplateDelegate>;

/**
 * Get a template from the server by fetch request and caching the retrieved result
 * @param path - The web-accessible HTML template URL
 * @returns A Promise which resolves to the compiled Handlebars template
 */
function getTemplate(path: string): Promise<Handlebars.TemplateDelegate>;
