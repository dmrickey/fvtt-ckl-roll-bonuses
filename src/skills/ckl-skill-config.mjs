import { MODULE_NAME } from "../consts.mjs";
import { localize } from "../util/localize.mjs";

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
            { label: localize('PF1.Cancel'), value: false },
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
