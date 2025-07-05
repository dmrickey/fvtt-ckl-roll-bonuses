export { }

declare global {
    namespace Handlebars {
        function TemplateDelegate(
            templateData: { [key: string]: any },
            options: {
                allowProtoMethodsByDefault?: boolean,
                allowProtoPropertiesByDefault?: boolean,
            }
        ): string;

        let partials: { [key: string]: function(object, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true }) };
    }

    namespace SearchFilter {
        function cleanQuery(string): string;
    }

    class EmbeddedCollection<T> extends Array<T> {
        /**
         * Same as array.length
         */
        size: number;

        /** @deprecated - use {@link size} */
        length: unknown;
        contents: Array<T>;

        get(id: string): T | undefined;

        toObject(): { [key: string]: any };

        updateAll(func: (T) => void): Promise<void>;
    }

    class HbsTemplate {}
    interface RenderOptions {
        notes: string[];
        css: string;
        title: string;
    }
    function renderTemplate(
        hbsPath: string,
        options: RenderOptions,
    ): Promise<string>;

    interface EnrichOptions {
        rollData?: RollData,
        async: true,
        relativeTo?: ActorPF,
    }
    class TextEditor {
        static enrichHTML(
            context: string,
            options: EnrichOptions,
        ): Promise<string>;
    }

    class DialogButtonData {
        label: string;
        callback: () => void;
    }
    class Dialog {
        constructor({
            buttons: { [string]: DialogButton },
            content: string,
            default: string,
            title: string,
            [render]: any,
        }) {}
        render(boolean): void;
    }

    interface Set<T> {
        difference<T>(set: Set<T>): Set<T>;
        intersection<T>(set: Set<T>): Set<T>;
        /**
         * Create a new Set where every element is modified by a provided transformation function.
         * @see {@link Array#map}
         * @param transform - The transformation function to apply.Positional arguments are the value, the index of iteration, and the set being transformed.
         * @returns A new Set of equal size containing transformed elements.
         */
        map<V>(transform: (value: T, index: number, set: Set<T>) => V): Set<V>;

        union<T, U>(set: Set<U>): Set<T|U>;
    }

    type GridMeasurePathResultWaypoint = {
        /** The segment from the previous waypoint to this waypoint. */
        backward: GridMeasurePathResultSegment;
        /** The segment from this waypoint to the next waypoint. */
        forward: GridMeasurePathResultSegment;
        /** The total distance travelled along the path up to this waypoint. */
        distance: number;
        /** The total number of spaces moved along a direct path up to this waypoint. */
        spaces: number;
        /** The total cost of the direct path ({@link BaseGrid#getDirectPath}) up to this waypoint. */
        cost: number;
    }

    type GridMeasurePathResultSegment = {
        /** The waypoint that this segment starts from. */
        from: GridMeasurePathResultWaypoint;
        /** The waypoint that this segment goes to. */
        to: GridMeasurePathResultWaypoint;
        /** Is teleporation? */
        teleport: boolean;
        /** The distance travelled in grid units along this segment. */
        distance: number;
        /** The number of spaces moved along this segment. */
        spaces: number;
        /** The cost of the direct path ({@link BaseGrid#getDirectPath}) between the two waypoints. */
        cost: number;
    }

    type GridMeasurePathResult = {
        /** The measurements at each waypoint. */
        waypoints: GridMeasurePathResultWaypoint[];
        /** The measurements at each segment. */
        segments: GridMeasurePathResultSegment[];
        /** The total distance travelled along the path through all waypoints. */
        distance: number;
        /**
         * The total number of spaces moved along a direct path through all waypoints.
         * Moving from a grid space to any of its neighbors counts as 1 step.
         * Always 0 in gridless grids.
         */
        spaces: number;
        /** The total cost of the direct path ({@link BaseGrid#getDirectPath}) through all waypoints. */
        cost: number;
    }
}
