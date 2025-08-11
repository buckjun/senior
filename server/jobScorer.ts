import { synonymMap, REPAIR_TOKENS } from './keywordMap';

interface JobItem {
  id?: string;
  company: string;
  title: string;
  field: string;
  experience?: string;
  education?: string;
  employment?: string;
  location?: string;
  description?: string;
  url?: string;
  [key: string]: any;
}

interface Intent {
  raw: string;
  topField?: { name: string; score: number } | null;
  hasRepairHint: boolean;
}

function hasAnyToken(text: string, tokens: string[]): boolean {
  const s = text.toLowerCase();
  return tokens.some(token => s.includes(token.toLowerCase()));
}

export function scoreJob(item: JobItem, intent: Intent): number {
  let score = 0;
  const query = intent.raw.toLowerCase();
  const topField = intent.topField?.name || null;

  // 1) 분야 정확도 - 가장 중요한 점수 (최대 15점)
  if (topField) {
    if (item.field === topField) {
      score += 15; // 정확한 분야 일치 - 최우선 (기존 10 → 15로 상향)
    } else if (hasAnyToken(item.field, [topField])) {
      score += 10; // 부분 일치 (기존 6 → 10으로 상향)
    }
  }

  // 2) 수리/정비 키워드 우선 반영 (핵심 알고리즘) - 최대 15점 
  const userWantsRepair = intent.hasRepairHint;
  if (userWantsRepair) {
    // 사용자가 수리/정비 관련 경험을 언급했을 때
    if (hasAnyToken(item.field, REPAIR_TOKENS)) {
      score += 12; // 분야에 수리/정비 키워드가 있음 (기존 8 → 12로 상향)
    }
    if (hasAnyToken(item.title, REPAIR_TOKENS)) {
      score += 8; // 직무명에 수리/정비 키워드가 있음 (기존 4 → 8로 상향)
    }
    if (hasAnyToken(item.description || '', REPAIR_TOKENS)) {
      score += 6; // 설명에 수리/정비 키워드가 있음 (기존 3 → 6으로 상향)
    }
  } else {
    // 사용자 문장에 수리 신호가 없더라도, 공고에 있으면 약한 보너스
    if (hasAnyToken(item.field, REPAIR_TOKENS)) {
      score += 5; // 기존 3 → 5로 상향
    }
  }

  // 3) 동의어 매칭 (사용자 문장 ↔ 해당 분야 동의어) - 최대 20점
  const fieldSynonyms = synonymMap[item.field] || [];
  for (const term of fieldSynonyms) {
    if (!term) continue;
    if (query.includes(term.toLowerCase())) {
      score += 2; // 기존 1 → 2로 상향
    }
  }

  // 4) 특별 키워드 매칭 (학과명, 회사명 등) - 최대 35점
  if (query.includes('토목') && item.field === '건설업') {
    score += 20; // 토목 관련 특별 가산 (기존 15 → 20로 상향)
  }
  if (query.includes('삼성') || query.includes('대기업')) {
    score += 6; // 대기업 경력 가산 (기존 5 → 6으로 상향)
  }
  if (query.includes('자격증') || query.includes('1급') || query.includes('기사') || query.includes('산업기사')) {
    score += 10; // 자격증 보유 가산 (기존 8 → 10으로 상향)
  }
  if (query.includes('대학교') || query.includes('졸업')) {
    score += 4; // 학력 관련 가산 (기존 3 → 4로 상향)
  }
  // 토목학과 특별 조합 보너스
  if (query.includes('토목학과') && item.field === '건설업') {
    score += 8; // 토목학과 전공자 추가 보너스 (기존 5 → 8로 상향)
  }
  // 종합 전문성 보너스 (토목 + 자격증 + 대기업 경력)
  if (query.includes('토목') && query.includes('자격증') && (query.includes('삼성') || query.includes('대기업')) && item.field === '건설업') {
    score += 5; // 전문성 종합 보너스 추가
  }

  // 5) 기타 휴리스틱: 제목/설명에 분야명 포함 - 최대 4점
  if (hasAnyToken(item.title, [item.field])) {
    score += 2; // 기존 1 → 2로 상향
  }
  if (hasAnyToken(item.description || '', [item.field])) {
    score += 2; // 기존 1 → 2로 상향
  }

  // 6) 경력 연수 매칭 - 최대 5점
  if (intent.years && intent.years > 0) {
    if (intent.years >= 10) {
      score += 5; // 10년 이상 경력 보너스
    } else if (intent.years >= 5) {
      score += 3; // 5년 이상 경력
    } else {
      score += 1; // 기본 경력
    }
  }

  return score;
}

export function buildMatcherForField(fieldName: string): (value: string) => boolean {
  const synonyms = [fieldName, ...(synonymMap[fieldName] || [])];
  
  return (value: string) => {
    const s = value.toLowerCase();
    for (const term of synonyms) {
      if (!term) continue;
      if (s.includes(term.toLowerCase())) {
        return true;
      }
    }
    return false;
  };
}