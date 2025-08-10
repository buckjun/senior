import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, MapPin, Users, Calendar, Banknote, Trophy, ArrowLeft, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MatchedCompany {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  education: string;
  experience: string;
  category: string;
  deadline: string;
  employmentType: string;
  companySize: string;
  salary: number | null;
  skills: string;
  matchingScore: number;
  matchingDetails: {
    fieldMatch: number;
    experienceMatch: number;
    educationMatch: number;
    employmentTypeMatch: number;
    certificationBonus: number;
    totalScore: number;
  };
}

interface RecommendationsResponse {
  recommendations: MatchedCompany[];
  userCategories: any[];
  totalCompanies: number;
}

export default function CompanyRecommendationsPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch recommendations
  const { data: recommendationsData, isLoading, error } = useQuery<RecommendationsResponse>({
    queryKey: ['/api/recommendations'],
  });

  const handleBackToCategories = () => {
    setLocation('/individual/job-category-selection');
  };

  const handleBackToDashboard = () => {
    setLocation('/dashboard');
  };

  const formatSalary = (salary: number | null) => {
    if (!salary) return '협의';
    return `${salary.toLocaleString()}만원`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '매우 적합';
    if (score >= 60) return '적합';
    if (score >= 40) return '보통';
    return '검토 필요';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-[#FFFEF0] to-white">
        <div className="w-12 h-12 border-4 border-[#F5F5DC] border-t-[#D4B896] rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-[#2F3036] mt-4">내일을 향한 새로운 출발</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFEF0] to-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">추천을 가져오는 중 오류가 발생했습니다.</p>
          <Button 
            onClick={handleBackToCategories} 
            className="bg-[#D4B896] hover:bg-[#D4B896]/90 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            직종 선택으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const { recommendations = [], userCategories = [], totalCompanies = 0 } = recommendationsData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFEF0] to-white">
      {/* Header */}
      <div className="bg-white border-b border-[#F5F5DC] px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="p-2 hover:bg-[#FFFEF0]"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#2F3036]">
                맞춤 기업 추천
              </h1>
              <p className="text-[#2F3036]/70">
                일있슈가 회원님의 프로필을 분석하여 추천하는 기업들입니다
              </p>
            </div>
          </div>

          {/* Selected Categories & Statistics */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Selected Categories */}
            <div className="bg-[#FFFEF0] rounded-2xl p-6">
              <h3 className="font-semibold text-[#2F3036] mb-3">선택한 직종</h3>
              <div className="flex flex-wrap gap-2">
                {userCategories.map((category: any) => (
                  <span 
                    key={category.id} 
                    className="px-3 py-1 bg-[#F5F5DC] text-[#2F3036] rounded-full text-sm font-medium"
                  >
                    {category.displayName}
                  </span>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-2xl p-6 border border-[#F5F5DC] shadow-sm">
              <h3 className="font-semibold text-[#2F3036] mb-4">추천 현황</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#D4B896]">{recommendations.length}</div>
                  <div className="text-xs text-[#2F3036]/60">추천 기업</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#D4B896]">{totalCompanies}</div>
                  <div className="text-xs text-[#2F3036]/60">전체 기업</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#D4B896]">
                    {recommendations.length > 0 ? Math.round(recommendations[0]?.matchingScore || 0) : 0}%
                  </div>
                  <div className="text-xs text-[#2F3036]/60">최고 매칭</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Recommendations List */}
          {recommendations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#F5F5DC] rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-[#D4B896]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2F3036] mb-2">
                추천 기업이 없습니다
              </h3>
              <p className="text-[#2F3036]/70 mb-8">
                선택하신 직종에 맞는 기업을 찾지 못했습니다.<br />
                다른 직종을 선택하거나 프로필을 더 자세히 작성해보세요.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleBackToCategories} 
                  variant="outline"
                  data-testid="button-reselect-categories"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  직종 다시 선택
                </Button>
                <Button 
                  onClick={() => setLocation('/individual/profile-setup')}
                  className="bg-[#D4B896] hover:bg-[#D4B896]/90 text-white"
                >
                  프로필 보완하기
                </Button>
              </div>
            </div>
        ) : (
          <div className="grid gap-6">
            {recommendations.map((company, index) => (
              <div key={company.id} className="bg-white rounded-2xl p-6 border border-[#F5F5DC] shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[#2F3036]">{company.companyName}</h3>
                      <div className="flex items-center gap-1 bg-[#FFFEF0] px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-[#D4B896] fill-current" />
                        <span className="text-sm font-semibold text-[#2F3036]">
                          {company.matchingScore}%
                        </span>
                      </div>
                    </div>
                    <h4 className="text-lg font-medium text-[#2F3036]/70 mb-3">
                      {company.jobTitle}
                    </h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    company.matchingScore >= 80 
                      ? 'bg-[#FFFEF0] text-[#D4B896]' 
                      : company.matchingScore >= 60 
                        ? 'bg-[#F5F5DC] text-[#2F3036]'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {getScoreLabel(company.matchingScore)}
                  </span>
                </div>

                {/* Company Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    {company.location && (
                      <div className="flex items-center text-[#2F3036]/70">
                        <MapPin className="w-4 h-4 mr-3 text-[#D4B896]" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.companySize && (
                      <div className="flex items-center text-[#2F3036]/70">
                        <Users className="w-4 h-4 mr-3 text-[#D4B896]" />
                        <span>{company.companySize}</span>
                      </div>
                    )}
                    {company.employmentType && (
                      <div className="flex items-center text-[#2F3036]/70">
                        <Building2 className="w-4 h-4 mr-3 text-[#D4B896]" />
                        <span>{company.employmentType}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-[#2F3036]/70">
                      <Banknote className="w-4 h-4 mr-3 text-[#D4B896]" />
                      <span className="font-medium">{formatSalary(company.salary)}</span>
                    </div>
                    {company.deadline && (
                      <div className="flex items-center text-[#2F3036]/70">
                        <Calendar className="w-4 h-4 mr-3 text-[#D4B896]" />
                        <span>마감: {company.deadline}</span>
                      </div>
                    )}
                    {company.experience && (
                      <div className="flex items-center text-[#2F3036]/70">
                        <Trophy className="w-4 h-4 mr-3 text-[#D4B896]" />
                        <span>{company.experience}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {company.skills && (
                  <div className="mb-6 p-4 bg-[#FFFEF0] rounded-lg">
                    <h4 className="font-semibold text-[#2F3036] mb-2">관련 기술/자격증</h4>
                    <p className="text-[#2F3036]/70 text-sm">{company.skills}</p>
                  </div>
                )}

                {/* Matching Details */}
                <div className="bg-[#F5F5DC] rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-[#2F3036] mb-4">매칭 분석</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[#2F3036]/70">분야 매칭</span>
                        <span className="text-sm font-medium text-[#2F3036]">{company.matchingDetails.fieldMatch}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div 
                          className="bg-[#D4B896] h-2 rounded-full transition-all" 
                          style={{ width: `${company.matchingDetails.fieldMatch}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[#2F3036]/70">경력 매칭</span>
                        <span className="text-sm font-medium text-[#2F3036]">{company.matchingDetails.experienceMatch}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div 
                          className="bg-[#D4B896] h-2 rounded-full transition-all" 
                          style={{ width: `${company.matchingDetails.experienceMatch}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[#2F3036]/70">학력 매칭</span>
                        <span className="text-sm font-medium text-[#2F3036]">{company.matchingDetails.educationMatch}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div 
                          className="bg-[#D4B896] h-2 rounded-full transition-all" 
                          style={{ width: `${company.matchingDetails.educationMatch}%` }}
                        ></div>
                      </div>
                    </div>
                    {company.matchingDetails.certificationBonus > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">자격증 보너스</span>
                          <span className="text-sm font-medium text-green-700">+{company.matchingDetails.certificationBonus}점</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid={`button-view-company-${index}`}
                  >
                    상세 정보 보기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackToCategories}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
              data-testid="button-change-categories"
            >
              직종 변경하기
            </Button>
            <Button 
              onClick={handleBackToDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-back-to-dashboard"
            >
              대시보드로 돌아가기
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}