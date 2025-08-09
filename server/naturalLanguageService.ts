// Natural Language Processing Service for Resume Generation
// Based on the algorithm from https://github.com/yurimlee09/five

export interface ParsedResume {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  summary: string;
}

export function parseNaturalLanguage(text: string): ParsedResume {
  const clean = text.replace(/\s+/g, " ").trim();
  const result: ParsedResume = {
    name: "",
    title: "",
    location: "",
    phone: "",
    email: "",
    summary: ""
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

  // Extract job title - expanded for 5060 generation
  const titles = [
    "개발자", "데이터 분석가", "데이터 사이언티스트", "프론트엔드", "백엔드",
    "풀스택", "PM", "디자이너", "마케터", "교사", "요리사", "간호사", "영업",
    // 5060 세대에 특화된 직업군 추가
    "관리자", "팀장", "부장", "이사", "상무", "전무", "사무원", "회계", "총무",
    "인사", "기획", "영업관리", "품질관리", "생산관리", "안전관리", "시설관리",
    "고객상담", "접객", "판매", "매장관리", "창고관리", "운전", "배송",
    "청소", "경비", "조리", "제조", "포장", "검사", "검수", "상담사",
    "코디네이터", "어시스턴트", "보조", "지원", "서비스"
  ];

  result.title = titles.find(title => clean.includes(title)) || "";

  // Extract location
  const locations = [
    "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
    "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
  ];

  result.location = locations.find(location => clean.includes(location)) || "";

  // Create structured cover letter from the text
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

// Enhanced for 5060 generation - extract skills from text
export function extractSkills(text: string): string[] {
  const skillKeywords = [
    // IT 관련
    "Excel", "Word", "PowerPoint", "한글", "컴활", "정보처리",
    "React", "JavaScript", "TypeScript", "Python", "Java", "HTML", "CSS",
    
    // 일반 업무 스킬
    "회계", "세무", "인사", "총무", "기획", "영업", "마케팅", "고객상담",
    "품질관리", "생산관리", "안전관리", "시설관리", "재고관리",
    
    // 언어
    "영어", "일본어", "중국어", "독일어", "프랑스어", "스페인어",
    "토익", "토플", "JPT", "HSK",
    
    // 자격증/면허
    "운전면허", "지게차", "포크레인", "크레인", "용접", "전기", "가스",
    "요리사", "제빵사", "미용사", "이용사", "간병사", "사회복지사",
    
    // 소프트 스킬
    "리더십", "소통", "협업", "문제해결", "의사결정", "멘토링", "교육",
    "프레젠테이션", "협상", "조정", "중재"
  ];

  const foundSkills: string[] = [];
  
  skillKeywords.forEach(skill => {
    if (text.includes(skill) && !foundSkills.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

// Main function to process natural language input and return structured resume data
export async function parseResumeFromText(text: string): Promise<any> {
  const extractedInfo = parseNaturalLanguage(text);
  const skills = extractSkills(text);
  const summary = createSeniorFriendlyCoverLetter(text, extractedInfo.title);

  // Return structured data with meaningful content when available
  return {
    name: extractedInfo.name || "",
    title: extractedInfo.title || "",
    location: extractedInfo.location || "",
    phone: extractedInfo.phone || "",
    email: extractedInfo.email || "",
    summary: summary || "입력하신 내용을 바탕으로 자기소개서가 생성됩니다.",
    skills: skills.length > 0 ? skills : []
  };
}