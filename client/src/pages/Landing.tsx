import { Wifi, Signal, Battery } from 'lucide-react';

export default function Landing() {
  return (
    <div className="w-full max-w-sm mx-auto min-h-screen flex flex-col" style={{ backgroundColor: '#FEF7E6' }}>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 text-black text-sm font-medium">
        <div className="flex items-center space-x-1">
          <Signal className="w-4 h-4" />
          <Wifi className="w-4 h-4" />
        </div>
        <div className="text-center font-semibold">1:47</div>
        <div className="flex items-center space-x-1">
          <Battery className="w-4 h-4" />
          <span className="text-xs">100%</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        {/* Character with Star */}
        <div className="relative mb-8">
          {/* Star above character */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.09 8.26L20 9.27L15.82 13.14L16.91 19.02L12 16.77L7.09 19.02L8.18 13.14L4 9.27L9.91 8.26L12 2Z" fill="#FFB000" />
            </svg>
          </div>
          
          {/* Main Character */}
          <div className="w-32 h-32 rounded-full flex items-center justify-center relative" style={{ backgroundColor: '#FF8B47' }}>
            {/* Character Eyes */}
            <div className="flex space-x-3">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Briefcase Icon */}
        <div className="relative mb-6">
          <div className="w-16 h-12 rounded-md flex items-center justify-center relative" style={{ backgroundColor: '#FF8B47' }}>
            {/* Briefcase handle */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 border-2 border-orange-600 rounded-t-md bg-transparent"></div>
            
            {/* Checkmark */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD700' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center">
          <h1 
            className="text-6xl font-bold mb-8" 
            style={{ 
              color: '#FFB000',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.02em'
            }}
            data-testid="text-app-title"
          >
            일있슈
          </h1>
        </div>

        {/* Touch area for navigation */}
        <button 
          onClick={() => window.location.href = '/api/login'}
          className="absolute inset-0 w-full h-full bg-transparent"
          style={{ zIndex: 10 }}
          aria-label="앱 시작하기"
        />
      </div>
    </div>
  );
}