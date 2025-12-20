import type React from 'react';
import { NavLink, useLocation } from 'react-router';
import { tv } from 'tailwind-variants';

const styles = tv({
  slots: {
    wrapper: [
      'w-[280px] flex-shrink-0',
      'bg-fixed-white border-r-2 border-border-strong',
      'flex flex-col z-20 h-screen',
    ],
    header: 'p-8 pb-8',
    logo: 'flex items-center gap-3',
    logoIcon: [
      'size-10 bg-accent-yellow flex items-center justify-center',
      'border-2 border-border-strong',
      'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      'rounded-md',
    ],
    logoText: 'flex flex-col',
    logoTitle: 'text-xl font-bold leading-none tracking-tight text-text-main',
    logoSubtitle: 'text-xs text-text-muted mt-1 font-medium uppercase tracking-wider',
    nav: 'flex-1 px-4 space-y-2 overflow-y-auto',
    sectionLabel: 'pt-6 pb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-widest',
    navItem: [
      'flex items-center gap-3 px-4 py-3',
      'text-sm font-medium text-text-secondary',
      'border-2 border-transparent',
      'rounded-md',
      'transition-colors duration-200',
      'hover:bg-gray-100 hover:text-text-main hover:border-border-strong',
      'cursor-pointer',
    ],
    navItemActive: [
      'bg-primary text-fixed-black font-bold',
      'border-2 border-border-strong',
      'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    ],
    navBadge: [
      'ml-auto flex size-5 items-center justify-center',
      'bg-fixed-black text-[10px] text-accent-yellow rounded-sm font-bold',
    ],
  },
})();

export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

interface SidebarProps {
  sections: NavSection[];
}

export const Sidebar: React.FC<SidebarProps> = ({ sections }) => {
  const location = useLocation();

  return (
    <aside className={styles.wrapper()}>
      <div className={styles.header()}>
        <div className={styles.logo()}>
          <div className={styles.logoIcon()}>
            <span className="material-symbols-outlined !text-2xl text-fixed-black font-bold">article</span>
          </div>
          <div className={styles.logoText()}>
            <span className={styles.logoTitle()}>AI Docs</span>
            <span className={styles.logoSubtitle()}>Bulk Processor</span>
          </div>
        </div>
      </div>

      <nav className={styles.nav()}>
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.label && (
              <div className={styles.sectionLabel()}>{section.label}</div>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem()} ${isActive ? styles.navItemActive() : ''}`}
                >
                  {item.icon && (
                    <span className="material-symbols-outlined !text-[20px]">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={styles.navBadge()}>{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};
