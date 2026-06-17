import "dotenv/config";
import express from "express";
import session from "express-session";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import { parseRosterBriefPdf } from "./roster-extraction.js";
import { buildGoogleSheetsWorkbook } from "./sheets-export.js";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_PORT = 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
function escapeHtml(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function sessionState(req) {
    return req.session;
}
function readGoogleConfig(port) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim() || `http://localhost:${port}/auth/google/callback`;
    if (!clientId || !clientSecret)
        return null;
    return { clientId, clientSecret, redirectUri };
}
function googleAuthClient(config) {
    return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
}
function renderWarnings(warnings) {
    if (warnings.length === 0) {
        return `<p class="muted">No warnings.</p>`;
    }
    const rows = warnings
        .map((warning) => `
        <tr>
          <td>${escapeHtml(String(warning.pageNumber))}</td>
          <td>${escapeHtml(String(warning.rosterRowNumber ?? ""))}</td>
          <td>${escapeHtml(warning.field ?? "")}</td>
          <td>${escapeHtml(warning.issue ?? "")}</td>
          <td>${escapeHtml(warning.message)}</td>
        </tr>`)
        .join("");
    return `
    <table>
      <thead>
        <tr><th>Page</th><th>Row</th><th>Field</th><th>Issue</th><th>Message</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
function renderRosterSummary(roster, filename) {
    const previewRows = roster.records.slice(0, 5).map((record) => {
        return `<tr><td>${record.rosterRowNumber}</td><td>${escapeHtml(record.athleteName)}</td><td>${escapeHtml(record.practiceCenterPreference ?? "")}</td><td>${escapeHtml(record.shirtSize ?? "")}</td></tr>`;
    }).join("");
    return `
    <section class="card">
      <h2>Parsed roster</h2>
      <p>${escapeHtml(filename || "Uploaded PDF")}</p>
      <p><strong>${roster.records.length}</strong> records across <strong>${roster.pageCount}</strong> pages.</p>
      <p><strong>${roster.warnings.length}</strong> warnings.</p>
      <table>
        <thead>
          <tr><th>Row</th><th>Athlete</th><th>Practice Center</th><th>Shirt</th></tr>
        </thead>
        <tbody>${previewRows || "<tr><td colspan='4' class='muted'>No records parsed.</td></tr>"}</tbody>
      </table>
      <h3>Warnings</h3>
      ${renderWarnings(roster.warnings)}
    </section>`;
}
function renderPage(req, config) {
    const state = sessionState(req);
    const flash = state.flash ? `<div class="flash">${escapeHtml(state.flash)}</div>` : "";
    delete state.flash;
    const connected = Boolean(state.googleTokens);
    const rosterSection = state.roster ? renderRosterSummary(state.roster, state.rosterFilename) : `<p class="muted">Upload a roster PDF to preview the extracted records.</p>`;
    const sheetSection = state.sheetUrl
        ? `<p><strong>Latest Google Sheet:</strong> <a href="${escapeHtml(state.sheetUrl)}" target="_blank" rel="noreferrer">Open spreadsheet</a></p>`
        : "";
    const connectButton = config
        ? `<a class="button secondary" href="/auth/google">${connected ? "Reconnect Google Sheets" : "Connect Google Sheets"}</a>`
        : `<p class="muted">Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google Sheets upload.</p>`;
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Roster Upload Prototype</title>
    <style>
      :root { color-scheme: light; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
      body { margin: 0; background: #f6f7fb; color: #1f2937; }
      main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 48px; }
      h1, h2, h3 { margin-top: 0; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; align-items: start; }
      .card { background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.03); }
      .flash { background: #ecfeff; border: 1px solid #06b6d4; color: #0e7490; padding: 12px 14px; border-radius: 10px; margin-bottom: 16px; }
      .muted { color: #6b7280; }
      .button { display: inline-block; border: 0; border-radius: 10px; padding: 10px 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
      .button.primary { background: #111827; color: white; }
      .button.secondary { background: #2563eb; color: white; }
      .button[disabled] { opacity: .5; pointer-events: none; }
      form { display: grid; gap: 12px; }
      input[type="file"] { display: block; width: 100%; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; border-top: 1px solid #e5e7eb; padding: 8px 10px; vertical-align: top; }
      th { background: #f9fafb; font-size: 0.92rem; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; }
      .status { display: flex; flex-wrap: wrap; gap: 10px; margin: 12px 0; }
      .pill { border-radius: 999px; padding: 6px 10px; background: #e5e7eb; font-size: .85rem; }
      .pill.ok { background: #dcfce7; color: #166534; }
    </style>
  </head>
  <body>
    <main>
      <h1>Roster Upload Prototype</h1>
      <p class="muted">Upload the PDF roster, connect a Google Sheets account, and write the extracted results into a new spreadsheet.</p>
      ${flash}

      <div class="status">
        <span class="pill ${connected ? "ok" : ""}">${connected ? "Google connected" : "Google not connected"}</span>
        <span class="pill">PDF parsed in app</span>
        <span class="pill">Roster + warnings tabs</span>
      </div>

      <div class="grid">
        <section class="card">
          <h2>1. Upload roster PDF</h2>
          <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="rosterPdf" accept="application/pdf" required />
            <button class="button primary" type="submit">Upload and extract</button>
          </form>
          <p class="muted">The extracted records stay in your browser session until you create a sheet or upload a new roster.</p>
        </section>

        <section class="card">
          <h2>2. Google Sheets account</h2>
          <p class="muted">The app uses Google OAuth to create a new spreadsheet in the connected account.</p>
          <div class="actions">
            ${connectButton}
          </div>
          ${sheetSection}
          <form action="/create-sheet" method="post" style="margin-top: 14px;">
            <button class="button secondary" type="submit" ${state.roster && connected ? "" : "disabled"}>Create new Google Sheet</button>
          </form>
          <p class="muted">Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.</p>
        </section>
      </div>

      ${rosterSection}
    </main>
  </body>
</html>`;
}
async function saveSession(req) {
    await new Promise((resolve, reject) => {
        req.session.save((error) => (error ? reject(error) : resolve()));
    });
}
async function createSpreadsheetFromRoster(req, config) {
    const state = sessionState(req);
    if (!state.roster) {
        throw new Error("Upload a roster PDF first.");
    }
    if (!state.googleTokens) {
        throw new Error("Connect a Google account first.");
    }
    const workbookTitle = state.rosterFilename
        ? `${state.rosterFilename.replace(/\.pdf$/i, "")} - extracted roster`
        : `Roster export ${new Date().toISOString()}`;
    const workbook = buildGoogleSheetsWorkbook(state.roster, workbookTitle);
    const oauth = googleAuthClient(config);
    oauth.setCredentials(state.googleTokens);
    const sheets = google.sheets({ version: "v4", auth: oauth });
    const created = await sheets.spreadsheets.create({ requestBody: workbook.requestBody });
    const spreadsheetId = created.data.spreadsheetId;
    if (!spreadsheetId) {
        throw new Error("Google Sheets did not return a spreadsheet ID.");
    }
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: "USER_ENTERED",
            data: workbook.valueRanges,
        },
    });
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}
export function createWebApp(port = DEFAULT_PORT) {
    const app = express();
    const config = readGoogleConfig(port);
    app.disable("x-powered-by");
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
        secret: process.env.SESSION_SECRET?.trim() || "roster-upload-prototype-secret",
        resave: false,
        saveUninitialized: false,
        cookie: { sameSite: "lax" },
    }));
    app.get("/health", (_req, res) => {
        res.type("text/plain").send("ok");
    });
    app.get("/", (req, res) => {
        res.type("html").send(renderPage(req, config));
    });
    app.post("/upload", upload.single("rosterPdf"), async (req, res) => {
        try {
            if (!req.file?.buffer) {
                throw new Error("Choose a PDF roster file first.");
            }
            const result = await parseRosterBriefPdf(req.file.buffer);
            const state = sessionState(req);
            state.roster = result;
            state.rosterFilename = req.file.originalname;
            state.flash = `Parsed ${result.records.length} records from ${req.file.originalname}.`;
            await saveSession(req);
            res.redirect("/");
        }
        catch (error) {
            const state = sessionState(req);
            state.flash = error instanceof Error ? error.message : String(error);
            await saveSession(req);
            res.redirect("/");
        }
    });
    app.get("/auth/google", (req, res) => {
        if (!config) {
            const state = sessionState(req);
            state.flash = "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.";
            void saveSession(req).then(() => res.redirect("/"));
            return;
        }
        const oauth = googleAuthClient(config);
        const stateValue = randomUUID();
        const state = sessionState(req);
        state.oauthState = stateValue;
        void saveSession(req).then(() => {
            res.redirect(oauth.generateAuthUrl({
                access_type: "offline",
                prompt: "consent",
                scope: [GOOGLE_SHEETS_SCOPE],
                state: stateValue,
            }));
        });
    });
    app.get("/auth/google/callback", async (req, res) => {
        try {
            if (!config) {
                throw new Error("Google OAuth is not configured.");
            }
            const code = typeof req.query.code === "string" ? req.query.code : "";
            const returnedState = typeof req.query.state === "string" ? req.query.state : "";
            const state = sessionState(req);
            if (!code) {
                throw new Error("Google did not return an authorization code.");
            }
            if (!state.oauthState || state.oauthState !== returnedState) {
                throw new Error("OAuth state did not match. Please try connecting again.");
            }
            const oauth = googleAuthClient(config);
            const { tokens } = await oauth.getToken(code);
            state.googleTokens = tokens;
            state.flash = "Google account connected.";
            delete state.oauthState;
            await saveSession(req);
            res.redirect("/");
        }
        catch (error) {
            const state = sessionState(req);
            state.flash = error instanceof Error ? error.message : String(error);
            await saveSession(req);
            res.redirect("/");
        }
    });
    app.post("/create-sheet", async (req, res) => {
        try {
            if (!config) {
                throw new Error("Google OAuth is not configured.");
            }
            const sheetUrl = await createSpreadsheetFromRoster(req, config);
            const state = sessionState(req);
            state.sheetUrl = sheetUrl;
            state.flash = "Created a new Google Sheet with the roster and warnings tabs.";
            await saveSession(req);
            res.redirect("/");
        }
        catch (error) {
            const state = sessionState(req);
            state.flash = error instanceof Error ? error.message : String(error);
            await saveSession(req);
            res.redirect("/");
        }
    });
    return app;
}
export async function main(argv = process.argv) {
    const portArg = argv[2];
    const parsedPort = portArg ? Number(portArg) : Number(process.env.PORT ?? DEFAULT_PORT);
    const port = Number.isFinite(parsedPort) ? parsedPort : DEFAULT_PORT;
    const app = createWebApp(port);
    return await new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`Roster prototype running at http://localhost:${port}`);
            resolve(0);
        });
        server.on("error", (error) => {
            reject(error);
        });
    });
}
const entrypoint = process.argv[1] ? resolve(process.argv[1]) : "";
if (entrypoint && fileURLToPath(import.meta.url) === entrypoint) {
    void main(process.argv).catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    });
}
//# sourceMappingURL=web.js.map