"use client";

import { BrutalistButton } from "@/components/ui/brutalist-button";
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
    <main className="min-h-screen bg-white p-8 text-black font-mono">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center text-black font-bold uppercase hover:bg-yellow-400 transition-colors mb-6 border-[2px] border-black px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.section
          className="space-y-6 border-[3px] border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-none">Bad Boys Podcast</h1>
            <BrutalistButton href="https://badboyspodcast.com">
              Visit Live Site <ExternalLink className="inline ml-2 w-5 h-5" />
            </BrutalistButton>
          </div>
          <p className="text-xl font-bold">
            Co-hosting and engineering a weekly podcast about movies and pop culture. Over 10 years of content!
          </p>
          <div className="flex gap-3 flex-wrap">
            {["Podcast Engineering", "Audio Editing", "Content Creation", "Web Development"].map((tag) => (
              <span key={tag} className="bg-black text-white px-3 py-1 text-sm font-bold uppercase transform -rotate-1 hover:rotate-2 transition-transform">
                {tag}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Overview */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="border-l-[4px] border-black pl-6 py-4"
        >
          <h2 className="text-2xl font-black uppercase mb-4 bg-yellow-400 inline-block px-2 border-black border-[2px]">Overview</h2>
          <p className="leading-relaxed text-lg">
            The Bad Boys Podcast is a long-running project that started as a simple conversation between friends and evolved into a weekly production.
            Beyond just recording, it involves managing RSS feeds, website maintenance, and ensuring high-quality audio engineering.
            It has been a playground for learning about digital media distribution and building a community around content.
          </p>
        </motion.section>

        {/* Learning Moments */}
        <motion.section
          className="space-y-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="flex items-center gap-4">
            <motion.h2 variants={fadeInUp} className="text-3xl font-black uppercase underline decoration-4 decoration-yellow-400">Learning Moments</motion.h2>
          </div>

          {/* Moment 1 */}
          <motion.div variants={fadeInUp} className="relative group">
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
            <div className="relative border-[3px] border-black bg-white p-6 hover:-translate-y-1 transition-transform">
              <h3 className="text-xl font-black uppercase mb-4">1. RSS Feed Management</h3>
              <p className="mb-4 font-medium">
                One of the key technical challenges was understanding and customizing the RSS feed to ensure compatibility with various podcast platforms like Apple Podcasts and Spotify.
                Structure and XML validation were crucial.
              </p>
              <div className="bg-gray-100 border-[2px] border-black p-4 overflow-x-auto text-xs">
                <pre className="font-mono">
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
            </div>
          </motion.div>

          {/* Moment 2 */}
          <motion.div variants={fadeInUp} className="relative group">
            <div className="absolute inset-0 bg-yellow-400 translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform border-[3px] border-black" />
            <div className="relative border-[3px] border-black bg-white p-6 hover:-translate-y-1 transition-transform">
              <h3 className="text-xl font-black uppercase mb-4">2. Audio Engineering Workflow</h3>
              <p className="mb-4 font-medium">
                Consistency is key. Developing a reliable workflow for recording, editing, mixing, and mastering significantly reduced production time.
                Automation scripts were eventually introduced to handle file naming and metadata tagging.
              </p>
              <div className="bg-black text-white p-4 overflow-x-auto text-xs border-[2px] border-yellow-400">
                <pre className="font-mono">
                  {`# Example Bash script for tagging
ffmpeg -i input.wav \\
  -metadata title="Episode Title" \\
  -metadata artist="Bad Boys Podcast" \\
  -codec:a libmp3lame -q:a 2 \\
  output.mp3`}
                </pre>
              </div>
            </div>
          </motion.div>

        </motion.section>
      </div>
    </main>
  );
}
