import { MODULE_NAME } from "../consts.mjs";
import { localize, localizeFull } from "../util/localize.mjs";

export class CklSkillConfig {
    static _inspiriationDieKey = 'inspiriationDie';

    constructor({ inspiration } = { inspiration: `1d6[${localize('skills.inspiration')}]` }) {
        this.inspiration = inspiration?.trim() || `1d6[${localize('skills.inspiration')}]`;
    }

    static getSkillConfig = (actor) => new CklSkillConfig(actor.getFlag(MODULE_NAME, this._inspiriationDieKey) || new CklSkillConfig());
    static loadInspiration = (actor) => this.getSkillConfig(actor).inspiration;
    static setSkillConfig = async (actor, config) => await actor.setFlag(MODULE_NAME, this._inspiriationDieKey, config);

    static async showSkillConfigDialog(actor) {
        const buttons = [
            { label: localizeFull('PF1.Cancel'), value: false },
            { label: localize('ok'), value: true },
        ];
        const inputs = [{
            label: localize('skills.inspiration'),
            type: 'text',
            options: this.loadInspiration(actor),
        }];
        const { inputs: output, buttons: result } = await warpgate.menu({ buttons, inputs }, { title: localize('skills.config') });
        if (result) {
            const inspiration = output[0].trim() || `1d6[${localize('skills.inspiration')}]`;

            // todo validate input formula

            await this.setSkillConfig(actor, { inspiration });
        }
    }
}