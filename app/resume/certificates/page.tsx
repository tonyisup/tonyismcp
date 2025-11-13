import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">
            A collection of completed courses and certifications, grouped by
            platform.
          </p>
          <p>
            <Link href="/resume" className="underline">
              Back to Resume
            </Link>
          </p>
        </header>

        {certificateGroups.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No certificates available yet.
          </p>
        ) : (
          certificateGroups.map((group) => (
            <section key={group.folder} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">{group.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {group.certificates.length}{" "}
                  {group.certificates.length === 1
                    ? "certificate"
                    : "certificates"}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {group.certificates.map((certificate) => (
                  <Link
                    key={certificate.fileName}
                    href={certificate.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    <figure
                      className="space-y-3 rounded-md border bg-card p-4 shadow-sm"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded">
                        <Image
                          src={certificate.src}
                          alt={certificate.title}
                          fill
                          className="object-contain bg-secondary"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <figcaption className="text-sm font-medium text-center text-card-foreground">
                        {certificate.title}
                      </figcaption>
                    </figure>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}

