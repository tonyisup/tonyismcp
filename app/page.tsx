import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-5xl mx-auto space-y-10">
        <section className="text-center">
          <h1 className="text-4xl font-bold">Antonio Villanueva</h1>
          <p className="text-sm text-muted-foreground">AKA <span className="text-lg">TonyIsUp</span>
            <span className="text-sm"> AKA</span> <span className="text-lg">MCP</span></p>
          <p className="text-md text-muted-foreground">STEM. EDM. ENM.</p>
          <p className="text-sm text-muted-foreground">Everything is a learning experience. Help others. Fail eagerly.</p>
        </section>

        <section className="flex flex-col items-center">
          <div className="flex flex-col gap-2 items-center mb-4">
            <h2 className="text-2xl font-semibold">Me in 140 characters</h2>
            <p className="w-1/2 text-muted-foreground">Tech enthusiast. Deeply empathetic, constantly analytical, endlessly creative. Hyper-aware of (mis)communication and psychology. Gamer4Life.</p>
          </div>
        </section>

        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-4">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">
                    <Link href="https://badboyspodcast.com" target="_blank">Bad Boys Podcast</Link>
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Co-hosting and engineering a weekly podcast about movies and pop culture. Been going for over ten years! &quot;Yeah, we&apos;re terrible. Please come.&quot; </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">
                    <Link href="https://breaktheiceberg.com" target="_blank">Break the Ice(berg)</Link>
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generates random conversation starters for you and your friends.
                    Initially started as a side project to learn react using AI while also helping create the daily Question of the Day for CrossFit classes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">
                    <Link href="https://fincal.vercel.app" target="_blank">FinCal</Link>
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A budgeting tracker I built for myself originally using javascript and google calender. Recently upgraded to React.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">
                    <Link href="https://github.com/tonyisup?tab=repositories" target="_blank">Other Projects</Link>
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Various other sparks of creativity.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-6">
            <Link href="/ai-profile">&quot;Hey GPT, what do you think of me?&quot; (May 2025)</Link>
          </div>
        </section>

        <footer className="text-center text-sm text-muted-foreground mt-12">
          <p className="flex justify-center items-center gap-4 mb-4">
            <Link href="https://github.com/tonyisup" target="_blank" className="flex items-center gap-2">
              <GitHubIcon /> GitHub
            </Link>
            <Link href="https://www.linkedin.com/in/antonio-villanueva-0000000000/" target="_blank" className="flex items-center gap-2">
              <LinkedInIcon /> LinkedIn
            </Link>
            <Link href="https://www.instagram.com/tonyisup/" target="_blank" className="flex items-center gap-2">
              <InstagramIcon /> Instagram
            </Link>
            <Link href="https://www.facebook.com/tonyisup/" target="_blank" className="flex items-center gap-2">
              <FacebookIcon /> Facebook
            </Link>
            <Link href="https://www.twitter.com/tonyisup/" target="_blank" className="flex items-center gap-2">
              <TwitterIcon /> Twitter
            </Link>
          </p>
          <p className="my-4">
            <Link href="/resume">Resume</Link>
          </p>
          <p>© 2025 Antonio Villanueva. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"  >
      <title>GitHub</title>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"  >
      <title>LinkedIn</title>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <title>Instagram</title>
      <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <title>Facebook</title>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <title>X</title>
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
    </svg>
  );
}