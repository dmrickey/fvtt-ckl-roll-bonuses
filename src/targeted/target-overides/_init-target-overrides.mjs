import { Sources } from '../source-registration.mjs';
import { FinesseOverride } from './finesse-override.mjs';
import { WeaponBaseTypeOverride } from './weapon-type-override.mjs';
import { WeaponGroupOverride } from './weapon-group-override.mjs';
import { ProficiencyOverride } from './proficiency-override.mjs';

export const registerTargetOverrides = () => [
    FinesseOverride,
    ProficiencyOverride,
    WeaponBaseTypeOverride,
    WeaponGroupOverride,
].forEach(Sources.registerSource);
