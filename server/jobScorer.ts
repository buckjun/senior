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

  // 1) 분야 정확도 - 가장 중요한 점수
  if (topField) {
    if (item.field === topField) {
      score += 10; // 정확한 분야 일치 - 최우선
    } else if (hasAnyToken(item.field, [topField])) {
      score += 6; // 부분 일치
    }
  }

  // 2) 수리/정비 키워드 우선 반영 (핵심 알고리즘)
  const userWantsRepair = intent.hasRepairHint;
  if (userWantsRepair) {
    // 사용자가 수리/정비 관련 경험을 언급했을 때
    if (hasAnyToken(item.field, REPAIR_TOKENS)) {
      score += 8; // 분야에 수리/정비 키워드가 있음
    }
    if (hasAnyToken(item.title, REPAIR_TOKENS)) {
      score += 4; // 직무명에 수리/정비 키워드가 있음
    }
    if (hasAnyToken(item.description || '', REPAIR_TOKENS)) {
      score += 3; // 설명에 수리/정비 키워드가 있음
    }
  } else {
    // 사용자 문장에 수리 신호가 없더라도, 공고에 있으면 약한 보너스
    if (hasAnyToken(item.field, REPAIR_TOKENS)) {
      score += 3;
    }
  }

  // 3) 동의어 매칭 (사용자 문장 ↔ 해당 분야 동의어)
  const fieldSynonyms = synonymMap[item.field] || [];
  for (const term of fieldSynonyms) {
    if (!term) continue;
    if (query.includes(term.toLowerCase())) {
      score += 1;
    }
  }

  // 4) 기타 휴리스틱: 제목/설명에 분야명 포함
  if (hasAnyToken(item.title, [item.field])) {
    score += 1;
  }
  if (hasAnyToken(item.description || '', [item.field])) {
    score += 1;
  }

  // 5) 경력 연수 매칭 (기존 로직 유지)
  if (intent.raw.includes('년') && item.experience) {
    const experienceMatch = item.experience.match(/(\d+)/);
    if (experienceMatch) {
      score += 0.5; // 경력 요건이 있으면 소폭 가산
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