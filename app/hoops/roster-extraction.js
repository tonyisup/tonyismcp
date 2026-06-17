const ENROLLMENT_CODES = [
    "AD",
    "AL",
    "AN",
    "AP",
    "AT",
    "AV",
    "AW",
    "AY",
    "CV",
    "PH",
    "PN",
    "RV",
    "TV",
    "WA",
    "AM",
    "AH",
    "AC",
    "TR",
    "AF",
    "PA",
    "RP",
];
const CODE_PATTERN = ENROLLMENT_CODES.join("|");
const PHONE_PATTERN = "\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}(?:\\s*x\\d+)?";
const HEADER_RE = new RegExp(`^(?<row>\\d+)\\s+(?<name>.+?)\\s+(?<code>${CODE_PATTERN})\\s+\\d+\\s+(?<age>\\d{1,2}(?:\\.\\d{1,2})?)\\s+(?<gender>[MF])?\\s*(?<hohPhone>${PHONE_PATTERN})\\s+(?<email>.+?)\\s+(?<receipt>\\d+\\.\\d+)\\s+(?<contactPhone>${PHONE_PATTERN})\\s+(?<contactName>.+?)(?:\\s+Customer Skill|\\s+Custom Questions Answers|\\s+What is your skill level\\?|$)`, "i");
const SKILL_RE = /What is your skill level\?\s+(?<answer>.+?)(?:\s+To ensure your child is in a group with friends,neighbors, or\s+family, please list their names here:\s+|\s+Which center would you rather practice at\?\s+|\s+What is your shirt size\?\s+|$)/is;
const BUDDY_RE = /To ensure your child is in a group with friends,neighbors, or\s+family, please list their names here:\s+(?<answer>.+?)(?:\s+Which center would you rather practice at\?\s+|\s+What is your shirt size\?\s+|$)/is;
const CENTER_RE = /Which center would you rather practice at\?\s+(?<answer>.+?)(?:\s+What is your shirt size\?\s+|$)/is;
const SHIRT_RE = /What is your shirt size\?\s+(?<answer>.+?)(?:$)/is;
const PAGE_FOOTER_PREFIXES = ["Activity Roster - Brief", "ROSTER Transactions Shown Only", "Tx", "Qty"];
const PAGE_HEADER_NOISE_RE = /\b\d{1,2}:\d{2}\s*[AP]M\s+Page\s*:?(?:\s*)\d+\s+of\s+\d+\s+.*?1st Contact Phone\b/gi;
const PAGE_HEADER_COLUMNS_RE = /\bReceipt # # Gndr Enrollee Name Area Age Team Name HOH Email HOH Home Phone 1st Contact Name 1st Contact Phone\b/gi;
const ENROLLMENT_LEGEND_RE = /\s+AD\s*=\s+Enrollment[\s\S]*$/i;
function compact(text) {
    return text.replace(/\s+/g, " ").trim();
}
function normalizeLines(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map((line) => compact(line))
        .filter(Boolean);
}
function linesToTextContent(lines) {
    const output = [];
    let current = "";
    for (const item of lines) {
        const chunk = compact(item.str ?? "");
        if (!chunk) {
            if (item.hasEOL && current) {
                output.push(compact(current));
                current = "";
            }
            continue;
        }
        current = current ? `${current} ${chunk}` : chunk;
        if (item.hasEOL) {
            output.push(compact(current));
            current = "";
        }
    }
    if (current)
        output.push(compact(current));
    return output;
}
function normalizePhone(raw, fieldLabel) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10)
        return { value: compact(raw), warning: null };
    const hasLeadingCountryCode = digits.length > 10 && digits.startsWith("1");
    const base = hasLeadingCountryCode ? digits.slice(1, 11) : digits.slice(-10);
    const extension = digits.length > 10 ? digits.slice(hasLeadingCountryCode ? 11 : 10) : "";
    const formatted = `(${base.slice(0, 3)}) ${base.slice(3, 6)}-${base.slice(6)}`;
    return {
        value: extension ? `${formatted} x${extension}` : formatted,
        warning: hasLeadingCountryCode ? `Normalized ${fieldLabel} by stripping leading +1` : null,
    };
}
function normalizeEmail(raw) {
    return raw.replace(/\s+/g, "").replace(/\.+$/, ".").toLowerCase();
}
function normalizeCenter(raw) {
    const value = compact(raw ?? "");
    if (!value)
        return null;
    if (/melba bishop/i.test(value))
        return "Melba Bishop Recreation Center";
    if (/junior seau/i.test(value) || /j\.sbcc/i.test(value))
        return "Junior Seau Beach Community Center";
    return value;
}
function normalizeShirtSize(raw) {
    const value = compact(raw ?? "");
    return value || null;
}
function normalizeQuestionText(text) {
    return text.replace(PAGE_HEADER_NOISE_RE, " ").replace(PAGE_HEADER_COLUMNS_RE, " ").replace(ENROLLMENT_LEGEND_RE, " ");
}
function extractQuestionAnswer(text, regex) {
    const normalizedText = normalizeQuestionText(text);
    const match = normalizedText.match(regex);
    return compact(match?.groups?.answer ?? "") || null;
}
function buildWarnings(pageNumber, rowNumber, record) {
    const warnings = [];
    if (!record.athleteName)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "athleteName", issue: "missing", message: "Missing athlete name" });
    if (!record.enrollmentTypeCode)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "enrollmentTypeCode", issue: "missing", message: "Missing enrollment type code" });
    if (!record.age)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "age", issue: "missing", message: "Missing age" });
    if (!record.gender)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "gender", issue: "missing", message: "Missing gender" });
    if (!record.receiptNumber)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "receiptNumber", issue: "missing", message: "Missing receipt number" });
    if (!record.hohEmail)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "hohEmail", issue: "missing", message: "Missing guardian email" });
    if (!record.hohHomePhone)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "hohHomePhone", issue: "missing", message: "Missing guardian home phone" });
    if (!record.firstContactName)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "firstContactName", issue: "missing", message: "Missing first contact name" });
    if (!record.firstContactPhone)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "firstContactPhone", issue: "missing", message: "Missing first contact phone" });
    if (!record.skillLevel)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "skillLevel", issue: "missing", message: "Missing skill level" });
    if (!record.practiceCenterPreference)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "practiceCenterPreference", issue: "missing", message: "Missing practice center preference" });
    if (!record.shirtSize)
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "shirtSize", issue: "missing", message: "Missing shirt size" });
    return warnings;
}
function parseBlock(blockLines, sourcePageNumbers) {
    const pageNumber = sourcePageNumbers[0];
    const rawRecordText = blockLines.join("\n");
    const flat = compact(blockLines.join(" "));
    const headerMatch = flat.match(HEADER_RE);
    if (!headerMatch?.groups) {
        return {
            record: null,
            warnings: [{ pageNumber, message: "Could not parse roster row header" }],
        };
    }
    const rowNumber = Number(headerMatch.groups.row);
    const athleteName = compact(headerMatch.groups.name);
    const enrollmentTypeCode = headerMatch.groups.code;
    const age = headerMatch.groups.age;
    const gender = headerMatch.groups.gender;
    const hohHomePhone = normalizePhone(headerMatch.groups.hohPhone, "guardian home phone");
    const hohEmail = normalizeEmail(headerMatch.groups.email);
    const receiptNumber = headerMatch.groups.receipt;
    const firstContactPhone = normalizePhone(headerMatch.groups.contactPhone, "first contact phone");
    const firstContactName = compact(headerMatch.groups.contactName);
    const skillLevel = extractQuestionAnswer(flat, SKILL_RE);
    const buddyRequest = extractQuestionAnswer(flat, BUDDY_RE);
    const practiceCenterPreference = normalizeCenter(extractQuestionAnswer(flat, CENTER_RE));
    const shirtSize = normalizeShirtSize(extractQuestionAnswer(flat, SHIRT_RE));
    const warnings = buildWarnings(pageNumber, rowNumber, {
        athleteName,
        enrollmentTypeCode,
        age,
        gender,
        receiptNumber,
        hohEmail,
        hohHomePhone: hohHomePhone.value,
        firstContactName,
        firstContactPhone: firstContactPhone.value,
        skillLevel,
        practiceCenterPreference,
        shirtSize,
    });
    if (hohHomePhone.warning) {
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "hohHomePhone", issue: "normalized", message: hohHomePhone.warning });
    }
    if (firstContactPhone.warning) {
        warnings.push({ pageNumber, rosterRowNumber: rowNumber, field: "firstContactPhone", issue: "normalized", message: firstContactPhone.warning });
    }
    const parseWarnings = [...new Set(warnings.map((warning) => warning.message))];
    const extractionConfidence = Math.max(0.4, Number((0.99 - warnings.length * 0.03 - (buddyRequest ? 0 : 0.01)).toFixed(2)));
    return {
        record: {
            rosterRowNumber: rowNumber,
            athleteName,
            gender,
            age,
            receiptNumber,
            enrollmentTypeCode,
            hohEmail,
            hohHomePhone: hohHomePhone.value,
            firstContactName,
            firstContactPhone: firstContactPhone.value,
            skillLevel,
            buddyRequest,
            practiceCenterPreference,
            shirtSize,
            sourcePageNumbers,
            rawRecordText,
            needsReview: warnings.length > 0,
            extractionConfidence,
            parseWarnings,
        },
        warnings,
    };
}
export function parseRosterBriefPages(pageTexts) {
    const records = [];
    const warnings = [];
    const rowStartRe = /^\d+\s+.+,\s*.+/;
    let pendingBlockLines = null;
    let pendingPageNumbers = [];
    const flushPendingBlock = () => {
        if (!pendingBlockLines)
            return;
        const parsed = parseBlock(pendingBlockLines, pendingPageNumbers);
        if (parsed.record)
            records.push(parsed.record);
        warnings.push(...parsed.warnings);
        pendingBlockLines = null;
        pendingPageNumbers = [];
    };
    pageTexts.forEach((pageText, index) => {
        const pageNumber = index + 1;
        const lines = normalizeLines(pageText).filter((line) => !PAGE_FOOTER_PREFIXES.some((prefix) => line.startsWith(prefix)));
        const starts = lines.flatMap((line, lineIndex) => (rowStartRe.test(line) ? [lineIndex] : []));
        if (starts.length === 0) {
            if (pendingBlockLines) {
                pendingBlockLines.push(...lines);
                pendingPageNumbers.push(pageNumber);
            }
            return;
        }
        const firstStart = starts[0];
        const prefix = lines.slice(0, firstStart);
        if (pendingBlockLines) {
            pendingBlockLines.push(...prefix);
            pendingPageNumbers.push(pageNumber);
            flushPendingBlock();
        }
        for (let i = 0; i < starts.length - 1; i += 1) {
            const blockLines = lines.slice(starts[i], starts[i + 1]);
            const parsed = parseBlock(blockLines, [pageNumber]);
            if (parsed.record)
                records.push(parsed.record);
            warnings.push(...parsed.warnings);
        }
        const lastStart = starts[starts.length - 1];
        pendingBlockLines = lines.slice(lastStart);
        pendingPageNumbers = [pageNumber];
    });
    flushPendingBlock();
    return {
        pageCount: pageTexts.length,
        records,
        warnings,
    };
}
export function parseRosterBriefText(text) {
    const pageTexts = text.includes("\f") ? text.split("\f") : [text];
    return parseRosterBriefPages(pageTexts);
}
async function extractPageTextsFromPdf(pdfData) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(pdfData);
    const loadingTask = pdfjs.getDocument({ data, useWorkerFetch: false, disableFontFace: true });
    const pdf = await loadingTask.promise;
    const pageTexts = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });
        const lines = linesToTextContent(textContent.items);
        pageTexts.push(lines.join("\n"));
    }
    return pageTexts;
}
export async function parseRosterBriefPdf(pdfData) {
    const pageTexts = await extractPageTextsFromPdf(pdfData);
    return parseRosterBriefPages(pageTexts);
}
//# sourceMappingURL=roster-extraction.js.map