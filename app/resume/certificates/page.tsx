import fs from "fs";
import path from "path";
import Image from "next/image";
import { Panel, Prompt } from "@/components/console/panel";
import { SiteShell } from "@/components/console/site-shell";
import { TermLink } from "@/components/console/term-link";

type CertificateGroup = {
  folder: string;
  label: string;
  certificates: { fileName: string; title: string; src: string }[];
};

const CERTIFICATES_DIR = path.join(
  process.cwd(),
  "public",
  "learning",
  "certificates"
);

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseCertificateName(fileName: string) {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");

  return titleCase(withoutExt);
}

function getCertificateGroups(): CertificateGroup[] {
  if (!fs.existsSync(CERTIFICATES_DIR)) {
    return [];
  }

  const subfolders = fs
    .readdirSync(CERTIFICATES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return subfolders
    .map((folder) => {
      const folderPath = path.join(CERTIFICATES_DIR, folder);

      const certificates = fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isFile() && /\.(png|jpe?g|webp|avif|pdf)$/i.test(entry.name)
        )
        .map((entry) => ({
          fileName: entry.name,
          title: parseCertificateName(entry.name),
          src: `/learning/certificates/${folder}/${entry.name}`,
        }));

      return {
        folder,
        label: titleCase(folder),
        certificates,
      };
    })
    .filter((group) => group.certificates.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function CertificatesPage() {
  const certificateGroups = getCertificateGroups();
  const total = certificateGroups.reduce((sum, group) => sum + group.certificates.length, 0);

  return (
    <SiteShell>
      <Panel title={<><b className="text-foreground">~/resume/learning</b> — certificates</>} meta={`${total} files`}>
        <Prompt path="~/resume">ls ./learning</Prompt>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-none tracking-[-0.04em] [word-spacing:-0.18em]">Learning</h1>
            <p className="mt-3 font-sans text-[15px] text-dim">Completed courses &amp; certifications</p>
          </div>
          <TermLink href="/resume">← back to resume</TermLink>
        </div>
      </Panel>

      {certificateGroups.length === 0 ? (
        <Panel className="border-t border-border">
          <p className="text-dim">ls: ./learning/certificates: no certificates found.</p>
        </Panel>
      ) : (
        certificateGroups.map((group, groupIndex) => (
          <Panel
            key={group.folder}
            title={<><b className="text-foreground">ls</b> ./{group.folder}</>}
            meta={`${group.certificates.length} files`}
            className="border-t border-border"
          >
            <h2 className="mb-5 text-xl font-extrabold tracking-[-0.02em]">{group.label}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.certificates.map((certificate, index) => (
                <li key={certificate.fileName}>
                  <a
                    href={certificate.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded border border-border bg-panel transition-colors hover:border-signal"
                  >
                    <div className="relative aspect-[4/3] w-full border-b border-border bg-white">
                      <Image
                        src={certificate.src}
                        alt={certificate.title}
                        fill
                        priority={groupIndex === 0 && index < 3}
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                      <span className="truncate group-hover:text-signal">{certificate.fileName}</span>
                      <span className="text-dim">↗</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        ))
      )}
    </SiteShell>
  );
}
