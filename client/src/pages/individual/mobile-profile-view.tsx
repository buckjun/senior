import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { MobileCard, MobileButton } from "@/components/ui/mobile-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { 
  Edit, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Briefcase, 
  GraduationCap,
  Target,
  Star,
  Calendar,
  Settings
} from "lucide-react";

export default function MobileProfileView() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Load user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: !!user,
  });

  const handleBack = () => {
    setLocation('/');
  };

  const handleEditProfile = () => {
    setLocation('/individual/profile-setup');
  };

  const getUserDisplayName = () => {
    if (profile && typeof profile === 'object' && 'name' in profile && profile.name) {
      return profile.name as string;
    }
    if (user && typeof user === 'object' && 'email' in user && user.email && typeof user.email === 'string') {
      return user.email.split('@')[0];
    }
    return '사용자';
  };

  const parseJsonField = (field: any): string[] => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [field];
      }
    }
    if (Array.isArray(field)) return field;
    return [];
  };

  if (loadingProfile) {
    return (
      <MobileLayout 
        title="내 정보" 
        backButton={true} 
        onBack={handleBack}
        showBottomNav={true}
      >
        <div className="flex-1 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const profileData = profile as any;
  const skills = parseJsonField(profileData?.skills);
  const experience = parseJsonField(profileData?.experience);
  const education = parseJsonField(profileData?.education);
  const preferredJobTypes = parseJsonField(profileData?.preferredJobTypes);

  // Check if user has meaningful profile data
  const hasProfileData = profileData && (
    profileData.summary || 
    skills.length > 0 || 
    experience.length > 0 || 
    education.length > 0
  );

  if (!hasProfileData) {
    return (
      <MobileLayout 
        title="내 정보" 
        backButton={true} 
        onBack={handleBack}
        showBottomNav={true}
      >
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">프로필을 작성해주세요</h2>
              <p className="text-muted-foreground text-sm">
                AI가 분석할 수 있는 이력서 정보를<br />
                작성하시면 맞춤형 추천을 받으실 수 있습니다.
              </p>
            </div>
            <div className="space-y-3">
              <MobileButton 
                fullWidth 
                onClick={handleEditProfile}
                testId="button-create-profile"
              >
                프로필 작성하기
              </MobileButton>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const profileCompleteness = profileData?.profileCompleteness || 0;

  return (
    <MobileLayout 
      title="내 정보" 
      backButton={true} 
      onBack={handleBack}
      showBottomNav={true}
    >
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 사용자 기본 정보 */}
        <MobileCard variant="filled" className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1" data-testid="text-user-name">
                  {getUserDisplayName()}
                </h2>
                {profileData?.title && (
                  <p className="text-sm text-muted-foreground">{profileData.title}</p>
                )}
                {profileData?.location && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{profileData.location}</span>
                  </div>
                )}
              </div>
            </div>
            <MobileButton 
              size="sm" 
              variant="secondary"
              onClick={handleEditProfile}
              testId="button-edit-profile"
            >
              <Edit className="w-4 h-4" />
            </MobileButton>
          </div>
        </MobileCard>

        {/* 프로필 완성도 */}
        <MobileCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">프로필 완성도</h3>
            <span className="text-sm text-muted-foreground">
              {profileCompleteness}%
            </span>
          </div>
          <Progress value={profileCompleteness} className="mb-3" />
          <p className="text-sm text-muted-foreground">
            {profileCompleteness >= 80 
              ? "프로필이 잘 완성되었습니다!" 
              : "추가 정보를 입력하시면 더 정확한 추천을 받으실 수 있습니다."}
          </p>
        </MobileCard>

        {/* 연락 정보 */}
        <MobileCard>
          <h3 className="font-medium mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2 text-primary" />
            연락 정보
          </h3>
          <div className="space-y-2">
            {(user as any)?.email && (
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{(user as any).email}</span>
              </div>
            )}
            {profileData?.phone && (
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{profileData.phone}</span>
              </div>
            )}
          </div>
        </MobileCard>

        {/* 요약 */}
        {profileData?.summary && (
          <MobileCard>
            <h3 className="font-medium mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-primary" />
              자기소개
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profileData.summary}
            </p>
          </MobileCard>
        )}

        {/* 스킬 */}
        {skills.length > 0 && (
          <MobileCard>
            <h3 className="font-medium mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2 text-primary" />
              보유 기술
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </MobileCard>
        )}

        {/* 경력 */}
        {experience.length > 0 && (
          <MobileCard>
            <h3 className="font-medium mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-primary" />
              경력사항
            </h3>
            <div className="space-y-3">
              {experience.map((exp, index) => (
                <div key={index} className="pb-3 border-b border-border last:border-b-0">
                  <p className="text-sm font-medium">{exp}</p>
                </div>
              ))}
            </div>
          </MobileCard>
        )}

        {/* 학력 */}
        {education.length > 0 && (
          <MobileCard>
            <h3 className="font-medium mb-3 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-primary" />
              학력사항
            </h3>
            <div className="space-y-2">
              {education.map((edu, index) => (
                <p key={index} className="text-sm text-muted-foreground">{edu}</p>
              ))}
            </div>
          </MobileCard>
        )}

        {/* 선호 직종 */}
        {preferredJobTypes.length > 0 && (
          <MobileCard>
            <h3 className="font-medium mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-primary" />
              관심 분야
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferredJobTypes.map((jobType, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {jobType}
                </Badge>
              ))}
            </div>
          </MobileCard>
        )}

        {/* AI 분석 결과 */}
        {profileData?.aiAnalysis && (
          <MobileCard>
            <h3 className="font-medium mb-3 flex items-center">
              <Star className="w-4 h-4 mr-2 text-primary" />
              AI 분석 결과
            </h3>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profileData.aiAnalysis}
              </p>
            </div>
          </MobileCard>
        )}

        {/* 빈 공간 */}
        <div className="h-16"></div>
      </div>
    </MobileLayout>
  );
}