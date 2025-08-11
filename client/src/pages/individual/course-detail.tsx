import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award,
  Play,
  Pause,
  RotateCcw,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Course {
  id: string;
  title: string;
  institution: string;
  duration: string;
  cost: string;
  address: string;
  city: string;
  district: string;
  category: string;
  matchingScore: number;
  matchingReasons: string[];
}

export default function CourseDetailPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract course ID from URL
  const courseId = location.split('/').pop();
  
  const [isStudying, setIsStudying] = useState(false);
  const [studyProgress, setStudyProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Fetch course details
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['/api/courses', courseId],
    enabled: !!courseId
  });

  // Study progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying && studyProgress < 100) {
      interval = setInterval(() => {
        setStudyProgress(prev => {
          const newProgress = prev + 2;
          if (newProgress >= 100) {
            setIsStudying(false);
            setIsCompleted(true);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying, studyProgress]);

  // Add to resume mutation
  const addToResumeMutation = useMutation({
    mutationFn: async () => {
      if (!course) throw new Error('Course not found');
      
      const certificationName = getCertificationName(course.category);
      const educationEntry = `${course.title} 수료 (${course.institution})`;
      
      return await apiRequest('POST', '/api/individual-profiles/add-education', {
        education: educationEntry,
        certification: certificationName,
        skills: [`${course.category} 분야 전문교육`, '온라인 학습 완주']
      });
    },
    onSuccess: () => {
      // Invalidate profile queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      setShowCompletionModal(true);
      
      toast({
        title: "축하합니다! 🎉",
        description: "수료증이 이력서에 추가되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류 발생",
        description: error.message || "이력서 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const getCertificationName = (category: string): string => {
    if (category.includes('정보통신')) return '정보처리기능사 관련 교육';
    if (category.includes('의료')) return '의료관리학 관련 자격';
    if (category.includes('제조업')) return '품질관리 관련 자격';
    if (category.includes('마케팅')) return '디지털마케팅 전문가 과정';
    if (category.includes('건설업')) return '건설안전기사 관련 교육';
    if (category.includes('운수')) return '물류관리사 관련 과정';
    if (category.includes('과학')) return '기술사 관련 전문교육';
    if (category.includes('예술')) return '예술심리상담사 과정';
    if (category.includes('공급업')) return '유통관리사 관련 교육';
    return `${category} 분야 전문과정`;
  };

  const handleStartStudy = () => {
    setIsStudying(true);
    toast({
      title: "강의 수강 시작!",
      description: "집중해서 학습해보세요. 완료까지 약 2분 소요됩니다.",
    });
  };

  const handlePauseStudy = () => {
    setIsStudying(false);
    toast({
      title: "일시정지",
      description: "언제든 다시 시작할 수 있습니다.",
    });
  };

  const handleResetStudy = () => {
    setStudyProgress(0);
    setIsStudying(false);
    setIsCompleted(false);
  };

  const handleComplete = () => {
    addToResumeMutation.mutate();
  };

  const handleBackToCourses = () => {
    setLocation('/individual/recommended-courses');
  };

  const handleBackToDashboard = () => {
    setLocation('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFEF0] to-[#F5F5DC] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F3036] mx-auto mb-4"></div>
              <p className="text-[#2F3036]/70">강의 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFEF0] to-[#F5F5DC] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-[#2F3036] mb-4">강의를 찾을 수 없습니다</h2>
            <Button onClick={handleBackToCourses} className="bg-[#2F3036] text-white hover:bg-[#2F3036]/90">
              추천강좌로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFEF0] to-[#F5F5DC]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#2F3036]/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToCourses}
              className="text-[#2F3036] hover:bg-[#F5F5DC]"
              data-testid="button-back-to-courses"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              추천강좌로 돌아가기
            </Button>
            <h1 className="text-xl font-bold text-[#2F3036]">강의 수강</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-[#2F3036] mb-2">{course.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-[#2F3036]/70">
                  <span>🏢 {course.institution}</span>
                  <Badge variant="outline" className="border-[#FF8C42] text-[#FF8C42]">
                    <Star className="w-3 h-3 mr-1" />
                    {course.matchingScore}% 매칭
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Course Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>📅 기간: {course.duration}</div>
              <div>💰 비용: {course.cost}</div>
              <div className="col-span-2">📍 위치: {course.address} ({course.city} {course.district})</div>
            </div>

            {/* Progress Section */}
            <div className="bg-[#F5F5DC] rounded-lg p-6">
              <h3 className="font-semibold text-[#2F3036] mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                학습 진행률
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2F3036]/70">진행률</span>
                  <span className="font-semibold text-[#2F3036]">{studyProgress}%</span>
                </div>
                
                <Progress value={studyProgress} className="h-3" />
                
                <div className="flex gap-3">
                  {!isCompleted && (
                    <>
                      {!isStudying ? (
                        <Button 
                          onClick={handleStartStudy}
                          className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
                          data-testid="button-start-study"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {studyProgress === 0 ? '강의 시작' : '계속 학습'}
                        </Button>
                      ) : (
                        <Button 
                          onClick={handlePauseStudy}
                          variant="outline"
                          data-testid="button-pause-study"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          일시정지
                        </Button>
                      )}
                      
                      {studyProgress > 0 && (
                        <Button 
                          onClick={handleResetStudy}
                          variant="outline"
                          className="border-[#2F3036]/20 text-[#2F3036]"
                          data-testid="button-reset-study"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          처음부터
                        </Button>
                      )}
                    </>
                  )}
                  
                  {isCompleted && (
                    <Button 
                      onClick={handleComplete}
                      disabled={addToResumeMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="button-complete-course"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      {addToResumeMutation.isPending ? '이력서 추가 중...' : '수강 완료 (이력서에 추가)'}
                    </Button>
                  )}
                </div>

                {isStudying && (
                  <div className="text-sm text-[#2F3036]/70 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    강의 진행 중... 집중해서 학습해보세요!
                  </div>
                )}
              </div>
            </div>

            {/* What will be added to resume */}
            <div className="bg-[#FFFEF0] border border-[#FF8C42]/20 rounded-lg p-4">
              <h4 className="font-semibold text-[#2F3036] mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#FF8C42]" />
                이력서에 추가될 요소
              </h4>
              <div className="space-y-2 text-sm text-[#2F3036]/80">
                <div>• {course.title} 수료증</div>
                <div>• {course.category} 분야 교육 이수</div>
                <div>• {course.institution} 교육기관 수료</div>
                <div>• {getCertificationName(course.category)}</div>
                <div>• 온라인 학습 완주 경험</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Completion Success Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#2F3036]">
              수강 완료! 🎉
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="bg-[#F5F5DC] rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-[#FF8C42]" />
                <span className="font-semibold text-[#2F3036]">{course.title}</span>
              </div>
              <p className="text-[#2F3036]/70 text-sm">{course.institution} 수료</p>
            </div>
            
            <div className="text-sm text-[#2F3036]/70 space-y-2">
              <p>강의 수강이 완료되었습니다!</p>
              <p>수료증과 관련 자격이 이력서에 추가되었습니다.</p>
              <p className="font-medium text-[#FF8C42]">계속해서 발전하는 모습이 멋집니다! 👏</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCompletionModal(false)}
                className="flex-1"
                data-testid="button-close-completion-modal"
              >
                닫기
              </Button>
              <Button 
                onClick={() => {
                  setShowCompletionModal(false);
                  handleBackToDashboard();
                }}
                className="flex-1 bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
                data-testid="button-back-to-dashboard-from-completion"
              >
                대시보드로 이동
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}