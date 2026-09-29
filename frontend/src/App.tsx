import { lazy, Suspense, useState } from 'react';
import { bio, intro, links, projects, work, type Item } from './content';
import { say, stop, type Line } from './face/voice';

// Three.js loads after the text, so the page is readable instantly.
const Face = lazy(() => import('./face/Face'));

function Row({ item, active }: { item: Item; active: boolean }) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-fg">{item.title}</span>
        {item.tag && <span className="font-mono text-xs text-muted">{item.tag}</span>}
      </div>
      <p className="mt-0.5 text-sm text-muted">{item.description}</p>
    </>
  );
  const cls = `row block rounded-lg px-3 py-2.5 -mx-3 ${active ? 'row-active' : ''}`;
  return item.href ? (
    <a href={item.href} target="_blank" rel="noreferrer" className={`${cls} hover:bg-white/[0.04]`}>{body}</a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Section({ title, items, active }: { title: string; items: Item[]; active?: string }) {
  return (
    <section className="mt-14">
      <h2 className="mb-3 text-sm text-muted">{title}</h2>
      <div className="flex flex-col gap-1">
        {items.map((it) => <Row key={it.id} item={it} active={active === it.id} />)}
      </div>
    </section>
  );
}

export default function App() {
  const [line, setLine] = useState<Line | null>(null);
  const talking = line !== null;

  const toggle = () => (talking ? stop(setLine) : say(intro, setLine));

  return (
    <main className="mx-auto max-w-[620px] px-4 pb-24">
      <div className="relative -mx-4 h-[min(48vh,420px)] sm:-mx-16 sm:h-[min(62vh,520px)]">
        <Suspense fallback={null}>
          <Face onClick={toggle} label={talking ? 'Stop talking' : 'Talk to Ricardo'} />
        </Suspense>
      </div>

      <p className="caption -mt-2 min-h-[3.5rem] text-center text-[15px] text-fg" aria-live="polite">
        {line ? line.text : <span className="text-muted">tap the face to hear from me · or read below</span>}
      </p>

      <header className="mt-6">
        <h1 className="text-fg">{bio.name}</h1>
        <p className="mt-2 text-muted">{bio.line}</p>
      </header>

      <Section title="Work" items={work} active={line?.highlight} />
      <Section title="Building" items={projects} active={line?.highlight} />

      <section className="mt-14">
        <h2 className="mb-3 text-sm text-muted">Elsewhere</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <a key={l.id} href={l.href} target="_blank" rel="noreferrer" className="text-fg hover:text-accent">{l.title}</a>
          ))}
        </div>
      </section>
    </main>
  );
}
