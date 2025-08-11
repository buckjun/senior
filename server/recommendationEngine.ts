// 통합 추천 엔진 - 음성 이력서에서 업종별 직업/공고/교육 추천
import type { IndividualProfile } from "@shared/schema";

// 1) 업종/키워드 사전
export const SECTORS = [
  '건설업','공급업','과학 기술 서비스업','마케팅','예술',
  '운수 및 창고업','의료','정보통신','제조업'
];

const sectorVocab: Record<string, string[]> = {
  '건설업': ['현장','토목','건축','시공','안전','품질','공정','BIM','도면','감리','LH','철근','콘크리트','건설'],
  '공급업': ['전기','가스','증기','공기조절','변전','배전','에너지','설비','유틸리티','계량'],
  '과학 기술 서비스업': ['연구','실험','R&D','분석','시뮬레이션','모델링','테스트','프로토타입','성능','데이터','과학','기술'],
  '마케팅': ['브랜딩','캠페인','디지털','콘텐츠','SEO','광고','성과지표','CRM','퍼포먼스','바이럴','마케팅'],
  '예술': ['공연','전시','문화','디자인','기획','예술교육','무대','크리에이티브','촬영','에디팅','예술'],
  '운수 및 창고업': ['물류','창고','WMS','운송','배차','3PL','입출고','재고','SCM','배송','운수','택배'],
  '의료': ['병원','임상','의료기기','간호','의사','EMR','진단','재활','약무','보건','의료','병원'],
  '정보통신': ['소프트웨어','네트워크','백엔드','프론트엔드','DB','API','클라우드','보안','모바일','AI','개발','프로그래밍','IT'],
  '제조업': ['공정','설비','품질','양산','라인','PLC','자동화','FMEA','MES','원가','제조','생산','공장']
};

// 2) 간단 토크나이저 & 헬퍼
const tokenize = (s = '') => (s.toLowerCase().replace(/[^a-zA-Z0-9가-힣\s]/g, ' ').split(/\s+/).filter(Boolean));
const hasAny = (text: string, keywords: string[] = []) => 
  keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);

// 3) 이력서 파싱
const ALL_SKILLS = [
  '프로젝트','리더','관리','엑셀','파워포인트','파이썬','자바','SQL','AutoCAD','PLC','CNC','AI','AWS','Docker','React','Node','품질','안전','도면','회계','영업','R&D','물류','SCM','WMS','EMR','마케팅','디자인','기획','문화','의료','병원','건설','제조','정보통신','개발'
];

export interface UserProfile {
  years: number;
  education: string;
  skills: string[];
}

export function extractProfile(resumeText = ''): UserProfile {
  const text = resumeText.toLowerCase();
  const yearsMatch = text.match(/(\d{1,2})\s*년/);
  const years = yearsMatch ? Math.min(40, parseInt(yearsMatch[1], 10)) : 0;
  
  const edu = /박사/.test(text) ? '박사' : 
              /석사/.test(text) ? '석사' : 
              /학사|대졸/.test(text) ? '학사' : '무관';
              
  const skills = ALL_SKILLS.filter(k => text.includes(k.toLowerCase()));
  return { years, education: edu, skills };
}

// 4) 업종 자동 분류
export function rankSectors(resumeText = '', topK = 2) {
  const text = resumeText.toLowerCase();
  const scores = SECTORS.map(sector => {
    const score = hasAny(text, sectorVocab[sector]);
    return { sector, score };
  }).sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}

// 5) 샘플 데이터 (실제 서비스에서는 DB 또는 API로 교체)
export interface Occupation {
  id: string;
  sector: string;
  title: string;
  minYears: number;
  reqEdu: string;
  skills: string[];
  description?: string;
}

export interface JobPosting {
  id: string;
  sector: string;
  title: string;
  company: string;
  minYears: number;
  reqEdu: string;
  skills: string[];
  location?: string;
  salary?: string;
  url?: string;
}

