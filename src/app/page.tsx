'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

/* ======================================================== */
/*  DATA                                                      */
/* ======================================================== */

const textPassages = [
  {
    id: 1,
    text: 'Zärtlich griff er nach ihrer Hand – ein Moment zwischen Vertrauen und Neugier.',
    defaultMood: 'ruhig' as const,
  },
  {
    id: 2,
    text: 'Sein Atem berührte sie, wie eine Erinnerung, die Wärme trägt.',
    defaultMood: 'intensiv' as const,
  },
  {
    id: 3,
    text: 'Ein Blick, der mehr sagte als Worte – still, aber voller Bedeutung.',
    defaultMood: 'melancholisch' as const,
  },
  {
    id: 4,
    text: 'Die Nähe war kein Zufall, sondern ein Versprechen, das sich erfüllte.',
    defaultMood: 'hoffnungsvoll' as const,
  },
  {
    id: 5,
    text: 'In der Bewegung lag keine Hast, nur das Erkennen des Augenblicks.',
    defaultMood: 'ruhig' as const,
  },
];

type MoodType = 'ruhig' | 'intensiv' | 'melancholisch' | 'hoffnungsvoll';

const moodStyles: Record<MoodType, { bg: string; glow: string; text: string; accent: string }> = {
  ruhig: {
    bg: 'from-amber-950/40 via-stone-900/30 to-amber-950/40',
    glow: 'rgba(201, 168, 76, 0.08)',
    text: '#d4a574',
    accent: 'rgba(201, 168, 76, 0.3)',
  },
  intensiv: {
    bg: 'from-red-950/30 via-stone-900/40 to-red-950/30',
    glow: 'rgba(180, 80, 60, 0.1)',
    text: '#e8a88a',
    accent: 'rgba(180, 80, 60, 0.4)',
  },
  melancholisch: {
    bg: 'from-slate-900/40 via-stone-900/30 to-slate-900/40',
    glow: 'rgba(120, 140, 180, 0.08)',
    text: '#b8a8c8',
    accent: 'rgba(120, 140, 180, 0.3)',
  },
  hoffnungsvoll: {
    bg: 'from-amber-900/30 via-yellow-950/20 to-amber-900/30',
    glow: 'rgba(220, 180, 80, 0.1)',
    text: '#e8d5a3',
    accent: 'rgba(220, 180, 80, 0.35)',
  },
};

const moodLabels: Record<MoodType, string> = {
  ruhig: 'ruhig',
  intensiv: 'intensiv',
  melancholisch: 'melancholisch',
  hoffnungsvoll: 'hoffnungsvoll',
};

/* ======================================================== */
/*  DUST PARTICLES COMPONENT                                  */
/* ======================================================== */

function DustParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 10,
    opacity: 0.2 + Math.random() * 0.4,
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
/*  NAVIGATION DOTS                                           */
/* ======================================================== */

function NavDots({ current, onNavigate }: { current: number; onNavigate: (i: number) => void }) {
  const labels = ['I', 'II', 'III'];
  return (
    <motion.nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2, duration: 1.5 }}
    >
      {labels.map((label, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className="nav-dot group relative"
          aria-label={`Kapitel ${label}`}
          style={current === i ? { background: 'rgba(201, 168, 76, 0.7)', boxShadow: '0 0 10px rgba(201, 168, 76, 0.3)' } : {}}
        >
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-[family-name:var(--font-playfair)] text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
            {label}
          </span>
        </button>
      ))}
    </motion.nav>
  );
}

/* ======================================================== */
/*  CHAPTER I – INTRO / VIDEO PAGE                           */
/* ======================================================== */

