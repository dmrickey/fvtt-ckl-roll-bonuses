interface CONST {
    DOCUMENT_OWNERSHIP_LEVELS: {
        INHERIT: -1;
        LIMITED: 1;
        NONE: 0;
        OBSERVER: 2;
        OWNER: 3;
    };
    GRID_DIAGONALS: {
        EQUIDISTANT: 0;
        EXACT: 1;
        APPROXIMATE: 2;
        RECTILINEAR: 3;
        ALTERNATING_1: 4;
        ALTERNATING_2: 5;
        ILLEGAL: 6;
    };
    TOKEN_DISPLAY_MODES: {
        NONE: 0;
        CONTROL: 10;
        OWNER_HOVER: 20;
        HOVER: 30;
        OWNER: 40;
        ALWAYS: 50;
    };
    TOKEN_DISPOSITIONS: {
        FRIENDLY: 1;
        HOSTILE: -1;
        NEUTRAL: 0;
        SECRET: -2;
    };
}
