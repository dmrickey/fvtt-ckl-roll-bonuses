/**
 *
 * @param {HTMLElement} arg
 */
export const handleJournalClick = async ({ dataset }) => {
    const journal = dataset.journal;
    if (journal) {
        const [uuid, header] = journal.split('#');
        const doc = await fromUuid(uuid);

        // @ts-ignore
        if (doc instanceof JournalEntryPage) {
            doc.parent.sheet.render(true, { pageId: doc.id, anchor: header });
        } else {
            doc.sheet.render(true);
        }
    }
}
