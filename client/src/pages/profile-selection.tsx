import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSelection() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">
                {user?.firstName || user?.email}님 환영합니다
              </h1>
              <p className="text-sm text-gray-600">프로필을 선택해주세요</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href="/api/logout">
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Selection */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            어떤 방식으로 이용하시겠습니까?
          </h2>
          <p className="text-gray-600">
            개인 구직자 또는 기업 채용담당자로 가입할 수 있습니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Profile */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-600">개인 회원</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                50-60세 구직자를 위한<br/>
                맞춤형 일자리 매칭 서비스
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• AI 기반 맞춤 일자리 추천</li>
                <li>• 자연어 이력서 작성</li>
                <li>• 기업 정보 검색</li>
                <li>• 관심 일자리 관리</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/individual/profile-setup">개인 프로필 작성</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Company Profile */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-orange-600">기업 회원</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                우수한 5060 인재를<br/>
                찾는 기업을 위한 서비스
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• 경력직 인재 검색</li>
                <li>• 채용공고 관리</li>
                <li>• AI 인재 매칭</li>
                <li>• 사업자 인증 시스템</li>
              </ul>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/company/signup">기업 프로필 작성</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            언제든지 프로필을 변경하거나 추가할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}