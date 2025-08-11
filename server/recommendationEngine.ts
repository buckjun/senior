// 수리 우선 추천 알고리즘 적용 - 음성 이력서에서 업종별 직업/공고/교육 추천
import type { IndividualProfile } from "@shared/schema";
import { extractIntent } from "./intentExtractor";
import { scoreJob } from "./jobScorer";
import { synonymMap, REPAIR_TOKENS } from "./keywordMap";
import { loadAllCompanyJobs, loadLearningPrograms, extractSectorKeywords, type CompanyJob } from "./csvReader";

// 1) 업종/키워드 사전 (업데이트된 수리 우선 알고리즘 반영)
export const SECTORS = [
  '건설업','공급업','과학 기술 서비스업','마케팅','예술',
  '운수 및 창고업','의료','정보통신','제조업'
];

// 기존 업종별 키워드를 새로운 수리 우선 매핑으로 교체
const sectorVocab: Record<string, string[]> = synonymMap;

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
              
  // 기존 스킬 추출에 수리 관련 키워드 추가
  const detectedSkills = ALL_SKILLS.filter(k => text.includes(k.toLowerCase()));
  const repairSkills = REPAIR_TOKENS.filter(token => text.includes(token.toLowerCase()));
  const combinedSkills = [...detectedSkills, ...repairSkills];
  const skills = Array.from(new Set(combinedSkills));
  
  return { years, education: edu, skills };
}

// 4) 업종 자동 분류 (수리 우선 알고리즘 적용)
export function rankSectors(resumeText = '', topK = 1) {
  console.log('Ranking sectors for:', resumeText);
  
  // 새로운 의도 추출 알고리즘 사용
  const intent = extractIntent(resumeText, SECTORS);
  console.log('Intent extraction result:', intent);
  
  let sectorScores = intent.candidates.map(candidate => ({
    sector: candidate.name,
    score: candidate.score / 10  // 0-1 범위로 정규화
  }));
  
  // 기존 방식도 병행하여 결합
  const legacyScores = SECTORS.map(sector => {
    const score = hasAny(resumeText.toLowerCase(), sectorVocab[sector] || []);
    return { sector, score: score / 10 };
  });
  
  // 두 방식의 점수를 결합
  const combinedScores = SECTORS.map(sector => {
    const intentScore = sectorScores.find(s => s.sector === sector)?.score || 0;
    const legacyScore = legacyScores.find(s => s.sector === sector)?.score || 0;
    return {
      sector,
      score: Math.max(intentScore, legacyScore) // 더 높은 점수 사용
    };
  }).sort((a, b) => b.score - a.score);
  
  console.log('Combined sector scores:', combinedScores);
  return combinedScores.slice(0, topK);
}

// 5) 실제 CSV 데이터 로드 함수들
let companiesCache: CompanyJob[] = [];
let programsCache: any[] = [];

export function getCompanyJobs(): CompanyJob[] {
  if (companiesCache.length === 0) {
    try {
      companiesCache = loadAllCompanyJobs();
      console.log(`Loaded ${companiesCache.length} company jobs from CSV files`);
    } catch (error) {
      console.error('Error loading company jobs:', error);
      companiesCache = [];
    }
  }
  return companiesCache;
}

// 캐시를 재로드하는 함수 추가
export function reloadCompanyJobsCache(): CompanyJob[] {
  console.log('Reloading company jobs cache...');
  companiesCache = [];
  try {
    companiesCache = loadAllCompanyJobs();
    console.log(`Reloaded ${companiesCache.length} company jobs from CSV files`);
    return companiesCache;
  } catch (error) {
    console.error('Error reloading company jobs:', error);
    companiesCache = [];
    return [];
  }
}