function ChapterIntro({ onEnter }: { onEnter: () => void }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#0d0806]">
      {/* Animated “video” background – candlelit atelier scene via CSS */}
      <div className="absolute inset-0 candle-glow">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139, 105, 20, 0.18) 0%, transparent 70%),
              radial-gradient(ellipse 40% 35% at 35% 55%, rgba(201, 168, 76, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 35% 30% at 70% 50%, rgba(160, 120, 74, 0.1) 0%, transparent 55%),
              radial-gradient(circle at 50% 50%, rgba(74, 28, 28, 0.3) 0%, rgba(13, 8, 6, 1) 80%)
            `,
          }}
        />
        {/* Sepia overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.08) 0%, rgba(100, 60, 30, 0.05) 50%, rgba(180, 140, 80, 0.08) 100%)',
          }}
        />
        {/* Simulated warm light sources */}
        <div
          className="absolute top-[30%] left-[25%] w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 180, 80, 0.06) 0%, transparent 70%)',
            animation: 'flicker 3s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 160, 60, 0.04) 0%, transparent 70%)',
            animation: 'flicker 4s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>

      {/* Fog / mist overlay */}
      <div className="fog-overlay" />

      {/* Vignette */}
      <div className="vignette absolute inset-0 z-[2]" />

      {/* Dust particles */}
      <DustParticles />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
            >
              {/* Ornamental top */}
              <motion.div
                className="ornament-divider"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
              >
                <span>✦</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-center leading-tight"
                style={{
                  color: '#c9a84c',
                  textShadow: '0 0 40px rgba(201, 168, 76, 0.3), 0 2px 4px rgba(0,0,0,0.5)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 0.8 }}
              >
                Buch der Begierde
              </motion.h1>

              {/* Subline */}
              <motion.p
                className="font-[family-name:var(--font-vibes)] text-xl sm:text-2xl md:text-3xl text-center"
                style={{
                  color: '#d4a574',
                  textShadow: '0 0 15px rgba(212, 165, 116, 0.2)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1.5 }}
              >
                Ein Portal in deine tiefsten Sehnsüchte
              </motion.p>

              {/* Seal button */}
              <motion.button
                className="seal-button"
                onClick={onEnter}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 2.5, ease: 'easeOut' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                Eintreten
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 4, duration: 2 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[#c9a84c] text-2xl"
        >
          ❧
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ======================================================== */
/*  CHAPTER II – THE BOOK INTRODUCES ITSELF                */
/* ======================================================== */

function ChapterBookIntro({ onContinue }: { onContinue: () => void }) {
  const [revealedLines, setRevealedLines] = useState(0);

  const lines = [
    'Ich wurde nicht geschrieben – ich wurde gefühlt.',
    'Jede Seite trägt den Hauch einer Frau, die es wagte,',
    'ihre tiefste Wahrheit niederzuschreiben.',
    '',
    'Dies ist kein gewöhnliches Buch.',
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
      }, revealedLines === 0 ? 500 : 600);
      return () => clearTimeout(timer);
    }
  }, [revealedLines, lines.length]);

  return (
    <section className="relative w-full min-h-screen overflow-hidden dark-parchment flex items-center justify-center py-16 md:py-24">
      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full candle-glow"
          style={{
            background: 'radial-gradient(circle, rgba(201, 168, 76, 0.04) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full candle-glow"
          style={{
            background: 'radial-gradient(circle, rgba(160, 120, 74, 0.03) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
      </div>

      <DustParticles />

      {/* Main content card */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 md:px-8">
        {/* Gold frame card */}
        <div className="gold-frame p-8 md:p-12 page-curl relative">
          {/* Chapter number watermark */}
          <div className="chapter-num">II</div>

          {/* Headline */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            <h2
              className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-semibold mb-3"
              style={{
                color: '#c9a84c',
                textShadow: '0 0 20px rgba(201, 168, 76, 0.2)',
              }}
            >
              Geschrieben von Frauen
              <br />
              für Frauen
            </h2>
            <div className="ornament-divider">
              <span>✦</span>
            </div>
          </motion.div>

          {/* Revealing text lines */}
          <div className="space-y-1 min-h-[280px] md:min-h-[320px]">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                className={`font-[family-name:var(--font-cormorant)] text-lg sm:text-xl md:text-2xl leading-relaxed ${
                  line === '' ? 'h-4' : ''
                }`}
                style={{
                  color: i === 0 || i === 4 || i === 8 ? '#c9a84c' : '#d4a574',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: i < revealedLines ? 1 : 0,
                  x: i < revealedLines ? 0 : -10,
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Continue button */}
          <AnimatePresence>
            {revealedLines >= lines.length && (
              <motion.div
                className="mt-10 text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
              >
                <div className="ornament-divider">
                  <span>✦</span>
                </div>
                <motion.button
                  className="mt-4 font-[family-name:var(--font-playfair)] text-sm tracking-[0.2em] uppercase px-8 py-3 border border-[#c9a84c]/30 rounded-sm bg-transparent text-[#c9a84c] hover:bg-[#c9a84c]/10 hover:border-[#c9a84c]/60 transition-all duration-700"
                  onClick={onContinue}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    textShadow: '0 0 10px rgba(201, 168, 76, 0.2)',
                  }}
                >
                  Weiterblättern
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Decorative corner ornaments */}
          <div className="absolute top-2 left-2 text-[#c9a84c]/20 text-lg">✦</div>
          <div className="absolute top-2 right-2 text-[#c9a84c]/20 text-lg">✦</div>
          <div className="absolute bottom-2 left-2 text-[#c9a84c]/20 text-lg">✦</div>
          <div className="absolute bottom-2 right-2 text-[#c9a84c]/20 text-lg">✦</div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================== */
/*  CHAPTER III – EMOTIONAL TEXT PASSAGES                   */
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
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), index * 300);
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  const currentMood = selectedMood || passage.defaultMood;
  const style = moodStyles[currentMood];

  return (
    <motion.div
      ref={cardRef}
      className={`mood-card bg-gradient-to-b ${style.bg}`}
      initial={{ opacity: 0, y: 30 }}
      animate={
        revealed
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 30 }
      }
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{
        borderColor: style.accent,
        boxShadow: `0 0 40px ${style.glow}`,
      }}
    >
      {/* Quote mark */}
      <div
        className="font-[family-name:var(--font-playfair)] text-5xl leading-none mb-3 select-none"
        style={{ color: style.accent, opacity: 0.5 }}
      >
        „
      </div>

      {/* Text passage */}
      <p
        className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl md:text-3xl leading-relaxed italic mb-6 transition-colors duration-1000"
        style={{
          color: style.text,
          textShadow: `0 1px 3px rgba(0,0,0,0.4)`,
        }}
      >
        {passage.text}
      </p>

      {/* Mood tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {(Object.keys(moodLabels) as MoodType[]).map((mood) => (
          <button
            key={mood}
            className={`mood-tag ${currentMood === mood ? 'active' : ''}`}
            onClick={() => onMoodSelect(passage.id, mood)}
            style={
              currentMood === mood
                ? { borderColor: style.accent, color: style.text, background: `${style.glow}` }
                : {}
            }
          >
            {moodLabels[mood]}
          </button>
        ))}
      </div>

      {/* Ambient glow at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none transition-all duration-1000"
        style={{
          background: `linear-gradient(to top, ${style.glow}, transparent)`,
        }}
      />
    </motion.div>
  );
}

function ChapterPassages() {
  const [moodSelections, setMoodSelections] = useState<Record<number, MoodType | null>>({});
  const sectionRef = useRef<HTMLElement>(null);

  const handleMoodSelect = useCallback((id: number, mood: MoodType) => {
    setMoodSelections((prev) => ({ ...prev, [id]: mood }));
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen dark-parchment py-16 md:py-24">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[10%] right-[20%] w-[500px] h-[500px] rounded-full candle-glow"
          style={{
            background: 'radial-gradient(circle, rgba(201, 168, 76, 0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      <DustParticles />

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8">
        {/* Chapter heading */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="chapter-num mx-auto w-fit">III</div>
          <h2
            className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 relative"
            style={{
              color: '#c9a84c',
              textShadow: '0 0 20px rgba(201, 168, 76, 0.2)',
            }}
          >
            Stimmungsgedichte
          </h2>
          <p
            className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl text-[#d4a574]/70 italic"
          >
            Klicke auf eine Stimmung und erlebe, wie sich die Atmosphäre verwandelt
          </p>
          <div className="ornament-divider">
            <span>✦</span>
          </div>
        </motion.div>

        {/* Text passages */}
        <div className="space-y-8 md:space-y-10">
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
          className="ornament-divider mt-16 md:mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
        >
          <span>✦</span>
        </motion.div>

        {/* Closing thought */}
        <motion.p
          className="text-center font-[family-name:var(--font-vibes)] text-2xl sm:text-3xl mt-8 mb-12"
          style={{
            color: '#c9a84c',
            textShadow: '0 0 15px rgba(201, 168, 76, 0.15)',
            opacity: 0.7,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
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
  const containerRef = useRef<HTMLDivElement>(null);

  const navigateToChapter = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setActiveChapter(index);
    setTimeout(() => setTransitioning(false), 1200);
  }, [transitioning]);

  const handleEnter = useCallback(() => {
    navigateToChapter(1);
  }, [navigateToChapter]);

  const handleContinue = useCallback(() => {
    navigateToChapter(2);
  }, [navigateToChapter]);

  return (
    <main className="relative min-h-screen bg-[#1a0f0a] overflow-hidden" ref={containerRef}>
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

      {/* Navigation dots (hidden on chapter 1 intro) */}
      {activeChapter > 0 && (
        <NavDots current={activeChapter - 1} onNavigate={navigateToChapter} />
      )}

      {/* Global vignette overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 vignette" />
    </main>
  );
}
