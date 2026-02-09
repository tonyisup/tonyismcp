"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrutalistButtonProps {
	href: string;
	children: React.ReactNode;
	variant?: "primary" | "secondary";
	className?: string;
}

export function BrutalistButton({ href, children, variant = "primary", className }: BrutalistButtonProps) {
	const baseStyles = "inline-block px-6 py-3 font-black text-xl transition-colors border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] uppercase";

	const variants = {
		primary: "bg-black text-white hover:bg-yellow-400 hover:text-black",
		secondary: "bg-white text-black hover:bg-black hover:text-white border-black shadow-[4px_4px_0_0_rgba(250,204,21,1)]",
	};

	return (
		<Link
			href={href}
			className={cn(baseStyles, variants[variant], className)}
		>
			{children}
		</Link>
	);
}
