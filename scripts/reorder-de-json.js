const fs = require('fs');
const path = require('path');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function orderKeys(reference, target) {
  if (typeof reference !== 'object' || reference === null || Array.isArray(reference)) {
    return target;
  }
  const result = {};
  for (const key of Object.keys(reference)) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      result[key] = orderKeys(reference[key], target[key]);
    } else if (typeof reference[key] === 'object' && reference[key] !== null && !Array.isArray(reference[key])) {
      result[key] = orderKeys(reference[key], {});
    }
  }
  for (const key of Object.keys(target)) {
    if (!Object.prototype.hasOwnProperty.call(reference, key)) {
      result[key] = target[key];
    }
  }
  return result;
}

const enFile = path.join(__dirname, '..', 'lang', 'en.json');
const deFile = path.join(__dirname, '..', 'lang', 'de.json');
const en = readJSON(enFile);
const de = readJSON(deFile);
const sorted = { ...de, 'ckl-roll-bonuses': orderKeys(en['ckl-roll-bonuses'], de['ckl-roll-bonuses']) };
fs.writeFileSync(deFile, JSON.stringify(sorted, null, 4) + '\n');
console.log('de.json reordered to match en.json order.');
