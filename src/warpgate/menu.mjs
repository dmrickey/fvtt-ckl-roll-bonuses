// @ts-nocheck

/**
 * @typedef {object} MenuButton
 * @prop {string} label Display text for this button, accepts HTML.
 * @prop {*} value Arbitrary object to return if selected.
 * @prop {MenuCallback} [callback] Additional callback to be executed
 *   when this button is selected. Can be used to modify the menu's results object.
 * @prop {boolean} [default] Any truthy value sets this button as
 *  default for the 'submit' or 'ENTER' dialog event. If none provided, the last button provided
 *  will be used.
 */

/**
 * __`options` property details__
 * | Input Type | Options Type | Default Value | Description |
 * |--|--|--|--|
 * | header, info | `none` | `undefined` | Ignored
 * | text, password, number | `string` | `''` | Initial value of input |
 * | checkbox | `boolean`| `false` | Initial checked state |
 * | radio | `[string, boolean]` | `['radio', false]` | Group name and initial checked state, respectively |
 * | select | `{html: string, value: any, selected: boolean}[]` or `string[]` | `[]` | HTML string for select option element, the value to be return if selected, and initial state. If only a string is provided, it will be used as both the HTML and return value. |
 *
 * @typedef {Object} MenuInput
 * @prop {string} type Type of input, controlling display and return values. See "options property details," above, and {@link MenuResult MenuResult.button}.
 * @prop {string} label Display text for this inputs label element. Accepts HTML.
 * @prop {string} [value]
 * @prop {boolean|string|Array<string|boolean>} [options] See "options property details," above.
 */

/**
 * @callback MenuCallback
 * @param {MenuResult} result User's chosen values (by reference) for this menu. Can modify or expand return value.
 * @param {HTMLElement} html Menu DOM element.
 */

/**
 * @typedef {object} MenuConfig
 * @prop {string} [title='Prompt'] Title of dialog
 * @prop {string} [defaultButton='Ok'] Button label if no buttons otherwise provided
 * @prop {boolean} [checkedText=false] Return the associated label's `innerText` (no html) of `'checkbox'` or `'radio'` type inputs as opposed to its checked state.
 * @prop {Function} [close=((resolve)=>resolve({buttons:false}))] Override default behavior and return value if the menu is closed without a button selected.
 * @prop {function(HTMLElement):void} [render=()=>{}]
 * @prop {object} [options] Passed to the Dialog options argument.
 */

/**
 * __`inputs` return details__
 * | Input Type | Return Type | Description |
 * |--|--|--|
 * | header, info | `undefined` | |
 * | text, password, number | `string` | Final input value
 * | checkbox, radio | `boolean\|string`| Final checked state. Using `checkedText` results in `""` for unchecked and `label` for checked. |
 * | select | `any` | `value` of the chosen select option, as provided by {@link MenuInput MenuInput.options[i].value} |
 *
 * @typedef {object} MenuResult
 * @prop {Array<any>} inputs See "inputs return details," above.
 * @prop {*} buttons `value` of the selected menu button, as provided by {@link MenuButton MenuButton.value}
 */

/**
 * Advanced dialog helper providing multiple input type options as well as user defined buttons.
 *
 * @static
 * @param {Object} [prompts]
 * @param {Array<MenuInput>} [prompts.inputs]
 * @param {Array<MenuButton>} [prompts.buttons] If no default button is specified, the last
 *  button provided will be set as default
 * @param {MenuConfig} [config]
 *
 * @return {Promise<MenuResult>} Object with `inputs` containing the chosen values for each provided input, in order, and the provided `value` of the pressed button or `false`, if closed.
 *
 * @example
 * const results = await menu({
 * inputs: [{
 *   label: 'My Way',
 *   type: 'radio',
 *   options: 'group1',
 * }, {
 *   label: 'The Highway',
 *   type: 'radio',
 *   options: 'group1',
 * },{
 *   label: 'Agree to ToS 😈',
 *   type: 'checkbox',
 *   options: true,
 * },{
 *   type: 'select',
 *   label: 'Make it a combo?',
 *   options: [
 *       {html: 'Yes ✅', value: {combo: true, size: 'med'}},
 *       {html: 'No ❌', value: {combo: false}, selected:true},
 *       {html: 'Super Size Me!', value: {combo: true, size: 'lg'}}
 *   ],
 * }],
 * buttons: [{
 *   label: 'Yes',
 *   value: 1,
 *   callback: () => ui.notifications.info('Yes was clicked'),
 * }, {
 *   label: 'No',
 *   value: 2
 * }, {
 *   label: '<strong>Maybe</strong>',
 *   value: 3,
 *   default: true,
 *   callback: (results) => {
 *       results.inputs[3].freebies = true;
 *       ui.notifications.info('Let us help make your decision easier.')
 *   },
 * }, {
 *   label: 'Eventually',
 *   value: 4
 * }]
 * },{
 *  title: 'Choose Wisely...',
 *  //checkedText: true, //Swap true/false output to label/empty string
 *  render: (...args) => { console.log(...args); ui.notifications.info('render!')},
 *  options: {
 *    width: '100px',
 *    height: '100%',
 *  }
 * })
 *
 * console.log('results', results)
 *
 * // EXAMPLE OUTPUT
 *
 * // Ex1: Default state (Press enter when displayed)
 * // -------------------------------
 * // Foundry VTT | Rendering Dialog
 * // S.fn.init(3) [div.dialog-content, text, div.dialog-buttons]
 * // render!
 * // Let us help make your decision easier.
 * // results {
 * //             "inputs": [
 * //                 false,
 * //                 false,
 * //                 true,
 * //                 {
 * //                     "combo": false,
 * //                     "freebies": true
 * //                 }
 * //             ],
 * //             "buttons": 3
 * //         }
 * //
 * // Ex 2: Output for selecting 'My Way', super sizing
 * //       the combo, and clicking 'Yes'
 * // -------------------------------
 * // Foundry VTT | Rendering Dialog
 * // S.fn.init(3) [div.dialog-content, text, div.dialog-buttons]
 * // render!
 * // Yes was clicked
 * // results {
 * //             "inputs": [
 * //                 true,
 * //                 false,
 * //                 true,
 * //                 {
 * //                     "combo": true,
 * //                     "size": "lg"
 * //                 }
 * //             ],
 * //             "buttons": 1
 * //         }
 */