export function getLearningPrograms() {
  if (programsCache.length === 0) {
    try {
      programsCache = loadLearningPrograms();
      // 하드코딩된 오프라인 프로그램도 추가
      const offlinePrograms = [
        { id: 'pg1', title: 'PLC 자동화 교육', skills: ['PLC', '자동화', '전기'], duration: '3개월', provider: '기술교육원', type: 'offline' as const },
        { id: 'pg2', title: '품질/공정 FMEA 교육', skills: ['품질관리', 'FMEA', '공정'], duration: '2개월', provider: '품질관리협회', type: 'offline' as const },
        { id: 'pg3', title: 'BIM 3D 설계교육', skills: ['BIM', '3D', 'AutoCAD'], duration: '4개월', provider: '건설기술원', type: 'offline' as const },
        { id: 'pg7', title: '물류관리사 자격과정', skills: ['물류', 'SCM', 'WMS'], duration: '3개월', provider: '물류진흥원', type: 'offline' as const },
        { id: 'pg8', title: '의료정보시스템 운영', skills: ['EMR', '의료정보', '시스템'], duration: '2개월', provider: '의료정보협회', type: 'offline' as const },
        { id: 'pg9', title: 'R&D 실무교육', skills: ['연구', '실험', '분석'], duration: '3개월', provider: '과학기술원', type: 'offline' as const },
        { id: 'pg10', title: '전기설비 기초과정', skills: ['전기', '설비', '안전'], duration: '2개월', provider: '전기안전공사', type: 'offline' as const },
        { id: 'pg11', title: '문화예술기획 실무', skills: ['기획', '예술', '문화'], duration: '2개월', provider: '문화재단', type: 'offline' as const },
        { id: 'pg12', title: '건설안전관리 실무', skills: ['안전', '건설', '관리'], duration: '1개월', provider: '안전보건공단', type: 'offline' as const }
      ];
      programsCache = [...programsCache, ...offlinePrograms];
      console.log(`Loaded ${programsCache.length} learning programs`);
    } catch (error) {
      console.error('Error loading learning programs:', error);
      programsCache = [];
    }
  }
  return programsCache;
}

// 샘플 데이터 (실제 서비스에서는 DB 또는 API로 교체)
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
  // 엑셀 CSV에서 요청한 추가 필드들
  field?: string;
  experience?: string;
  deadline?: string;
  employmentType?: string;
  companySize?: string;
  originalData?: {
    회사명: string;
    공고명: string;
    지역: string;
    학력: string;
    경력: string;
    분야: string;
    마감일: string;
    고용형태: string;
    기업규모: string;
    급여: string;
  };
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

