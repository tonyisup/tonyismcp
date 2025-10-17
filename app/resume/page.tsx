import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-full flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Resume</h1>
            <p className="w-full text-center text-sm text-muted-foreground">Last updated: October 17, 2025</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href="/Resume.pdf"
                download="Antonio_Villanueva_Resume.pdf"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href="/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </div>

        {/* PDF Display */}
        <Card>
          <CardContent className="p-0">
            <div className="w-full h-[calc(100vh-200px)] min-h-[600px]">
              <iframe
                src="/Resume.pdf"
                width="100%"
                height="100%"
                className="border-0"
                title="Antonio Villanueva Resume"
                style={{ minHeight: '600px' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>If the PDF doesn't load properly, try downloading it or opening in a new tab.</p>
        </div>
      </div>
    </main>
  );
}
