import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Target, LogOut, Search, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export default function IndividualDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  if (!profile) {
    window.location.href = '/individual/profile-setup';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">
                  {user?.firstName || user?.email}님 환영합니다
                </h1>
                <p className="text-sm text-gray-600">개인 대시보드</p>
              </div>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Search className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">일자리 검색</h3>
              <p className="text-sm text-gray-600 mb-4">맞춤형 일자리를 찾아보세요</p>
              <Button asChild size="sm" className="w-full">
                <Link href="/individual/job-search">검색하기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">AI 추천</h3>
              <p className="text-sm text-gray-600 mb-4">AI가 추천하는 맞춤 일자리</p>
              <Button asChild size="sm" className="w-full">
                <Link href="/individual/recommendations">추천받기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">관심 일자리</h3>
              <p className="text-sm text-gray-600 mb-4">저장한 일자리를 확인하세요</p>
              <Button asChild size="sm" className="w-full">
                <Link href="/individual/saved-jobs">확인하기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              내 프로필
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">기본 정보</h4>
                <p className="text-sm text-gray-600 mb-1">
                  출생년도: {profile.birthYear || '미입력'}
                </p>
                <p className="text-sm text-gray-600">
                  근무시간 조정: {profile.workTimeFlexibility ? '가능' : '불가능'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">희망 사항</h4>
                <p className="text-sm text-gray-600 mb-1">
                  희망 직종: {Array.isArray(profile.preferredJobTypes) && profile.preferredJobTypes.length > 0 
                    ? profile.preferredJobTypes.join(', ') : '미입력'}
                </p>
                <p className="text-sm text-gray-600">
                  희망 지역: {Array.isArray(profile.preferredLocations) && profile.preferredLocations.length > 0 
                    ? profile.preferredLocations.join(', ') : '미입력'}
                </p>
              </div>
            </div>
            {profile.summary && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">자기소개</h4>
                <p className="text-sm text-gray-600">{profile.summary}</p>
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/individual/profile-edit">프로필 수정</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">아직 활동 내역이 없습니다</p>
              <Button asChild>
                <Link href="/individual/job-search">일자리 검색 시작하기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}