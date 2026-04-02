import type React from 'react';

type Styles = Record<string, React.CSSProperties>;

export const pageStyles: Styles = {
  page: {
    minHeight: '100vh',
    background: '#070B12',
    color: '#F1F5F9',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    overflowX: 'hidden',
  },
  header: {
    borderBottom: '1px solid #1C2D42',
    padding: '48px 0 36px',
    background: 'linear-gradient(180deg, #0C1420 0%, #070B12 100%)',
  },
  headerInner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '0 40px',
  },
  headerEyebrow: {
    margin: '0 0 8px',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#3B8BF6',
  },
  headerTitle: {
    margin: '0 0 12px',
    fontSize: 28,
    fontWeight: 700,
    color: '#F1F5F9',
    letterSpacing: '-0.02em',
  },
  headerSubtitle: {
    margin: 0,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 1.6,
  },
  main: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '48px 40px 96px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 64,
  },
  block: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  questionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },
  qNum: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    color: '#334155',
    letterSpacing: '0.08em',
    paddingTop: 3,
  },
  qText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: '#CBD5E1',
    lineHeight: 1.5,
  },
  vizWrap: {
    display: 'flex',
    justifyContent: 'flex-start',
    background: '#070B12',
    border: '1px solid #1C2D42',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  insight: {
    margin: 0,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 1.7,
    paddingLeft: 36,
    borderLeft: '2px solid #1C2D42',
  },
  highlight: {
    color: '#94A3B8',
    fontWeight: 700,
  },
  highlightsWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    paddingLeft: 36,
    borderLeft: '2px solid #1C2D42',
  },
  highlightsLabel: {
    margin: '0 0 4px',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: '#334155',
  },
};
