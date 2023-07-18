import { MODULE_NAME } from "../../consts.mjs";
import { localize } from "../../util/localize.mjs";

export class CklSkillData {
    /**
     * @param {{ inspiration: boolean | string, dice: string, bonus: string }} args
     */
    constructor({
        inspiration,
        dice,
        bonus,
    }) {
        this.inspiration = inspiration;
        this.dice = dice;
        this.bonus = bonus;
    }

    get configured() {
        return !!(this.inspiration || this.dice || this.bonus);
    }

    /**
     * Removes all dots from the id
     * @param {string} id
     * @returns Encoded id
     */
    static #encodeId = id => `${id}`.replaceAll('.', '');

    /**
     * Creates skill data for the given actor
     * @param {ActorPF} actor
     * @param {string} skillId
     * @returns @see {@link CklSkillData}
     */
    static getSkillData = (actor, skillId) => new CklSkillData(actor.getFlag(MODULE_NAME, this.#encodeId(skillId)) || {});

    /**
     *
     * @param {ActorPF} actor
     * @param {string} skillId
     * @param {Partial<CklSkillData>} data
     * @returns
     */
    static setSkillData = async (actor, skillId, data) => await actor.setFlag(MODULE_NAME, this.#encodeId(skillId), data);

    /**
     *
     * @param {ActorPF} actor
     * @param {string} skillId
     */
    static async showSkillDataDialog(actor, skillId) {
        const data = this.getSkillData(actor, skillId);
        const buttons = [
            { label: localize('PF1.Cancel'), value: false },
            { label: localize('ok'), value: true },
        ];
        const inputs = [{
            label: localize('PF1.BaseDice'),
            type: 'text',
            options: data.dice ?? '',
        }, {
            label: localize('PF1.Bonus'),
            type: 'text',
            options: data.bonus ?? '',
        }, {
            label: localize('skills.inspiration'),
            type: 'checkbox',
            options: data.inspiration ? 'checked' : false,
        }];

        const title = pf1.config.skills[skillId]
            || actor.system.skills[skillId]?.name
            || actor.system.skills[skillId.split('.')[0]].subSkills[skillId.split('.').at(-1) ?? '']?.name;
        const { inputs: output, buttons: result } = await warpgate.menu({ buttons, inputs }, { title });
        if (result) {
            const bonus = output[1]?.trim() || '';
            const dice = output[0]?.trim() || '';
            const inspiration = output[2] || false;

            // todo verify validity of input bonus / dice

            await this.setSkillData(actor, skillId, {
                bonus,
                dice,
                inspiration,
            })
        }
    }
}
