/**
 * @param {string} toolTip
 * @param {string[]} classes
 * @returns {HTMLElement}
 */
export const createSkillIcon = (toolTip, classes) => {
    const icon = document.createElement('a');
    icon.classList.add(...classes);

    icon.setAttribute('data-tooltip', toolTip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    return icon;
}
