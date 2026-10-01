import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { about, bio, intro, links, nft, projects, work, type Item } from './content';
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

function Section({ title, items, active, delay }: { title: string; items: Item[]; active?: string; delay?: string }) {
  return (
    <section className="reveal mt-14" style={{ animationDelay: delay }}>
      <h2 className="mb-3 text-sm text-muted">{title}</h2>
      <div className="flex flex-col gap-1">
        {items.map((it) => <Row key={it.id} item={it} active={active === it.id} />)}
      </div>
    </section>
  );
}

// Below this width there's no room beside the head, so the head steps aside for the bubble.
const NARROW = '(max-width: 1023px)';
function useNarrow() {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(NARROW); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => matchMedia(NARROW).matches,
  );
}

export default function App() {
  const [line, setLine] = useState<Line | null>(null);
  const [aboutFace, setAboutFace] = useState(false);
  const narrow = useNarrow();
  const bubbleOpen = aboutFace && !line;
  const talking = line !== null;

  const toggle = () => (talking ? stop(setLine) : say(intro, setLine));

  useEffect(() => {
    if (!aboutFace) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !(e.target as Element).closest('[aria-expanded], .bubble')) setAboutFace(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', close);
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('pointerdown', close); };
  }, [aboutFace]);

  return (
    <main className="mx-auto max-w-[620px] px-4 pb-24">
      <div className="relative -mx-4 h-[min(48vh,420px)] sm:-mx-16 sm:h-[min(62vh,520px)]">
        <Suspense fallback={null}>
          <Face onClick={toggle} label={talking ? 'Stop talking' : 'Talk to Ricardo'} aside={bubbleOpen && narrow} />
        </Suspense>

        {/* Speech bubble from the character, always beside the face and never over it:
            on wide screens it uses the empty space; on narrow ones the head steps aside first. */}
        {bubbleOpen && (
          <div className="bubble bubble-in absolute top-1/2 right-4 z-10 w-[calc(50%-1.5rem)] -translate-y-1/2 rounded-lg border border-white/10 bg-bg/95 p-3 text-left text-xs leading-relaxed text-muted shadow-2xl backdrop-blur sm:right-16 sm:w-[calc(50%-5rem)] sm:p-4 sm:text-sm lg:right-auto lg:left-[calc(50%+235px)] lg:w-64">
            <p>{nft.fact}</p>
            <a href={nft.href} target="_blank" rel="noreferrer" className="mt-3 inline-block text-fg hover:text-accent">
              View on OpenSea
            </a>
            <span className="absolute top-1/2 right-full -mr-px size-3 translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-white/10 bg-bg" />
          </div>
        )}
      </div>

      {/* One caption: who the face is, how to talk to it, and a bubble with its story. */}
      <div className="reveal relative mt-4 h-[3rem] text-center text-[15px]" style={{ animationDelay: '0.9s' }} aria-live="polite">
        {line ? (
          <p className="caption text-fg">{line.text}</p>
        ) : (
          <p className="text-muted">
            <span className="font-mono text-xs text-fg">{nft.name}</span>
            {' · tap to talk · '}
            <button
              type="button"
              onClick={() => setAboutFace((v) => !v)}
              aria-expanded={aboutFace}
              className="underline decoration-white/25 underline-offset-4 hover:text-fg"
            >
              read more
            </button>
          </p>
        )}
      </div>

      <header className="reveal mt-10" style={{ animationDelay: '1s' }}>
        <h1 className="text-sm text-muted">{bio.name}</h1>
        <p className="mt-3 text-xl leading-snug text-fg text-balance">{bio.hook}</p>
        <p className="mt-4 leading-relaxed text-muted">
          {about.map((seg, i) =>
            typeof seg === 'string' ? (
              seg
            ) : (
              <a
                key={i}
                href={seg.href}
                target="_blank"
                rel="noreferrer"
                className={`inline-link ${line?.highlight === seg.id ? 'inline-link-active' : ''}`}
              >
                {seg.text}
              </a>
            ),
          )}
        </p>
      </header>

      <Section title="Experience" items={work} active={line?.highlight} delay="1.1s" />
      <Section title="Building" items={projects} active={line?.highlight} delay="1.2s" />

      <section className="reveal mt-14" style={{ animationDelay: '1.3s' }}>
        <h2 className="mb-3 text-sm text-muted">Elsewhere</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <a key={l.id} href={l.href} target="_blank" rel="noreferrer" className="text-fg hover:text-accent">{l.title}</a>
          ))}
        </div>
      </section>

      <footer className="reveal mt-16 text-xs text-muted" style={{ animationDelay: '1.4s' }}>
        Built brick by brick, with a little help from AI.{' '}
        <a href="https://github.com/ramcav/me" target="_blank" rel="noreferrer" className="inline-link">
          See the source
        </a>
      </footer>
    </main>
  );
}
