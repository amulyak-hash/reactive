import { useRef, useState, useEffect } from 'react';
import RiskConstellation from '../canvas/uc/RiskConstellation';
import { useStore } from '../store';
import { USE_CASES } from '../data/useCases';

export default function Dashboard() {
  const askByUseCase = useStore(s => s.askByUseCase);
  const containerRef = useRef(null);
  const [vizWidth, setVizWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    setVizWidth(containerRef.current.offsetWidth);
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 0) setVizWidth(Math.floor(width));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const vizHeight = Math.max(460, Math.min(vizWidth * 0.6, 640));

  return (
    <div ref={containerRef} style={{
      padding: '16px clamp(18px, 2vw, 32px) 8px',
    }}>
      {vizWidth > 0 && (
        <RiskConstellation
          width={vizWidth}
          height={vizHeight}
          useCases={USE_CASES}
          onNodeClick={(ucId) => askByUseCase(ucId)}
        />
      )}
    </div>
  );
}
