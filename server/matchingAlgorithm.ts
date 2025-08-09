import { Company, IndividualProfile, JobCategory } from '@shared/schema';

interface MatchingCriteria {
  fieldMatch: number;
  experienceMatch: number; 
  educationMatch: number;
  employmentTypeMatch: number;
  certificationBonus: number;
  totalScore: number;
}

interface MatchedCompany extends Company {
  matchingScore: number;
  matchingDetails: MatchingCriteria;
}

// Scoring weights (분야 > 경력 > 학력 > 고용형태)
const WEIGHTS = {
  FIELD: 40,      // 분야 매칭 (40%)
  EXPERIENCE: 30, // 경력 매칭 (30%) 
  EDUCATION: 20,  // 학력 매칭 (20%)
  EMPLOYMENT: 10, // 고용형태 매칭 (10%)
};

// IT 관련 자격증 목록 (ADSP 등)
const IT_CERTIFICATIONS = [
  'ADSP', 'ADP', 'SQLD', 'SQLP', 'OCP', 'AWS', 'Azure', 'GCP',
  'PMP', 'CISSP', 'CISA', 'CISM', 'CEH', 'CCNA', 'CCNP',
  '정보처리기사', '정보보안기사', '컴활', 'MOS', 'ITQ'
];

function calculateFieldMatch(
  userCategories: JobCategory[], 
  companyCategory: string
): number {
  // Direct category name matching
  for (const userCategory of userCategories) {
    if (userCategory.name === companyCategory) {
      return 100; // Perfect match
    }
  }

  // Semantic matching for similar fields
  const categoryMatches: Record<string, string[]> = {
    'manufacturing': ['제조업', '생산', '공장', '제품', '품질'],
    'information_technology': ['정보통신', 'IT', '소프트웨어', '개발', '시스템', '데이터'],
    'logistics': ['운수', '창고', '물류', '배송', '운송', '유통'],
    'construction': ['건설', '건축', '토목', '시설', '공사'],
    'marketing': ['마케팅', '광고', '홍보', '브랜딩', '영업'],
    'healthcare': ['의료', '제약', '병원', '간호', '바이오'],
    'science_technology': ['연구', '개발', '기술', '과학', 'R&D'],
    'arts': ['예술', '문화', '콘텐츠', '디자인', '편집'],
    'supply': ['공급', '유통', '서비스', '호텔', '요리']
  };

  for (const userCategory of userCategories) {
    const keywords = categoryMatches[userCategory.name] || [];
    for (const keyword of keywords) {
      if (companyCategory.includes(keyword)) {
        return 75; // Good semantic match
      }
    }
  }

  return 0; // No match
}

function calculateExperienceMatch(
  userExperience: any[], 
  requiredExperience: string
): number {
  if (!userExperience || userExperience.length === 0) {
    if (requiredExperience.includes('신입') || requiredExperience.includes('무관')) {
      return 80;
    }
    return 20; // Low score for missing experience when required
  }

  // Calculate total years of experience
  const totalYears = userExperience.reduce((sum, exp) => {
    const duration = exp.duration || '0';
    const years = parseInt(duration.match(/\d+/)?.[0] || '0');
    return sum + years;
  }, 0);

  // Extract required years from company requirement
  const requiredYearsMatch = requiredExperience.match(/(\d+)년/);
  const requiredYears = requiredYearsMatch ? parseInt(requiredYearsMatch[1]) : 0;

  if (requiredYears === 0) return 90; // No specific requirement

  // Score based on experience match
  if (totalYears >= requiredYears) {
    return Math.min(100, 80 + (totalYears - requiredYears) * 2); // Bonus for extra experience
  } else {
    // Penalty for insufficient experience
    const ratio = totalYears / requiredYears;
    return Math.max(20, ratio * 70);
  }
}

