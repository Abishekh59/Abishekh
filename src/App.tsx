import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSEO } from './seo/useSEO'
import {
  buildPersonSchema,
  buildWebSiteSchema,
  buildWebPageSchema,
  buildPortfolioSchema,
} from './seo/schema'
import abishekharImg from './imports/Abiskark_Joshi.webp'
import damakImg from './imports/Damak_Music_Circle_.webp'
import sachinImg from './imports/Sachin Yagol Shrestha.webp'
import heroImg from './photography/Landscape/1786773923331.webp'
import aboutImg from './AbishekforAbout.webp'

// ─── Types ───────────────────────────────────────────────────────────────────

type Collection = 'Portrait' | 'Landscape' | 'Culture' | 'Street' | 'Wedding' | 'Concerts' | 'AI'

interface GalleryItem {
  id: string
  url: string
  thumb: string
  alt: string
  title: string
  subtitle: string
  year: string
  location: string
  aspect: string // CSS aspect-ratio value, e.g. '2/3'
  collection: Collection
}

// ─── Shuffle helper ──────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── All gallery images ──────────────────────────────────────────────────────

const localImagesGlob = import.meta.glob('./photography/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}', { eager: true });
const localImages: Record<string, string> = Object.fromEntries(
  Object.entries(localImagesGlob).map(([k, v]) => {
    const url = typeof v === 'string' ? v : (v as { default: string }).default
    return [k, url]
  })
);
const localImagePaths = Object.values(localImages).filter(Boolean);

const VALID_COLLECTIONS: Collection[] = ['Portrait', 'Landscape', 'Culture', 'Street', 'Wedding', 'Concerts', 'AI'];

const ALL_IMAGES: GalleryItem[] = Object.entries(localImages).map(([path, url], i) => {
  const parts = path.split('/');
  const folderName = parts[2] || '';
  const category = VALID_COLLECTIONS.find(
    (c) => c.toLowerCase() === folderName.toLowerCase()
  ) || 'Portrait';

  return {
    id: `img-${i}`,
    url: url,
    thumb: url,
    alt: `${category} photography image ${i + 1}`,
    title: `Capture ${String(i + 1).padStart(2, '0')}`,
    subtitle: `${category} Photography`,
    year: '2026',
    location: 'Nepal',
    aspect: i % 3 === 0 ? '2/3' : '3/2',
    collection: category,
  };
});

const HERO_SLIDES = localImagePaths.length > 0 
  ? localImagePaths.slice(0, Math.min(6, localImagePaths.length)).map(url => ({ url, alt: 'Hero image' }))
  : [{ url: '', alt: 'Placeholder' }];

const MARQUEE_SET = ALL_IMAGES.filter(item => item.collection !== 'AI');

// ─── Cursor ───────────────────────────────────────────────────────────────────

function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [bloom, setBloom] = useState(false)
  const rafId = useRef<number>(0)

  useEffect(() => {
    let mx = 0, my = 0
    const tick = () => {
      if (ref.current) ref.current.style.transform = `translate3d(${mx}px,${my}px,0)`
    }
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(tick)
    }
    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a,button,[data-hover]')) setBloom(true)
    }
    const out = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('a,button,[data-hover]')) setBloom(false)
    }
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over)
    window.addEventListener('mouseout', out)
    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mouseout', out)
    }
  }, [])

  // Camera icon — body colour and size stay constant
  const size = 22
  const col = '#1a1a1a'

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'transform',
        // offset so the lens centre (≈60% down, 50% across) is the hotspot
        marginLeft: -size * 0.5,
        marginTop: -size * 0.6,
        transition: 'margin .35s cubic-bezier(.25,1,.5,1)',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ display: 'block', transition: 'width .35s cubic-bezier(.25,1,.5,1), height .35s cubic-bezier(.25,1,.5,1)' }}
      >
        {/* Camera body */}
        <rect x="1" y="6" width="22" height="15" rx="2" ry="2"
          fill={col}
          style={{ transition: 'fill .35s ease' }}
        />
        {/* Viewfinder notch */}
        <path d="M9 6l1.5-3h3L15 6" fill={col} style={{ transition: 'fill .35s ease' }} />
        {/* Lens ring outer */}
        <circle cx="12" cy="13" r="4.5"
          fill="rgba(255,255,255,.15)"
          stroke="rgba(255,255,255,.6)"
          strokeWidth="1.2"
          style={{ transition: 'all .35s ease' }}
        />
        {/* Lens ring inner */}
        <circle cx="12" cy="13" r="2.2"
          fill="rgba(255,255,255,.25)"
          style={{ transition: 'fill .35s ease' }}
        />
        {/* Flash dot */}
        <circle cx="19" cy="9" r="1"
          fill="rgba(255,255,255,.5)"
          style={{ transition: 'fill .35s ease' }}
        />
      </svg>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Photography', href: '#photography' },
  { label: 'Films', href: '#films' },
  { label: 'Contact', href: '#contact' },
]

