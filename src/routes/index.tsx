import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { MERIDIANS, ALL_POINTS, TOTAL_UNIQUE_POINTS, type FlatPoint } from "@/data/meridians";

const AcupointScene = lazy(() =>
  import("@/components/dog/AcupointScene").then((m) => ({ default: m.AcupointScene })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canine Acupressure Atlas — Interactive 3D Meridian Model" },
      {
        name: "description",
        content:
          "Rotate a 3D dog and explore every acupressure point: 14 meridians, named points, locations and indications from classical TCVM charts.",
      },
      { property: "og:title", content: "Canine Acupressure Atlas — Interactive 3D Meridian Model" },
      {
        property: "og:description",
        content:
          "An interactive three-dimensional canine meridian chart with named acupressure points and their indications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeIds, setActiveIds] = useState<string[]>(MERIDIANS.map((m) => m.id));
  const [selected, setSelected] = useState<FlatPoint | null>(null);
  const [hovered, setHovered] = useState<FlatPoint | null>(null);
  const [bodyOpacity, setBodyOpacity] = useState(0.34);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = (id: string) =>
    setActiveIds((cur) => (cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_POINTS.filter(
      (p) =>
        p.side !== "L" &&
        (p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.note.toLowerCase().includes(q) ||
          p.meridianName.toLowerCase().includes(q)),
    ).slice(0, 12);
  }, [query]);

  const focus = selected ?? hovered;
  const activeMeridian = focus ? MERIDIANS.find((m) => m.id === focus.meridianId) : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-5 md:px-10">
        <p className="rule-label">Tallgrass-style meridian reference · TCVM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Canine Acupressure Atlas
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {TOTAL_UNIQUE_POINTS} named points across {MERIDIANS.length} channels, mapped onto a
            rotatable three-dimensional dog. Drag to orbit, scroll to zoom, click a point.
          </p>
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[280px_1fr_320px]">
        {/* Legend */}
        <aside className="border-b border-border p-5 lg:border-b-0 lg:border-r">
          <p className="rule-label">Meridian legend</p>
          <div className="mt-3 space-y-1">
            {MERIDIANS.map((m) => {
              const on = activeIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  className={`flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-secondary ${
                    on ? "opacity-100" : "opacity-35"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="flex-1 text-sm">{m.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{m.code}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-4 border-t border-border pt-5">
            <label className="block">
              <span className="rule-label">Tissue opacity</span>
              <input
                type="range"
                min={0.15}
                max={1}
                step={0.01}
                value={bodyOpacity}
                onChange={(e) => setBodyOpacity(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSkeleton}
                onChange={(e) => setShowSkeleton(e.target.checked)}
                className="accent-primary"
              />
              Show skeleton
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPaths}
                onChange={(e) => setShowPaths(e.target.checked)}
                className="accent-primary"
              />
              Show channel pathways
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="accent-primary"
              />
              Always show point codes
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveIds(MERIDIANS.map((m) => m.id))}
                className="flex-1 rounded-sm border border-border px-2 py-1.5 text-xs hover:bg-secondary"
              >
                All
              </button>
              <button
                onClick={() => setActiveIds([])}
                className="flex-1 rounded-sm border border-border px-2 py-1.5 text-xs hover:bg-secondary"
              >
                None
              </button>
            </div>
          </div>
        </aside>

        {/* Viewport */}
        <section className="relative h-[58vh] min-h-[420px] lg:h-[calc(100vh-140px)]">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Preparing the model…
              </div>
            }
          >
            <AcupointScene
              activeIds={activeIds}
              selected={selected}
              hovered={hovered}
              onSelect={setSelected}
              onHover={setHovered}
              bodyOpacity={bodyOpacity}
              showPaths={showPaths}
              showLabels={showLabels}
              showSkeleton={showSkeleton}
            />
          </Suspense>
          <div className="pointer-events-none absolute bottom-3 left-4 rule-label">
            Drag · orbit &nbsp;/&nbsp; Scroll · zoom &nbsp;/&nbsp; Click · inspect
          </div>
        </section>

        {/* Detail */}
        <aside className="border-t border-border p-5 lg:border-l lg:border-t-0">
          <p className="rule-label">Find a point</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Bai Hui, ST 36, hip"
            className="mt-2 w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          {results.length > 0 && (
            <div className="mt-2 max-h-52 overflow-auto rounded-sm border border-border">
              {results.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setSelected(p);
                    if (!activeIds.includes(p.meridianId)) toggle(p.meridianId);
                  }}
                  className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-xs last:border-b-0 hover:bg-secondary"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-mono">{p.code}</span>
                  <span className="truncate text-muted-foreground">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            {focus && activeMeridian ? (
              <article>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: focus.color }}
                  />
                  <span className="rule-label">
                    {activeMeridian.name} · {activeMeridian.polarity}
                    {activeMeridian.element !== "Extraordinary" ? ` · ${activeMeridian.element}` : ""}
                  </span>
                </div>
                <h2 className="mt-3 font-mono text-2xl">{focus.code}</h2>
                <p className="text-lg italic text-primary">{focus.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {focus.side === "M"
                    ? "Midline point"
                    : `Bilateral · ${focus.side === "R" ? "right" : "left"} side shown`}
                </p>
                <p className="mt-4 text-sm leading-relaxed">{focus.note}</p>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  {activeMeridian.summary}
                </p>
              </article>
            ) : (
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  Hover or click any bead on the model to read its classical name, anatomical
                  location and common indications.
                </p>
                <p className="mt-3">
                  Solid channels are yin, ascending; yang channels descend along the outer surfaces.
                  Sister meridians share a colour family, as on printed charts.
                </p>
              </div>
            )}
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
            Educational reference only. Point locations are approximations mapped to a stylised
            model — confirm anatomy with a qualified TCVM veterinarian before treatment.
          </p>
        </aside>
      </div>
    </main>
  );
}
