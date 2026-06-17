import { parseRosterBriefPdf } from "./roster-extraction.js";
export type RosterCliOptions = {
    inputPath: string;
    json: boolean;
    outputPath: string | null;
};
export type RosterCliPayload = {
    inputPath: string;
    pageCount: number;
    recordCount: number;
    warningCount: number;
    records: unknown[];
    warnings: unknown[];
};
export type RosterOutputArtifacts = {
    jsonPath: string;
    csvPath: string;
    exceptionsPath: string;
    json: string;
    csv: string;
    exceptions: string;
};
export declare function parseCliArgs(argv: string[]): RosterCliOptions;
export declare function formatRosterCliOutput(result: Awaited<ReturnType<typeof parseRosterBriefPdf>>, options: RosterCliOptions): string;
export declare function buildRosterArtifacts(result: Awaited<ReturnType<typeof parseRosterBriefPdf>>, options: RosterCliOptions): RosterOutputArtifacts;
export declare function main(argv?: string[]): Promise<number>;
