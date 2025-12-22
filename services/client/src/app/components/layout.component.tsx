import type React from 'react';
import { Outlet } from 'react-router';
import { Sidebar, type NavSection } from './sidebar.component';

const defaultNavSections: NavSection[] = [
  {
    items: [
      // { path: '/documents', label: 'My Documents', icon: 'folder' },
      { path: '/batches', label: 'Batches', icon: 'stacks' },
      { path: '/batch/new', label: 'New Batch', icon: 'note_stack_add' },
    ],
  },
  // {
  //   label: 'Current Session',
  //   items: [
  //     { path: '/batch/output', label: 'Bulk Output', icon: 'auto_awesome_motion', badge: 8 }, // TODO: Add badge logic
  //   ],
  // },
  // {
  //   label: 'Preferences',
  //   items: [
  //     { path: '/settings', label: 'Settings', icon: 'settings' },
  //   ],
  // },
];

interface AppLayoutProps {
  navSections?: NavSection[];
}

// TODO: Create dedicated .style file
export const AppLayout: React.FC<AppLayoutProps> = ({
  navSections = defaultNavSections,
}) => {
  return (
    <div className="flex h-screen w-full bg-background text-text-main font-display overflow-hidden antialiased">
      <Sidebar sections={navSections} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-fixed-white">
        <div className="flex-1 overflow-y-auto bg-surface">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
