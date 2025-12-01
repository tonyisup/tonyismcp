"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BadBoysPodcastShowcase() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.section
          className="space-y-4"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-4xl font-bold">Bad Boys Podcast</h1>
            <Button asChild>
              <Link href="https://badboyspodcast.com" target="_blank">
                Visit Live Site <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-xl text-muted-foreground">
            Co-hosting and engineering a weekly podcast about movies and pop culture. Over 10 years of content!
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">Podcast Engineering</span>
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">Audio Editing</span>
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">Content Creation</span>
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">Web Development</span>
          </div>
        </motion.section>

        {/* Overview */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">
                The Bad Boys Podcast is a long-running project that started as a simple conversation between friends and evolved into a weekly production.
                Beyond just recording, it involves managing RSS feeds, website maintenance, and ensuring high-quality audio engineering.
                It has been a playground for learning about digital media distribution and building a community around content.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Learning Moments */}
        <motion.section
          className="space-y-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold">Learning Moments</motion.h2>

          {/* Moment 1 */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. RSS Feed Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  One of the key technical challenges was understanding and customizing the RSS feed to ensure compatibility with various podcast platforms like Apple Podcasts and Spotify.
                  Structure and XML validation were crucial.
                </p>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm font-mono">
{`<item>
  <title>Episode 100: The Milestone</title>
  <description>We celebrate 100 episodes...</description>
  <enclosure url="https://example.com/ep100.mp3" length="12345678" type="audio/mpeg" />
  <guid>https://example.com/ep100</guid>
  <pubDate>Tue, 14 Mar 2023 12:00:00 GMT</pubDate>
  <itunes:duration>1:05:23</itunes:duration>
</item>`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>

           {/* Moment 2 */}
           <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. Audio Engineering Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Consistency is key. Developing a reliable workflow for recording, editing, mixing, and mastering significantly reduced production time.
                  Automation scripts were eventually introduced to handle file naming and metadata tagging.
                </p>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm font-mono">
{`# Example Bash script for tagging
ffmpeg -i input.wav \
  -metadata title="Episode Title" \
  -metadata artist="Bad Boys Podcast" \
  -codec:a libmp3lame -q:a 2 \
  output.mp3`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </motion.section>
      </div>
    </main>
  );
}
