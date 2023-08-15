import { templates } from "./templates.mjs";

Hooks.on('ready', () => loadTemplates(Object.values(templates)));
