import { synonymMap, fieldAlias, REPAIR_TOKENS } from './keywordMap';

interface IntentCandidate {
  name: string;
  score: number;
}

interface ExtractedIntent {
  raw: string;
  years: number | null;
  candidates: IntentCandidate[];
  topField: IntentCandidate | null;
  hasRepairHint: boolean;
}

function normalizeText(text: string): string {
  return text
    .replace(/[^\w\s가-힣]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractYears(text: string): number | null {
  const matches = text.match(/(\d+)\s*년/g);
  if (!matches) return null;
  
  const nums = matches
    .map(x => parseInt(x.replace(/[^0-9]/g, ''), 10))
    .filter(n => !isNaN(n));
  
  if (!nums.length) return null;
  return Math.max(...nums);
}

function canonicalFieldName(name: string): string {
  if (!name) return name;
  return fieldAlias[name] || name;
}

function hasAnyToken(text: string, tokens: string[]): boolean {
  const s = text.toLowerCase();
  return tokens.some(token => s.includes(token.toLowerCase()));
}

export function extractIntent(text: string, availableFields: string[]): ExtractedIntent {
  const raw = normalizeText(text);
  const lower = raw.toLowerCase();
  const years = extractYears(raw);

  const scoreMap: Record<string, number> = {};
  
  const addScore = (field: string, points: number = 1) => {
    scoreMap[field] = (scoreMap[field] || 0) + points;
  };

  // 1) 표준 분야명 직접 일치
  for (const field of availableFields) {
    const canonicalField = canonicalFieldName(field);
    if (!canonicalField) continue;
    
    if (raw.includes(canonicalField)) {
      addScore(canonicalField, 3);
    }
  }

  // 2) 동의어/연관어 부분일치  
  for (const [field, synonyms] of Object.entries(synonymMap)) {
    const canonicalField = canonicalFieldName(field);
    for (const term of synonyms) {
      if (!term) continue;
      if (lower.includes(term.toLowerCase())) {
        addScore(canonicalField, 1);
      }
    }
  }

  // 3) "수리/정비" 류 신호가 있으면, 그 키워드를 동의어로 가진 분야들을 가산
  const hasRepairHint = hasAnyToken(lower, REPAIR_TOKENS);
  if (hasRepairHint) {
    for (const [field, synonyms] of Object.entries(synonymMap)) {
      if (synonyms.some(synonym => REPAIR_TOKENS.includes(synonym.toLowerCase()))) {
        addScore(canonicalFieldName(field), 2);
      }
    }
  }

  // 4) 룰 힌트 (부서/팀/직무 패턴) - 확장된 버전
  const ruleHints = [
    { pattern: /(마케팅|광고|브랜딩|퍼포먼스|crm)/i, field: '마케팅', weight: 2 },
    { pattern: /(생산|공정|품질|설비|보전|기계|수리|금속|섬유|화학|환경)/i, field: '제조업', weight: 2 },
    { pattern: /(개발|서버|네트워크|보안|데이터|it|앱|웹)/i, field: '정보통신', weight: 2 },
    { pattern: /(물류|창고|wms|운송|배송|포워딩|택배)/i, field: '운수 및 창고업', weight: 2 },
    { pattern: /(건설|시공|토목|건축|안전|견적|전기설비)/i, field: '건설업', weight: 2 },
    { pattern: /(r&d|연구|실험|분석|특허|컨설팅)/i, field: '과학 기술 서비스업', weight: 2 },
    { pattern: /(병원|간호|임상|원무|의료기기)/i, field: '의료', weight: 2 },
    { pattern: /(전시|공연|디자인|영상|사진|브랜딩)/i, field: '예술', weight: 2 },
    { pattern: /(전기|가스|증기|공조|배전|변전|난방|에너지)/i, field: '공급업', weight: 2 },
    { pattern: /(수리|정비|유지보수|보수|a\/s|maintenance|repair)/i, field: '제조업', weight: 3 },
    { pattern: /(토목|토목학과|토목과|토목공학)/i, field: '건설업', weight: 8 },
    { pattern: /(자격증|1급|기사|산업기사)/i, field: null, weight: 2 },
    { pattern: /(삼성|대기업|대기업체)/i, field: null, weight: 1 },
    { pattern: /(대학교|대학|학과|졸업)/i, field: null, weight: 1 }
  ];

  for (const hint of ruleHints) {
    if (hint.pattern.test(raw)) {
      const field = hint.field;
      if (field) {
        addScore(canonicalFieldName(field), hint.weight);
      } else {
        // 일반적인 가산점
        for (const f of availableFields) {
          addScore(canonicalFieldName(f), hint.weight * 0.1);
        }
      }
    }
  }

  // 결과 정리
  const candidates: IntentCandidate[] = [];
  for (const [name, score] of Object.entries(scoreMap)) {
    if (score > 0) {
      candidates.push({ name, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const topField = candidates[0] || null;

  return {
    raw,
    years,
    candidates,
    topField,
    hasRepairHint
  };
}