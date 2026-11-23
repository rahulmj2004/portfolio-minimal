import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { achievements, featured, profile } from "@/content/site";
import { AskRahul } from "@/components/AskRahul";
import { ChatLauncher } from "@/components/ChatLauncher";
import { CopyEmail } from "@/components/CopyEmail";
import { HeroGrid } from "@/components/HeroGrid";
import { Reveal } from "@/components/Reveal";

const tools = ["Python", "Django", "React", "Next.js", "TensorFlow", "FastAPI"];

const services = [
  {
    title: "Healthcare AI",
    text: "Evidence-backed tools for pharmacists, doctors and patients — deterministic where it matters.",
    icon: (
      <>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        <path d="M7.5 12h2.5l1.5-2.5 2 4 1.5-1.5h2" />
      </>
    ),
  },
  {
    title: "Full-Stack Web",
    text: "Fast, accessible products with Next.js, React, Django and FastAPI, from idea to deploy.",
    icon: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />,
  },
  {
    title: "ML & Security",
    text: "Anomaly detection, federated learning and explainable models engineers can read.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Open Source",
    text: "Contributing to CARE, a Digital Public Good running in real hospitals.",
    icon: (
      <>
        <circle cx="7" cy="6" r="2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="8" r="2" />
        <path d="M7 8v8M17 10c0 4-10 2-10 6" />
      </>
    ),
  },
];

const recognition = achievements.filter((a) =>
  ["First Prize", "Second Prize", "National Finalist", "Open Source Contributor", "Smart India Hackathon"].includes(
    a.title,
  ),
);

function Icon({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M4 10L10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = true,
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  arrow?: boolean;
  external?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-ink text-white hover:bg-black"
      : "border border-line bg-white text-ink hover:border-ink/30";
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`btn inline-flex items-center gap-2 rounded-full px-[22px] py-3 text-sm font-medium ${styles}`}
    >
      {children}
      {arrow && <Arrow className="btn-arrow" />}
    </a>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold tracking-[0.14em] text-mute md:text-xs">{children}</p>;
}

