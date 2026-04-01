import './styles.css';
import { WorkspacePage } from './pages/workspace/WorkspacePage';
import { ProjectDashboardPage } from './pages/projectDashboard';

const page = new URLSearchParams(window.location.search).get('page');

export default function App() {
  if (page === 'project-dashboard') {
    return <ProjectDashboardPage />;
  }
  return <WorkspacePage />;
}