function Nav({ onNav }: { onNav: (href: string) => void }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 70)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault(); setOpen(false); onNav(href)
  }

  const textColor = solid ? '#111111' : '#ffffff'

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 40px',
          background: solid ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: solid ? 'blur(16px)' : 'none',
          borderBottom: solid ? '1px solid rgba(0,0,0,.07)' : 'none',
          transition: 'background .5s, backdrop-filter .5s',
        }}
      >
        <a href="#top" onClick={(e) => go(e, '#top')} style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: textColor, fontSize: 'clamp(.78rem,1.2vw,.9rem)', letterSpacing: '.28em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color .5s' }}>
          Abishekh Joshi
        </a>
        <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 }} className="hidden md:flex">
          {NAV.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: textColor, fontSize: '.68rem', letterSpacing: '.38em', textTransform: 'uppercase', textDecoration: 'none', opacity: solid ? 0.5 : 0.75, transition: 'opacity .35s, color .5s' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '1')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = solid ? '.5' : '.75')}
              >{l.label}</a>
            </li>
          ))}
        </ul>
        <button className="md:hidden" onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: textColor, fontSize: 22, transition: 'color .5s' }}>≡</button>
      </nav>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: '#f4f1ec', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 24, right: 36, background: 'none', border: 'none', color: '#111111', fontSize: 28 }}>×</button>
          {NAV.map((l) => (
            <a key={l.label} href={l.href} onClick={(e) => go(e, l.href)} style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#111111', fontSize: '2.2rem', textDecoration: 'none' }}>{l.label}</a>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="top" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#f4f1ec' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <img src={heroImg} alt="Hero image" loading="eager" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#dedad4' }} />
      </div>

      {/* Gradient */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', background: 'linear-gradient(to bottom,rgba(8,8,8,.82) 0%,rgba(8,8,8,.08) 32%,rgba(8,8,8,.04) 58%,rgba(8,8,8,.88) 100%)' }} />

      {/* Identity — bottom left */}
      <div style={{ position: 'absolute', bottom: 68, left: 44, zIndex: 10, maxWidth: 580 }}>
        <p style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: '#c9a96e', fontSize: '.66rem', letterSpacing: '.55em', textTransform: 'uppercase', marginBottom: 16 }}>
          Photography · Films · Design
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#ffffff', fontSize: 'clamp(2.6rem,7vw,5.8rem)', lineHeight: .92, textTransform: 'uppercase', letterSpacing: '-.01em', marginBottom: 20 }}>
          Light finds<br />its subject.
        </h1>
        <p style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#ffffff', fontSize: 'clamp(.85rem,1.4vw,1.05rem)', fontStyle: 'italic', opacity: .8 }}>
          Visual Storyteller &nbsp;·&nbsp; Kathmandu, Nepal
        </p>
      </div>

      {/* Scroll cue */}
      <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: "'DM Sans'", color: '#ffffff', fontSize: '.6rem', letterSpacing: '.45em', textTransform: 'uppercase', opacity: .5 }}>Scroll</span>
        <div style={{ width: 1, height: 42, background: 'rgba(255,255,255,.2)', overflow: 'hidden' }}>
          <div className="scroll-cue-line" style={{ width: '100%', height: '100%', background: '#c9a96e' }} />
        </div>
      </div>
    </section>
  )
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

