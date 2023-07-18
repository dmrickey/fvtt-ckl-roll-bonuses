export { }

declare global {
    interface IdObject {
        id: string,
    }

    interface ModifierSource {
        /** The value of this modifer */
        value: number | string,

        /** The name of the source of this modifier */
        name: string,

        /** The damage type of this modifier */
        modifier: string,

        /** The sort priority for this modifier */
        sort: number,
    }
}
