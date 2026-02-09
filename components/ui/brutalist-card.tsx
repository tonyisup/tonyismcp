"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrutalistCardProps {
	title: string;
	description: string;
	link: string;
	tag: string;
	external?: boolean;
	className?: string;
}

export function BrutalistCard({ title, description, link, tag, external = false, className }: BrutalistCardProps) {
	return (
		<motion.div
			whileHover={{ scale: 1.01, x: 4, y: -4 }}
			className={cn(
				"group relative border-[3px] border-black p-6 bg-white hover:bg-yellow-50 transition-colors shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
				className
			)}
		>
			<div className="absolute -top-3 -left-3 bg-black text-white px-2 py-0.5 text-xs font-bold tracking-tighter italic">
				{tag}
			</div>
			<Link href={link} target={external ? "_blank" : undefined} className="flex justify-between items-start group">
				<div>
					<h3 className="text-2xl font-black uppercase group-hover:underline decoration-[4px] decoration-yellow-400 mb-2 flex items-center gap-2">
						{title} {external && <ExternalLink size={18} />}
					</h3>
					<p className="text-sm font-bold opacity-80">{description}</p>
				</div>
				<ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
			</Link>
		</motion.div>
	);
}