const _innerValueParse = (data, html, { checkedText = false }) => {
    return Array(data.length)
        .fill()
        .map((e, i) => {
            let { type } = data[i];
            if (type.toLowerCase() === `select`) {
                return data[i].options[html.find(`select#${i}qd`).val()].value;
            } else {
                switch (type.toLowerCase()) {
                    case `text`:
                    case `password`:
                        return html.find(`input#${i}qd`)[0].value;
                    case `radio`:
                    case `checkbox`: {
                        const ele = html.find(`input#${i}qd`)[0];

                        if (checkedText) {
                            const label = html.find(`[for="${i}qd"]`)[0];
                            return ele.checked ? label.innerText : '';
                        }

                        return ele.checked;
                    }
                    case `number`:
                        return html.find(`input#${i}qd`)[0].valueAsNumber;
                }
            }
        });
}

const error = (...args) => {
    console.error('ERROR | ', ...args);
    ui.notifications.error(`ERROR | ${args[0]}`);
}

const dialogInputs = (data) => {
    /* correct legacy input data */
    data.forEach((inputData) => {
        if (inputData.type === "select") {
            inputData.options.forEach((e, i) => {
                switch (typeof e) {
                    case "string":
                        /* if we are handed legacy string values, convert them to objects */
                        inputData.options[i] = { value: e, html: e };
                    /* fallthrough to tweak missing values from object */

                    case "object":
                        /* if no HMTL provided, use value */
                        inputData.options[i].html ??= inputData.options[i].value;

                        /* sanity check */
                        if (
                            !!inputData.options[i].html &&
                            inputData.options[i].value != undefined
                        ) {
                            break;
                        }

                    /* fallthrough to throw error if all else fails */

                    default: {
                        const emsg = game.i18n.format("error.badSelectOpts", {
                            fnName: "menu",
                        });
                        error(emsg);
                        throw new Error(emsg);
                    }
                }
            });
        }
    });

    const mapped = data
        .map(({ type, label, options }, i) => {
            type = type.toLowerCase();
            switch (type) {
                case "header":
                    return `<tr><td colspan = "2"><h2>${label}</h2></td></tr>`;
                case "button":
                    return "";
                case "info":
                    return `<tr><td colspan="2">${label}</td></tr>`;
                case "select": {
                    const optionString = options
                        .map((e, i) => {
                            return `<option value="${i}" ${e.selected ? 'selected' : ''}>${e.html}</option>`;
                        })
                        .join("");

                    return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><select id="${i}qd">${optionString}</select></td></tr>`;
                }
                case "radio":
                    return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" ${(options instanceof Array ? options[1] : false)
                        ? "checked"
                        : ""
                        } value="${i}" name="${options instanceof Array ? options[0] : options ?? "radio"
                        }"/></td></tr>`;
                case "checkbox":
                    return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" ${(options instanceof Array ? options[0] : options ?? false)
                        ? "checked"
                        : ""
                        } value="${i}"/></td></tr>`;
                default:
                    return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" value="${options instanceof Array ? options[0] : options
                        }"/></td></tr>`;
            }
        })
        .join(``);

    const content = `
<table style="width:100%">
  ${mapped}
</table>`;

    return content;
};

/** @return {Promise<MenuResult>} */
export const menu = async (prompts = {}, config = {}) => {
    /* apply defaults to optional params */
    const configDefaults = {
        title: "Prompt",
        defaultButton: "Ok",
        render: null,
        close: (resolve) => resolve({ buttons: false }),
        options: {},
    };

    const { title, defaultButton, render, close, checkedText, options } =
        foundry.utils.mergeObject(configDefaults, config);
    const { inputs, buttons } = foundry.utils.mergeObject(
        { inputs: [], buttons: [] },
        prompts
    );

    return await new Promise((resolve) => {
        let content = dialogInputs(inputs);
        /** @type {Object<string, DialogButtonData>} */
        let buttonData = {};
        let def = buttons.at(-1)?.label;
        buttons.forEach((button) => {
            if ("default" in button) def = button.label;
            buttonData[button.label] = {
                label: button.label,
                callback: (html) => {
                    const results = {
                        inputs: _innerValueParse(inputs, html, { checkedText }),
                        buttons: button.value,
                    };
                    if (button.callback instanceof Function)
                        button.callback(results, html);
                    return resolve(results);
                },
            };
        });

        /* insert standard submit button if none provided */
        if (buttons.length < 1) {
            def = defaultButton;
            buttonData = {
                [defaultButton]: {
                    label: defaultButton,
                    callback: (html) =>
                        resolve({
                            inputs: _innerValueParse(inputs, html, { checkedText }),
                            buttons: true,
                        }),
                },
            };
        }

        new Dialog(
            {
                title,
                content,
                default: def,
                close: (...args) => close(resolve, ...args),
                buttons: buttonData,
                render,
            },
            { focus: true, ...options }
        ).render(true);
    });
}