function Marquee({ onImageClick }: { onImageClick: (item: GalleryItem) => void }) {
  const imgs = [...MARQUEE_SET, ...MARQUEE_SET]
  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,.09)', borderBottom: '1px solid rgba(0,0,0,.09)', overflow: 'hidden', padding: '10px 0' }}>
      <div className="marquee-wrap" style={{ overflow: 'hidden' }}>
        <div className="marquee-track" style={{ display: 'flex', gap: 8, width: 'max-content' }}>
          {imgs.map((item, i) => (
            <div key={i} data-hover onClick={() => onImageClick(item)} style={{ flexShrink: 0, width: i % 3 === 0 ? 220 : 310, height: 150, overflow: 'hidden', background: '#dedad4', position: 'relative', cursor: 'none' }}>
              <img src={item.url} alt={item.alt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(1)', transition: 'filter .65s ease,transform .65s ease', transform: 'scale(1)', willChange: 'transform, filter' }}
                onMouseEnter={(e) => { const img = e.currentTarget; img.style.filter = 'grayscale(0)'; img.style.transform = 'scale(1.05)' }}
                onMouseLeave={(e) => { const img = e.currentTarget; img.style.filter = 'grayscale(1)'; img.style.transform = 'scale(1)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Gallery card ─────────────────────────────────────────────────────────────

function GCard({ item, onOpen }: { item: GalleryItem; onOpen: (i: GalleryItem) => void }) {
  const [h, setH] = useState(false)
  return (
    <div
      id={item.id}
      data-hover
      onClick={() => onOpen(item)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: 'relative',
        breakInside: 'avoid',
        marginBottom: 10,
        overflow: 'hidden',
        background: '#dedad4',
        cursor: 'none',
        borderRadius: 0,
        // Pinterest: no fixed aspect — image determines the height
      }}
    >
      <img
        src={item.url}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          transform: h ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform .65s cubic-bezier(.25,1,.5,1)',
          willChange: 'transform',
          // Sharp edges — no border-radius ever
          borderRadius: 0,
        }}
      />
      {/* Pinterest hover card — slides up from bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top,rgba(8,8,8,.96) 0%,rgba(8,8,8,.35) 40%,rgba(8,8,8,.0) 68%)',
          opacity: h ? 1 : 0,
          transition: 'opacity .5s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '18px 16px 16px',
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans'",
            color: '#c9a96e',
            fontSize: '.58rem',
            letterSpacing: '.42em',
            textTransform: 'uppercase',
            marginBottom: 5,
            transform: h ? 'translateY(0)' : 'translateY(8px)',
            transition: 'transform .5s ease',
          }}
        >
          {item.collection} · {item.year}
        </p>
        <h3
          style={{
            fontFamily: "'DM Serif Display',Georgia,serif",
            color: '#111111',
            fontSize: 'clamp(.9rem,1.8vw,1.2rem)',
            lineHeight: 1.1,
            transform: h ? 'translateY(0)' : 'translateY(10px)',
            transition: 'transform .5s ease .035s',
            marginBottom: 4,
          }}
        >
          {item.title}
        </h3>
        <p
          style={{
            fontFamily: "'DM Sans'",
            color: 'rgba(11,11,11,.45)',
            fontSize: '.62rem',
            letterSpacing: '.06em',
            transform: h ? 'translateY(0)' : 'translateY(10px)',
            transition: 'transform .5s ease .07s',
          }}
        >
          {item.location}
        </p>
      </div>
    </div>
  )
}

// ─── Photography section ──────────────────────────────────────────────────────

const TABS = ['All', 'Portrait', 'Landscape', 'Culture', 'Street', 'Wedding', 'Concerts', 'AI'] as const

function Photography({ onOpen, tab, setTab }: { onOpen: (i: GalleryItem) => void; tab: typeof TABS[number]; setTab: (t: typeof TABS[number]) => void }) {

  // Shuffle once on mount, re-shuffle when tab changes
  const shuffled = useMemo(
    () => shuffle(tab === 'All' ? ALL_IMAGES : ALL_IMAGES.filter(i => i.collection === tab)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab]
  )

  return (
    <section id="photography" style={{ padding: 'clamp(56px,7vw,110px) clamp(18px,4vw,64px)', borderTop: '1px solid rgba(0,0,0,.09)' }}>
      <p style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.66rem', letterSpacing: '.52em', textTransform: 'uppercase', marginBottom: 10 }}>03 — Through the Lens</p>
      <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#111111', fontSize: 'clamp(2rem,5vw,4rem)', lineHeight: .95, marginBottom: 14 }}>Photography</h2>
      <p style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.9rem', lineHeight: 1.75, maxWidth: 480, marginBottom: 32 }}>
        Capturing mountains, heritage and people — through a curious eye.
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 32 }}>
        {TABS.map((t) => {
          const active = tab === t
          return (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: "'DM Sans'", fontSize: '.66rem', letterSpacing: '.32em', textTransform: 'uppercase', padding: '8px 18px', border: '1px solid', borderColor: active ? '#c9a96e' : 'rgba(0,0,0,.12)', background: active ? '#c9a96e' : 'transparent', color: active ? '#111111' : '#6b6b6b', transition: 'all .35s ease', cursor: 'none' }}>{t}</button>
          )
        })}
      </div>

      {/* Pinterest masonry — natural image heights, 1→2→3 cols */}
      <div className="pin-grid">
        {shuffled.map((item) => <GCard key={item.id + tab} item={item} onOpen={onOpen} />)}
      </div>
    </section>
  )
}

// ─── Work section ─────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    img: abishekharImg,
    title: 'Abishkar Joshi',
    subtitle: 'Personal Portfolio Website',
    description:
      'Cinematic visual portfolio — designed and built from scratch. Fullscreen hero, crossfading slideshow, masonry gallery, and gallery-room modal. Built with React, Tailwind CSS, and deployed on Vercel.',
    tags: ['UX/UI', 'Web Design', 'React', 'Photography'],
    label: 'Live · 2026',
    url: 'https://abishkar-joshi.vercel.app/',
    year: '2025',
    role: 'Designer & Developer',
  },
  {
    img: sachinImg,
    title: 'Sachin Yagol Shrestha',
    subtitle: 'Personal Portfolio Website',
    description:
      'Portfolio website for Sachin Yagol Shrestha. Designed and developed to showcase work and skills with a clean, modern aesthetic.',
    tags: ['Web Design', 'UX/UI', 'Portfolio'],
    label: 'Live · 2026',
    url: 'https://www.sachinyagolshrestha.com.np/',
    year: '2024',
    role: 'Designer & Developer',
  },
  {
    img: damakImg,
    title: 'Damak Music Circle',
    subtitle: 'Music School · Damak, Nepal',
    description:
      'Full website for Damak Music Circle — a music school nurturing talent since 2018. Covers admissions, scholarship applications, studio booking, instrument store, and gallery. Dark gold editorial aesthetic.',
    tags: ['Web Design', 'Branding', 'UX/UI', 'Nepal'],
    label: 'Live · 2026',
    url: 'https://www.damakmusiccircle.com/',
    year: '2024',
    role: 'Designer & Developer',
  },
]

function WorkCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Screenshot */}
      <div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          data-hover
          style={{ display: 'block', overflow: 'hidden', position: 'relative' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={project.img}
            alt={`Screenshot of ${project.title}`}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              transform: hovered ? 'scale(1.025)' : 'scale(1)',
              transition: 'transform .7s cubic-bezier(.25,1,.5,1)',
              willChange: 'transform',
              borderRadius: 0,
              border: '1px solid rgba(0,0,0,.04)',
            }}
          />
          {/* "Visit site" overlay on hover */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(8,8,8,.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity .45s ease',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid rgba(201,169,110,.8)',
              padding: '10px 20px',
              background: 'rgba(8,8,8,.5)',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.6rem', letterSpacing: '.38em', textTransform: 'uppercase' }}>
                Visit Site
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6h10M6 1l5 5-5 5" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Text col */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Index + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.55rem', letterSpacing: '.4em', textTransform: 'uppercase' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ width: 24, height: '1px', background: '#c9a96e', flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.55rem', letterSpacing: '.3em', textTransform: 'uppercase' }}>
            {project.label}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#111111', fontSize: 'clamp(1.4rem,2vw,1.8rem)', lineHeight: 1.1, marginBottom: 6 }}>
          {project.title}
        </h3>
        <p style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#6b6b6b', fontSize: 'clamp(.8rem,1vw,.9rem)', fontStyle: 'italic', marginBottom: 16 }}>
          {project.subtitle}
        </p>

        {/* Description */}
        <p style={{ fontFamily: "'DM Sans'", color: '#5a5a5a', fontSize: 'clamp(.78rem,1vw,.85rem)', lineHeight: 1.7, marginBottom: 20, flexGrow: 1 }}>
          {project.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {project.tags.map((t) => (
            <span key={t} style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.55rem', letterSpacing: '.25em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid rgba(0,0,0,.1)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* CTA & Meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(0,0,0,.08)', paddingTop: 16 }}>
          <div>
            <p style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.5rem', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 2 }}>{project.role}</p>
            <p style={{ fontFamily: "'DM Sans'", color: '#111111', fontSize: '.75rem' }}>{project.year}</p>
          </div>
          
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            data-hover
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'DM Sans'",
              color: '#111111',
              fontSize: '.6rem',
              letterSpacing: '.3em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              paddingBottom: 2,
              borderBottom: '1px solid rgba(0,0,0,.25)',
              transition: 'color .35s, border-color .35s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = '#c9a96e'
              el.style.borderBottomColor = '#c9a96e'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = '#111111'
              el.style.borderBottomColor = 'rgba(0,0,0,.25)'
            }}
          >
            Visit
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
              <path d="M1 5.5h9M5.5 1l4.5 4.5L5.5 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
}

function Work() {
  return (
    <section id="work" style={{ padding: 'clamp(56px,7vw,110px) clamp(18px,4vw,64px)', borderTop: '1px solid rgba(0,0,0,.09)' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 'clamp(40px,6vw,72px)' }}>
        <div>
          <p style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.66rem', letterSpacing: '.52em', textTransform: 'uppercase', marginBottom: 10 }}>02 — Selected Work</p>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#111111', fontSize: 'clamp(2rem,5vw,4rem)', lineHeight: .95 }}>Live Projects</h2>
        </div>
        <p style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.88rem', lineHeight: 1.75, maxWidth: 360 }}>
          Designed and shipped end-to-end — from research to deployment.
        </p>
      </div>

      {/* Project list */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {PROJECTS.map((p, i) => <WorkCard key={p.title} project={p} index={i} />)}
      </div>
    </section>
  )
}



// ─── About ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section
      id="about"
      style={{
        borderTop: '1px solid rgba(0,0,0,.09)',
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT: text ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(52px,7vw,96px) clamp(20px,5vw,72px)',
          minHeight: '100vh',
        }}
      >
        {/* Top: eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 'clamp(40px,6vw,80px)' }}>
          <p style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.62rem', letterSpacing: '.52em', textTransform: 'uppercase' }}>
            01 — About
          </p>
          {/* Pulsing available badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid rgba(201,169,110,.25)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a96e', boxShadow: '0 0 7px rgba(201,169,110,.8)', display: 'block', flexShrink: 0 }} />
            <span style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.58rem', letterSpacing: '.38em', textTransform: 'uppercase' }}>Available · 2026</span>
          </div>
        </div>

        {/* Middle: giant name + bio */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Large name — matches reference */}
          <h1
            style={{
              fontFamily: "'DM Serif Display',Georgia,serif",
              color: '#111111',
              fontSize: 'clamp(3.2rem,9vw,8.5rem)',
              lineHeight: .9,
              letterSpacing: '-.025em',
              marginBottom: 'clamp(32px,5vw,56px)',
            }}
          >
            Abishekh<br />Joshi
          </h1>

          {/* Sub-label */}
          <p style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.68rem', letterSpacing: '.38em', textTransform: 'uppercase', marginBottom: 28 }}>
            UX/UI Designer &nbsp;·&nbsp; Photographer &nbsp;·&nbsp; Kathmandu
          </p>

          {/* Bio paragraphs — compact, like the reference */}
          <div style={{ maxWidth: 460 }}>
            <p style={{ fontFamily: "'DM Sans'", color: 'rgba(11,11,11,.58)', fontSize: 'clamp(.84rem,1.1vw,.95rem)', lineHeight: 1.85, marginBottom: 18 }}>
              Hello, I'm Abishekh.<br />
              I'm a UX/UI designer &amp; photographer based in Kathmandu, Nepal,
              blending visual storytelling with functional design to create
              experiences that feel personal and purposeful.
            </p>
            <p style={{ fontFamily: "'DM Sans'", color: 'rgba(11,11,11,.38)', fontSize: 'clamp(.82rem,1vw,.92rem)', lineHeight: 1.85, marginBottom: 0 }}>
              My work spans user interface design, brand identity, and photography —
              with a technical foundation in Information Technology. Currently open
              to internships, freelance projects, and meaningful collaborations.
            </p>
          </div>
        </div>

        {/* Bottom: social links — underlined like the reference */}
        <div style={{ display: 'flex', gap: 32, marginTop: 'clamp(40px,6vw,72px)', paddingTop: 28, borderTop: '1px solid rgba(0,0,0,.08)', flexWrap: 'wrap' }}>
          {[
            { label: 'Instagram', href: 'https://www.instagram.com/abishek_joshi_/' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abishekh-joshi-41135a2a0/' },
            { label: 'Facebook', href: 'https://www.facebook.com/abishek.joshi.79' },
            { label: 'TikTok', href: 'https://www.tiktok.com/@abishekjoshi59' },
            { label: 'WhatsApp', href: 'https://wa.me/9779815025634' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{
                fontFamily: "'DM Sans'",
                color: 'rgba(11,11,11,.5)',
                fontSize: '.78rem',
                letterSpacing: '.06em',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(0,0,0,.2)',
                paddingBottom: 3,
                transition: 'color .35s, border-color .35s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#c9a96e'
                el.style.borderBottomColor = '#c9a96e'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'rgba(11,11,11,.5)'
                el.style.borderBottomColor = 'rgba(0,0,0,.2)'
              }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── RIGHT: portrait image ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
        }}
      >
        <img
          src={aboutImg}
          alt="Abishekh Joshi portrait"
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: 'grayscale(12%)',
            transition: 'transform .8s cubic-bezier(.25,.46,.45,.94)',
            willChange: 'transform',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
        />
        {/* Subtle left-side gradient so the image blends into the text column */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(255,255,255,.18) 0%, transparent 25%)',
            pointerEvents: 'none',
          }}
        />
        {/* Subtle gold accent bar at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(to right, transparent, #c9a96e 40%, transparent)',
          }}
        />
      </div>

    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────

// Service definitions — each drives the left panel content dynamically
const SERVICES = [
  {
    id: 'photography',
    label: 'Photography',
    heading: 'Book a\nPhotoshoot',
    tagline: 'Portrait · Concert · Culture · Wedding · Landscape',
    description:
      'From intimate portraits to large-scale concert coverage — let\'s capture something that lasts.',
    duration: '1–4 hours on location',
    delivery: '5–7 business days',
    placeholder: 'Describe the shoot — occasion, location, mood, number of people…',
    subjectLabel: 'New Photography Booking',
    index: '01',
  },
  {
    id: 'editing',
    label: 'Video Editing',
    heading: 'Video\nEditing',
    tagline: 'Music Videos · Short Films · Reels · Docs',
    description:
      'Cinematic cuts, colour grades, and motion work for music artists, brands, and creators.',
    duration: 'Project-dependent',
    delivery: '3–10 business days',
    placeholder: 'Share your footage details, style references, platform, and deadline…',
    subjectLabel: 'New Video Editing Project',
    index: '02',
  },
  {
    id: 'design',
    label: 'Web Design',
    heading: 'Website\nDesign',
    tagline: 'Portfolio · Brand · Business · School',
    description:
      'End-to-end design and development — from wireframe to deployed, live website.',
    duration: '30–45 min discovery call',
    delivery: '2–4 weeks per project',
    placeholder: 'Tell me about your business, goals, pages needed, and any reference sites you like…',
    subjectLabel: 'New Website Design Project',
    index: '03',
  },
  {
    id: 'other',
    label: 'Something else',
    heading: 'Let\'s Talk\nCraft',
    tagline: 'Collaboration · Licensing · Just a chat',
    description:
      'Not sure which service fits? Drop a message and we\'ll figure it out together.',
    duration: 'Flexible',
    delivery: 'Depends on scope',
    placeholder: 'Tell me what\'s on your mind…',
    subjectLabel: 'New Inquiry from Portfolio',
    index: '04',
  },
] as const

type ServiceId = typeof SERVICES[number]['id']

function Contact() {
  const [serviceId, setServiceId] = useState<ServiceId>('photography')
  const [form, setForm] = useState({ name: '', phone: '', date: '', brief: '' })
  const [focused, setFocused] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const service = SERVICES.find(s => s.id === serviceId)!

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid',
    borderColor: focused === field ? 'rgba(201,169,110,.55)' : 'rgba(255,255,255,.08)',
    color: '#f0ede8',
    fontFamily: "'DM Sans',system-ui,sans-serif",
    fontSize: '.88rem',
    padding: '14px 16px',
    outline: 'none',
    transition: 'border-color .35s',
    borderRadius: 0,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  })

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans',system-ui,sans-serif",
    color: 'rgba(240,237,232,.38)',
    fontSize: '.55rem',
    letterSpacing: '.42em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 7,
  }

  const handleWhatsApp = () => {
    if (!form.name.trim() || !form.brief.trim()) return
    const lines = [
      `Hi Abishekh,`,
      `Service: ${service.label}`,
      `Name: ${form.name}`,
      form.phone ? `Phone: ${form.phone}` : '',
      form.date ? `Preferred date: ${form.date}` : '',
      ``,
      form.brief,
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/9779815025634?text=${encodeURIComponent(lines)}`, '_blank')
  }

  if (sent) {
    return (
      <section id="contact" style={{ position: 'relative', background: '#0a0a0a', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(to right,transparent,rgba(201,169,110,.25),transparent)' }} />
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ width: 56, height: 56, border: '1px solid rgba(201,169,110,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#f0ede8', fontSize: 'clamp(1.8rem,4vw,3rem)', lineHeight: 1, marginBottom: 14, fontStyle: 'italic' }}>Message sent.</h2>
          <p style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.4)', fontSize: '.9rem', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 32px' }}>
            I'll confirm your enquiry personally — usually within a day. Check WhatsApp for a quicker reply.
          </p>
          <button
            data-hover
            onClick={() => { setSent(false); setForm({ name: '', phone: '', date: '', brief: '' }) }}
            style={{ fontFamily: "'DM Sans'", fontSize: '.6rem', letterSpacing: '.38em', textTransform: 'uppercase', padding: '13px 28px', background: 'transparent', color: '#c9a96e', border: '1px solid rgba(201,169,110,.35)', cursor: 'none', transition: 'border-color .35s' }}
          >
            Send another
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      id="contact"
      style={{ position: 'relative', background: '#0a0a0a', padding: 'clamp(64px,8vw,120px) clamp(18px,4vw,64px)', overflow: 'hidden' }}
    >
      {/* Watermark */}
      <div style={{ position: 'absolute', top: '-4%', right: '-2%', fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(12rem,24vw,22rem)', color: 'rgba(255,255,255,.016)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>05</div>
      {/* Top gold rule */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(to right,transparent,rgba(201,169,110,.25),transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Section header ── */}
        <div style={{ marginBottom: 'clamp(36px,5vw,60px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.58rem', letterSpacing: '.52em', textTransform: 'uppercase' }}>05 — Work With Me</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(201,169,110,.12)' }} />
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#f0ede8', fontSize: 'clamp(2.2rem,5.5vw,4.4rem)', lineHeight: .92, fontStyle: 'italic', marginBottom: 0 }}>
            Let's Create<br />Together
          </h2>
        </div>

        {/* ── Service selector tabs ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'clamp(28px,4vw,48px)' }}>
          {SERVICES.map(s => {
            const active = s.id === serviceId
            return (
              <button
                key={s.id}
                data-hover
                onClick={() => setServiceId(s.id)}
                style={{
                  fontFamily: "'DM Sans'",
                  fontSize: '.6rem',
                  letterSpacing: '.34em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  border: '1px solid',
                  borderColor: active ? '#c9a96e' : 'rgba(255,255,255,.1)',
                  background: active ? 'rgba(201,169,110,.1)' : 'transparent',
                  color: active ? '#c9a96e' : 'rgba(240,237,232,.45)',
                  cursor: 'none',
                  transition: 'all .3s ease',
                }}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* ── Two-panel card ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', border: '1px solid rgba(255,255,255,.07)' }} className="contact-booking-grid">

          {/* LEFT panel — service details, changes with selection */}
          <div
            style={{
              background: 'rgba(201,169,110,.06)',
              borderRight: '1px solid rgba(255,255,255,.07)',
              padding: 'clamp(28px,4vw,52px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 36,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Corner index */}
            <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: "'DM Serif Display',Georgia,serif", color: 'rgba(201,169,110,.18)', fontSize: 'clamp(2.4rem,5vw,4rem)', lineHeight: 1, userSelect: 'none' }}>
              {service.index}
            </div>

            <div>
              {/* Eyebrow */}
              <p style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.55rem', letterSpacing: '.48em', textTransform: 'uppercase', marginBottom: 20 }}>
                Personalised Session
              </p>
              {/* Heading — splits on \n */}
              <h3 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#f0ede8', fontSize: 'clamp(1.9rem,4vw,3rem)', lineHeight: .96, marginBottom: 12 }}>
                {service.heading.split('\n').map((line, i) => (
                  <span key={i} style={{ display: 'block', fontStyle: i === 1 ? 'italic' : 'normal' }}>{line}</span>
                ))}
              </h3>
              {/* Tagline */}
              <p style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.35)', fontSize: '.65rem', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 20 }}>
                {service.tagline}
              </p>
              {/* Description */}
              <p style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.5)', fontSize: '.88rem', lineHeight: 1.75 }}>
                {service.description}
              </p>
            </div>

            {/* Meta rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 24 }}>
              {[
                { k: 'Duration', v: service.duration },
                { k: 'Delivery', v: service.delivery },
                { k: 'Location', v: 'Kathmandu or remote' },
              ].map(({ k, v }, i) => (
                <div key={k}>
                  {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '14px 0' }} />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.28)', fontSize: '.56rem', letterSpacing: '.38em', textTransform: 'uppercase' }}>{k}</span>
                    <span style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.65)', fontSize: '.8rem' }}>{v}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'joshiabishek987@gmail.com', href: 'mailto:joshiabishek987@gmail.com' },
                { label: '+977 9815025634', href: 'tel:+9779815025634' },
              ].map(item => (
                <a key={item.label} href={item.href} data-hover style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.38)', fontSize: '.78rem', textDecoration: 'none', transition: 'color .3s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c9a96e')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,.38)')}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT panel — form */}
          <div style={{ background: 'rgba(255,255,255,.02)', padding: 'clamp(28px,4vw,52px)', backdropFilter: 'blur(10px)' }}>

            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 30 }}>
              <span className="contact-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e', display: 'block', flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Sans'", color: 'rgba(201,169,110,.65)', fontSize: '.54rem', letterSpacing: '.38em', textTransform: 'uppercase' }}>
                Open to new projects · 2026
              </span>
            </div>

            <p style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#f0ede8', fontSize: 'clamp(1rem,2vw,1.3rem)', marginBottom: 26, lineHeight: 1.3 }}>
              Tell me about your {service.id === 'other' ? 'idea' : 'project'}
            </p>

            <form
              action="https://formsubmit.co/joshiabishek987@gmail.com"
              method="POST"
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              onSubmit={() => setTimeout(() => setSent(true), 200)}
            >
              <input type="hidden" name="_subject" value={service.subjectLabel} />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="service" value={service.label} />

              {/* Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text" name="name" placeholder="e.g. Abishekh Joshi" required
                  style={inputStyle('name')} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                />
              </div>

              {/* Phone + Date — side by side on wider screens */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="contact-row-grid">
                <div>
                  <label style={labelStyle}>Phone / WhatsApp</label>
                  <input
                    type="tel" name="phone" placeholder="+977 98XXXXXXXX"
                    style={inputStyle('phone')} value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Preferred Date</label>
                  <input
                    type="date" name="date"
                    style={{ ...inputStyle('date'), colorScheme: 'dark' }} value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    onFocus={() => setFocused('date')} onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              {/* Brief */}
              <div>
                <label style={labelStyle}>Project Brief</label>
                <textarea
                  name="brief" rows={5} required
                  placeholder={service.placeholder}
                  style={{ ...inputStyle('brief'), resize: 'none' }}
                  value={form.brief}
                  onChange={e => setForm({ ...form, brief: e.target.value })}
                  onFocus={() => setFocused('brief')} onBlur={() => setFocused(null)}
                />
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {/* Email submit */}
                <button
                  type="submit"
                  data-hover
                  style={{ flex: 1, fontFamily: "'DM Sans'", fontSize: '.62rem', letterSpacing: '.4em', textTransform: 'uppercase', padding: '16px 20px', background: '#c9a96e', color: '#0a0a0a', border: 'none', cursor: 'none', fontWeight: 500, transition: 'background .35s, transform .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#dfc088'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#c9a96e'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  Confirm Request
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M6 1l5 5-5 5" stroke="#0a0a0a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {/* WhatsApp shortcut */}
                <button
                  type="button"
                  data-hover
                  onClick={handleWhatsApp}
                  title="Send via WhatsApp instead"
                  style={{ fontFamily: "'DM Sans'", fontSize: '.62rem', letterSpacing: '.38em', textTransform: 'uppercase', padding: '16px 20px', background: 'transparent', color: '#f0ede8', border: '1px solid rgba(255,255,255,.1)', cursor: 'none', transition: 'border-color .35s, color .35s, transform .25s', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(201,169,110,.45)'; el.style.color = '#c9a96e'; el.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,.1)'; el.style.color = '#f0ede8'; el.style.transform = 'translateY(0)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
              </div>

              <p style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.2)', fontSize: '.58rem', textAlign: 'center', marginTop: 2 }}>
                No payment required · Your details remain private
              </p>
            </form>
          </div>

        </div>

        {/* ── Social row below the card ── */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Instagram', href: 'https://www.instagram.com/abishek_joshi_/' },
            { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/abishekh-joshi-41135a2a0/' },
            { label: 'Facebook',  href: 'https://www.facebook.com/abishek.joshi.79' },
            { label: 'TikTok',    href: 'https://www.tiktok.com/@abishekjoshi59' },
            { label: 'WhatsApp',  href: 'https://wa.me/9779815025634' },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" data-hover
              style={{ fontFamily: "'DM Sans'", color: 'rgba(240,237,232,.25)', fontSize: '.58rem', letterSpacing: '.32em', textTransform: 'uppercase', textDecoration: 'none', padding: '8px 14px', border: '1px solid rgba(255,255,255,.06)', transition: 'color .3s, border-color .3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a96e'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,232,.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.06)' }}
            >
              {s.label}
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}


// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  const [phase, setPhase] = useState<'out' | 'black' | 'in'>('out')

  useEffect(() => {
    if (item) {
      setPhase('black')
      const t = setTimeout(() => setPhase('in'), 380)
      return () => clearTimeout(t)
    } else setPhase('out')
  }, [item])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = phase !== 'out' ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [phase])

  if (!item && phase === 'out') return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#000', opacity: phase === 'out' ? 0 : 1, transition: 'opacity .38s ease', display: 'flex', flexDirection: 'column' }}>
      {item && (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: phase === 'in' ? 1 : 0, transition: 'opacity .42s ease .12s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 36px 16px', flexShrink: 0 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.62rem', letterSpacing: '.44em', textTransform: 'uppercase', marginBottom: 7 }}>{item.collection} · {item.year} · {item.location}</p>
              <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#111111', fontSize: 'clamp(1.3rem,3vw,2.4rem)', lineHeight: 1, marginBottom: 4 }}>{item.title}</h2>
              <p style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.78rem' }}>{item.subtitle}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#111111', fontSize: 30, lineHeight: 1, opacity: .4, cursor: 'none', paddingLeft: 20, transition: 'opacity .3s' }}
              onMouseEnter={(e) => requestAnimationFrame(() => ((e.currentTarget as HTMLElement).style.opacity = '1'))}
              onMouseLeave={(e) => requestAnimationFrame(() => ((e.currentTarget as HTMLElement).style.opacity = '.4'))}
              aria-label="Close"
            >×</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 36px 28px', minHeight: 0 }}>
            <img src={item.url.replace(/w=\d+&h=\d+/, 'w=1600&h=1000')} alt={item.alt} loading="lazy" decoding="async" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', backgroundColor: '#f4f1ec' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

// ─── Films ────────────────────────────────────────────────────────────────────

type Film = {
  id: string;
  title: string;
  year: string;
  customThumb?: string;
  customUrl?: string;
};

const FILMS: Film[] = [
  {
    id: 'LFSU-SqMrgk',
    title: 'Ankita Pun — Maili',
    year: '2024',
  },
  {
    id: 'HIL9fcQhm5k',
    title: 'Ankita Pun — Char Din Char Juni',
    year: '2024',
  },
  {
    id: '5KfrycH9iXk',
    title: 'Anisha Thulung Rai — Kathai Ma Haina',
    year: '2024',
  },
  {
    id: '4a_Xhtc6w7U',
    title: "Void Turned To Message — ‘मित्रता’",
    year: '2023',
  },
  {
    id: '8yo1ofBOFsg',
    title: 'Flower of Silence — Sampachit',
    year: '2023',
  },
  {
    id: 'fRwodduCtMs',
    title: 'Treble Clef — समीप (Official Video)',
    year: '2023',
  },
  {
    id: 'video-editing-lab',
    title: 'Video Editing Lab — Practice & Projects',
    year: '2024-2026',
    customThumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop',
    customUrl: 'https://drive.google.com/drive/folders/1bGPh7UEvSjU9asL5WFq5tmGTBCKmznxV?usp=drive_link',
  }
]

function FilmCard({ film }: { film: Film }) {
  const [h, setH] = useState(false)
  const thumb = film.customThumb || `https://img.youtube.com/vi/${film.id}/maxresdefault.jpg`
  const link = film.customUrl || `https://youtube.com/watch?v=${film.id}`

  return (
    <div
      data-hover
      style={{ position: 'relative', overflow: 'hidden', background: '#111', cursor: 'none', breakInside: 'avoid', marginBottom: 10 }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => window.open(link, '_blank')}
    >
      {/* Thumbnail */}
      <img
        src={thumb}
        alt={film.title}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'cover',
          filter: h ? 'brightness(.45)' : 'brightness(.7)',
          transform: h ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform .65s cubic-bezier(.25,1,.5,1), filter .45s ease',
        }}
        onError={(e) => {
          if (film.customThumb) return;
          // Fallback to hqdefault if maxresdefault not available
          const el = e.currentTarget as HTMLImageElement
          if (!el.src.includes('hqdefault')) {
            el.src = `https://img.youtube.com/vi/${film.id}/hqdefault.jpg`
          }
        }}
      />

      {/* Bottom info bar — always visible */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(8,8,8,.88) 0%, rgba(8,8,8,.18) 55%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '20px 18px 18px',
        }}
      >
        <span style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.55rem', letterSpacing: '.42em', textTransform: 'uppercase', marginBottom: 5 }}>
          {film.year}
        </span>
        <h3 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#f0ede8', fontSize: 'clamp(.9rem,1.4vw,1.1rem)', lineHeight: 1.2, margin: 0 }}>
          {film.title}
        </h3>
      </div>

      {/* Play button — appears on hover */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%,-50%) scale(${h ? 1 : 0.7})`,
          opacity: h ? 1 : 0,
          transition: 'opacity .35s ease, transform .35s cubic-bezier(.25,1,.5,1)',
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '1.5px solid rgba(201,169,110,.85)',
          background: 'rgba(8,8,8,.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Triangle play icon */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5.5 3.5l9 5.5-9 5.5V3.5z" fill="#c9a96e" />
        </svg>
      </div>
    </div>
  )
}

function Films() {
  return (
    <>
      <section
        id="films"
        style={{
          padding: 'clamp(56px,7vw,110px) clamp(18px,4vw,64px)',
          borderTop: '1px solid rgba(0,0,0,.09)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 'clamp(32px,5vw,56px)' }}>
          <div>
            <p style={{ fontFamily: "'DM Sans'", color: '#c9a96e', fontSize: '.66rem', letterSpacing: '.52em', textTransform: 'uppercase', marginBottom: 10 }}>
              04 — Films
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#111111', fontSize: 'clamp(2rem,5vw,4rem)', lineHeight: .95 }}>
              Motion Work
            </h2>
          </div>
          <p style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.88rem', lineHeight: 1.75, maxWidth: 340 }}>
            Music videos, official films, and live sessions shot across Nepal.
          </p>
        </div>

        {/* Masonry grid of film cards */}
        <div className="pin-grid">
          {FILMS.map((f) => (
            <FilmCard key={f.id} film={f} />
          ))}
        </div>
      </section>
    </>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,.07)', padding: '24px clamp(18px,4vw,64px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: '#111111', fontSize: '.78rem', letterSpacing: '.22em', textTransform: 'uppercase' }}>Abishekh Joshi</span>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          ['Instagram', 'https://www.instagram.com/abishek_joshi_/'],
          ['LinkedIn', 'https://www.linkedin.com/in/abishekh-joshi-41135a2a0/'],
          ['Facebook', 'https://www.facebook.com/abishek.joshi.79'],
          ['TikTok', 'https://www.tiktok.com/@abishekjoshi59'],
          ['WhatsApp', 'https://wa.me/9779815025634']
        ].map(([l, h]) => (
          <a key={l} href={h} style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.62rem', letterSpacing: '.34em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color .35s' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#c9a96e')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#6b6b6b')}
          >{l}</a>
        ))}
      </div>
      <span style={{ fontFamily: "'DM Sans'", color: '#6b6b6b', fontSize: '.65rem' }}>© 2026 Abishekh Joshi</span>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  // ─── SEO: inject metadata + JSON-LD on mount ───────────────────────────
  useSEO({
    title: 'Abishekh Joshi — Photographer, Video Editor & Web Designer, Kathmandu',
    description:
      'Abishekh Joshi is a photographer, video editor, and web designer based in Kathmandu, Nepal. Specialising in portrait, concert, and landscape photography, cinematic video editing for music artists, and end-to-end web design and development.',
    canonicalUrl: 'https://abishekhjoshi.com.np/',
    robots: 'index, follow',
    ogType: 'website',
    ogImage: 'https://abishekhjoshi.com.np/og-image.jpg',
    twitterCard: 'summary_large_image',
    schemas: [
      { _id: 'schema-person',    ...buildPersonSchema() },
      { _id: 'schema-website',   ...buildWebSiteSchema() },
      { _id: 'schema-webpage',   ...buildWebPageSchema() },
      { _id: 'schema-portfolio', ...buildPortfolioSchema() },
    ],
  })

  const [modal, setModal] = useState<GalleryItem | null>(null)
  const [photoTab, setPhotoTab] = useState<typeof TABS[number]>('All')

  const nav = useCallback((href: string) => {
    if (href === '#top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    setTimeout(() => { const el = document.querySelector(href); if (el) el.scrollIntoView({ behavior: 'smooth' }) }, 40)
  }, [])

  const handleMarqueeImageClick = useCallback((item: GalleryItem) => {
    setPhotoTab(item.collection)
    setModal(null)
    nav('#photography')

    // Wait for the new category tab elements to render, then scroll to the specific image card
    // and highlight it temporarily with a gold border outline and scale effect.
    setTimeout(() => {
      const el = document.getElementById(item.id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        const originalTransform = el.style.transform
        const originalZIndex = el.style.zIndex

        el.style.zIndex = '50'
        el.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        el.style.outline = '3px solid #c9a96e'
        el.style.outlineOffset = '6px'
        el.style.transform = 'scale(1.03)'

        setTimeout(() => {
          el.style.outline = 'none'
          el.style.transform = originalTransform
          el.style.zIndex = originalZIndex
        }, 2200)
      }
    }, 450)
  }, [nav])

  return (
    <div style={{ background: '#f4f1ec', minHeight: '100vh', color: '#111111' }}>
      <Cursor />
      <Nav onNav={nav} />
      <Hero />
      <Marquee onImageClick={handleMarqueeImageClick} />
      <About />
      <Work />
      <Films />
      <Photography onOpen={setModal} tab={photoTab} setTab={setPhotoTab} />
      <Contact />
      <Footer />
      <Modal item={modal} onClose={() => setModal(null)} />
    </div>
  )
}
