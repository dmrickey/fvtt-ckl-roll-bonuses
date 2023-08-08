
Hooks.on('ready', () => {
    targetTypes = {
        ['action']: 'Action',
        ['damage-type']: 'Damage Type',
        ['item']: 'Item',
        ['weapon-group']: 'Weapon Group',
        ['weapon-type']: 'Weapon Type',
    };
});

export let targetTypes = {};
