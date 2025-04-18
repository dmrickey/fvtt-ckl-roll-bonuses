/**
 * @param {string} toolTip
 * @param {string[]} classes
 * @param {() => void} [clickAction]
 * @returns {HTMLElement}
 */
export const createSkillIcon = (toolTip, classes, clickAction = undefined) => {
    const icon = document.createElement('a');
    icon.classList.add(...classes);

    icon.setAttribute('data-tooltip', toolTip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    if (clickAction) {
        icon.addEventListener('contextmenu', clickAction);
    }

    return icon;
}
