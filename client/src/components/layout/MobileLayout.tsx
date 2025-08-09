import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  title?: string;
  backButton?: boolean;
  onBack?: () => void;
}

export function MobileLayout({ 
  children, 
  showHeader = true, 
  showBottomNav = true,
  title,
  backButton = false,
  onBack
}: MobileLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* 모바일 헤더 */}
      {showHeader && (
        <header className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border-b border-border">
          {backButton && onBack ? (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-hover rounded-lg transition-colors"
              data-testid="button-back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
          
          {title && (
            <h1 className="text-lg font-medium text-foreground" data-testid="text-page-title">
              {title}
            </h1>
          )}
          
          {user ? (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {(user as any).firstName?.[0] || (user as any).email?.[0] || '?'}
              </span>
            </div>
          ) : (
            <div className="w-10 h-10" />
          )}
        </header>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>

      {/* 모바일 하단 네비게이션 */}
      {showBottomNav && user && (
        <nav className="bg-card border-t border-border p-2">
          <div className="flex justify-around">
            <NavButton icon="home" label="홈" to="/" />
            <NavButton icon="search" label="일자리" to="/jobs" />
            <NavButton icon="bookmark" label="찜한공고" to="/individual/saved-jobs" />
            <NavButton icon="user" label="내정보" to="/individual/profile-view" />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ icon, label, to }: { icon: string; label: string; to: string }) {
  const [location, setLocation] = useLocation();
  const isActive = location === to;
  
  return (
    <button 
      onClick={() => setLocation(to)}
      className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
        isActive 
          ? 'text-primary bg-primary/10' 
          : 'text-muted-foreground hover:text-foreground hover:bg-hover'
      }`}
      data-testid={`link-nav-${label}`}
    >
      <NavIcon name={icon} className="w-6 h-6 mb-1" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

function NavIcon({ name, className }: { name: string; className: string }): ReactNode {
  const icons: Record<string, ReactNode> = {
    home: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    bookmark: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    user: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };
  
  return (icons[name as keyof typeof icons] || icons.home) as ReactNode;
}