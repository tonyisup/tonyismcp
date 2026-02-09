import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { BrutalistButton } from "@/components/ui/brutalist-button";
import { ArrowLeft, ExternalLink } from "lucide-react";

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
    <main className="min-h-screen bg-white p-8 text-black font-mono selection:bg-yellow-400">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-[4px] border-black pb-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-black uppercase tracking-tighter italic underline decoration-yellow-400 decoration-8">
                Learning
              </h1>
              <p className="font-bold uppercase opacity-60">
                Completed courses & certifications
              </p>
            </div>
            <BrutalistButton href="/resume" className="text-sm px-4 py-2">
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              Back to Resume
            </BrutalistButton>
          </div>
        </header>

        {certificateGroups.length === 0 ? (
          <div className="border-[3px] border-black p-12 text-center bg-gray-50 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <p className="text-xl font-black uppercase italic">
              No certificates detected in the system.
            </p>
          </div>
        ) : (
          <div className="grid gap-16">
            {certificateGroups.map((group) => (
              <section key={group.folder} className="space-y-10">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-yellow-400 translate-x-1 translate-y-1 -z-10" />
                  <h2 className="text-3xl font-black uppercase border-[3px] border-black px-4 py-2 bg-white">
                    {group.label}
                  </h2>
                  <span className="absolute -top-3 -right-3 bg-black text-white px-2 py-0.5 text-xs font-bold">
                    {group.certificates.length} ITEMS
                  </span>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {group.certificates.map((certificate, idx) => (
                    <div key={certificate.fileName}>
                      <Link
                        href={certificate.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block relative"
                      >
                        <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
                        <figure className="relative space-y-4 border-[3px] border-black bg-white p-4 h-full flex flex-col hover:-translate-y-1 transition-transform">
                          <div className="relative aspect-[4/3] w-full overflow-hidden border-[2px] border-black bg-gray-100">
                            <Image
                              src={certificate.src}
                              alt={certificate.title}
                              fill
                              className="object-contain p-2"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <figcaption className="text-sm font-black uppercase text-center mt-auto flex items-center justify-center gap-2 group-hover:text-yellow-600">
                            {certificate.title} <ExternalLink size={14} />
                          </figcaption>
                        </figure>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="h-[2px] bg-black/10 w-full" />
              </section>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-20 text-center text-xs font-bold uppercase text-gray-500">
        <p>© 2026 TonyIsUp. Verification Protocols Active.</p>
      </footer>
    </main>
  );
}
