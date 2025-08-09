import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function IndividualSignup() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // 이미 로그인된 경우 프로필 설정으로 이동
    window.location.href = '/individual/profile-setup';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mr-3"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">개인 회원가입</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            개인 회원가입
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            50-60세 구직자를 위한 AI 맞춤형 일자리 매칭 서비스입니다.<br/>
            Replit 계정으로 간편하게 가입하고 개인 프로필을 작성해보세요.
          </p>

          <div className="space-y-4">
            <Button
              asChild
              className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700"
            >
              <a href="/api/login">Replit으로 로그인</a>
            </Button>
            
            <p className="text-sm text-gray-500">
              로그인 후 개인 프로필을 작성하실 수 있습니다
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              개인 회원가입 시 이용 가능한 서비스:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• AI 기반 맞춤형 일자리 추천</li>
              <li>• 자연어 이력서 작성 도우미</li>
              <li>• 기업 정보 및 채용공고 검색</li>
              <li>• 관심 일자리 저장 및 관리</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}