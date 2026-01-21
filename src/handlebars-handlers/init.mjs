import { templates } from "./templates.mjs";

Hooks.on('ready', () => {
    // @ts-ignore
    if (game.release.generation === 12) {
        loadTemplates(Object.values(templates));
    }
    else {
        Hooks.on('ready', () => foundry.applications.handlebars.loadTemplates(Object.values(templates)));
    }
});
