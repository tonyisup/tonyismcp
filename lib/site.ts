export interface NavItem {
  key: string;
  label: string;
  href: string;
}

// Order matters: the index + 1 is the keyboard shortcut shown in the status bar.
export const NAV: NavItem[] = [
  { key: "1", label: "home", href: "/" },
  { key: "2", label: "beliefs", href: "/core-beliefs" },
  { key: "3", label: "resume", href: "/resume" },
  { key: "4", label: "podcast", href: "/showcase/bad-boys-podcast" },
];

export interface Project {
  slug: string;
  title: string;
  description: string;
  type: string;
  status: string;
  href: string;
  external?: boolean;
}

export const PROJECTS: Project[] = [
  {
    slug: "core-beliefs",
    title: "Core Beliefs",
    description:
      "A living essay — the convictions driving my work. Semantic drift, abstraction, failing eagerly, and the gaps between us.",
    type: "thoughtware",
    status: "live",
    href: "/core-beliefs",
  },
  {
    slug: "bad-boys-podcast",
    title: "Bad Boys Podcast",
    description:
      "Co-hosting and engineering a weekly podcast about movies and pop culture. Over ten years of terrible fun.",
    type: "podcast",
    status: "weekly",
    href: "/showcase/bad-boys-podcast",
  },
  {
    slug: "break-the-iceberg",
    title: "Break the Ice(berg)",
    description: "AI-powered conversation starters. Learn React while helping CrossFit classes.",
    type: "web app",
    status: "ext",
    href: "https://breaktheiceberg.com",
    external: true,
  },
  {
    slug: "fincal",
    title: "FinCal",
    description: "Budgeting tracker originally built with JS/Google Calendar, now upgraded to React.",
    type: "finance",
    status: "ext",
    href: "https://fincal.vercel.app",
    external: true,
  },
];

export interface Social {
  key: string;
  label: string;
  href: string;
}

export const SOCIALS: Social[] = [
  { key: "gh", label: "github", href: "https://github.com/tonyisup" },
  { key: "li", label: "linkedin", href: "https://linkedin.com/in/antonio-villanueva" },
  { key: "ig", label: "instagram", href: "https://instagram.com/tonyisup" },
  { key: "x", label: "twitter", href: "https://twitter.com/tonyisup" },
  { key: "fb", label: "facebook", href: "https://facebook.com/tonyisup" },
  { key: "kf", label: "ko-fi", href: "https://ko-fi.com/tonyisup" },
];

export const EST_YEAR = 2015;
