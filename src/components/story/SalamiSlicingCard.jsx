import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { USE_CASE_MAP } from '../../data/useCases';
import TimeScrubber from './TimeScrubber';
import NCEScatterField from './NCEScatterField';
import ClauseSpreadPanel from './ClauseSpreadPanel';
import RealCostPanel from './RealCostPanel';
import TrajectoryPanel from './TrajectoryPanel';
import SalamiDataDrawer from './SalamiDataDrawer';
import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

// ─── Contractor data remapped to logos we have ───
const CONTRACTORS = [
  {
    id: 'kec',
    name: 'KEC International',
    shortName: 'KEC',
    color: C.amber,
    logo: '/logos/kec.png',
    isFlagged: true,
    nces: [
      { month: 0, clause: 0, value: 47 },
      { month: 1, clause: 1, value: 38 },
      { month: 2, clause: 0, value: 28 },
      { month: 2, clause: 2, value: 14 },
      { month: 3, clause: 1, value: 42 },
      { month: 3, clause: 0, value: 23 },
      { month: 3, clause: 2, value: 29 },
    ],
    clauses: [
      { label: 'Access delays (60.1(2))', count: 3, total: 98, color: C.amber },
      { label: 'Design changes (60.1(1))', count: 2, total: 72, color: C.orange },
      { label: 'Physical conditions (60.1(12))', count: 2, total: 51, color: C.red },
    ],
    bid: { winning: 1200, nextBidder: 1360, projected: 2190 },
    trajectory: {
      values: [0, 47, 85, 127, 221, 340, 500, 700, 990],
      months: ['M0','M1','M2','M3','M4','M6','M8','M10','M14'],
      nowIdx: 4,
    },
    summary: '7 NCEs in 4 months, each below £50K threshold. Bid 12% below next bidder. Projected total: £990K — effective cost £830K MORE than alternative.',
  },
  {
    id: 'afcons',
    name: 'Afcons Infra',
    shortName: 'Afcons',
    color: C.blue,
    logo: '/logos/afcons.png',
    isFlagged: false,
    nces: [
      { month: 1, clause: 1, value: 65 },
    ],
    clauses: [
      { label: 'Design changes (60.1(1))', count: 1, total: 65, color: C.blue },
    ],
    bid: { winning: 980, nextBidder: 1050, projected: 1045 },
    trajectory: {
      values: [0, 0, 65, 65, 65, 65, 65, 65, 65],
      months: ['M0','M1','M2','M3','M4','M6','M8','M10','M14'],
      nowIdx: 4,
    },
    summary: '1 NCE at £65K — single design change claim. Normal pattern.',
  },
  {
    id: 'lt',
    name: 'L&T Construction',
    shortName: 'L&T',
    color: C.green,
    logo: '/logos/lt.png',
    isFlagged: false,
    nces: [
      { month: 2, clause: 1, value: 120 },
    ],
    clauses: [
      { label: 'Design changes (60.1(1))', count: 1, total: 120, color: C.green },
    ],
    bid: { winning: 1540, nextBidder: 1620, projected: 1660 },
    trajectory: {
      values: [0, 0, 0, 120, 120, 120, 120, 120, 120],
      months: ['M0','M1','M2','M3','M4','M6','M8','M10','M14'],
      nowIdx: 4,
    },
    summary: '1 NCE at £120K — legitimate large design change. No pattern.',
  },
  {
    id: 'ncc',
    name: 'NCC Ltd',
    shortName: 'NCC',
    color: C.purple,
    logo: '/logos/ncc.png',
    isFlagged: false,
    nces: [
      { month: 0, clause: 0, value: 25 },
      { month: 3, clause: 2, value: 30 },
    ],
    clauses: [
      { label: 'Access delays (60.1(2))', count: 1, total: 25, color: C.purple },
      { label: 'Physical conditions (60.1(12))', count: 1, total: 30, color: C.purple },
    ],
    bid: { winning: 860, nextBidder: 905, projected: 915 },
    trajectory: {
      values: [0, 25, 25, 25, 55, 55, 55, 55, 55],
      months: ['M0','M1','M2','M3','M4','M6','M8','M10','M14'],
      nowIdx: 4,
    },
    summary: '2 small NCEs across 2 clauses — low value, no escalation pattern.',
  },
  {
    id: 'tata',
    name: 'Tata Projects',
    shortName: 'Tata',
    color: C.cyan,
    logo: '/logos/tata.png',
    isFlagged: false,
    nces: [
      { month: 3, clause: 1, value: 180 },
    ],
    clauses: [
      { label: 'Design changes (60.1(1))', count: 1, total: 180, color: C.cyan },
    ],
    bid: { winning: 2100, nextBidder: 2350, projected: 2280 },
    trajectory: {
      values: [0, 0, 0, 0, 180, 180, 180, 180, 180],
      months: ['M0','M1','M2','M3','M4','M6','M8','M10','M14'],
      nowIdx: 4,
    },
    summary: '1 NCE at £180K — large but transparent. Single claim, single clause.',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr'];
const CLAUSES = ['Access 60.1(2)', 'Design 60.1(1)', 'Physical 60.1(12)'];

export default function SalamiSlicingCard({ useCaseId, onStoryComplete }) {
  const uc = USE_CASE_MAP[useCaseId];
  // Start at month 4 — all dots visible by default
  const [scrubValue, setScrubValue] = useState(1);
  const [hasStartedDragging, setHasStartedDragging] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const containerRef = useRef(null);
  const [vizWidth, setVizWidth] = useState(0);

  const measuredRef = useCallback((node) => {
    if (!node) return;
    containerRef.current = node;
    setVizWidth(node.offsetWidth);
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setVizWidth(Math.floor(w));
    });
    ro.observe(node);
  }, []);

  const handleScrub = useCallback((v) => {
    setScrubValue(v);
    if (!hasStartedDragging) setHasStartedDragging(true);
  }, [hasStartedDragging]);

  const handleContractorClick = useCallback((contractorId) => {
    setSelectedContractor(prev => prev === contractorId ? null : contractorId);
  }, []);

  if (!uc) return null;

  const activeContractor = selectedContractor
    ? CONTRACTORS.find(c => c.id === selectedContractor)
    : CONTRACTORS[0]; // KEC (flagged) is default

  const leftWidth = Math.floor(vizWidth * 0.7);
  const vizHeight = Math.max(380, Math.min(leftWidth * 0.6, 520));

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      animation: 'fadeIn 300ms ease-out both',
    }}>
      <div ref={measuredRef} style={{ padding: '0 clamp(18px, 2vw, 32px)' }}>

        {/* ─── 70/30 split layout ─── */}
        <div style={{
          display: 'flex',
          gap: 16,
          alignItems: 'stretch',
          minHeight: vizHeight + 80, // scrubber + scatter
        }}>

          {/* ─── Left: 70% — Scrubber + Scatter ─── */}
          <div style={{ flex: '0 0 70%', minWidth: 0 }}>
            <TimeScrubber
              value={scrubValue}
              onChange={handleScrub}
              months={MONTHS}
            />

            {vizWidth > 0 && (
              <NCEScatterField
                width={leftWidth}
                height={vizHeight}
                scrubValue={scrubValue}
                contractors={CONTRACTORS}
                clauses={CLAUSES}
                months={MONTHS}
                hasStartedDragging={hasStartedDragging}
                selectedContractor={selectedContractor}
                onContractorClick={handleContractorClick}
              />
            )}
          </div>

          {/* ─── Right: 30% — Stacked panels ─── */}
          <div style={{
            flex: '0 0 calc(30% - 16px)',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingTop: 8,
          }}>
            {/* Contractor header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeContractor.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}>
                  <img
                    src={activeContractor.logo}
                    alt={activeContractor.name}
                    style={{
                      width: 24, height: 24, borderRadius: 5,
                      objectFit: 'contain',
                      background: 'rgba(255,255,255,0.06)',
                      padding: 2,
                    }}
                  />
                  <span style={{
                    fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600,
                    color: activeContractor.color,
                  }}>
                    {activeContractor.shortName}
                  </span>
                  {activeContractor.isFlagged && (
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 7, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: C.red, background: `${C.red}18`,
                      padding: '2px 6px', borderRadius: 3,
                      border: `1px solid ${C.red}30`,
                    }}>
                      Flagged
                    </span>
                  )}
                </div>

                <div style={{
                  fontFamily: FONT_SANS, fontSize: 9,
                  color: C.t3, lineHeight: 1.4,
                  marginBottom: 6,
                }}>
                  Click a logo in the scatter to compare contractors
                </div>

                <div style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${activeContractor.color}44, transparent)`,
                  marginBottom: 4,
                }} />
              </motion.div>
            </AnimatePresence>

            {/* Panels stacked vertically */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeContractor.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  flex: 1,
                }}
              >
                <ClauseSpreadPanel contractor={activeContractor} />
                <RealCostPanel contractor={activeContractor} />
                <TrajectoryPanel contractor={activeContractor} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Data Drawer — full width below ─── */}
        <SalamiDataDrawer
          contractors={CONTRACTORS}
          drawerOpen={drawerOpen}
          onToggle={() => setDrawerOpen(prev => !prev)}
        />
      </div>
    </div>
  );
}
