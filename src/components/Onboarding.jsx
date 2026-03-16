import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { C, rgb, FONT_SERIF, FONT_MONO, FONT_SANS } from '../theme/tokens';
import { useStore } from '../store';

const SCREEN_DURATIONS = [3500, 3500, 3500, 3500, 2000];
const TOTAL_SCREENS = 5;

const SYSTEM_LABELS = ['SCADA', 'MES', 'ERP', 'Quality', 'Supply Chain', 'Energy'];
const LABEL_OFFSETS = [
  { x: -120, y: -55 }, { x: 80, y: -50 },
  { x: -95, y: 25 },   { x: 100, y: 35 },
  { x: -35, y: -80 },  { x: 55, y: 70 },
];

// Pre-computed random widths for Screen3 chart lines (avoids flicker on re-render)
const CHART_LINE_WIDTHS = [58, 72, 63, 77];

export default function Onboarding() {
  const enterDashboard = useStore(s => s.enterDashboard);
  const [screen, setScreen] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [screenOpacity, setScreenOpacity] = useState(1);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(performance.now());
  const activeTlRef = useRef(null); // single source of truth for active timeline

  // Exit with fade-to-black
  const exit = useCallback(() => {
    if (fading) return;
    setFading(true);
    if (activeTlRef.current) activeTlRef.current.kill();
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    setTimeout(() => enterDashboard(), 300);
  }, [fading, enterDashboard]);

  // Skip = same as exit
  const skip = useCallback(() => exit(), [exit]);

  // Register active timeline from child screens (for cleanup on skip)
  const registerTimeline = useCallback((tl) => {
    if (activeTlRef.current && activeTlRef.current !== tl) {
      activeTlRef.current.kill();
    }
    activeTlRef.current = tl;
  }, []);

  // Progress bar — smooth rAF-driven
  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const screenDur = SCREEN_DURATIONS[screen] || 3500;
      const withinScreen = Math.min(elapsed / screenDur, 1);
      const total = (screen + withinScreen) / TOTAL_SCREENS;
      setProgress(total);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen]);

  // Auto-advance screens
  useEffect(() => {
    if (fading) return;
    const dur = SCREEN_DURATIONS[screen];
    if (screen >= TOTAL_SCREENS) return;

    timerRef.current = setTimeout(() => {
      if (screen < TOTAL_SCREENS - 1) {
        // Brief crossfade between screens
        setScreenOpacity(0);
        setTimeout(() => {
          setScreen(s => s + 1);
          setScreenOpacity(1);
        }, 150);
      } else {
        // Screen 5 done — fade to black, then enter dashboard
        exit();
      }
    }, dur);

    return () => clearTimeout(timerRef.current);
  }, [screen, fading, exit]);

  const bottomText = [
    null,
    'Cross-system intelligence from every data source',
    'Context-aware dashboards that build themselves',
    'Proactive intelligence before you search',
    null,
  ];

  return (
    <div onClick={skip} style={{
      position: 'fixed', inset: 0, background: C.bg, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', overflow: 'hidden',
      opacity: fading ? 0 : 1,
      transition: 'opacity 300ms ease',
    }}>
      {/* Screen content with crossfade */}
      <div style={{
        opacity: screenOpacity,
        transition: 'opacity 150ms ease',
      }}>
        {screen === 0 && <Screen1 registerTimeline={registerTimeline} />}
        {screen === 1 && <Screen2 registerTimeline={registerTimeline} />}
        {screen === 2 && <Screen3 registerTimeline={registerTimeline} />}
        {screen === 3 && <Screen4 registerTimeline={registerTimeline} />}
        {screen === 4 && <Screen5 />}
      </div>

      {/* Bottom text */}
      {bottomText[screen] && (
        <div style={{
          position: 'absolute', bottom: 28, left: 0, right: 0,
          textAlign: 'center', fontFamily: FONT_SANS, fontSize: 11,
          color: C.t3, opacity: screenOpacity, transition: 'opacity 150ms ease',
        }}>
          {bottomText[screen]}
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: rgb(C.orange, 0.15),
      }}>
        <div style={{
          height: '100%', background: C.orange,
          width: `${progress * 100}%`,
          transition: 'width 50ms linear',
        }} />
      </div>
    </div>
  );
}

/* ─── Screen 1: Logo Reveal ─── */
function Screen1({ registerTimeline }) {
  const diamondRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    registerTimeline(tl);

    // 300ms void, then diamond scales up with 45° rotation
    tl.fromTo(diamondRef.current,
      { scale: 0, rotation: 0 },
      { scale: 1, rotation: 45, duration: 0.6, ease: 'power2.out', delay: 0.3 }
    )
    // Title fades in 300ms after diamond completes
    .fromTo(titleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3 },
      '+=0.1'
    )
    // Subtitle fades in 200ms after title
    .fromTo(subRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
      '+=0.1'
    );

    // Gentle pulse: oscillate 0.85 ↔ 1.0, 2s total period
    gsap.fromTo(groupRef.current,
      { opacity: 0.85 },
      { opacity: 1, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 }
    );

    return () => {
      tl.kill();
      gsap.killTweensOf(groupRef.current);
    };
  }, [registerTimeline]);

  return (
    <div ref={groupRef} style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div ref={diamondRef} style={{
          width: 24, height: 24, background: C.orange,
          transform: 'scale(0) rotate(0deg)',
        }} />
      </div>
      <div ref={titleRef} style={{
        fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 300, color: C.t1, opacity: 0,
      }}>
        Enterprise Brain
      </div>
      <div ref={subRef} style={{
        fontFamily: FONT_MONO, fontSize: 11, color: C.t3, marginTop: 8, opacity: 0,
      }}>
        Intelligent Operations Command Center
      </div>
    </div>
  );
}

