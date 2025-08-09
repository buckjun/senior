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
    setLocation('/individual/job-categories');
  };

  const handleBackToDashboard = () => {
    setLocation('/individual/dashboard');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">맞춤 회사를 찾는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">추천을 가져오는 중 오류가 발생했습니다.</p>
          <Button onClick={handleBackToCategories} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            직종 선택으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const { recommendations = [], userCategories = [], totalCompanies = 0 } = recommendationsData || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="p-2"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                맞춤 회사 추천
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                선택하신 직종과 프로필을 기반으로 추천드립니다
              </p>
            </div>
          </div>

          {/* Selected Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">선택한 직종:</span>
            {userCategories.map((category: any) => (
              <Badge key={category.id} variant="secondary" className="text-xs">
                {category.displayName}
              </Badge>
            ))}
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">추천 회사</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{totalCompanies}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">총 관련 회사</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {recommendations.length > 0 ? Math.round(recommendations[0]?.matchingScore || 0) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">최고 매칭점수</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building2 className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              추천 회사가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              선택하신 직종에 맞는 회사를 찾지 못했습니다. 다른 직종을 선택해보세요.
            </p>
            <Button onClick={handleBackToCategories} data-testid="button-reselect-categories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              직종 다시 선택하기
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {recommendations.map((company, index) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{company.companyName}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className={`text-sm font-medium ${getScoreColor(company.matchingScore)}`}>
                            {company.matchingScore}점
                          </span>
                        </div>
                      </div>
                      <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {company.jobTitle}
                      </h3>
                    </div>
                    <Badge 
                      variant={company.matchingScore >= 80 ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {getScoreLabel(company.matchingScore)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      {company.location && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mr-2" />
                          {company.location}
                        </div>
                      )}
                      {company.companySize && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Users className="w-4 h-4 mr-2" />
                          {company.companySize}
                        </div>
                      )}
                      {company.employmentType && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Building2 className="w-4 h-4 mr-2" />
                          {company.employmentType}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Banknote className="w-4 h-4 mr-2" />
                        {formatSalary(company.salary)}
                      </div>
                      {company.deadline && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          마감: {company.deadline}
                        </div>
                      )}
                      {company.experience && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Trophy className="w-4 h-4 mr-2" />
                          {company.experience}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {company.skills && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">관련 기술/자격증:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{company.skills}</p>
                    </div>
                  )}

                  {/* Matching Details */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">매칭 상세</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>분야 매칭</span>
                        <div className="flex items-center gap-2">
                          <Progress value={company.matchingDetails.fieldMatch} className="w-16 h-2" />
                          <span className="w-8">{company.matchingDetails.fieldMatch}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>경력 매칭</span>
                        <div className="flex items-center gap-2">
                          <Progress value={company.matchingDetails.experienceMatch} className="w-16 h-2" />
                          <span className="w-8">{company.matchingDetails.experienceMatch}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>학력 매칭</span>
                        <div className="flex items-center gap-2">
                          <Progress value={company.matchingDetails.educationMatch} className="w-16 h-2" />
                          <span className="w-8">{company.matchingDetails.educationMatch}%</span>
                        </div>
                      </div>
                      {company.matchingDetails.certificationBonus > 0 && (
                        <div className="flex items-center justify-between text-xs text-green-600">
                          <span>자격증 보너스</span>
                          <span>+{company.matchingDetails.certificationBonus}점</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" data-testid={`button-view-company-${index}`}>
                      상세 정보 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackToCategories}
              data-testid="button-change-categories"
            >
              직종 변경하기
            </Button>
            <Button 
              onClick={handleBackToDashboard}
              data-testid="button-back-to-dashboard"
            >
              대시보드로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}