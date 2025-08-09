import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, Heart, User, Briefcase, Users, Settings } from 'lucide-react';

interface MobileNavProps {
  type?: 'individual' | 'company';
}

export function MobileNav({ type = 'individual' }: MobileNavProps) {
  const [location] = useLocation();

  const individualNavItems = [
    { path: '/individual/dashboard', icon: Home, label: '홈', testId: 'nav-home' },
    { path: '/individual/search', icon: Search, label: '탐색', testId: 'nav-search' },
    { path: '/saved-jobs', icon: Heart, label: '찜한공고', testId: 'nav-saved' },
    { path: '/individual/profile-view', icon: User, label: '내정보', testId: 'nav-profile' },
  ];

  const companyNavItems = [
    { path: '/company/dashboard', icon: Home, label: '홈', testId: 'nav-home' },
    { path: '/company/jobs', icon: Briefcase, label: '공고관리', testId: 'nav-jobs' },
    { path: '/company/applicants', icon: Users, label: '지원자', testId: 'nav-applicants' },
    { path: '/company/settings', icon: Settings, label: '설정', testId: 'nav-settings' },
  ];

  const navItems = type === 'individual' ? individualNavItems : companyNavItems;

  return (
    <div className="mobile-nav safe-area-bottom">
      <div className="grid grid-cols-4 py-2">
        {navItems.map(({ path, icon: Icon, label, testId }) => {
          const isActive = location === path || location.startsWith(path);
          
          return (
            <Link key={path} href={path}>
              <div 
                className={`mobile-nav-item touch-target ${isActive ? 'active' : ''}`}
                data-testid={testId}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