/* ─── Screen 2: Connects Every System ─── */
function Screen2({ registerTimeline }) {
  const wrapperRefs = useRef([]);
  const nodeRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    registerTimeline(tl);

    // Stagger labels: fade + slide up from wrapper divs (no transform conflict)
    tl.fromTo(wrapperRefs.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.12, duration: 0.4, ease: 'power2.out' }
    )
    // Central cyan node pops in after all labels visible (~1s)
    .fromTo(nodeRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      '+=0.2'
    );

    return () => tl.kill();
  }, [registerTimeline]);

  return (
    <div style={{ position: 'relative', width: 300, height: 200 }}>
      {SYSTEM_LABELS.map((label, i) => (
        <div
          key={label}
          ref={el => wrapperRefs.current[i] = el}
          style={{
            position: 'absolute',
            left: `calc(50% + ${LABEL_OFFSETS[i].x}px)`,
            top: `calc(50% + ${LABEL_OFFSETS[i].y}px)`,
            transform: 'translate(-50%, -50%)',
            opacity: 0,
          }}
        >
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10, color: C.t2,
            border: `1px solid ${C.bd}`, padding: '6px 14px',
            borderRadius: 6, whiteSpace: 'nowrap',
          }}>
            {label}
          </div>
        </div>
      ))}
      <div ref={nodeRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 12, height: 12, borderRadius: '50%', background: C.cyan,
        boxShadow: `0 0 20px ${rgb(C.cyan, 0.4)}`,
        opacity: 0,
      }} />
    </div>
  );
}

/* ─── Screen 3: Builds Itself ─── */
function Screen3({ registerTimeline }) {
  const cardsRef = useRef([]);
  const linesRef = useRef([]);
  const accents = [C.blue, C.cyan, C.orange, C.green];

  useEffect(() => {
    const tl = gsap.timeline();
    registerTimeline(tl);

    tl.fromTo(cardsRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, stagger: 0.15, duration: 0.4, ease: 'power2.out' }
    )
    .fromTo(linesRef.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, stagger: 0.1, duration: 0.4, ease: 'power2.out', transformOrigin: 'left' },
      '+=0.3'
    );

    return () => tl.kill();
  }, [registerTimeline]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {accents.map((accent, i) => (
        <div
          key={i}
          ref={el => cardsRef.current[i] = el}
          style={{
            width: 120, height: 48, borderRadius: 8,
            border: `1px solid ${rgb(accent, 0.2)}`,
            background: rgb(accent, 0.04),
            display: 'flex', alignItems: 'flex-end', padding: 8,
            opacity: 0,
          }}
        >
          <div
            ref={el => linesRef.current[i] = el}
            style={{
              width: `${CHART_LINE_WIDTHS[i]}%`, height: 3,
              background: rgb(accent, 0.3), borderRadius: 2,
              opacity: 0, transformOrigin: 'left',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Screen 4: Surfaces What's Critical ─── */
function Screen4({ registerTimeline }) {
  const numRef = useRef(null);
  const dotRef = useRef(null);
  const alertRef = useRef(null);
  const [alertText, setAlertText] = useState('');
  const fullAlert = 'Alert: Line 3 deviation detected';

  useEffect(() => {
    const tl = gsap.timeline();
    registerTimeline(tl);

    let typingInterval;

    // Number fades in
    tl.fromTo(numRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
    // Color transition: green → amber (1s) → red (1s) = 2s total
    .to(numRef.current, { color: C.amber, duration: 1 })
    .to(numRef.current, { color: C.red, duration: 1 })
    // After color shift: red pulsing dot appears
    .fromTo(dotRef.current,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.3 }
    )
    // Alert text container fades in
    .fromTo(alertRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2 }
    )
    // Typing synchronized via GSAP .call()
    .call(() => {
      let idx = 0;
      typingInterval = setInterval(() => {
        idx++;
        if (idx >= fullAlert.length) {
          setAlertText(fullAlert);
          clearInterval(typingInterval);
        } else {
          setAlertText(fullAlert.slice(0, idx));
        }
      }, 50);
    });

    return () => {
      tl.kill();
      clearInterval(typingInterval);
    };
  }, [registerTimeline]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div ref={numRef} style={{
        fontFamily: FONT_MONO, fontSize: 42, fontWeight: 800, color: C.green, opacity: 0,
      }}>
        94.2<span style={{ fontSize: 20, color: C.t3 }}>%</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 16, minHeight: 20,
      }}>
        <div ref={dotRef} style={{
          width: 6, height: 6, borderRadius: '50%', background: C.red,
          animation: 'pulse-dot 1.5s ease-in-out infinite', opacity: 0,
        }} />
        <div ref={alertRef} style={{
          fontFamily: FONT_MONO, fontSize: 10, color: C.t2, opacity: 0,
        }}>
          {alertText}
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 5: Transition ─── */
function Screen5() {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: 12, color: C.t2,
    }}>
      Entering Tata Steel Operations...
      <span style={{
        color: C.t2,
        animation: 'blink 1s step-end infinite',
        marginLeft: 2,
      }}>|</span>
    </div>
  );
}
