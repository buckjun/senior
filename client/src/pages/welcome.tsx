import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Handshake } from 'lucide-react';

export default function Welcome() {
  useEffect(() => {
    // Simulate push notification after 3 seconds
    const timer = setTimeout(() => {
      // This would be replaced with actual push notification service
      console.log("Push notification: 새로운 공고가 등록되었어요!");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 gradient-primary text-white">
        {/* App Logo/Icon */}
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
          <Handshake className="text-white text-4xl" />
        </div>
        
        <h1 className="text-large font-bold text-center mb-4 leading-tight">
          경험은 가장 위대한<br />자산입니다
        </h1>
        
        <p className="text-body text-white/90 text-center mb-12 leading-relaxed">
          AI가 당신의 새로운 시작을<br />함께합니다
        </p>
        
        {/* User Type Selection */}
        <div className="w-full space-y-4 max-w-sm">
          <Link href="/api/login?userType=individual">
            <Button 
              className="w-full bg-white text-primary py-4 px-6 rounded-2xl text-body font-semibold shadow-lg hover:bg-white/95"
              data-testid="button-individual-signup"
            >
              <i className="fas fa-user mr-3"></i>
              개인회원 - 새로운 일자리 찾기
            </Button>
          </Link>
          
          <Link href="/api/login?userType=company">
            <Button 
              variant="outline"
              className="w-full bg-white/10 border-2 border-white text-white py-4 px-6 rounded-2xl text-body font-semibold shadow-lg hover:bg-white/20 border-white"
              data-testid="button-company-signup"
            >
              <i className="fas fa-building mr-3"></i>
              기업회원 - 최고의 인재 채용하기
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="h-8 bg-white safe-area-bottom"></div>
    </div>
  );
}
