import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Filter
} from "lucide-react";
import type { Course } from "@shared/schema";

interface RecommendedCourse extends Course {
  matchingScore: number;
  matchingReasons: string[];
}

export default function RecommendedCourses() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
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
                      <Button variant="outline" size="sm" className="border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]">
                        상세보기
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-[#2F3036] text-white hover:bg-[#2F3036]/90"
                        onClick={() => setLocation(`/individual/course-detail/${course.id}`)}
                        data-testid={`button-apply-course-${index}`}
                      >
                        신청하기
                      </Button>
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
    </div>
  );
}