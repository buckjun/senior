import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Phone, Mail, Briefcase, GraduationCap, Award } from 'lucide-react';

interface ParsedResume {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
}

interface ResumePreviewProps {
  data?: ParsedResume;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  if (!data || (!data.name && !data.title && !data.summary && data.skills?.length === 0)) {
    return (
      <Card className="w-full bg-[#F5F5DC]/30 border-[#2F3036]/20">
        <CardContent className="p-8 text-center text-[#2F3036]/70">
          <User className="mx-auto mb-4 h-12 w-12 text-[#2F3036]/50" />
          <p>위에 자연어로 이력서 정보를 입력하시면</p>
          <p>여기에 미리보기가 표시됩니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-[#2F3036]">
              {data.name || '이름 미입력'}
            </CardTitle>
            <p className="text-lg text-[#2F3036]/80 font-medium">
              {data.title || '희망 직종'}
            </p>
          </div>
          <div className="text-right text-sm text-[#2F3036]/70 space-y-1">
            {data.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{data.location}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{data.email}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 자기소개 */}
        {data.summary && (
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <User className="h-5 w-5 text-blue-600" />
              자기소개
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}

        <Separator />

        {/* 보유 기술 */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Award className="h-5 w-5 text-green-600" />
              보유 기술
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 경력 */}
        {data.experience && data.experience.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Briefcase className="h-5 w-5 text-purple-600" />
                경력 사항
              </h3>
              <ul className="space-y-2">
                {data.experience.map((exp, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* 학력 */}
        {data.education && data.education.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <GraduationCap className="h-5 w-5 text-orange-600" />
                학력
              </h3>
              <ul className="space-y-2">
                {data.education.map((edu, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{edu}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}