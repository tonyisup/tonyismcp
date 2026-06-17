import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRosterBriefPdf } from "./roster-extraction.js";
function csvCell(value) {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
}
function toCsv(records) {
    const headers = [
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
    const lines = [headers.join(",")];
    for (const record of records) {
        lines.push([
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
        ]
            .map(csvCell)
            .join(","));
    }
    return `${lines.join("\n")}\n`;
}
function buildExceptionsReport(inputPath, result) {
    const recordsNeedingReview = result.records
        .filter((record) => record.needsReview)
        .map((record) => ({
        rosterRowNumber: record.rosterRowNumber,
        athleteName: record.athleteName,
        warningCount: record.parseWarnings.length,
        warnings: record.parseWarnings,
    }));
    return `${JSON.stringify({
        inputPath,
        warningCount: result.warnings.length,
        reviewCount: recordsNeedingReview.length,
        recordsNeedingReview,
    }, null, 2)}\n`;
}
export function parseCliArgs(argv) {
    const args = argv.slice(2);
    let inputPath = "";
    let outputPath = null;
    let json = false;
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === "--json") {
            json = true;
            continue;
        }
        if (arg === "--output") {
            const next = args[index + 1];
            if (!next || next.startsWith("--")) {
                throw new Error("Expected a file path after --output");
            }
            outputPath = next;
            index += 1;
            continue;
        }
        if (arg.startsWith("--")) {
            throw new Error(`Unknown flag: ${arg}`);
        }
        if (!inputPath) {
            inputPath = arg;
            continue;
        }
        throw new Error(`Unexpected extra argument: ${arg}`);
    }
    if (!inputPath) {
        throw new Error("Missing input PDF path");
    }
    return {
        inputPath,
        json,
        outputPath,
    };
}
function buildJsonPayload(result, options) {
    return {
        inputPath: options.inputPath,
        pageCount: result.pageCount,
        recordCount: result.records.length,
        warningCount: result.warnings.length,
        records: result.records,
        warnings: result.warnings,
    };
}
export function formatRosterCliOutput(result, options) {
    return `${JSON.stringify(buildJsonPayload(result, options), null, 2)}\n`;
}
function deriveSiblingPaths(jsonPath) {
    const ext = extname(jsonPath);
    const base = ext ? jsonPath.slice(0, -ext.length) : jsonPath;
    return {
        jsonPath,
        csvPath: `${base}.csv`,
        exceptionsPath: `${base}.exceptions.json`,
    };
}
export function buildRosterArtifacts(result, options) {
    const jsonPath = options.outputPath ?? `${options.inputPath}.json`;
    const { csvPath, exceptionsPath } = deriveSiblingPaths(jsonPath);
    return {
        jsonPath,
        csvPath,
        exceptionsPath,
        json: formatRosterCliOutput(result, options),
        csv: toCsv(result.records),
        exceptions: buildExceptionsReport(options.inputPath, result),
    };
}
export async function main(argv = process.argv) {
    try {
        const options = parseCliArgs(argv);
        const inputPath = resolve(options.inputPath);
        const pdfBytes = await readFile(inputPath);
        const result = await parseRosterBriefPdf(pdfBytes);
        if (options.outputPath) {
            const artifacts = buildRosterArtifacts(result, options);
            await writeFile(resolve(artifacts.jsonPath), artifacts.json, "utf8");
            await writeFile(resolve(artifacts.csvPath), artifacts.csv, "utf8");
            await writeFile(resolve(artifacts.exceptionsPath), artifacts.exceptions, "utf8");
        }
        else {
            process.stdout.write(formatRosterCliOutput(result, options));
        }
        return 0;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`roster-extraction: ${message}`);
        console.error("Usage: node dist/cli.js <input.pdf> [--json] [--output <output.json>]");
        return 1;
    }
}
const entrypoint = process.argv[1] ? resolve(process.argv[1]) : "";
if (entrypoint && fileURLToPath(import.meta.url) === entrypoint) {
    void main(process.argv).then((code) => {
        process.exitCode = code;
    });
}
//# sourceMappingURL=cli.js.map