// Natural Language Processing Service for Resume Generation
// Enhanced based on the algorithm from https://github.com/yurimlee09/five
// Optimized for Korean seniors aged 50-60

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ParsedResume {
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

// Enhanced Korean natural language parsing for 5060 generation
export function parseNaturalLanguage(text: string): ParsedResume {
  const clean = text.replace(/\s+/g, " ").trim();
  const result: ParsedResume = {
    name: "",
    title: "",
    location: "",
    phone: "",
    email: "",
    summary: "",
    skills: [],
    experience: [],
    education: []
  };

  // Extract name - look for Korean name patterns
  const nameByLabel = clean.match(/이름\s*[:：]\s*([가-힣]{2,4}|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)/);
  if (nameByLabel) {
    result.name = nameByLabel[1];
  }

  // Extract phone number
  const phoneMatch = clean.match(/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }

  // Extract email
  const emailMatch = clean.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // Enhanced job title extraction for 5060 generation with industry patterns
  const seniorJobTitles = [
    // 관리직/임원급
    "관리자", "팀장", "부장", "차장", "과장", "대리", "주임", "이사", "상무", "전무", "사장", "CEO", "CTO", "CFO",
    
    // 전문직
    "회계사", "세무사", "변호사", "건축사", "의사", "간호사", "약사", "교사", "교수", "연구원", "컨설턴트",
    
    // 기술직
    "개발자", "프로그래머", "시스템관리자", "네트워크관리자", "DB관리자", "웹개발자", "앱개발자",
    "데이터분석가", "AI개발자", "머신러닝엔지니어",
    
    // 사무직
    "사무원", "총무", "인사", "기획", "재무", "회계", "구매", "영업", "마케팅", "홍보", "비서", "경리",
    
    // 서비스직
    "고객상담", "접객", "판매", "영업사원", "매장관리", "점장", "상담사", "코디네이터", "어드바이저",
    
    // 생산/기술직
    "품질관리", "생산관리", "안전관리", "시설관리", "설비관리", "기계조작", "용접", "전기", "배관",
    "건설", "토목", "조경", "운전", "배송", "물류", "창고관리",
    
    // 특수직
    "보안", "경비", "청소", "조리", "제빵", "미용", "이용", "간병", "요양보호", "사회복지",
    "문화예술", "강사", "트레이너", "코치"
  ];

  // 직급과 직종을 분리하여 더 정확한 매칭
  const jobPattern = new RegExp(`(${seniorJobTitles.join('|')})`, 'g');
  const matches = clean.match(jobPattern);
  result.title = matches ? matches[0] : "";

  // 경력 정보 추출
  const experiencePatterns = [
    /(\d+)년\s*경력/g,
    /(\d+)년간?\s*(근무|재직|담당)/g,
    /(전|현)\s*([가-힣\s]+?)\s*(회사|기업|단체|기관)/g,
    /([가-힣\s]+?)\s*(부서|팀|본부)\s*(근무|담당)/g
  ];

  experiencePatterns.forEach(pattern => {
    const matches = clean.match(pattern);
    if (matches) {
      result.experience.push(...matches);
    }
  });

  // 학력 정보 추출
  const educationKeywords = ["대학교", "대학", "고등학교", "고교", "전문대", "대학원", "석사", "박사", "학사"];
  educationKeywords.forEach(keyword => {
    const pattern = new RegExp(`([가-힣\\s]*${keyword}[가-힣\\s]*)`, 'g');
    const matches = clean.match(pattern);
    if (matches) {
      result.education.push(...matches.filter(match => match.trim().length > keyword.length));
    }
  });

  // Enhanced location extraction with detailed areas
  const detailedLocations = [
    // 서울 세부 지역
    "서울", "강남", "강북", "강서", "강동", "서초", "송파", "영등포", "마포", "용산", "종로", "중구",
    "성북", "동작", "관악", "서대문", "은평", "노원", "도봉", "양천", "구로", "금천",
    
    // 광역시
    "부산", "대구", "인천", "광주", "대전", "울산", "세종",
    
    // 경기도 주요 도시
    "수원", "성남", "안양", "부천", "광명", "평택", "안산", "고양", "과천", "구리", "남양주", "의정부",
    "하남", "용인", "파주", "이천", "안성", "김포", "화성", "광주", "양주", "포천", "여주", "연천", "가평", "양평",
    
    // 기타 광역시도
    "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
    "춘천", "원주", "청주", "천안", "전주", "광주", "포항", "경주", "진주", "창원", "제주시", "서귀포"
  ];

  result.location = detailedLocations.find(location => clean.includes(location)) || "";

  // Extract skills using enhanced algorithm
  result.skills = extractSkills(clean);

  // Create structured cover letter optimized for seniors
  result.summary = createSeniorFriendlyCoverLetter(clean, result.title);

  return result;
}

function createSeniorFriendlyCoverLetter(text: string, jobTitle: string): string {
  const sentences = text.split(/[。.!?！？]/);
  let coverLetter = "";

  // Opening statement - 5060 세대에 맞는 정중한 인사
  if (jobTitle) {
    coverLetter += `안녕하십니까. ${jobTitle} 포지션에 지원하는 지원자입니다.\n\n`;
  } else {
    coverLetter += "안녕하십니까. 오랜 경험과 노하우를 바탕으로 새로운 도전을 하고자 지원하게 되었습니다.\n\n";
  }

  // Experience and skills section - 경력 중심
  const experienceKeywords = [
    "경력", "경험", "년", "개월", "프로젝트", "개발", "담당", "참여", 
    "관리", "운영", "책임", "업무", "근무", "재직", "퇴직", "은퇴"
  ];
  const skillKeywords = [
    "기술", "언어", "도구", "프레임워크", "라이브러리", "능력", "역량", 
    "자격증", "면허", "교육", "훈련", "스킬"
  ];

  const experienceSentences = sentences.filter(s =>
    experienceKeywords.some(keyword => s.includes(keyword))
  );

  if (experienceSentences.length > 0) {
    coverLetter += "【 주요 경력 및 경험 】\n";
    experienceSentences.forEach(sentence => {
      if (sentence.trim()) {
        coverLetter += `• ${sentence.trim()}\n`;
      }
    });
    coverLetter += "\n";
  }

  // Skills and competencies
  const skillSentences = sentences.filter(s =>
    skillKeywords.some(keyword => s.includes(keyword)) ||
    s.includes("React") || s.includes("JavaScript") || s.includes("Python") ||
    s.includes("Java") || s.includes("TypeScript") || s.includes("Vue") ||
    s.includes("Angular") || s.includes("Node.js") ||
    // 5060 세대에 일반적인 기술들 추가
    s.includes("Excel") || s.includes("Word") || s.includes("PowerPoint") ||
    s.includes("한글") || s.includes("컴활") || s.includes("회계") ||
    s.includes("ERP") || s.includes("CRM") || s.includes("영어") || s.includes("일본어") ||
    s.includes("중국어") || s.includes("운전면허") || s.includes("포크레인") ||
    s.includes("지게차") || s.includes("용접") || s.includes("기계")
  );

  if (skillSentences.length > 0) {
    coverLetter += "【 보유 기술 및 역량 】\n";
    skillSentences.forEach(sentence => {
      if (sentence.trim()) {
        coverLetter += `• ${sentence.trim()}\n`;
      }
    });
    coverLetter += "\n";
  }

  // Goals and motivation - 5060 세대 특성 반영
  const motivationKeywords = [
    "목표", "꿈", "희망", "관심", "열정", "성장", "도전", "기여",
    "봉사", "나눔", "멘토링", "후배", "전수", "노하우", "경험"
  ];
  const motivationSentences = sentences.filter(s =>
    motivationKeywords.some(keyword => s.includes(keyword))
  );

  if (motivationSentences.length > 0) {
    coverLetter += "【 지원 동기 및 포부 】\n";
    motivationSentences.forEach(sentence => {
      if (sentence.trim()) {
        coverLetter += `• ${sentence.trim()}\n`;
      }
    });
    coverLetter += "\n";
  }

  // Closing statement - 5060 세대다운 마무리
  coverLetter += "오랜 경험과 성숙한 판단력을 바탕으로 조직에 실질적인 도움이 되고자 합니다. " +
    "젊은 동료들과 협력하며 상호 발전할 수 있는 기회를 주신다면 최선을 다하겠습니다.\n\n감사합니다.";

  // If no structured content was found, use the original text with formatting
  if (!experienceSentences.length && !skillSentences.length && !motivationSentences.length) {
    const mainContent = sentences.filter(s => s.trim().length > 10).slice(0, 3);
    if (mainContent.length > 0) {
      coverLetter = coverLetter.split('\n\n')[0] + "\n\n";
      coverLetter += "【 자기소개 】\n";
      mainContent.forEach(sentence => {
        if (sentence.trim()) {
          coverLetter += `${sentence.trim()}.\n`;
        }
      });
      coverLetter += "\n축적된 경험과 노하우로 귀하의 조직에 기여하고 싶습니다.\n\n감사합니다.";
    }
  }

  return coverLetter;
}

// Enhanced skill extraction optimized for 5060 generation
export function extractSkills(text: string): string[] {
  const seniorSkillCategories = {
    // 디지털 기초 스킬 (5060 세대 필수)
    digitalBasic: [
      "컴퓨터활용", "컴활", "Excel", "엑셀", "Word", "워드", "PowerPoint", "파워포인트", "한글",
      "인터넷", "이메일", "카카오톡", "문서작성", "스프레드시트", "프레젠테이션"
    ],
    
    // 고급 IT 스킬
    digitalAdvanced: [
      "React", "JavaScript", "TypeScript", "Python", "Java", "HTML", "CSS", "SQL",
      "데이터분석", "프로그래밍", "웹개발", "앱개발", "시스템관리", "네트워크"
    ],
    
    // 업무 전문 스킬
    businessProfessional: [
      "회계", "세무", "재무관리", "예산관리", "인사관리", "노무관리", "총무", "기획",
      "프로젝트관리", "영업관리", "마케팅", "홍보", "고객관리", "구매", "조달"
    ],
    
    // 생산/기술 스킬
    technicalProduction: [
      "품질관리", "생산관리", "공정관리", "안전관리", "시설관리", "설비관리", "재고관리",
      "물류관리", "SCM", "용접", "전기", "기계", "건설", "토목", "배관", "자동화"
    ],
    
    // 언어 능력
    languages: [
      "영어", "일본어", "중국어", "독일어", "프랑스어", "스페인어", "러시아어",
      "토익", "토플", "텝스", "JPT", "JLPT", "HSK", "OPIc", "회화", "번역", "통역"
    ],
    
    // 자격증/면허 (5060 세대 특화)
    certifications: [
      "운전면허", "1종면허", "2종면허", "지게차", "포크레인", "크레인", "굴삭기",
      "용접기능사", "전기기능사", "가스기능사", "건설기계", "화물운송", "택시",
      "요리사", "조리사", "제빵사", "제과사", "바리스타", "소믈리에",
      "미용사", "이용사", "네일아트", "피부관리", "마사지",
      "간병사", "요양보호사", "사회복지사", "보육교사", "평생교육사"
    ],
    
    // 관리/리더십 스킬 (5060 세대 강점)
    leadership: [
      "리더십", "팀관리", "조직관리", "인력관리", "부서관리", "사업관리",
      "의사결정", "문제해결", "위기관리", "갈등조정", "중재", "협상",
      "멘토링", "코칭", "교육", "훈련", "지도", "상담"
    ],
    
    // 커뮤니케이션 스킬
    communication: [
      "소통", "커뮤니케이션", "협업", "팀워크", "고객응대", "고객상담", "상담",
      "프레젠테이션", "발표", "회의진행", "보고서작성", "기획서작성"
    ],
    
    // 서비스업 특화 스킬
    serviceIndustry: [
      "접객", "고객서비스", "판매", "영업", "매장관리", "점포운영", "재고관리",
      "POS", "계산", "진열", "상품관리", "클레임처리", "AS", "배송", "택배"
    ]
  };

  const allSkills = Object.values(seniorSkillCategories).flat();
  const foundSkills: string[] = [];
  
  // 정확한 매칭과 유사 키워드 매칭
  allSkills.forEach(skill => {
    if (text.includes(skill) && !foundSkills.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  // 패턴 기반 스킬 추출 (예: "○○ 가능", "○○ 경험")
  const skillPatterns = [
    /([가-힣A-Za-z]+)\s*(가능|능력|경험|숙련|전문)/g,
    /([가-힣A-Za-z]+)\s*(자격증|면허|기능사)/g,
    /([가-힣A-Za-z]+)\s*(\d+급|\d+종)/g
  ];

  skillPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const skill = match[1].trim();
      if (skill.length > 1 && !foundSkills.includes(skill)) {
        foundSkills.push(skill);
      }
    }
    pattern.lastIndex = 0; // Reset regex
  });

  return foundSkills.slice(0, 20); // 최대 20개로 제한
}

// AI-enhanced parsing using Gemini for better accuracy
export async function parseResumeWithAI(text: string): Promise<ParsedResume> {
  try {
    const prompt = `
다음 한국어 텍스트에서 50-60세 구직자의 이력서 정보를 추출해주세요.
JSON 형식으로 응답하고, 다음 필드를 포함해주세요:

{
  "name": "추출된 이름 (없으면 빈 문자열)",
  "title": "직책이나 희망 직종 (5060 세대 적합한 직종)",
  "location": "지역 정보",
  "phone": "전화번호 (01X-XXXX-XXXX 형식)",
  "email": "이메일 주소",
  "summary": "5060 세대에 적합한 자기소개서 (300자 이내, 경험과 성숙함 강조)",
  "skills": ["추출된 스킬 목록 (최대 10개)"],
  "experience": ["경력 정보 목록"],
  "education": ["학력 정보 목록"]
}

입력 텍스트:
${text}

5060 세대의 특성을 고려하여:
- 풍부한 경험과 노하우 강조
- 성숙한 판단력과 책임감 언급
- 멘토링과 협업 능력 부각
- 안정적이고 신뢰할 수 있는 인상 전달
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || '{}');
    
    // 기본값 설정 및 검증
    return {
      name: result.name || "",
      title: result.title || "",
      location: result.location || "",
      phone: result.phone || "",
      email: result.email || "",
      summary: result.summary || createSeniorFriendlyCoverLetter(text, result.title || ""),
      skills: Array.isArray(result.skills) ? result.skills.slice(0, 10) : extractSkills(text).slice(0, 10),
      experience: Array.isArray(result.experience) ? result.experience : [],
      education: Array.isArray(result.education) ? result.education : []
    };

  } catch (error) {
    console.error('AI parsing failed, falling back to rule-based parsing:', error);
    // AI 파싱 실패 시 기존 규칙 기반 파싱으로 폴백
    return parseNaturalLanguage(text);
  }
}

// Main function to process natural language input and return structured resume data
export async function parseResumeFromText(text: string): Promise<ParsedResume> {
  // AI 파싱을 먼저 시도하고, 실패시 규칙 기반 파싱으로 폴백
  return await parseResumeWithAI(text);
}