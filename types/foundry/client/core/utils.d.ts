/**
 * Retrieve an Entity or Embedded Entity by its Universally Unique Identifier (uuid).
 * @param uuid     - The uuid of the Entity or Embedded Entity to retrieve
 * @param relative - A document to resolve relative UUIDs against.
 */
function fromUuid(
    uuid: string,
    relative?: ClientDocumentMixin<foundry.abstract.Document<any, any>>
): Promise<foundry.abstract.Document<any, any> | null>;

/**
 * Retrieve a Document by its Universally Unique Identifier (uuid) synchronously. If the uuid resolves to a compendium
 * document, that document's index entry will be returned instead.
 * @param uuid     - The uuid of the Document to retrieve.
 * @param relative - A document to resolve relative UUIDs against.
 * @returns The Document or its index entry if it resides in a Compendium, otherwise null.
 * @throws If the uuid resolves to a Document that cannot be retrieved synchronously.
 */
function fromUuidSync(
    uuid: string,
    relative?: ClientDocumentMixin<foundry.abstract.Document<any, any>>
): foundry.abstract.Document<any, any> | Record<string, unknown> | null;
