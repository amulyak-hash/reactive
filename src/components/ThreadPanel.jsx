import { useStore } from '../store';
import ResponseCard from './ResponseCard';
import { C, FONT_SANS } from '../theme/tokens';
import { ENTITY_TO_USECASE, getEntityById } from '../data/entityGraph';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThreadPanel() {
  const threadEntity = useStore(s => s.threadEntity);
  const thread = useStore(s => s.thread);

  if (!threadEntity) return null;

  const entity = getEntityById(threadEntity);
  const useCaseId = ENTITY_TO_USECASE[threadEntity];
  // Find the latest thread entry for this use case
  const latestEntry = [...thread].reverse().find(t => t.useCaseId === useCaseId);

  if (!latestEntry) return null;

  const handleClose = () => {
    useStore.setState({ threadEntity: null });
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 450,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'rgba(7, 11, 18, 0.96)',
        borderLeft: `1px solid ${C.line}`,
        backdropFilter: 'blur(20px)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${C.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600,
            color: C.t1,
          }}>
            {entity?.label || 'Analysis'}
          </div>
          {entity?.subtitle && (
            <div style={{
              fontFamily: FONT_SANS, fontSize: 10, color: C.t3, marginTop: 2,
            }}>
              {entity.subtitle}
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          style={{
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${C.line}`,
            color: C.t3, cursor: 'pointer',
            fontFamily: FONT_SANS, fontSize: 14,
            transition: 'background 120ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          ×
        </button>
      </div>

      {/* Response card content */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <ResponseCard useCaseId={useCaseId} />
      </div>
    </motion.div>
  );
}
