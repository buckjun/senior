import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function Welcome() {
  const [isIndividual, setIsIndividual] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-[#FFFEF0] to-white">
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

        {/* Login Form */}
        <LoginForm isIndividual={isIndividual} />
        
      </div>
    </div>
  );
}
