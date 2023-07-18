export { }
declare global {

    let libWrapper: libWrapper;

    type WrapType =
        'WRAPPER' |
        'MIXED' |
        'OVERRIDE';

    interface libWrapper {
        /**
         *
         * @param moduleName
         * @param toWrap - string path to wrap, normally on the prototype object
         * @param localMethod - local reference
         * @param {WrapType} wrapType
         */
        register(moduleName: string, toWrap: string, localMethod: function, wrapType: WrapType): void;

        /** Must call the wrapped function, will be called before any other wrappers */
        WRAPPER: WrapType = WrapType.WRAPPER;

        /** May or may not called the wrapped function */
        MIXED: WrapType = WrapType.MIXED;

        /** Cannot call the wrapped function, will be run after every other wrapper */
        OVERRIDE: WrapType = WrapType.OVERRIDE;
    };
}
