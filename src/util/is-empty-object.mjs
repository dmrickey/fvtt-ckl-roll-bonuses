import { api } from './api.mjs';

export const isEmptyObject = (/** @type {{}} */ obj) => !Object.keys(obj).length;
export const isNotEmptyObject = (/** @type {{}} */ obj) => !isEmptyObject(obj);

api.utils.isEmptyObject = isEmptyObject;
api.utils.isNotEmptyObject = isNotEmptyObject;
