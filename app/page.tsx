export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-5xl font-extrabold">
        Hot &amp; Fresh <span className="text-ember italic">Artisan Pizza</span>
      </h1>
      <p className="text-on-surface-variant">
        Space Grotesk body text, tabular: $1,234.50
      </p>
      <button className="rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground glow-amber active:scale-95 transition">
        Explore Pizza Menu
      </button>
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
        Card surface
      </div>
    </main>
  );
}
