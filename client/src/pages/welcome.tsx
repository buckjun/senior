import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { SignupForm } from '@/components/SignupForm';

export default function Welcome() {
  const [isIndividual, setIsIndividual] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-[#FFFEF0] to-white">
      {/* Status Bar Space */}
      <div className="h-12"></div>

      {/* Header with Logo */}
      <div className="text-center mb-8 px-6">
        <h1 className="text-3xl font-bold text-[#2F3036] mb-2">일있슈</h1>
        <p className="text-[#2F3036]/70 text-sm">50-60세대를 위한 맞춤 취업 플랫폼</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        
        {/* Tab Selection - Only show when not in signup mode */}
        {!showSignup && (
          <div className="flex mb-8 max-w-sm mx-auto w-full">
            <button
              onClick={() => setIsIndividual(true)}
              className={`flex-1 py-3 text-lg font-medium border-b-2 transition-colors ${
                isIndividual 
                  ? 'text-[#2F3036] border-[#D4B896]' 
                  : 'text-[#2F3036]/70 border-transparent'
              }`}
              data-testid="tab-individual"
            >
              개인회원
            </button>
            <button
              onClick={() => setIsIndividual(false)}
              className={`flex-1 py-3 text-lg font-medium border-b-2 transition-colors ${
                !isIndividual 
                  ? 'text-[#2F3036] border-[#D4B896]' 
                  : 'text-[#2F3036]/70 border-transparent'
              }`}
              data-testid="tab-company"
            >
              기업회원
            </button>
          </div>
        )}

        {/* Form Content */}
        {showSignup ? (
          <SignupForm 
            isIndividual={isIndividual} 
            onBackToLogin={() => setShowSignup(false)} 
          />
        ) : (
          <LoginForm 
            isIndividual={isIndividual} 
            onShowSignup={() => setShowSignup(true)} 
          />
        )}
        
      </div>
    </div>
  );
}
