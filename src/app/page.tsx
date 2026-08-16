'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ======================================================== */
/*  DATA                                                      */
/* ======================================================== */

const textPassages = [
  {
    id: 1,
    text: 'Zärtlich griff er nach ihrer Hand – ein Moment zwischen Vertrauen und Neugier.',
    defaultMood: 'ruhig' as const,
  },
  {
    id: 2,
    text: 'Sein Atem berührte sie, wie eine Erinnerung, die Wärme trägt.',
    defaultMood: 'intensiv' as const,
  },
  {
    id: 3,
    text: 'Ein Blick, der mehr sagte als Worte – still, aber voller Bedeutung.',
    defaultMood: 'melancholisch' as const,
  },
  {
    id: 4,
    text: 'Die Nähe war kein Zufall, sondern ein Versprechen, das sich erfüllte.',
    defaultMood: 'hoffnungsvoll' as const,
  },
  {
    id: 5,
    text: 'In der Bewegung lag keine Hast, nur das Erkennen des Augenblicks.',
    defaultMood: 'ruhig' as const,
  },
];

type MoodType = 'ruhig' | 'intensiv' | 'melancholisch' | 'hoffnungsvoll';

const moodStyles: Record<MoodType, { bg: string; glow: string; text: string; accent: string; border: string }> = {
  ruhig: {
    bg: 'rgba(232, 220, 200, 0.5)',
    glow: 'rgba(184, 134, 11, 0.06)',
    text: '#3E3322',
    accent: 'rgba(184, 134, 11, 0.25)',
    border: 'rgba(139, 115, 85, 0.3)',
  },
  intensiv: {
    bg: 'rgba(200, 180, 160, 0.55)',
    glow: 'rgba(160, 80, 50, 0.06)',
    text: '#4A2C1C',
    accent: 'rgba(160, 80, 50, 0.25)',
    border: 'rgba(120, 70, 40, 0.3)',
  },
  melancholisch: {
    bg: 'rgba(210, 205, 200, 0.55)',
    glow: 'rgba(100, 110, 130, 0.05)',
    text: '#3A3540',
    accent: 'rgba(100, 110, 130, 0.2)',
    border: 'rgba(120, 110, 100, 0.3)',
  },
  hoffnungsvoll: {
    bg: 'rgba(235, 218, 185, 0.5)',
    glow: 'rgba(200, 170, 60, 0.07)',
    text: '#3A3218',
    accent: 'rgba(200, 170, 60, 0.3)',
    border: 'rgba(160, 140, 80, 0.3)',
  },
};

const moodLabels: Record<MoodType, string> = {
  ruhig: 'ruhig',
  intensiv: 'intensiv',
  melancholisch: 'melancholisch',
  hoffnungsvoll: 'hoffnungsvoll',
};

/* ======================================================== */
/*  VICTORIAN CORNER ORNAMENT SVG                             */
/* ======================================================== */

function CornerOrnament() {
  return (
    <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main stem */}
      <path d="M10 10 C10 10, 10 120, 40 160 C60 185, 90 190, 110 170" stroke="#5D4E37" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Acanthus leaf 1 */}
      <path d="M15 30 C30 20, 55 25, 50 45 C45 60, 20 50, 15 30Z" stroke="#5D4E37" strokeWidth="0.8" fill="rgba(93,78,55,0.06)" />
      {/* Acanthus leaf 2 */}
      <path d="M20 60 C40 48, 70 55, 62 80 C55 100, 25 85, 20 60Z" stroke="#5D4E37" strokeWidth="0.8" fill="rgba(93,78,55,0.05)" />
      {/* Acanthus leaf 3 */}
      <path d="M30 95 C55 80, 90 90, 78 118 C68 140, 35 120, 30 95Z" stroke="#5D4E37" strokeWidth="0.8" fill="rgba(93,78,55,0.04)" />
      {/* Scroll curl top */}
      <path d="M10 10 C25 5, 40 12, 35 25 C30 35, 12 22, 10 10" stroke="#5D4E37" strokeWidth="1" fill="rgba(93,78,55,0.08)" />
      {/* Spiral at end */}
      <path d="M110 170 C120 155, 140 155, 145 165 C150 175, 140 185, 130 180 C120 175, 125 165, 110 170" stroke="#5D4E37" strokeWidth="1" fill="none" />
      {/* Small tendril */}
      <path d="M62 80 C75 72, 88 78, 82 90" stroke="#5D4E37" strokeWidth="0.6" fill="none" />
      {/* Dot accents */}
      <circle cx="12" cy="12" r="1.5" fill="#5D4E37" opacity="0.4" />
      <circle cx="145" cy="165" r="1.5" fill="#5D4E37" opacity="0.3" />
    </svg>
  );
}

