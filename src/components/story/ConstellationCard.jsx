import { USE_CASE_MAP, USE_CASES } from '../../data/useCases';
import { useStore } from '../../store';
import IsometricScene from '../iso/IsometricScene';
import UseCaseAnswer from '../UseCaseAnswer';
import ImpactSummary from '../ImpactSummary';
import { C } from '../../theme/tokens';

export default function ConstellationCard({ useCaseId, onStoryComplete }) {
  const uc = USE_CASE_MAP[useCaseId];
  const askByUseCase = useStore(s => s.askByUseCase);

  if (!uc) return null;

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      animation: 'fadeIn 300ms ease-out both',
    }}>
      {/* 3D Isometric constellation */}
      <div style={{ width: '100%', height: 560 }}>
        <IsometricScene
          useCases={USE_CASES}
          onNodeClick={(ucId) => askByUseCase(ucId)}
        />
      </div>

      {/* Impact + Answer below */}
      <div style={{ padding: '0 clamp(18px, 2vw, 32px)' }}>
        <div style={{
          borderTop: `1px solid ${C.line}`,
          padding: '16px 0',
        }}>
          <ImpactSummary useCase={uc} />
        </div>

        <div style={{ padding: '0 0 24px' }}>
          <UseCaseAnswer answer={uc.answer} accent={uc.accent} active={true} />
        </div>
      </div>
    </div>
  );
}