export interface EducationProgram {
  id: string;
  title: string;
  skills: string[];
  duration?: string;
  provider?: string;
  type: 'online' | 'offline';
  description?: string;
}

export const occupationsDB: Occupation[] = [
  { id: 'occ-cs-01', sector: '건설업', title: '현장 시공관리자', minYears: 3, reqEdu: '학사', skills: ['도면','공정','안전'] },
  { id: 'occ-cs-02', sector: '건설업', title: 'BIM 모델러', minYears: 2, reqEdu: '무관', skills: ['BIM','도면'] },
  { id: 'occ-sup-01', sector: '공급업', title: '변전 설비 엔지니어', minYears: 4, reqEdu: '학사', skills: ['전기','설비'] },
  { id: 'occ-sup-02', sector: '공급업', title: '에너지 계량 운영', minYears: 1, reqEdu: '무관', skills: ['계량','데이터'] },
  { id: 'occ-st-01', sector: '과학 기술 서비스업', title: 'R&D 연구원', minYears: 3, reqEdu: '석사', skills: ['연구','실험','분석'] },
  { id: 'occ-st-02', sector: '과학 기술 서비스업', title: '시뮬레이션 엔지니어', minYears: 2, reqEdu: '학사', skills: ['시뮬레이션','모델링'] },
  { id: 'occ-mkt-01', sector: '마케팅', title: '디지털 마케터', minYears: 2, reqEdu: '무관', skills: ['디지털','광고','성과지표'] },
  { id: 'occ-mkt-02', sector: '마케팅', title: 'CRM 매니저', minYears: 3, reqEdu: '학사', skills: ['CRM','데이터'] },
  { id: 'occ-art-01', sector: '예술', title: '문화행사 기획자', minYears: 1, reqEdu: '무관', skills: ['기획','문화'] },
  { id: 'occ-art-02', sector: '예술', title: '콘텐츠 에디터', minYears: 1, reqEdu: '무관', skills: ['콘텐츠','에디팅'] },
  { id: 'occ-log-01', sector: '운수 및 창고업', title: '물류 운영 매니저', minYears: 2, reqEdu: '무관', skills: ['물류','WMS','SCM'] },
  { id: 'occ-log-02', sector: '운수 및 창고업', title: '배차/운송 코디네이터', minYears: 1, reqEdu: '무관', skills: ['배차','운송'] },
  { id: 'occ-med-01', sector: '의료', title: '의료기기 영업/교육', minYears: 2, reqEdu: '학사', skills: ['의료기기','교육'] },
  { id: 'occ-med-02', sector: '의료', title: '병원 EMR 운영', minYears: 1, reqEdu: '무관', skills: ['EMR','데이터'] },
  { id: 'occ-it-01', sector: '정보통신', title: '백엔드 개발자', minYears: 2, reqEdu: '무관', skills: ['Node','DB','API','클라우드'] },
  { id: 'occ-it-02', sector: '정보통신', title: '프론트엔드 개발자', minYears: 2, reqEdu: '무관', skills: ['React','웹','모바일'] },
  { id: 'occ-mfg-01', sector: '제조업', title: '생산 품질 엔지니어', minYears: 3, reqEdu: '학사', skills: ['품질','FMEA','MES'] },
  { id: 'occ-mfg-02', sector: '제조업', title: '설비 자동화(PLC)', minYears: 2, reqEdu: '무관', skills: ['PLC','자동화'] },
];

