/**
 * A helper function which searches through an object to retrieve a value by a string key.
 * The string key supports the notation a.b.c which would return object[a][b][c]
 * @param object - The object to traverse
 * @param key    - An object property with notation a.b.c
 * @returns The value of the found property
 */
function getProperty(object: object, key: string): any;

/**
 * A helper function which searches through an object to assign a value using a string key
 * This string key supports the notation a.b.c which would target object[a][b][c]
 * @param object - The object to update
 * @param key    - The string key
 * @param value  - The value to be assigned
 * @returns Whether the value was changed from its previous value
 */
function setProperty(object: object, key: string, value: any): boolean;
