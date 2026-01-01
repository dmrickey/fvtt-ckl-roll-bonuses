import { templates } from "./templates.mjs";

Hooks.on('ready', () => foundry.applications.handlebars.loadTemplates(Object.values(templates)));
