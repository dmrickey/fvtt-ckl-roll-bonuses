/**
 * A helper function which searches through an object to retrieve a value by a string key.
 * The string key supports the notation a.b.c which would return object[a][b][c]
 * @param object - The object to traverse
 * @param key    - An object property with notation a.b.c
 * @returns The value of the found property
 */
function getProperty(object: object, key: string): any;
