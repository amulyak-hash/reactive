import { useStore } from '../store';
import LifecycleScene from './lifecycle/LifecycleScene';

export default function Dashboard() {
  const askByUseCase = useStore(s => s.askByUseCase);
  return (
    <div style={{ height: '100%', boxSizing: 'border-box', position: 'relative' }}>
      <LifecycleScene onNodeClick={(ucId) => askByUseCase(ucId)} />
    </div>
  );
}
