import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Building2, Zap } from "lucide-react";

interface SectorSelectionProps {
  profile: any;
  sectorGuess: Array<{ sector: string; score: number }>;
  sectors: string[];
  resumeText: string;
}

export default function SectorSelection({ 
  profile, 
  sectorGuess, 
  sectors, 
  resumeText 
}: SectorSelectionProps) {
  const [location, setLocation] = useLocation();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => {
      if (prev.includes(sector)) {
        return prev.filter(s => s !== sector);
      } else if (prev.length < 2) {
        return [...prev, sector];
      }
      return prev;
    });
  };

  const handleProceed = () => {
    if (selectedSectors.length === 0) return;
    
    // 선택된 업종과 이력서 텍스트를 로컬 스토리지에 저장
    localStorage.setItem('selectedSectors', JSON.stringify(selectedSectors));
    localStorage.setItem('resumeText', resumeText);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    setLocation('/individual/unified-recommendations');
  };

  const getSectorIcon = (sector: string) => {
    if (sector.includes('건설')) return '🏗️';
    if (sector.includes('정보통신')) return '💻';
    if (sector.includes('제조')) return '⚙️';
    if (sector.includes('의료')) return '🏥';
    if (sector.includes('마케팅')) return '📊';
    if (sector.includes('예술')) return '🎨';
    if (sector.includes('운수')) return '🚛';
    if (sector.includes('과학')) return '🔬';
    if (sector.includes('공급')) return '⚡';
    return '🏢';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[#2F3036]/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2 text-[#2F3036] hover:bg-[#F5F5DC]"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Button>
          <h1 className="text-xl font-bold text-[#2F3036]">업종 선택</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Summary */}
        <Card className="border-[#2F3036]/20">
          <CardHeader>
            <CardTitle className="text-[#2F3036] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FF8C42]" />
              분석된 이력서 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F5F5DC]/50 rounded-lg p-3">
                <div className="text-sm text-[#2F3036]/70">경력</div>
                <div className="font-medium text-[#2F3036]">{profile.years}년</div>
              </div>
              <div className="bg-[#F5F5DC]/50 rounded-lg p-3">
                <div className="text-sm text-[#2F3036]/70">학력</div>
                <div className="font-medium text-[#2F3036]">{profile.education}</div>
              </div>
              <div className="bg-[#F5F5DC]/50 rounded-lg p-3">
                <div className="text-sm text-[#2F3036]/70">보유 기술</div>
                <div className="font-medium text-[#2F3036]">{profile.skills.length}개</div>
              </div>
            </div>
            
            {profile.skills.length > 0 && (
              <div>
                <div className="text-sm text-[#2F3036]/70 mb-2">주요 기술</div>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 8).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="border-[#FF8C42] text-[#FF8C42] text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 8 && (
                    <Badge variant="outline" className="border-[#2F3036]/30 text-[#2F3036]/70 text-xs">
                      +{profile.skills.length - 8}개 더
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        {sectorGuess.length > 0 && (
          <Card className="border-[#FF8C42]/30 bg-gradient-to-r from-[#FF8C42]/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-[#2F3036] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FF8C42]" />
                AI 추천 업종
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-[#2F3036]/70 mb-3">
                  이력서 분석 결과, 다음 업종이 가장 적합해 보입니다
                </p>
                <div className="flex flex-wrap gap-2">
                  {sectorGuess.map(({ sector, score }) => (
                    <Badge 
                      key={sector} 
                      className="bg-[#FF8C42]/10 text-[#FF8C42] border-[#FF8C42]/30"
                    >
                      {getSectorIcon(sector)} {sector} (점수: {score})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sector Selection */}
        <Card className="border-[#2F3036]/20">
          <CardHeader>
            <CardTitle className="text-[#2F3036]">관심 업종 선택</CardTitle>
            <p className="text-[#2F3036]/70 text-sm">
              최대 2개까지 선택 가능합니다. 선택하신 업종에 맞는 직업, 공고, 교육을 추천해드립니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectors.map((sector) => {
                const isSelected = selectedSectors.includes(sector);
                const isRecommended = sectorGuess.some(g => g.sector === sector);
                
                return (
                  <Card 
                    key={sector}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#FF8C42] bg-[#FF8C42]/5 shadow-md' 
                        : 'border-[#2F3036]/20 hover:border-[#FF8C42]/50 hover:bg-[#F5F5DC]/30'
                    } ${selectedSectors.length >= 2 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => toggleSector(sector)}
                    data-testid={`sector-${sector}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSectorIcon(sector)}</span>
                          <span className="font-medium text-[#2F3036]">{sector}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isRecommended && (
                            <Badge className="bg-[#FF8C42]/10 text-[#FF8C42] border-[#FF8C42]/30 text-xs">
                              AI 추천
                            </Badge>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-[#FF8C42]" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-[#2F3036]/70">
                선택된 업종: {selectedSectors.length}/2
              </div>
              
              <Button 
                onClick={handleProceed}
                disabled={selectedSectors.length === 0}
                className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
                data-testid="button-proceed-recommendations"
              >
                추천 받기 ({selectedSectors.length}개 업종)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}