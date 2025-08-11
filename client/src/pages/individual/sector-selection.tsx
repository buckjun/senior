import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Building2, Zap, Plus } from "lucide-react";

export default function SectorSelection() {
  const [location, setLocation] = useLocation();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [showAdditionalSectors, setShowAdditionalSectors] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [sectorGuess, setSectorGuess] = useState<Array<{ sector: string; score: number }>>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState<string>('');

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      const savedSectorGuess = localStorage.getItem('sectorGuess');
      const savedSectors = localStorage.getItem('sectors');
      const savedResumeText = localStorage.getItem('resumeText');

      // 필수 데이터가 없으면 음성 입력 페이지로 돌아가기
      if (!savedProfile || !savedSectorGuess || !savedSectors) {
        setLocation('/individual/voice-to-recommendation');
        return;
      }

      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setProfile(profileData);
      }

      if (savedSectorGuess) {
        const sectorData = JSON.parse(savedSectorGuess);
        setSectorGuess(sectorData);
        // AI 추천 업종을 초기값으로 설정
        if (sectorData.length > 0) {
          setSelectedSectors([sectorData[0].sector]);
        }
      }

      if (savedSectors) {
        const sectorsData = JSON.parse(savedSectors);
        setSectors(sectorsData);
      }

      if (savedResumeText) {
        setResumeText(savedResumeText);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setLocation('/individual/voice-to-recommendation');
    }
  }, [setLocation]);

  // 데이터 안전성 검사
  if (!profile || !sectorGuess || !sectors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-[#2F3036] mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
            <Button 
              onClick={() => setLocation('/individual/voice-to-recommendation')} 
              className="bg-[#FF8C42] hover:bg-[#FF8C42]/90"
            >
              다시 시도하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleAdditionalSector = (sector: string) => {
    const recommendedSector = sectorGuess[0]?.sector;
    
    setSelectedSectors(prev => {
      // 추천 업종은 항상 포함
      const baseSelection = recommendedSector ? [recommendedSector] : [];
      
      if (prev.includes(sector) && sector !== recommendedSector) {
        // 추가 업종 제거
        return baseSelection;
      } else if (!prev.includes(sector) && sector !== recommendedSector) {
        // 추가 업종 추가 (최대 1개)
        return [...baseSelection, sector];
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

  // 데이터 로딩 중이면 로딩 표시
  if (!profile || !sectorGuess.length || !sectors.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F5DC] to-white">
        <div className="w-12 h-12 border-4 border-[#F5F5DC] border-t-[#D4B896] rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-[#2F3036] mt-4">업종 분석 결과를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[#2F3036]/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/individual/voice-to-recommendation')}
            className="flex items-center gap-2 text-[#2F3036] hover:bg-[#F5F5DC]"
            data-testid="button-back-voice"
          >
            <ArrowLeft className="w-4 h-4" />
            다시 입력
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

        {/* AI Recommended Sector */}
        {sectorGuess.length > 0 && (
          <Card className="border-[#FF8C42]/30 bg-gradient-to-r from-[#FF8C42]/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-[#2F3036] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FF8C42]" />
                AI 추천 업종 (자동 선택됨)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-[#2F3036]/70">
                  이력서 분석 결과, 가장 적합한 업종입니다
                </p>
                <div className="bg-white rounded-lg border-2 border-[#FF8C42] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSectorIcon(sectorGuess[0].sector)}</span>
                      <div>
                        <h3 className="font-medium text-[#2F3036]">{sectorGuess[0].sector}</h3>
                        <p className="text-sm text-[#2F3036]/70">매칭도: {Math.round(sectorGuess[0].score * 100)}%</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-[#FF8C42]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Sector Selection */}
        <Card className="border-[#2F3036]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#2F3036]">추가 업종 선택 (선택사항)</CardTitle>
                <p className="text-[#2F3036]/70 text-sm">
                  원하시면 하나의 업종을 더 선택할 수 있습니다
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdditionalSectors(!showAdditionalSectors)}
                className="border-[#FF8C42]/30 text-[#FF8C42] hover:bg-[#FF8C42]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAdditionalSectors ? '숨기기' : '업종 보기'}
              </Button>
            </div>
          </CardHeader>
          {showAdditionalSectors && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sectors
                  .filter(sector => sector !== sectorGuess[0]?.sector) // 추천 업종 제외
                  .map((sector) => {
                    const isSelected = selectedSectors.includes(sector);
                    
                    return (
                      <Card 
                        key={sector}
                        className={`cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-[#FF8C42] bg-[#FF8C42]/5' 
                            : 'border-[#2F3036]/20 hover:border-[#FF8C42]/30'
                        }`}
                        onClick={() => toggleAdditionalSector(sector)}
                        data-testid={`card-additional-sector-${sector}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getSectorIcon(sector)}</span>
                              <div>
                                <h3 className="font-medium text-[#2F3036]">{sector}</h3>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-6 h-6 text-[#FF8C42]" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleProceed}
            disabled={selectedSectors.length === 0}
            className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white px-8 py-3 text-lg"
            data-testid="button-proceed-recommendations"
          >
            추천 받기 ({selectedSectors.length}개 업종)
          </Button>
        </div>
      </main>
    </div>
  );
}