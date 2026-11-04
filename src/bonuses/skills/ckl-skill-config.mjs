import { MODULE_NAME } from "../../consts.mjs";
import { localize } from "../../util/localize.mjs";
import { menu } from '../../warpgate/menu.mjs';

/**
 * @deprecated
 *
 *  DDDD   EEEEE  PPPP   RRRR   EEEEE   CCCC   AAAAA  TTTTT  EEEEE  DDDD
 *  D   D  E      P   P  R   R  E       C      A   A    T    E      D   D
 *  D   D  EEEE   PPPP   RRRR   EEEE    C      AAAAA    T    EEEE   D   D
 *  D   D  E      P      R  R   E       C      A   A    T    E      D   D
 *  DDDD   EEEEE  P      R   R  EEEEE   CCCC   A   A    T    EEEEE  DDDD
 *
 *  THIS DOCUMENTATION IS DEPRECATED.
 */
export class CklSkillConfig {
    static _inspiriationDieKey = 'inspiriationDie';

    constructor({ inspiration } = { inspiration: `1d6[${localize('skills.inspiration')}]` }) {
        this.inspiration = inspiration?.trim() || `1d6[${localize('skills.inspiration')}]`;
    }

    static getSkillConfig = (/** @type {ActorPF} */ actor) => new CklSkillConfig(actor.getFlag(MODULE_NAME, this._inspiriationDieKey) || new CklSkillConfig());
    static loadInspiration = (/** @type {ActorPF} */ actor) => this.getSkillConfig(actor).inspiration;
    static setSkillConfig = async (
        /** @type {ActorPF} */ actor,
        /** @type {CklSkillConfig} */ config,
    ) => await actor.setFlag(MODULE_NAME, this._inspiriationDieKey, config);

    static async showSkillConfigDialog(/** @type {ActorPF} */ actor) {
        const buttons = [
            { label: localize('Cancel'), value: false },
            { label: localize('ok'), value: true },
        ];

        const inputs = [{
            label: localize('skills.inspiration'),
            type: 'text',
            options: this.loadInspiration(actor),
        }];
        const { inputs: output, buttons: result } = await menu({ buttons, inputs }, { title: localize('skills.config') });
        if (result) {
            const inspiration = `${output[0]}`.trim() || `1d6[${localize('skills.inspiration')}]`;

            // todo validate input formula

            await this.setSkillConfig(actor, { inspiration });
        }
    }
}