export const jobPostingsDB: JobPosting[] = [
  { id: 'job1', sector: '건설업', title: '중견건설 시공관리', company: 'A건설', minYears: 3, reqEdu: '학사', skills: ['도면','공정','안전'], location: '서울', salary: '3500만원' },
  { id: 'job2', sector: '정보통신', title: '백엔드 주니어', company: '테크B', minYears: 2, reqEdu: '무관', skills: ['Node','DB','API'], location: '판교', salary: '4000만원' },
  { id: 'job3', sector: '제조업', title: '품질관리', company: '제조C', minYears: 3, reqEdu: '학사', skills: ['품질','MES'], location: '부산', salary: '3200만원' },
  { id: 'job4', sector: '운수 및 창고업', title: '물류 운영', company: '물류D', minYears: 2, reqEdu: '무관', skills: ['WMS','SCM'], location: '인천', salary: '3000만원' },
  { id: 'job5', sector: '마케팅', title: '디지털 마케터', company: '마케팅E', minYears: 2, reqEdu: '무관', skills: ['광고','성과지표'], location: '강남', salary: '3800만원' },
  { id: 'job6', sector: '과학 기술 서비스업', title: '시뮬레이션 엔지니어', company: '랩F', minYears: 2, reqEdu: '학사', skills: ['시뮬레이션'], location: '대전', salary: '4200만원' },
  { id: 'job7', sector: '의료', title: 'EMR 운영', company: '병원G', minYears: 1, reqEdu: '무관', skills: ['EMR'], location: '서울', salary: '2800만원' },
  { id: 'job8', sector: '예술', title: '문화행사 기획', company: '문화H', minYears: 1, reqEdu: '무관', skills: ['기획'], location: '홍대', salary: '2500만원' },
  { id: 'job9', sector: '공급업', title: '변전 설비', company: '에너지I', minYears: 4, reqEdu: '학사', skills: ['전기','설비'], location: '울산', salary: '4500만원' },
  { id: 'job10', sector: '정보통신', title: '프론트엔드', company: '테크J', minYears: 2, reqEdu: '무관', skills: ['React'], location: '분당', salary: '3700만원' },
  { id: 'job11', sector: '제조업', title: 'PLC 자동화', company: '팩토리K', minYears: 2, reqEdu: '무관', skills: ['PLC','자동화'], location: '창원', salary: '3600만원' },
  { id: 'job12', sector: '마케팅', title: 'CRM 매니저', company: '리테일L', minYears: 3, reqEdu: '학사', skills: ['CRM','데이터'], location: '송파', salary: '4100만원' },
];

export const programsDB: EducationProgram[] = [
  { id: 'pg1', title: 'PLC 자동화 실무과정', skills: ['PLC','자동화'], duration: '3개월', provider: '폴리텍대학', type: 'offline' },
  { id: 'pg2', title: '품질/공정 FMEA 교육', skills: ['품질','FMEA'], duration: '2개월', provider: '품질관리협회', type: 'offline' },
  { id: 'pg3', title: 'React 프론트엔드 개발', skills: ['React','웹'], duration: '4개월', provider: '코드스테이츠', type: 'online' },
  { id: 'pg4', title: 'Node.js 백엔드 API 개발', skills: ['Node','API','DB'], duration: '3개월', provider: '엘리스', type: 'online' },
  { id: 'pg5', title: '물류 WMS/SCM 운영', skills: ['WMS','SCM'], duration: '2개월', provider: '한국물류협회', type: 'offline' },
  { id: 'pg6', title: '시뮬레이션 모델링 입문', skills: ['시뮬레이션','모델링'], duration: '3개월', provider: '한국과학기술원', type: 'online' },
  { id: 'pg7', title: 'BIM 모델링 실무', skills: ['BIM','도면'], duration: '2개월', provider: '건설기술교육원', type: 'offline' },
  { id: 'pg8', title: 'EMR 병원정보시스템 운영', skills: ['EMR'], duration: '1개월', provider: '의료정보학회', type: 'offline' },
  { id: 'pg9', title: '디지털 마케팅 전문가', skills: ['광고','성과지표'], duration: '3개월', provider: '구글', type: 'online' },
  { id: 'pg10', title: '전기설비 기초과정', skills: ['전기','설비'], duration: '2개월', provider: '전기안전공사', type: 'offline' },
  { id: 'pg11', title: '데이터/CRM 분석과정', skills: ['데이터','CRM'], duration: '2개월', provider: '빅데이터아카데미', type: 'online' },
  { id: 'pg12', title: '건설안전관리 실무', skills: ['안전'], duration: '1개월', provider: '안전보건공단', type: 'offline' },
];

