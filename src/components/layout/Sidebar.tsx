import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

const NavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-orange text-white' : 'text-gray-600 hover:bg-gray-100'}`
  }>
    <span className="text-lg">{icon}</span>
    {label}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { projectId } = useParams();
  return (
    <aside className="w-56 bg-white border-r flex flex-col py-4 px-2 gap-1 flex-shrink-0 overflow-y-auto">
      <NavItem to="/projects" icon="🏠" label="All Projects" />
      {projectId && (
        <>
          <div className="mt-4 mb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Project</div>
          <NavItem to={`/projects/${projectId}/board`} icon="📋" label="Board" />
          <NavItem to={`/projects/${projectId}/backlog`} icon="📝" label="Backlog" />
          <NavItem to={`/projects/${projectId}/sprints`} icon="🏃" label="Sprints" />
          <NavItem to={`/projects/${projectId}/activity`} icon="📊" label="Activity" />
          <NavItem to={`/projects/${projectId}/settings`} icon="⚙️" label="Settings" />
        </>
      )}
    </aside>
  );
};
