export const isEmptyObject = (/** @type {{}} */ obj) => !Object.keys(obj).length;
export const isNotEmptyObject = (/** @type {{}} */ obj) => !isEmptyObject(obj);
