import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Briefcase, 
  GraduationCap,
  Target,
  Star
} from 'lucide-react';
import { Link } from 'wouter';

interface UserProfile {
  id: string;
  name?: string;
  email?: string; 
  phone?: string;
  title?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  aiAnalysis?: string;
  [key: string]: any;
}

export default function IndividualProfileView() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Load user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: !!user,
  });

  const getUserDisplayName = () => {
    if (profile && typeof profile === 'object' && 'name' in profile && profile.name) {
      return profile.name as string;
    }
    if (user && typeof user === 'object' && 'email' in user && user.email && typeof user.email === 'string') {
      return user.email.split('@')[0];
    }
    return '사용자';
  };

  const handleBackButton = () => {
    setLocation('/individual/dashboard');
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
      <div className="min-h-screen">
        <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 p-0"
              onClick={handleBackButton}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="flex-1 text-heading font-bold text-center">내 정보</h2>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const profileData = profile as UserProfile;
  const skills = parseJsonField(profileData?.skills);
  const experience = parseJsonField(profileData?.experience);
  const education = parseJsonField(profileData?.education);
  const preferredJobTypes = parseJsonField(profileData?.preferredJobTypes);
  const preferredLocations = parseJsonField(profileData?.preferredLocations);

  // Check if user has meaningful profile data
  const hasProfileData = profileData && (
    profileData.summary || 
    skills.length > 0 || 
    experience.length > 0 || 
    education.length > 0
  );

  if (!hasProfileData) {
    // Show empty state with option to create profile
    return (
      <div className="min-h-screen">
        <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 p-0"
              onClick={handleBackButton}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="flex-1 text-heading font-bold text-center">내 정보</h2>
            <div className="w-10"></div>
          </div>
        </div>
        
        <div className="p-6">
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-heading font-medium mb-2">아직 프로필이 없습니다</h3>
              <p className="text-body text-gray-500 mb-6">
                AI 이력서 작성을 통해 프로필을 생성해보세요
              </p>
              <Link href="/individual/profile-setup">
                <Button data-testid="button-create-profile">
                  <Edit className="w-4 h-4 mr-2" />
                  프로필 생성하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0"
            onClick={handleBackButton}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 text-heading font-bold text-center">내 정보</h2>
          <Link href="/individual/profile-setup">
            <Button variant="ghost" size="sm" data-testid="button-edit-profile">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-caption text-gray-500">이름</div>
                  <div className="text-body font-medium">
                    {profileData?.name || getUserDisplayName()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-caption text-gray-500">이메일</div>
                  <div className="text-body font-medium">
                    {profileData?.email || (user as any)?.email || '설정되지 않음'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-caption text-gray-500">연락처</div>
                  <div className="text-body font-medium">
                    {profileData?.phone || '설정되지 않음'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-caption text-gray-500">거주지</div>
                  <div className="text-body font-medium">
                    {profileData?.location || '설정되지 않음'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {profileData?.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-gray-600" />
                자기소개
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-gray-700 leading-relaxed">
                {profileData.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-600" />
                보유 기술
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                경력 사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
                    <p className="text-body">{exp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                학력 사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-green-200 pl-4 py-2">
                    <p className="text-body">{edu}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        {(preferredJobTypes.length > 0 || preferredLocations.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-600" />
                희망 조건
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferredJobTypes.length > 0 && (
                <div>
                  <div className="text-caption text-gray-500 mb-2">희망 직종</div>
                  <div className="flex flex-wrap gap-2">
                    {preferredJobTypes.map((type, index) => (
                      <Badge key={index} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {preferredLocations.length > 0 && (
                <div>
                  <div className="text-caption text-gray-500 mb-2">희망 근무지</div>
                  <div className="flex flex-wrap gap-2">
                    {preferredLocations.map((loc, index) => (
                      <Badge key={index} variant="outline">
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Analysis */}
        {profileData?.aiAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                AI 분석 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-gray-700">{profileData.aiAnalysis}</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Profile Button */}
        <div className="text-center pt-4">
          <Link href="/individual/profile-setup">
            <Button className="w-full" data-testid="button-edit-profile-full">
              <Edit className="w-4 h-4 mr-2" />
              프로필 수정하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}