/* ======================================================== */
/*  DUST PARTICLES                                             */
/* ======================================================== */

function DustParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    size: 1 + Math.random() * 1.5,
    duration: 10 + Math.random() * 15,
    delay: Math.random() * 12,
    opacity: 0.15 + Math.random() * 0.3,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="dust-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </>
  );
}

/* ======================================================== */
/*  NAVIGATION DOTS                                            */
/* ======================================================== */

function NavDots({ current, onNavigate }: { current: number; onNavigate: (i: number) => void }) {
  const labels = ['I', 'II', 'III'];
  return (
    <motion.nav
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, duration: 1.2 }}
    >
      {labels.map((label, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className="nav-dot-light group relative"
          aria-label={`Kapitel ${label}`}
          style={current === i ? { background: 'rgba(62, 51, 34, 0.6)', boxShadow: '0 0 6px rgba(62, 51, 34, 0.2)' } : {}}
        >
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-[family-name:var(--font-cinzel)] text-[#3E3322] opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
            {label}
          </span>
        </button>
      ))}
    </motion.nav>
  );
}

/* ======================================================== */
/*  CHAPTER I – TITLE PAGE (matching BOD1/BOD2)               */
/* ======================================================== */

function ChapterIntro({ onEnter }: { onEnter: () => void }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden parchment-bg">
      {/* Paper grain overlay */}
      <div className="paper-grain absolute inset-0" />

      {/* Warm ambient glow from upper-left */}
      <div
        className="absolute inset-0 candle-glow pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 35% 30%, rgba(232, 220, 200, 0.5) 0%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212, 175, 120, 0.12) 0%, transparent 60%)
          `,
        }}
      />

      {/* Dust particles */}
      <DustParticles />

      {/* Vignette */}
      <div className="vignette-warm absolute inset-0 z-[3]" />

      {/* Victorian frame with corner ornaments */}
      <div className="victorian-frame inner-border absolute inset-0 z-[2]">
        <div className="corner-ornament corner-tl"><CornerOrnament /></div>
        <div className="corner-ornament corner-tr"><CornerOrnament /></div>
        <div className="corner-ornament corner-bl"><CornerOrnament /></div>
        <div className="corner-ornament corner-br"><CornerOrnament /></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 md:px-16">
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
            >
              {/* THE BOOK */}
              <motion.h2
                className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[0.15em] uppercase text-center"
                style={{
                  color: '#3E3322',
                  textShadow: '1px 1px 0px rgba(255,245,220,0.3), -1px -1px 0px rgba(44,36,22,0.1)',
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.8, delay: 0.5 }}
              >
                The Book
              </motion.h2>

              {/* Diamond divider with OF */}
              <motion.div
                className="flex items-center gap-3 sm:gap-5 my-3 sm:my-4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.5, delay: 1.0 }}
              >
                <div className="w-16 sm:w-24 h-px" style={{ background: 'linear-gradient(90deg, transparent, #5D4E37)' }} />
                <span
                  className="font-[family-name:var(--font-cinzel)] text-sm sm:text-base tracking-[0.4em] uppercase"
                  style={{ color: '#4A3F2E' }}
                >
                  of
                </span>
                <div className="w-16 sm:w-24 h-px" style={{ background: 'linear-gradient(270deg, transparent, #5D4E37)' }} />
              </motion.div>

              {/* DESIRE – Main title with embossed effect */}
              <motion.h1
                className="embossed-title-large font-[family-name:var(--font-cinzel-decorative)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.02em] uppercase text-center leading-[0.85]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1.5 }}
              >
                Desire
              </motion.h1>

              {/* Diamond ornament below title */}
              <motion.div
                className="ornament-divider-diamond mt-4 sm:mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 2.5 }}
              >
                <span>◆</span>
              </motion.div>

              {/* German subtitle in script */}
              <motion.p
                className="font-[family-name:var(--font-vibes)] text-xl sm:text-2xl md:text-3xl text-center mt-2"
                style={{
                  color: '#5D4E37',
                  textShadow: '0 1px 2px rgba(44,36,22,0.1)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 3.0 }}
              >
                Ein Portal in deine tiefsten Sehnsüchte
              </motion.p>

              {/* Eintreten button */}
              <motion.button
                className="seal-button-light mt-8 sm:mt-10"
                onClick={onEnter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 3.5 }}
                whileHover={{ scale: 1.03, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Eintreten
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom ornament hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 4.5, duration: 2 }}
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: '#5D4E37' }}
          className="text-xl"
        >
          ❧
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ======================================================== */
/*  CHAPTER II – THE BOOK INTRODUCES ITSELF                 */
/* ======================================================== */

function ChapterBookIntro({ onContinue }: { onContinue: () => void }) {
  const [revealedLines, setRevealedLines] = useState(0);

  const lines = [
    'Ich wurde nicht geschrieben – ich wurde gefühlt.',
    'Jede Seite trägt den Hauch einer Frau, die es wagte,',
    'ihre tiefste Wahrheit niederzuschreiben.',
    '',
    'Dies ist kein gewöhnliches Buch.',
    'Es ist ein Spiegel, ein Vertrauter, ein Flüstern in der Nacht.',
    '',
    'Ich bin entstanden aus Stunden der Stille,',
    'aus Tinte und Sehnsucht, aus Mut und Verletzlichkeit.',
    '',
    'Lass mich dir zeigen, was zwischen den Zeilen lebt.',
  ];

  useEffect(() => {
    if (revealedLines < lines.length) {
      const timer = setTimeout(() => {
        setRevealedLines((prev) => prev + 1);
      }, revealedLines === 0 ? 500 : 550);
      return () => clearTimeout(timer);
    }
  }, [revealedLines, lines.length]);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center py-16 md:py-24"
      style={{
        background: 'radial-gradient(ellipse at center, #D9C4A0 0%, #C4A574 70%, #A68B5B 100%)',
      }}
    >
      {/* Paper grain */}
      <div className="paper-grain absolute inset-0" />

      {/* Ambient light */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full candle-glow"
          style={{ background: 'radial-gradient(circle, rgba(232, 220, 200, 0.3) 0%, transparent 70%)' }}
        />
      </div>

      <DustParticles />
      <div className="vignette-warm absolute inset-0 z-[3]" />

      {/* Content card */}
      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-8">
        <div className="gold-frame-light p-8 md:p-12 page-curl relative">
          <div className="chapter-num-light">II</div>

          {/* Headline */}
          <motion.div
            className="text-center mb-8 md:mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            <h2
              className="embossed-title font-[family-name:var(--font-cinzel-decorative)] text-2xl sm:text-3xl md:text-4xl font-bold mb-3 uppercase tracking-[0.08em]"
            >
              Geschrieben von Frauen
            </h2>
            <div className="ornament-divider-diamond">
              <span>◆</span>
            </div>
            <p
              className="font-[family-name:var(--font-cinzel)] text-base sm:text-lg tracking-[0.25em] uppercase"
              style={{ color: '#4A3F2E', opacity: 0.7 }}
            >
              für Frauen
            </p>
          </motion.div>

          {/* Text lines */}
          <div className="space-y-1 min-h-[260px] md:min-h-[300px]">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                className={`font-[family-name:var(--font-cormorant)] text-lg sm:text-xl md:text-2xl leading-relaxed ${
                  line === '' ? 'h-3' : ''
                }`}
                style={{
                  color: i === 0 || i === 4 || i === 8 || i === 10 ? '#3E3322' : '#5D4E37',
                  textShadow: '0 1px 1px rgba(255,245,220,0.3)',
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{
                  opacity: i < revealedLines ? 1 : 0,
                  x: i < revealedLines ? 0 : -8,
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Continue button */}
          <AnimatePresence>
            {revealedLines >= lines.length && (
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
              >
                <div className="double-rule" />
                <motion.button
                  className="seal-button-light mt-5"
                  onClick={onContinue}
                  whileHover={{ scale: 1.03, translateY: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Weiterblättern
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner dots */}
          <div className="absolute top-2 left-2 text-[#5D4E37] opacity-20 text-sm">◆</div>
          <div className="absolute top-2 right-2 text-[#5D4E37] opacity-20 text-sm">◆</div>
          <div className="absolute bottom-2 left-2 text-[#5D4E37] opacity-20 text-sm">◆</div>
          <div className="absolute bottom-2 right-2 text-[#5D4E37] opacity-20 text-sm">◆</div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================== */
/*  PASSAGE CARD (light parchment)                            */
/* ======================================================== */

function PassageCard({
  passage,
  index,
  selectedMood,
  onMoodSelect,
}: {
  passage: (typeof textPassages)[0];
  index: number;
  selectedMood: MoodType | null;
  onMoodSelect: (id: number, mood: MoodType) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setTimeout(() => setRevealed(true), index * 250);
      },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  const currentMood = selectedMood || passage.defaultMood;
  const style = moodStyles[currentMood];

  return (
    <motion.div
      ref={cardRef}
      className="mood-card-light"
      style={{
        background: style.bg,
        borderColor: style.border,
      }}
      initial={{ opacity: 0, y: 25 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* Subtle glow at top */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none transition-all duration-1000"
        style={{ background: `linear-gradient(to bottom, ${style.glow}, transparent)` }}
      />

      {/* Quote mark */}
      <div
        className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl leading-none mb-2 select-none"
        style={{ color: style.accent, opacity: 0.6 }}
      >
        „
      </div>

      {/* Text */}
      <p
        className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl md:text-3xl leading-relaxed italic mb-5 transition-colors duration-1000"
        style={{
          color: style.text,
          textShadow: '0 1px 1px rgba(255,245,220,0.25)',
        }}
      >
        {passage.text}
      </p>

      {/* Mood tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {(Object.keys(moodLabels) as MoodType[]).map((mood) => {
          const mStyle = moodStyles[mood];
          const isActive = currentMood === mood;
          return (
            <button
              key={mood}
              className={`mood-tag-light ${isActive ? 'active' : ''}`}
              onClick={() => onMoodSelect(passage.id, mood)}
              style={
                isActive
                  ? { borderColor: mStyle.accent, color: mStyle.text, background: mStyle.glow }
                  : {}
              }
            >
              {moodLabels[mood]}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ======================================================== */
/*  CHAPTER III – EMOTIONAL TEXT PASSAGES                     */
/* ======================================================== */

function ChapterPassages() {
  const [moodSelections, setMoodSelections] = useState<Record<number, MoodType | null>>({});

  const handleMoodSelect = useCallback((id: number, mood: MoodType) => {
    setMoodSelections((prev) => ({ ...prev, [id]: mood }));
  }, []);

  return (
    <section
      className="relative w-full min-h-screen py-16 md:py-24"
      style={{
        background: 'radial-gradient(ellipse at center, #D9C4A0 0%, #C4A574 60%, #B89B74 100%)',
      }}
    >
      <div className="paper-grain absolute inset-0" />
      <DustParticles />
      <div className="vignette-warm absolute inset-0 z-[3]" />

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8">
        {/* Chapter heading */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="chapter-num-light mx-auto w-fit">III</div>
          <h2
            className="embossed-title font-[family-name:var(--font-cinzel-decorative)] text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.08em] relative"
          >
            Stimmungsgedichte
          </h2>
          <div className="ornament-divider-diamond mt-2">
            <span>◆</span>
          </div>
          <p
            className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl italic mt-1"
            style={{ color: '#5D4E37', opacity: 0.7, textShadow: '0 1px 1px rgba(255,245,220,0.3)' }}
          >
            Klicke auf eine Stimmung und erlebe, wie sich die Atmosphäre verwandelt
          </p>
        </motion.div>

        {/* Passages */}
        <div className="space-y-6 md:space-y-8">
          {textPassages.map((passage, i) => (
            <PassageCard
              key={passage.id}
              passage={passage}
              index={i}
              selectedMood={moodSelections[passage.id] || null}
              onMoodSelect={handleMoodSelect}
            />
          ))}
        </div>

        {/* Bottom ornament */}
        <motion.div
          className="ornament-divider-diamond mt-14 md:mt-18"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
        >
          <span>◆</span>
        </motion.div>

        {/* Closing */}
        <motion.p
          className="text-center font-[family-name:var(--font-vibes)] text-2xl sm:text-3xl mt-6 mb-10"
          style={{ color: '#5D4E37', opacity: 0.6, textShadow: '0 1px 1px rgba(255,245,220,0.2)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          Die Geschichte geht weiter...
        </motion.p>
      </div>
    </section>
  );
}

/* ======================================================== */
/*  MAIN PAGE                                                  */
/* ======================================================== */

export default function BuchDerBegierde() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const navigateToChapter = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setActiveChapter(index);
    setTimeout(() => setTransitioning(false), 1200);
  }, [transitioning]);

  const handleEnter = useCallback(() => navigateToChapter(1), [navigateToChapter]);
  const handleContinue = useCallback(() => navigateToChapter(2), [navigateToChapter]);

  return (
    <main className="relative min-h-screen" style={{ background: '#C4A574' }}>
      <AnimatePresence mode="wait">
        {activeChapter === 0 && (
          <motion.div
            key="chapter-1"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <ChapterIntro onEnter={handleEnter} />
          </motion.div>
        )}

        {activeChapter === 1 && (
          <motion.div
            key="chapter-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <ChapterBookIntro onContinue={handleContinue} />
          </motion.div>
        )}

        {activeChapter === 2 && (
          <motion.div
            key="chapter-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <ChapterPassages />
          </motion.div>
        )}
      </AnimatePresence>

      {activeChapter > 0 && (
        <NavDots current={activeChapter - 1} onNavigate={navigateToChapter} />
      )}
    </main>
  );
}
