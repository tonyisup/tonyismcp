"use client";

import Link from "next/link";
import { ArrowLeft, Book, Download, ExternalLink } from "lucide-react";
import { BrutalistButton } from "@/components/ui/brutalist-button";

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-white p-8 text-black font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-[4px] border-black pb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/">
              <BrutalistButton href="/" className="text-sm px-4 py-2">
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Back to Home
              </BrutalistButton>
            </Link>
            <BrutalistButton href="/resume/certificates" variant="secondary" className="text-sm px-4 py-2">
              <Book className="h-4 w-4 inline mr-2" />
              Certificates
            </BrutalistButton>
            <p className="text-sm font-bold uppercase bg-yellow-400 px-2 py-1 border-[2px] border-black inline-block">
              Last updated: February 2026
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="/Resume.pdf"
              download="Antonio_Villanueva_Resume.pdf"
              className="inline-flex items-center gap-2 font-bold uppercase hover:underline decoration-4 decoration-yellow-400"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
            <a
              href="/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold uppercase hover:underline decoration-4 decoration-yellow-400"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </a>
          </div>
        </div>

        {/* PDF Display Container */}
        <div className="border-[4px] border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-gray-100 p-2">
          <div className="w-full h-[calc(100vh-250px)] min-h-[600px] border-[2px] border-black bg-white">
            <iframe
              src="/Resume.pdf"
              width="100%"
              height="100%"
              className="w-full h-full"
              title="Antonio Villanueva Resume"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm font-bold uppercase opacity-60">
          <p>If the PDF doesn&apos;t load properly, try downloading it or opening in a new tab.</p>
        </div>
      </div>
    </main>
  );
}
