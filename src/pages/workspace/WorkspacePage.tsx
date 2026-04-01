import { useEffect } from 'react';

import { WorkspaceShell } from '../../components/workspaceShell/WorkspaceShell';
import { useWorkspace } from '../../hooks/useWorkspace';
import { cleanupVisualizationMounts } from '../../utils/mounts';

export function WorkspacePage() {
  useEffect(() => {
    const cleanupWorkspace = useWorkspace();

    return () => {
      cleanupWorkspace();
      cleanupVisualizationMounts();
    };
  }, []);

  return <WorkspaceShell />;
}
