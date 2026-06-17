import type { RosterAthleteRecord, RosterParseResult, RosterParseWarning } from "./roster-extraction.js";
export declare const ROSTER_SHEET_NAME = "Roster";
export declare const WARNINGS_SHEET_NAME = "Warnings";
export declare const ROSTER_HEADERS: readonly ["rosterRowNumber", "athleteName", "gender", "age", "receiptNumber", "enrollmentTypeCode", "hohEmail", "hohHomePhone", "firstContactName", "firstContactPhone", "skillLevel", "buddyRequest", "practiceCenterPreference", "shirtSize", "sourcePageNumbers", "needsReview", "extractionConfidence", "parseWarnings"];
export declare const WARNING_HEADERS: readonly ["pageNumber", "rosterRowNumber", "field", "issue", "message"];
export declare function buildRosterSheetRows(records: RosterAthleteRecord[]): string[][];
export declare function buildWarningsSheetRows(warnings: RosterParseWarning[]): string[][];
export declare function buildGoogleSheetsWorkbook(result: RosterParseResult, spreadsheetTitle: string): {
    requestBody: {
        properties: {
            title: string;
        };
        sheets: Array<{
            properties: {
                title: string;
            };
        }>;
    };
    valueRanges: Array<{
        range: string;
        values: string[][];
    }>;
};
