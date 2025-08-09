import React, { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function Welcome() {
  const [isIndividual, setIsIndividual] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation('/individual/dashboard');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFEF0 49.04%, #FFFFFF 100%)'
      }}
    >
      {/* Status Bar Space */}
      <div className="h-12"></div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        
        {/* Tab Selection */}
        <div className="flex mb-8 max-w-sm mx-auto w-full">
          <button
            onClick={() => setIsIndividual(true)}
            className={`flex-1 py-3 text-lg font-medium border-b-2 transition-colors ${
              isIndividual 
                ? 'text-gray-800 border-blue-500' 
                : 'text-gray-500 border-transparent'
            }`}
            data-testid="tab-individual"
          >
            개인회원
          </button>
          <button
            onClick={() => setIsIndividual(false)}
            className={`flex-1 py-3 text-lg font-medium border-b-2 transition-colors ${
              !isIndividual 
                ? 'text-gray-800 border-blue-500' 
                : 'text-gray-500 border-transparent'
            }`}
            data-testid="tab-company"
          >
            기업회원
          </button>
        </div>

        {/* Login Form */}
        <LoginForm isIndividual={isIndividual} />
        
      </div>
    </div>
  );
}