function calculateEducationMatch(
  userProfile: IndividualProfile,
  requiredEducation: string
): number {
  if (!requiredEducation || requiredEducation === '무관') return 90;

  // Education level mapping
  const educationLevels: Record<string, number> = {
    '고졸': 1,
    '초대졸': 2,
    '전문대졸': 2,
    '대졸': 3,
    '석사': 4,
    '박사': 5,
  };

  // Extract user education from AI analysis or other fields
  const userEducation = userProfile.aiAnalysis as any;
  const userLevel = userEducation?.education || '대졸'; // Default assumption

  const requiredLevel = Object.keys(educationLevels).find(level => 
    requiredEducation.includes(level)
  ) || '대졸';

  const userLevelNum = educationLevels[userLevel] || 3;
  const requiredLevelNum = educationLevels[requiredLevel] || 3;

  if (userLevelNum >= requiredLevelNum) {
    return 100; // Meets or exceeds requirement
  } else {
    // Penalty for lower education
    const ratio = userLevelNum / requiredLevelNum;
    return Math.max(30, ratio * 70);
  }
}

function calculateEmploymentTypeMatch(
  userProfile: IndividualProfile,
  companyEmploymentType: string
): number {
  // For 5060 generation, flexibility is important
  const flexibleTypes = ['정규직', '계약직', '인턴', '훈련생'];
  
  if (!companyEmploymentType || flexibleTypes.includes(companyEmploymentType)) {
    return 90; // Good match for flexible employment
  }

  // If user specifically prefers certain types, check against those
  // For now, assume all types are acceptable
  return 70;
}

function calculateCertificationBonus(
  userProfile: IndividualProfile,
  companyCategory: string,
  companySkills: string
): number {
  const userSkills = userProfile.skills as string[] || [];
  let bonus = 0;

  // IT field certification bonus
  if (companyCategory === 'information_technology') {
    for (const skill of userSkills) {
      if (IT_CERTIFICATIONS.some(cert => skill.includes(cert))) {
        bonus += 15; // +15 points for each relevant certification
      }
    }
  }

  // General skill matching bonus
  for (const skill of userSkills) {
    if (companySkills && companySkills.includes(skill)) {
      bonus += 10; // +10 points for each matching skill
    }
  }

  return Math.min(bonus, 50); // Cap at 50 bonus points
}

export function matchUserToCompanies(
  userProfile: IndividualProfile,
  userCategories: JobCategory[],
  companies: Company[]
): MatchedCompany[] {
  const matchedCompanies: MatchedCompany[] = [];

  for (const company of companies) {
    const fieldMatch = calculateFieldMatch(userCategories, company.category);
    const experienceMatch = calculateExperienceMatch(
      userProfile.experience as any[], 
      company.experience || ''
    );
    const educationMatch = calculateEducationMatch(userProfile, company.education || '');
    const employmentTypeMatch = calculateEmploymentTypeMatch(
      userProfile, 
      company.employmentType || ''
    );
    const certificationBonus = calculateCertificationBonus(
      userProfile,
      company.category,
      company.skills || ''
    );

    // Calculate weighted total score
    const totalScore = (
      (fieldMatch * WEIGHTS.FIELD) +
      (experienceMatch * WEIGHTS.EXPERIENCE) + 
      (educationMatch * WEIGHTS.EDUCATION) +
      (employmentTypeMatch * WEIGHTS.EMPLOYMENT)
    ) / 100 + certificationBonus;

    const matchingDetails: MatchingCriteria = {
      fieldMatch,
      experienceMatch,
      educationMatch, 
      employmentTypeMatch,
      certificationBonus,
      totalScore,
    };

    matchedCompanies.push({
      ...company,
      matchingScore: Math.round(totalScore),
      matchingDetails,
    });
  }

  // Sort by matching score (highest first) and return top 4-10
  const sortedCompanies = matchedCompanies
    .sort((a, b) => b.matchingScore - a.matchingScore)
    .filter(company => company.matchingScore > 30) // Filter out very low matches
    .slice(0, 10); // Take top 10

  // Ensure minimum of 4 companies if available
  if (sortedCompanies.length < 4 && matchedCompanies.length >= 4) {
    return matchedCompanies
      .sort((a, b) => b.matchingScore - a.matchingScore)
      .slice(0, 4);
  }

  return sortedCompanies;
}

export type { MatchedCompany, MatchingCriteria };