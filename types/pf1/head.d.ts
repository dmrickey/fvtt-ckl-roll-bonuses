export { }

declare global {
    let RollPF: RollPF;
    let pf1: pf1;
    let deepClone: (arg0: T) => T;

    function mergeObject<
        T extends object,
        U extends DeepPartial<WithWidenedArrayTypes<T>>,
        M extends MergeObjectOptions & { enforceTypes: true }
    >(original: T, other?: U, options?: M, _d?: number): Result<T, U, M>;
    function mergeObject<
        T extends object,
        U extends DeepPartial<Record<keyof T, never>> & object,
        M extends MergeObjectOptions & { enforceTypes: true }
    >(original: T, other?: U, options?: M, _d?: number): Result<T, U, M>;
    function mergeObject<
        T extends object,
        U extends object,
        M extends MergeObjectOptions & { enforceTypes: true }
    >(original: T, other?: U, options?: M, _d?: number): never;
    function mergeObject<T extends object, U extends object, M extends MergeObjectOptions>(
        original: T,
        other?: U,
        options?: M,
        _d?: number
    ): Result<T, U, M>;
}
