import { ConfiguredDocumentClass } from "../../../../types/helperTypes";
import { DocumentDataType, DocumentModificationOptions } from "../../../common/abstract/document.mjs";

declare global {
    class User extends ClientDocumentMixin(foundry.documents.BaseUser) {
        /**
         * Track references to the current set of Tokens which are targeted by the User
         */
        targets: UserTargets;
    }
}
