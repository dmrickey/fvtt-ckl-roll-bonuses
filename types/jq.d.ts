interface JQuery {
    click(
        arg0: (
            options?: FormApplication.CloseOptions | undefined
        ) => Promise<void>
    ): unknown;
    find(selector: string): JQuery;
    hide(): JQuery;
}