/** Stacked card section: each one tucks under the previous card's rounded bottom. */
function Section({
  id,
  index,
  tone,
  last,
  className = "",
  children,
}: {
  id?: string;
  index: number;
  tone: "card" | "card-2";
  last?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const style: CSSProperties = { zIndex: 20 - index };
  return (
    <section
      id={id}
      style={style}
      className={`relative ${tone === "card" ? "bg-card" : "bg-card-2"} ${
        index > 0 ? "-mt-10 pt-10 md:-mt-14 md:pt-14" : ""
      } ${last ? "" : "rounded-b-[40px] md:rounded-b-[56px]"} ${className}`}
    >
      {children}
    </section>
  );
}

function Grey({ children }: { children: ReactNode }) {
  return <span className="text-dim">{children}</span>;
}

export default function Home() {
  const linkedin = profile.linkedin;
  return (
    <div className="px-0 py-0 md:px-6 md:py-12">
      <main className="mx-auto max-w-[1200px] overflow-hidden bg-card-2 md:rounded-[56px]">
        {/* HERO */}
        <Section index={0} tone="card" className="px-6 pb-14 pt-7 md:px-12 md:pb-26 md:pt-9">
          <HeroGrid />
          <header style={{ "--d": "0ms" } as CSSProperties} className="enter relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="hidden text-sm font-medium text-soft sm:inline">{profile.email}</span>
              <span className="text-base font-bold tracking-tight sm:hidden">{profile.name}</span>
              <span className="hidden sm:inline">
                <CopyEmail email={profile.email} />
              </span>
            </div>
            <nav className="flex items-center gap-3.5 text-sm font-medium text-soft">
              <a href={profile.github} target="_blank" rel="noreferrer" className="link hover:text-ink">
                GitHub
              </a>
              <span className="text-[#c4c4c0]">/</span>
              <a href={linkedin} target="_blank" rel="noreferrer" className="link hover:text-ink">
                LinkedIn
              </a>
              <span className="hidden text-[#c4c4c0] sm:inline">/</span>
              <a href={profile.resume} className="link hidden hover:text-ink sm:inline">
                Résumé
              </a>
            </nav>
          </header>

          <div className="relative mt-12 flex flex-col items-center text-center md:mt-18">
            <div style={{ "--d": "80ms" } as CSSProperties} className="enter relative">
              <Image
                src="/rahul.png"
                alt={`Portrait of ${profile.name}`}
                width={240}
                height={240}
                priority
                className="size-24 rounded-full object-cover object-top shadow-[0_10px_30px_rgba(22,22,22,0.12)] ring-4 ring-white md:size-30"
              />
              <span className="absolute -right-24 top-8 rotate-[10deg] rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.08)] md:-right-26 md:top-10">
                {profile.name} 👋
              </span>
            </div>

            <h1 style={{ "--d": "160ms" } as CSSProperties} className="enter relative mt-8 max-w-[840px] text-[34px] font-semibold leading-[1.13] tracking-[-0.03em] md:mt-9 md:text-[60px] md:leading-[1.12]">
              Building AI <Grey>products that are</Grey> honest about <Grey>what they know.</Grey>
            </h1>
            <p style={{ "--d": "240ms" } as CSSProperties} className="enter relative mt-4 max-w-md text-[15px] leading-relaxed text-mute md:mt-5 md:text-[17px]">
              Software engineer building where AI meets healthcare.
            </p>
            <div style={{ "--d": "320ms" } as CSSProperties} className="enter relative mt-7 md:mt-9">
              <ButtonLink href="#work">View my work</ButtonLink>
            </div>
          </div>
        </Section>

        {/* TOOLS */}
        <Section index={1} tone="card-2" className="px-6 pb-10 md:px-30 md:pb-16">
          <div data-reveal className="flex flex-col items-center gap-5 pt-8 md:gap-7 md:pt-4">
            <Eyebrow>TOOLS I SHIP WITH</Eyebrow>
            <ul className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-between">
              {tools.map((t) => (
                <li key={t} className="text-lg font-semibold tracking-tight text-faint md:text-[22px]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* SERVICES */}
        <Section index={2} tone="card" className="px-6 pb-16 md:px-30 md:pb-30">
          <div data-reveal className="pt-12 text-center md:pt-24">
            <h2 className="mx-auto max-w-xl text-[22px] font-semibold leading-[1.28] tracking-[-0.015em] md:text-[34px] md:leading-[1.25]">
              I work with <Grey>teams and founders</Grey> to ship software people can trust.
            </h2>
          </div>
          <div className="relative my-10 md:my-12" aria-hidden>
            <div className="h-px bg-line" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e2e2df] bg-white px-3 py-1 text-xs font-medium text-soft">
              Services
            </span>
          </div>
          <ul data-reveal className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4 md:gap-12">
            {services.map((s, i) => (
              <li key={s.title} className="svc" style={{ "--i": i } as CSSProperties}>
                <div className="svc-icon grid size-10 place-items-center rounded-xl bg-white text-ink">
                  <Icon>{s.icon}</Icon>
                </div>
                <h3 className="mt-3.5 text-[17px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-[1.55] text-mute">{s.text}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* WORK */}
        <Section id="work" index={3} tone="card-2" className="scroll-mt-6 px-6 pb-16 md:px-12 md:pb-30">
          <div data-reveal className="pt-12 md:px-3 md:pt-24">
            <Eyebrow>SELECTED WORK</Eyebrow>
            <h2 className="mt-2.5 text-[30px] font-semibold tracking-[-0.025em] md:text-[40px]">Things I’ve built</h2>
          </div>
          <ul data-reveal className="mt-6 grid gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
            {featured.map((p, i) => (
              <li key={p.slug} style={{ "--i": i } as CSSProperties}>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="card flex h-full flex-col gap-3 rounded-[28px] border border-[#ecece9] bg-white p-6 hover:border-line md:p-8"
                >
                  <div className="flex justify-between text-[13px] font-medium text-mute">
                    <span>{p.kind}</span>
                    <span>{p.year}</span>
                  </div>
                  <h3 className="flex items-center gap-2 text-[22px] font-semibold tracking-[-0.015em] md:text-[28px]">
                    {p.title}
                    <span className="card-arrow text-mute">
                      <Arrow />
                    </span>
                  </h3>
                  <p className="text-[15px] leading-[1.55] text-soft">{p.summary}</p>
                  <ul className="mt-auto flex flex-wrap gap-2 pt-1">
                    {p.tags.slice(0, 3).map((t) => (
                      <li key={t} className="rounded-full bg-chip px-3 py-1 text-xs font-medium text-soft">
                        {t}
                      </li>
                    ))}
                  </ul>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {/* RECOGNITION */}
        <Section index={4} tone="card" className="px-6 pb-16 md:px-30 md:pb-30">
          <div className="pt-12 md:pt-24">
            <Eyebrow>RECOGNITION</Eyebrow>
            <ul data-reveal className="mt-6 md:mt-7">
              {recognition.map((a, i) => (
                <li
                  key={a.title + a.org}
                  style={{ "--i": i } as CSSProperties}
                  className="row grid grid-cols-[56px_1fr] items-baseline gap-x-4 gap-y-1 border-t border-line py-5 md:grid-cols-[80px_1fr_auto] md:gap-x-6 md:py-6.5"
                >
                  <span className="text-[15px] font-medium text-mute">{a.year}</span>
                  <span className="row-title text-lg font-semibold tracking-[-0.01em] md:text-xl">{a.title}</span>
                  <span className="col-start-2 text-sm text-faint md:col-start-auto md:text-[15px]">{a.org}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ASK AI */}
        <Section id="ask" index={5} tone="card-2" className="px-6 pb-16 md:px-12 md:pb-28">
          <div data-reveal className="flex flex-col items-center pt-12 text-center md:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-soft">
              <span className="ai-dot" /> AI assistant
            </span>
            <h2 style={{ "--i": 1 } as CSSProperties} className="mt-5 text-[30px] font-semibold leading-[1.13] tracking-[-0.03em] md:text-5xl">
              Ask my portfolio
              <br />
              <Grey>anything.</Grey>
            </h2>
            <p style={{ "--i": 2 } as CSSProperties} className="mt-4 max-w-[480px] text-[15px] leading-[1.55] text-mute md:text-base">
              It answers only from my real résumé and projects, and says so when it doesn&apos;t know.
            </p>
            <div style={{ "--i": 3 } as CSSProperties} className="mt-8 w-full md:mt-10">
              <AskRahul />
            </div>
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contact" index={6} tone="card" last className="px-6 pb-8 md:px-12 md:pb-12">
          <div data-reveal className="flex flex-col items-center pt-14 text-center md:pt-30">
            <div className="grid size-18 place-items-center rounded-full border border-line bg-white md:size-22">
              <Icon size={32}>
                <path d="M4 4h16v12H8l-4 4V4Z" />
                <path d="M8 9h8M8 12h5" />
              </Icon>
            </div>
            <h2 style={{ "--i": 1 } as CSSProperties} className="mt-6 text-[30px] font-semibold leading-[1.13] tracking-[-0.03em] md:mt-8 md:text-5xl">
              Tell me about your
              <br />
              <Grey>next project</Grey>
            </h2>
            <div style={{ "--i": 2 } as CSSProperties} className="mt-6 flex flex-wrap justify-center gap-2.5 md:mt-9 md:gap-3">
              <ButtonLink href={`mailto:${profile.email}`}>Email me</ButtonLink>
              <ButtonLink href={linkedin} variant="secondary" external>
                LinkedIn
              </ButtonLink>
            </div>
          </div>
          <footer className="mt-14 flex flex-wrap justify-between gap-2 border-t border-line pt-5 text-[13px] font-medium text-mute md:mt-24 md:pt-6">
            <span>© {new Date().getFullYear()} {profile.name}</span>
            <span>{profile.location}</span>
          </footer>
        </Section>
      </main>
      <Reveal />
      <ChatLauncher />
    </div>
  );
}
