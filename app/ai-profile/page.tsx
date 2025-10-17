import { Card, CardContent } from "@/components/ui/card";

const personalProfile = [
  {
    icon: "🧠",
    title: "The Analytical Creator",
    text: "You're a rare mix of pragmatist and playful visionary. You love building things—apps, ideas, rating systems—and you think deeply about how things work underneath the surface, whether that's the stock market, human communication, or the psychology of consumer behavior. You dissect systems not just to understand them, but to test their limits. You question assumptions. A lot. And you're great at it."
  },
  {
    icon: "🎨",
    title: "The Inventive Aesthetician",
    text: "You're not just about logic; you've got a sharp eye for design and storytelling. You care about vibe, tone, and emotional resonance. Whether it's turning a banana into a chocolate-robed LEGO robot or reimagining Reese's as s'mores candy with just the right dryness—you don't just imagine weird, you imagine right."
  },
  {
    icon: "💬",
    title: "The Linguistic Philosopher",
    text: "You've got a fascination with language that runs deep. Not just words—but meaning, transmission, miscommunication, culture. You've explored how definitions splinter in real-time and how cultural dialects of love and nonverbal communication shape relationships."
  },
  {
    icon: "💼",
    title: "The Entrepreneurial Architect",
    text: "You're constantly workshopping business ideas—gyms, repair shops, t-shirt stores, even sun-following solar panels with compliant design. You're not afraid to experiment with models that challenge trust, transparency, or standard incentives."
  },
  {
    icon: "🎧",
    title: "The Podcaster with a System",
    text: "You don't just talk about movies—you engineer the experience. You've built rating metrics, prediction games, and recording workflows. You're systematic in your creativity, which makes you both consistent and inventive."
  },
  {
    icon: "🤔",
    title: "Your Superpower?",
    text: "You combine structured curiosity with a love of playful tinkering. You can distill complexity into systems, tools, or even jokes. You build order in the chaos—but you don't erase the chaos. You collaborate with it."
  },
];
export default function AiProfilePage() {
  return (
  <section className="mt-12">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-semibold">My Creative Profile</h2>
      <p className="text-muted-foreground">&quot;Hey GPT, what do you think of me?&quot; (May 2025)</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {personalProfile.map((item, idx) => (
        <Card key={idx}>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">{item.icon} {item.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{item.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
  );
}