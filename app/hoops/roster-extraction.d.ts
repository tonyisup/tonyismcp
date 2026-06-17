export type RosterParseWarning = {
    pageNumber: number;
    message: string;
    rosterRowNumber?: number;
    field?: string;
    issue?: "missing" | "normalized";
};
export type RosterAthleteRecord = {
    rosterRowNumber: number;
    athleteName: string;
    gender: string;
    age: string;
    receiptNumber: string;
    enrollmentTypeCode: string;
    hohEmail: string;
    hohHomePhone: string;
    firstContactName: string;
    firstContactPhone: string;
    skillLevel: string | null;
    buddyRequest: string | null;
    practiceCenterPreference: string | null;
    shirtSize: string | null;
    sourceFile?: string;
    sourcePageNumbers: number[];
    rawRecordText: string;
    needsReview: boolean;
    extractionConfidence: number;
    parseWarnings: string[];
};
export type RosterParseResult = {
    pageCount: number;
    records: RosterAthleteRecord[];
    warnings: RosterParseWarning[];
};
export declare function parseRosterBriefPages(pageTexts: string[]): RosterParseResult;
export declare function parseRosterBriefText(text: string): RosterParseResult;
export declare function parseRosterBriefPdf(pdfData: ArrayBuffer | Uint8Array): Promise<RosterParseResult>;
