import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Building2 } from 'lucide-react';

export default function Welcome() {
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
        
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            AI 커리어 매칭 플랫폼
          </h1>
          <p className="text-gray-600">
            기업과 인재를 위한 스마트 매칭 서비스
          </p>
        </div>

        {/* Login Section */}
        <div className="max-w-sm mx-auto w-full space-y-4 mb-8">
          <Button
            asChild
            className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700"
            data-testid="button-login"
          >
            <a href="/api/login">로그인</a>
          </Button>
        </div>

        {/* Signup Section */}
        <div className="max-w-sm mx-auto w-full">
          <div className="bg-orange-50/50 rounded-xl p-4 text-center">
            <Building2 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              우수한 인재를 찾는 기업을 위한 서비스
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full h-10 bg-orange-600 text-white border-orange-600 hover:bg-orange-700"
              data-testid="button-company-signup"
            >
              <Link href="/company/signup">기업 회원가입</Link>
            </Button>
          </div>
        </div>

        {/* Notice */}
        <div className="max-w-sm mx-auto w-full mt-8">
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">
              현재 기업 회원가입만 가능합니다
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}