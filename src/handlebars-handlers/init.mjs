import { templates } from "./templates.mjs";

Hooks.on('ready', () => {
    if (game.release.generation === 12) {
        loadTemplates(Object.values(templates));
    }
    else {
        foundry.applications.handlebars.loadTemplates(Object.values(templates));
    }
});
