interface JQuery {
    on(
        arg0: string,
        arg1: (
            this: HTMLElement,
            event: JQuery.ClickEvent<
                HTMLElement,
                undefined,
                HTMLElement,
                HTMLElement
            >
        ) => Promise<void> | void
    ): unknown;
    click(
        arg0: (
            options?: FormApplication.CloseOptions | undefined
        ) => Promise<void>
    ): unknown;
    find(selector: string): JQuery;
    hide(): JQuery;
    each(
        /** @this {HTMLElement} */
        func: () => void
    );
    0: HTMLElement;
}
