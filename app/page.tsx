"use client";

import { motion } from "framer-motion";
import { GitHubIcon, KoFiIcon, LinkedInIcon, InstagramIcon, FacebookIcon, TwitterIcon } from "@/components/icons";
import Link from "next/link";
import { BrutalistCard } from "@/components/ui/brutalist-card";
import { BrutalistButton } from "@/components/ui/brutalist-button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row min-h-[80vh]">
        {/* Sidebar / Profile Section */}
        <section className="md:w-1/3 border-b-[4px] md:border-b-0 md:border-r-[4px] border-black p-6 flex flex-col justify-between">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl md:text-5xl font-black uppercase leading-none mb-4"
            >
              Tony<br />Is<br />Up
            </motion.h1>
            <div className="bg-yellow-400 border-[3px] border-black p-4 mb-6 rotate-[-2deg]">
              <p className="font-bold uppercase italic">Antonio Villanueva</p>
              <p className="text-sm">STEM • EDM • ENM</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase bg-black text-white px-2 py-1 inline-block">Ethos</h2>
            <p className="text-md font-bold leading-tight">
              Everything is a learning experience. Help others. Fail eagerly.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.01, x: 4, y: -4 }}
            className={cn(
              "mt-6 bg-gray-400 hover:bg-yellow-50 transition-colors border-[3px] border-black p-4 rotate-[2deg]",
            )}
          >
            <Link href="/core-beliefs">
              <div>
                <p className="font-bold uppercase italic underline text-center">
                  Core Beliefs
                </p>
              </div>
            </Link>
          </motion.div>

          <div className="space-y-4 pt-6">
            <h2 className="text-2xl font-black uppercase bg-black text-white px-2 py-1 inline-block">Bio</h2>
            <p className="text-md font-bold leading-tight">
              Tech enthusiast. Deeply empathetic, constantly analytical, endlessly creative. Hyper-aware of (mis)communication and psychology. Gamer4Life.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-4">
              <SocialLink href="https://github.com/tonyisup" icon={<GitHubIcon />} label="GH" />
              <SocialLink href="https://linkedin.com/in/antonio-villanueva" icon={<LinkedInIcon />} label="LI" />
              <SocialLink href="https://instagram.com/tonyisup" icon={<InstagramIcon />} label="IG" />
              <SocialLink href="https://twitter.com/tonyisup" icon={<TwitterIcon />} label="X" />
              <SocialLink href="https://facebook.com/tonyisup" icon={<FacebookIcon />} label="FB" />
              <SocialLink href="https://ko-fi.com/tonyisup" icon={<KoFiIcon />} label="KF" />
            </div>
          </div>
        </section>

        {/* Main Content / Projects */}
        <section className="md:w-2/3 p-6 md:p-10 flex flex-col">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-4xl font-black uppercase underline decoration-yellow-400 decoration-[8px]">Projects</h2>
            <span className="text-sm border-[2px] border-black px-2 font-bold bg-black text-white">EST. 2015 - 2025</span>
          </div>

          <div className="grid grid-cols-1 gap-8 flex-grow">
            <BrutalistCard
              title="Core Beliefs"
              description="A living essay — the convictions driving my work. Semantic drift, abstraction, failing eagerly, and the gaps between us."
              link="/core-beliefs"
              tag="THOUGHTWARE"
            />
            <BrutalistCard
              title="Bad Boys Podcast"
              description="Co-hosting and engineering a weekly podcast about movies and pop culture. Over ten years of terrible fun."
              link="/showcase/bad-boys-podcast"
              tag="PODCAST"
            />
            <BrutalistCard
              title="Break the Ice(berg)"
              description="AI-powered conversation starters. Learn React while helping CrossFit classes."
              link="https://breaktheiceberg.com"
              tag="WEB APP"
              external
            />
            <BrutalistCard
              title="FinCal"
              description="Budgeting tracker originally built with JS/Google Calendar, now upgraded to React."
              link="https://fincal.vercel.app"
              tag="FINANCE"
              external
            />
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <BrutalistButton href="/resume" variant="primary">
              RESUME.PDF
            </BrutalistButton>
          </div>
        </section>
      </div>

      <footer className="mt-8 text-center text-xs font-bold uppercase text-gray-500">
        <p>© 2026 TonyIsUp. All Systems Operational.</p>
      </footer>
    </main>
  );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} target="_blank" className="flex flex-col items-center gap-1 group">
      <div className="border-[2px] border-black p-2 group-hover:bg-yellow-400 transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </Link>
  );
}