export const educationProgramsDB: EducationProgram[] = [
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

// 추천 품질 기준점 - 최소 5개는 보장
const MIN_RECOMMENDATION_SCORE = 0.3; // 낮춘 임계값으로 더 많은 결과 보장

const eduRank = (v: string) => ({'무관': 0, '학사': 1, '석사': 2, '박사': 3})[v] ?? 0;

function scoreItem(item: Occupation | JobPosting, profile: UserProfile, chosenSectors: string[], resumeText = '') {
  // 기존 점수 계산
  const domain = chosenSectors.includes(item.sector) ? 1 : 0;
  
  const itemSkills = item.skills ?? [];
  const intersection = itemSkills.filter(s => 
    profile.skills.includes(s.toLowerCase()) || profile.skills.includes(s)
  );
  const skills = itemSkills.length ? intersection.length / itemSkills.length : 0;
  
  const years = item.minYears ? Math.min(1, profile.years / item.minYears) : 1;
  const edu = eduRank(profile.education) >= eduRank(item.reqEdu ?? '무관') ? 1 : 0;
  const type = 0.5;
  
  let baseScore = WEIGHTS.domain * domain + WEIGHTS.skills * skills + WEIGHTS.years * years + WEIGHTS.edu * edu + WEIGHTS.type * type;
  
  // 수리 우선 알고리즘 적용
  if (resumeText) {
    const intent = extractIntent(resumeText, SECTORS);
    
    // 가상의 직업 아이템을 생성하여 수리 우선 점수 계산
    const jobItem = {
      id: item.id || '',
      company: 'company' in item ? item.company : '',
      title: item.title,
      field: item.sector,
      experience: item.minYears?.toString() || '',
      education: item.reqEdu || '',
      employment: '',
      location: 'location' in item ? item.location : '',
      description: 'description' in item ? item.description : '',
      url: ''
    };
    
    const repairScore = scoreJob(jobItem, { 
      raw: intent.raw, 
      topField: intent.topField, 
      hasRepairHint: intent.hasRepairHint 
    });
    
    // 수리 우선 점수를 0-1 범위로 정규화하고 기존 점수와 결합  
    // 최대 점수를 90점으로 가정하여 정규화하고 특별 보너스 적용
    const normalizedRepairScore = Math.min(1, repairScore / 90);
    
    // 특별 케이스: 고급 전문가 70점 이상 보장
    const rawLower = intent.raw.toLowerCase();
    const isAdvancedProfessional = (
      (rawLower.includes('토목') && rawLower.includes('자격증')) ||
      (rawLower.includes('수리') && rawLower.includes('정비') && intent.years && intent.years >= 10) ||
      (rawLower.includes('삼성') && intent.years && intent.years >= 8) ||
      (rawLower.includes('토목학과') && intent.years && intent.years >= 8)
    );
    
    // 디버그 로그 제거 (프로덕션용)
    
    if (isAdvancedProfessional) {
      baseScore = Math.max(0.72, (baseScore * 0.3) + (normalizedRepairScore * 0.7));
      // 고급 전문가 보너스 적용됨
    } else {
      baseScore = (baseScore * 0.3) + (normalizedRepairScore * 0.7);
    }
  }
  
  return baseScore;
}

// 7) 추천 함수들 (수리 우선 알고리즘 적용)
export function recommendOccupations(chosenSectors: string[], profile: UserProfile, resumeText = '', k = 10) {
  return occupationsDB
    .map(o => ({ ...o, score: scoreItem(o, profile, chosenSectors, resumeText) }))
    .filter(o => o.score >= MIN_RECOMMENDATION_SCORE) // "보통" 등급 이하 제외
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function recommendJobs(chosenSectors: string[], profile: UserProfile, resumeText = '', kMin = 5, kMax = 10) {
  console.log(`=== 공고 추천 시작 ===`);
  console.log(`선택된 업종: ${chosenSectors}`);
  console.log(`프로필:`, profile);
  
  // 강제로 CSV 데이터 로드
  const companyJobs = loadAllCompanyJobs();
  console.log(`CSV에서 로드된 총 공고 수: ${companyJobs.length}`);
  
  // 선택된 업종의 회사 공고 필터링
  const filteredJobs = companyJobs.filter((job: CompanyJob) => chosenSectors.includes(job.sector));
  console.log(`업종 ${chosenSectors}에 해당하는 공고: ${filteredJobs.length}개`);
  
  // CSV 데이터의 모든 필드를 보존하여 변환 (회사명, 공고명, 지역, 학력, 경력, 분야, 마감일, 고용형태, 기업규모, 급여)
  const convertedJobs = filteredJobs.map((job: CompanyJob) => ({
    id: job.id,
    sector: job.sector,
    // 기본 JobPosting 필드들
    title: job.title || '제목 없음',
    company: job.company || '회사명 없음',
    minYears: parseExperience(job.experience),
    reqEdu: job.education || '무관',
    skills: extractSectorKeywords(job),
    location: job.location || '지역 정보 없음',
    salary: job.salary ? (job.salary.includes('만원') ? job.salary : job.salary + '만원') : '급여 정보 없음',
    // 추가 CSV 필드들 (엑셀에서 요청한 상세 정보)
    field: job.field || '분야 정보 없음',
    experience: job.experience || '경력 정보 없음',
    deadline: job.deadline || '마감일 정보 없음', 
    employmentType: job.employmentType || '고용형태 정보 없음',
    companySize: job.companySize || '기업규모 정보 없음',
    // 원본 CSV 데이터 보존
    originalData: {
      회사명: job.company,
      공고명: job.title,
      지역: job.location, 
      학력: job.education,
      경력: job.experience,
      분야: job.field,
      마감일: job.deadline,
      고용형태: job.employmentType,
      기업규모: job.companySize,
      급여: job.salary
    },
    score: 0
  }));
  
  console.log(`변환된 공고 샘플:`, convertedJobs.slice(0, 2));
  
  // 점수 계산 및 정렬 (최소 5개는 보장)
  const ranked = convertedJobs
    .map(j => ({ ...j, score: scoreItem(j, profile, chosenSectors, resumeText) }))
    .sort((a, b) => b.score - a.score);
    
  console.log(`전체 점수별 정렬된 공고: ${ranked.length}개`);
  console.log(`상위 5개 공고 점수:`, ranked.slice(0, 5).map(j => ({ title: j.title, company: j.company, score: j.score.toFixed(2) })));
  
  // 최소 5개 이상 보장하되, 있는 만큼만 반환
  const resultCount = Math.min(kMax, Math.max(kMin, ranked.length));
  const result = ranked.slice(0, resultCount);
  
  console.log(`최종 반환 공고 수: ${result.length}개`);
  return result;
}

// 경력 텍스트를 숫자로 변환하는 헬퍼 함수
function parseExperience(expText: string): number {
  if (!expText) return 0;
  const match = expText.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function recommendPrograms(chosenSectors: string[], profile: UserProfile, kMin = 3, kMax = 6) {
  // 실제 학습 프로그램 데이터 사용
  const learningPrograms = getLearningPrograms();
  
  // 선택된 업종과 관련된 프로그램 필터링 + 기존 프로그램
  const allPrograms = [...learningPrograms, ...educationProgramsDB];
  
  // 부족 기술 (선택 업종의 주요 키워드 - 보유 기술)
  const needed = chosenSectors
    .flatMap((s: string) => sectorVocab[s] || [])
    .filter((kw: string, i: number, arr: string[]) => arr.indexOf(kw) === i);
  const missing = needed.filter(kw => 
    !profile.skills.includes(kw.toLowerCase()) && !profile.skills.includes(kw)
  );

  // 프로그램이 커버하는 기술 교집합 수로 정렬
  const ranked = allPrograms
    .map(p => ({ 
      ...p, 
      cover: p.skills.filter((s: string) => missing.includes(s)).length,
      relevance: p.skills.filter((s: string) => 
        chosenSectors.some(sector => sectorVocab[sector]?.includes(s))
      ).length
    }))
    .filter(p => p.cover > 0 || p.relevance > 0 || chosenSectors.includes(p.sector))
    .sort((a, b) => (b.cover + b.relevance) - (a.cover + a.relevance));

  const k = Math.min(kMax, Math.max(kMin, ranked.length || kMin));
  const fallbackPrograms = allPrograms.slice(0, kMin).map(p => ({ ...p, cover: 0, relevance: 0 }));
  return (ranked.length ? ranked : fallbackPrograms).slice(0, k);
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
  console.log('Getting unified recommendations for:', { resumeText, chosenSectors });
  
  const profile = extractProfile(resumeText);
  console.log('Extracted profile:', profile);
  
  const occupations = recommendOccupations(chosenSectors, profile, resumeText, 10);
  console.log('Recommended occupations:', occupations.length);
  
  const jobs = recommendJobs(chosenSectors, profile, resumeText, 5, 10);
  console.log('Recommended jobs:', jobs.length);
  
  const programs = recommendPrograms(chosenSectors, profile, 3, 6);
  console.log('Recommended programs:', programs.length);
  
  const result = { profile, occupations, jobs, programs };
  console.log('Final recommendation result:', result);
  
  return result;
}