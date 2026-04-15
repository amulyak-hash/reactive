import { USE_CASES } from '../../data/useCases';
import IsometricScene from './IsometricScene';

export default function IsometricConstellation({ width, height }) {
  return (
    <div style={{
      width: width || '100%',
      height: height || 500,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      <IsometricScene
        useCases={USE_CASES}
        onNodeClick={() => {}} // clicks handled by thread, not navigation
      />
    </div>
  );
}
