import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  BookOpen, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  ArrowLeft,
  Star,
  Clock,
  Users,
  Filter,
  CheckCircle2,
  Award
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Course } from "@shared/schema";

interface RecommendedCourse extends Course {
  matchingScore: number;
  matchingReasons: string[];
}

export default function RecommendedCourses() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [appliedCourses, setAppliedCourses] = useState<Set<string>>(new Set());
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<RecommendedCourse | null>(null);
  
  const { data: recommendedCourses, isLoading } = useQuery<RecommendedCourse[]>({
    queryKey: ['/api/courses/recommended'],
    enabled: !!user,
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ['/api/courses/categories'],
  });

  const filteredCourses = selectedCategory 
    ? recommendedCourses?.filter(course => course.category === selectedCategory)
    : recommendedCourses;

  // Add education to profile mutation
  const addToResumeMutation = useMutation({
    mutationFn: async (course: RecommendedCourse) => {
      const certificationName = getCertificationName(course.category);
      const educationEntry = `${course.title} 수료 (${course.institution})`;
      
      return await apiRequest('POST', '/api/individual-profiles/add-education', {
        education: educationEntry,
        certification: certificationName,
        skills: [`${course.category} 분야 전문교육`, '온라인 학습 완주']
      });
    },
    onSuccess: (data, course) => {
      // Remove from applied courses since it's now completed
      setAppliedCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(course.id);
        return newSet;
      });
      
      // Invalidate profile queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
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

  const handleApplyCourse = (course: RecommendedCourse) => {
    setSelectedCourse(course);
    setShowApplicationModal(true);
  };

  const handleConfirmApplication = () => {
    if (selectedCourse) {
      setAppliedCourses(prev => new Set([...Array.from(prev), selectedCourse.id]));
      setShowApplicationModal(false);
      setSelectedCourse(null);
      
      toast({
        title: "신청 완료!",
        description: `${selectedCourse.title} 강의에 신청되었습니다.`,
      });
    }
  };

  const handleCompleteCourse = (course: RecommendedCourse) => {
    addToResumeMutation.mutate(course);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFFEF0] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#2F3036]/10 sticky top-0 z-10">
        <div className="container-web mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/individual/dashboard">
                <Button variant="ghost" size="sm" className="text-[#2F3036] hover:bg-[#F5F5DC]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[#2F3036]">추천 강좌</h1>
                <p className="text-sm text-[#2F3036]/70">프로필에 맞는 맞춤 교육과정을 추천해드립니다</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]">
                <Filter className="w-4 h-4 mr-2" />
                필터
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-web mx-auto px-4 py-6 pb-20">
        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#2F3036] text-lg">분야별 강좌</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={selectedCategory === null 
                    ? "bg-[#2F3036] text-white" 
                    : "border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]"
                  }
                >
                  전체
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? "bg-[#2F3036] text-white" 
                      : "border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recommended Courses */}
        {filteredCourses && filteredCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2F3036]">
                맞춤 추천 강좌 ({filteredCourses.length}개)
              </h2>
            </div>
            
            {filteredCourses.map((course, index) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow border-[#2F3036]/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-[#F5F5DC] rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-[#2F3036]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-[#2F3036] text-lg leading-tight mb-2">
                            {course.title}
                          </h3>
                          <Badge className="ml-2 bg-[#F5F5DC] text-[#2F3036] hover:bg-[#F5F5DC]/80">
                            <Star className="w-3 h-3 mr-1" />
                            {course.matchingScore}% 매칭
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-[#F5F5DC] rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-[#2F3036] mb-2">이력서에 추가될 요소</h4>
                            <div className="space-y-1 text-sm text-[#2F3036]/80">
                              <div>• {course.title} 수료증</div>
                              <div>• {course.category} 분야 교육 이수</div>
                              <div>• {course.institution} 교육기관 수료</div>
                              {course.category.includes('정보통신') && <div>• 정보처리기능사 관련 교육</div>}
                              {course.category.includes('의료') && <div>• 의료관리학 관련 자격</div>}
                              {course.category.includes('제조업') && <div>• 품질관리 관련 자격</div>}
                              {course.category.includes('마케팅') && <div>• 디지털마케팅 전문가 과정</div>}
                              {course.category.includes('건설업') && <div>• 건설안전기사 관련 교육</div>}
                              {course.category.includes('운수') && <div>• 물류관리사 관련 과정</div>}
                              {course.category.includes('과학') && <div>• 기술사 관련 전문교육</div>}
                              {course.category.includes('예술') && <div>• 예술심리상담사 과정</div>}
                              {course.category.includes('공급업') && <div>• 유통관리사 관련 교육</div>}
                            </div>
                          </div>
                          
                          <div className="text-xs text-[#2F3036]/60 space-y-1">
                            <div>🏢 {course.institution}</div>
                            <div>📅 {course.duration}</div>
                            <div>💰 {course.cost}</div>
                            <div>📍 {course.address} ({course.city} {course.district})</div>
                          </div>
                        </div>

                        {/* Matching Reasons */}
                        {course.matchingReasons && course.matchingReasons.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-[#2F3036] mb-1">추천 이유:</p>
                            <div className="flex flex-wrap gap-1">
                              {course.matchingReasons.map((reason, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-[#F5F5DC]/50 text-[#2F3036]">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#2F3036]/10">
                    <Badge variant="outline" className="border-[#2F3036]/20 text-[#2F3036]">
                      {course.category}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]"
                        onClick={() => setLocation(`/individual/course-detail/${course.id}`)}
                        data-testid={`button-detail-course-${index}`}
                      >
                        상세보기
                      </Button>
                      
                      {!appliedCourses.has(course.id) ? (
                        <Button 
                          size="sm" 
                          className="bg-[#2F3036] text-white hover:bg-[#2F3036]/90"
                          onClick={() => handleApplyCourse(course)}
                          data-testid={`button-apply-course-${index}`}
                        >
                          신청하기
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleCompleteCourse(course)}
                          disabled={addToResumeMutation.isPending}
                          data-testid={`button-complete-course-${index}`}
                        >
                          <Award className="w-4 h-4 mr-2" />
                          {addToResumeMutation.isPending ? '처리 중...' : '수강완료'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCourses && filteredCourses.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-[#2F3036]/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#2F3036] mb-2">추천 강좌가 없습니다</h3>
              <p className="text-[#2F3036]/70 mb-4">
                프로필을 더 자세히 작성하시면 맞춤 강좌를 추천해드립니다.
              </p>
              <Link href="/individual/profile-setup">
                <Button className="bg-[#2F3036] text-white hover:bg-[#2F3036]/90">
                  프로필 완성하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Application Success Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#2F3036]">
              신청완료되었습니다! 🎉
            </DialogTitle>
            <DialogDescription className="sr-only">
              강의 신청 완료 확인 모달입니다
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            {selectedCourse && (
              <div className="bg-[#F5F5DC] rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-[#FF8C42]" />
                  <span className="font-semibold text-[#2F3036]">{selectedCourse.title}</span>
                </div>
                <p className="text-[#2F3036]/70 text-sm">{selectedCourse.institution}</p>
              </div>
            )}
            
            <div className="text-sm text-[#2F3036]/70 space-y-2">
              <p>강의 신청이 성공적으로 완료되었습니다!</p>
              <p>강의를 모두 수강하시면</p>
              <p><span className="font-medium text-[#FF8C42]">"수강완료"</span> 버튼을 클릭하여</p>
              <p>이력서에 수료증을 추가하실 수 있습니다.</p>
            </div>

            <Button 
              onClick={handleConfirmApplication}
              className="w-full bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
              data-testid="button-confirm-application"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}