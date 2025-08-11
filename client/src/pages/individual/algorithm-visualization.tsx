import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Brain, 
  Target, 
  Star, 
  Award, 
  Briefcase, 
  GraduationCap,
  Clock,
  TrendingUp,
  BarChart3,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

export default function AlgorithmVisualizationPage() {
  const [location, setLocation] = useLocation();
  const [selectedScenario, setSelectedScenario] = useState('example1');

  const handleBack = () => {
    setLocation('/individual/dashboard');
  };

  // 매칭 알고리즘 시나리오 예시
  const matchingScenarios = {
    example1: {
      title: "IT 경력 20년 김부장님",
      profile: {
        name: "김부장",
        experience: ["삼성전자 소프트웨어 개발팀 20년", "프로젝트 관리 경험", "팀 리더 역할"],
        skills: ["Java", "프로젝트 관리", "팀 리딩", "소프트웨어 아키텍처"],
        preferredJobTypes: ["정보통신"],
        preferredLocations: ["서울"]
      },
      job: {
        title: "시니어 개발자",
        company: "스타트업 A",
        category: "정보통신",
        location: "서울",
        education: "대졸",
        experience: "15년 이상",
        employmentType: "정규직"
      },
      scoring: {
        fieldMatch: 95,
        experienceMatch: 90,
        educationMatch: 85,
        employmentTypeMatch: 100,
        certificationBonus: 10,
        totalScore: 96
      }
    },
    example2: {
      title: "제조업 품질관리 15년 박과장님",
      profile: {
        name: "박과장",
        experience: ["현대자동차 품질관리팀 15년", "ISO 9001 인증 관리", "품질 시스템 구축"],
        skills: ["품질관리", "ISO 인증", "제조공정", "데이터 분석"],
        preferredJobTypes: ["제조업"],
        preferredLocations: ["경기도"]
      },
      job: {
        title: "품질관리 책임자",
        company: "중견기업 B",
        category: "제조업",
        location: "경기도",
        education: "대졸",
        experience: "10년 이상",
        employmentType: "정규직"
      },
      scoring: {
        fieldMatch: 100,
        experienceMatch: 95,
        educationMatch: 90,
        employmentTypeMatch: 100,
        certificationBonus: 15,
        totalScore: 100
      }
    }
  };

  const currentScenario = matchingScenarios[selectedScenario as keyof typeof matchingScenarios];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0"
            onClick={handleBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 text-heading font-bold text-center">매칭 알고리즘 시각화</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 알고리즘 개요 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-orange-500" />
              일있슈 매칭 알고리즘 소개
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              50-60세 시니어를 위한 특별한 매칭 시스템으로, 풍부한 경험과 전문성을 최우선으로 평가합니다.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                <span className="text-sm">분야 전문성 중시</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                <span className="text-sm">경력 우선 평가</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                <span className="text-sm">자격증 보너스</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm">시니어 우대기업</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 시나리오 선택 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              매칭 시나리오 체험
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant={selectedScenario === 'example1' ? 'default' : 'outline'}
                onClick={() => setSelectedScenario('example1')}
                className="h-auto p-3 text-left"
              >
                <div>
                  <div className="font-medium">IT 개발자</div>
                  <div className="text-sm text-gray-500">20년 경력</div>
                </div>
              </Button>
              <Button
                variant={selectedScenario === 'example2' ? 'default' : 'outline'}
                onClick={() => setSelectedScenario('example2')}
                className="h-auto p-3 text-left"
              >
                <div>
                  <div className="font-medium">품질관리 전문가</div>
                  <div className="text-sm text-gray-500">15년 경력</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 매칭 상세 분석 */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="scoring">점수 분석</TabsTrigger>
            <TabsTrigger value="algorithm">알고리즘</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 구직자 프로필 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{currentScenario.profile.name} 프로필</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">경력 사항</div>
                    <div className="space-y-1">
                      {currentScenario.profile.experience.map((exp, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">보유 스킬</div>
                    <div className="flex flex-wrap gap-2">
                      {currentScenario.profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">희망 분야</div>
                    <Badge variant="outline">{currentScenario.profile.preferredJobTypes[0]}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 채용 공고 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">매칭 채용 공고</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-500">회사명</div>
                    <div className="font-medium">{currentScenario.job.company}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500">채용 제목</div>
                    <div className="font-medium">{currentScenario.job.title}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">업종</div>
                      <div>{currentScenario.job.category}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">지역</div>
                      <div>{currentScenario.job.location}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">경력</div>
                      <div>{currentScenario.job.experience}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">고용형태</div>
                      <div>{currentScenario.job.employmentType}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  매칭 점수 분석
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 총점 */}
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {currentScenario.scoring.totalScore}점
                  </div>
                  <div className="text-sm text-gray-600">종합 매칭 점수</div>
                </div>

                {/* 세부 점수 */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">분야 매칭</span>
                      <span className={`text-sm font-medium ${getScoreTextColor(currentScenario.scoring.fieldMatch)}`}>
                        {currentScenario.scoring.fieldMatch}점
                      </span>
                    </div>
                    <Progress value={currentScenario.scoring.fieldMatch} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">업종과 직무의 일치도</div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">경력 매칭</span>
                      <span className={`text-sm font-medium ${getScoreTextColor(currentScenario.scoring.experienceMatch)}`}>
                        {currentScenario.scoring.experienceMatch}점
                      </span>
                    </div>
                    <Progress value={currentScenario.scoring.experienceMatch} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">요구 경력과 보유 경력의 일치도</div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">학력 매칭</span>
                      <span className={`text-sm font-medium ${getScoreTextColor(currentScenario.scoring.educationMatch)}`}>
                        {currentScenario.scoring.educationMatch}점
                      </span>
                    </div>
                    <Progress value={currentScenario.scoring.educationMatch} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">요구 학력 수준과의 일치도</div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">고용형태 매칭</span>
                      <span className={`text-sm font-medium ${getScoreTextColor(currentScenario.scoring.employmentTypeMatch)}`}>
                        {currentScenario.scoring.employmentTypeMatch}점
                      </span>
                    </div>
                    <Progress value={currentScenario.scoring.employmentTypeMatch} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">선호하는 고용형태와의 일치도</div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-green-600">자격증 보너스</span>
                      <span className="text-sm font-medium text-green-600">
                        +{currentScenario.scoring.certificationBonus}점
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">관련 자격증 및 특별 경력 가점</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="algorithm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-orange-500" />
                  매칭 알고리즘 상세
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* 우선순위 체계 */}
                  <div>
                    <h4 className="font-semibold mb-2">매칭 우선순위 체계</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span className="font-medium">분야 전문성 (40%)</span>
                        <span className="text-gray-500">업종과 직무의 정확한 일치</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span className="font-medium">경력 깊이 (30%)</span>
                        <span className="text-gray-500">관련 분야 경험년수와 전문성</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                        <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span className="font-medium">학력 조건 (20%)</span>
                        <span className="text-gray-500">요구 학력과 보유 학력 매칭</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-purple-50 rounded">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <span className="font-medium">근무 조건 (10%)</span>
                        <span className="text-gray-500">고용형태 및 근무시간 선호도</span>
                      </div>
                    </div>
                  </div>

                  {/* 시니어 특화 요소 */}
                  <div>
                    <h4 className="font-semibold mb-2">시니어 특화 가점 요소</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="font-medium text-orange-700">관련 자격증</div>
                        <div className="text-sm text-gray-600">업무 관련 전문 자격증 보유시 +10-20점</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="font-medium text-orange-700">리더십 경험</div>
                        <div className="text-sm text-gray-600">팀장, 관리직 경험시 +5-15점</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="font-medium text-orange-700">멘토링 역할</div>
                        <div className="text-sm text-gray-600">신입사원 교육, 멘토링 경험시 +5-10점</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="font-medium text-orange-700">시니어 우대기업</div>
                        <div className="text-sm text-gray-600">50+ 친화 기업일 경우 +10점</div>
                      </div>
                    </div>
                  </div>

                  {/* AI 보완 분석 */}
                  <div>
                    <h4 className="font-semibold mb-2">AI 보완 분석 (GPT-4o 활용)</h4>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>• 구직자의 자기소개서와 경력을 자연어로 분석</div>
                        <div>• 채용공고의 세부 요구사항과 문맥적 매칭</div>
                        <div>• 시니어의 경험가치와 안정성을 우선 평가</div>
                        <div>• 정량적 점수 + 정성적 매칭 이유 제공</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA 버튼 */}
        <div className="text-center pt-4">
          <Button 
            onClick={() => setLocation('/individual/job-category-selection')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
            size="lg"
          >
            <Target className="w-5 h-5 mr-2" />
            나에게 맞는 회사 찾기
          </Button>
        </div>
      </div>
    </div>
  );
}