// 6) 스코어링 가중치 및 함수
const WEIGHTS = { 
  domain: 0.40, 
  skills: 0.25, 
  years: 0.20, 
  edu: 0.10, 
  type: 0.05 
};

const eduRank = (v: string) => ({'무관': 0, '학사': 1, '석사': 2, '박사': 3})[v] ?? 0;

function scoreItem(item: Occupation | JobPosting, profile: UserProfile, chosenSectors: string[]) {
  // 업종 일치 점수
  const domain = chosenSectors.includes(item.sector) ? 1 : 0;
  
  // 기술 적합도
  const itemSkills = item.skills ?? [];
  const intersection = itemSkills.filter(s => 
    profile.skills.includes(s.toLowerCase()) || profile.skills.includes(s)
  );
  const skills = itemSkills.length ? intersection.length / itemSkills.length : 0;
  
  // 경력 연차 점수
  const years = item.minYears ? Math.min(1, profile.years / item.minYears) : 1;
  
  // 학력 점수
  const edu = eduRank(profile.education) >= eduRank(item.reqEdu ?? '무관') ? 1 : 0;
  
  // 고용형태 점수 (현재는 중립)
  const type = 0.5;
  
  return WEIGHTS.domain * domain + WEIGHTS.skills * skills + WEIGHTS.years * years + WEIGHTS.edu * edu + WEIGHTS.type * type;
}

// 7) 추천 함수들
export function recommendOccupations(chosenSectors: string[], profile: UserProfile, k = 10) {
  return occupationsDB
    .map(o => ({ ...o, score: scoreItem(o, profile, chosenSectors) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function recommendJobs(chosenSectors: string[], profile: UserProfile, kMin = 5, kMax = 10) {
  const ranked = jobPostingsDB
    .map(j => ({ ...j, score: scoreItem(j, profile, chosenSectors) }))
    .sort((a, b) => b.score - a.score);
  const k = Math.min(kMax, Math.max(kMin, ranked.length));
  return ranked.slice(0, k);
}

export function recommendPrograms(chosenSectors: string[], profile: UserProfile, kMin = 3, kMax = 6) {
  // 부족 기술 (선택 업종의 주요 키워드 - 보유 기술)
  const needed = chosenSectors
    .flatMap(s => sectorVocab[s] || [])
    .filter((kw, i, arr) => arr.indexOf(kw) === i);
  const missing = needed.filter(kw => 
    !profile.skills.includes(kw.toLowerCase()) && !profile.skills.includes(kw)
  );

  // 프로그램이 커버하는 기술 교집합 수로 정렬
  const ranked = programsDB
    .map(p => ({ 
      ...p, 
      cover: p.skills.filter(s => missing.includes(s)).length,
      relevance: p.skills.filter(s => 
        chosenSectors.some(sector => sectorVocab[sector]?.includes(s))
      ).length
    }))
    .filter(p => p.cover > 0 || p.relevance > 0)
    .sort((a, b) => (b.cover + b.relevance) - (a.cover + a.relevance));

  const k = Math.min(kMax, Math.max(kMin, ranked.length || kMin));
  return (ranked.length ? ranked : programsDB).slice(0, k);
}

// 8) 통합 추천 인터페이스
export interface UnifiedRecommendation {
  profile: UserProfile;
  occupations: (Occupation & { score: number })[];
  jobs: (JobPosting & { score: number })[];
  programs: (EducationProgram & { cover: number; relevance: number })[];
}

export function getUnifiedRecommendations(
  resumeText: string, 
  chosenSectors: string[]
): UnifiedRecommendation {
  const profile = extractProfile(resumeText);
  const occupations = recommendOccupations(chosenSectors, profile, 10);
  const jobs = recommendJobs(chosenSectors, profile, 5, 10);
  const programs = recommendPrograms(chosenSectors, profile, 3, 6);
  
  return { profile, occupations, jobs, programs };
}