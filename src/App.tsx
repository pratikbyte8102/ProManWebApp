import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BoardPage } from './pages/BoardPage';
import { BacklogPage } from './pages/BacklogPage';
import { SprintsPage } from './pages/SprintsPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { ActivityPage } from './pages/ActivityPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AppLayout />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId/board" element={<BoardPage />} />
        <Route path="/projects/:projectId/backlog" element={<BacklogPage />} />
        <Route path="/projects/:projectId/sprints" element={<SprintsPage />} />
        <Route path="/projects/:projectId/activity" element={<ActivityPage />} />
        <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
