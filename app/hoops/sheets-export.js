export const ROSTER_SHEET_NAME = "Roster";
export const WARNINGS_SHEET_NAME = "Warnings";
export const ROSTER_HEADERS = [
    "rosterRowNumber",
    "athleteName",
    "gender",
    "age",
    "receiptNumber",
    "enrollmentTypeCode",
    "hohEmail",
    "hohHomePhone",
    "firstContactName",
    "firstContactPhone",
    "skillLevel",
    "buddyRequest",
    "practiceCenterPreference",
    "shirtSize",
    "sourcePageNumbers",
    "needsReview",
    "extractionConfidence",
    "parseWarnings",
];
export const WARNING_HEADERS = ["pageNumber", "rosterRowNumber", "field", "issue", "message"];
function toTextCell(value) {
    return value == null ? "" : String(value);
}
export function buildRosterSheetRows(records) {
    return [
        [...ROSTER_HEADERS],
        ...records.map((record) => [
            record.rosterRowNumber,
            record.athleteName,
            record.gender,
            record.age,
            record.receiptNumber,
            record.enrollmentTypeCode,
            record.hohEmail,
            record.hohHomePhone,
            record.firstContactName,
            record.firstContactPhone,
            record.skillLevel,
            record.buddyRequest,
            record.practiceCenterPreference,
            record.shirtSize,
            record.sourcePageNumbers.join(";"),
            record.needsReview,
            record.extractionConfidence,
            record.parseWarnings.join("; "),
        ].map(toTextCell)),
    ];
}
export function buildWarningsSheetRows(warnings) {
    return [
        [...WARNING_HEADERS],
        ...warnings.map((warning) => [
            warning.pageNumber,
            warning.rosterRowNumber ?? "",
            warning.field ?? "",
            warning.issue ?? "",
            warning.message,
        ].map(toTextCell)),
    ];
}
export function buildGoogleSheetsWorkbook(result, spreadsheetTitle) {
    return {
        requestBody: {
            properties: { title: spreadsheetTitle },
            sheets: [{ properties: { title: ROSTER_SHEET_NAME } }, { properties: { title: WARNINGS_SHEET_NAME } }],
        },
        valueRanges: [
            { range: `${ROSTER_SHEET_NAME}!A1`, values: buildRosterSheetRows(result.records) },
            { range: `${WARNINGS_SHEET_NAME}!A1`, values: buildWarningsSheetRows(result.warnings) },
        ],
    };
}
//# sourceMappingURL=sheets-export.js.map