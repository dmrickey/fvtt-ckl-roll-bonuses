import { CONFIG_BUTTON } from '../consts.mjs';
import { CklSkillConfig } from './ckl-skill-config.mjs';
import { CklSkillData } from './ckl-skill-data.mjs';

/**
 *
 * @param {string} id
 * @returns Created button @see {@link HTMLAnchorElement}
 */
const createSkillButton = (id) => {
    const node = document.createElement('a');
    node.id = id;
    // @ts-ignore
    node.style = 'line-height: 1.5rem; width: 1.5rem;';
    node.innerHTML = CONFIG_BUTTON;
    return node;
}

Hooks.on('renderActorSheetPF', (
    /** @type {{ _skillsLocked: boolean; }} */ app,
    /** @type {{ find: (arg0: string) => { (): any; new (): any; each: { (arg0: { (_: any, element: HTMLElement): void; }): void; new (): any; }; }; }} */ html,
    /** @type {{ actor: ActorPF; }} */ data
) => {
    // this is not a "safe check" so I'm specifically checking for false instead of a falsy value
    if (app._skillsLocked == false) {
        return;
    }

    // add skill config button
    setTimeout(() => {
        html.find('.tab.skills .skill-lock-button').each((_, btn) => {
            const id = 'ckl-skill-config';
            const button = createSkillButton(id);
            button.addEventListener(
                'click',
                async () => await CklSkillConfig.showSkillConfigDialog(data.actor)
            );

            const parent = btn.parentElement;
            if (!parent) return;

            parent.removeChild(btn);
            const column = document.createElement('div');
            const lh = game.modules.get('koboldworks-pf1-little-helper')?.active ? ' flex-direction: column;' : '';
            // @ts-ignore
            column.style = `flex: unset; display: flex; align-items: center; justify-content: center; text-align: center;${lh}`;
            column.appendChild(button);

            // @ts-ignore
            btn.style = 'padding: unset;';
            column.appendChild(btn);

            parent.appendChild(column);
        });
    });

    // add skill data buttons
    html.find('.tab.skills .skills-list li.skill, .tab.skills .skills-list li.sub-skill').each((_, li) => {
        // fills out spacing for "base skills" (craft, perform, etc) so the settings cog is aligned with the rest
        const addMissingForSpacing = (/** @type {string} */ cls) => {
            let found = li.querySelector(cls);
            if (!found) {
                found = document.createElement('div');
                li.appendChild(found);
            }
        };
        ['.skill-mod', '.skill-rank', '.skill-cs', '.skill-acp', '.skill-rt', '.skill-ability'].forEach(addMissingForSpacing);

        const getSkillId = () => {
            const skillId = li.getAttribute('data-skill');
            const mainId = li.getAttribute('data-main-skill');
            return mainId
                ? `${mainId}.subSkills.${skillId}`
                : skillId;
        }

        const skillId = getSkillId();
        if (!skillId) return;

        const id = `ckl-skill-${skillId}`
        const button = createSkillButton(id);
        button.addEventListener(
            'click',
            async () => await CklSkillData.showSkillDataDialog(data.actor, skillId)
        );

        let controls = li.querySelector('.skill-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'skill-controls';
            li.appendChild(controls);
        }

        controls.appendChild(button);
    });
});

Hooks.on('pf1PreActorRollSkill', (
    /** @type {ActorPF} */ actor,
    /** @type {{ bonus: string; dice: string; }} */ options,
    /** @type {string} */ skillId,
) => {
    const data = CklSkillData.getSkillData(actor, skillId);
    if (!data.configured) {
        return;
    }

    if (data.bonus) {
        options.bonus = options.bonus
            ? `${options.bonus} + ${data.bonus}`
            : data.bonus;
    }

    if (data.inspiration) {
        const insp = CklSkillConfig.loadInspiration(actor);
        options.bonus = options.bonus
            ? `${options.bonus} + ${insp}`
            : insp;
    }

    if (data.dice) {
        options.dice = data.dice;
    }
});

// todo pf1 0.83.0
// todo no way to know which actor prompted the dialog so it's impossible to do in any sane way right now
// Hooks.on('renderApplication', (app, html, data) => {
    // if (app.options.subject?.skill === undefined) {
    //     return;
    // }

    // const dialog = html[0];
    // dialog.style.height = 'unset';

    // const lastRow = dialog.querySelector(".dialog-content .form-group:last-child");
    // if (!lastRow) {
    //     return;
    // }

    // const label = document.createElement('label');
    // label.innerText = localize('skills.inspiration');

    // const input = document.createElement('input');
    // input.type = 'checkbox';
    // // input.checked = <is inspiration checked for this skill?>

    // // create hint text that shows what inspiration is
    // const text = document.createElement('div');
    // // CklSkillConfig.loadInspiration(actor)
    // text.innerText = 'inspiration die value from actor';

    // const node = document.createElement('div');
    // node.classList.add('form-group');

    // node.appendChild(label);
    // node.appendChild(input);
    // node.appendChild(text);

    // lastRow.parentElement.appendChild(node);
// });

// Hooks.once('pf1.postReady', () => {
//     // libWrapper.register(MODULE_NAME, 'pf1.DicePF.d20Roll', function (wrapped, skillId, options) {
//     libWrapper.register(MODULE_NAME, 'pf1.documents.ActorPF.prototype.rollSkill', function (wrapped, skillId, options) {

//         let result = wrapped(...args);

//         if (result) {
//             // remove key
//         }

//         return result;
//     }, 'WRAPPER');
// });
