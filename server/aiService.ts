import OpenAI from "openai";
import { IndividualProfile, JobPosting } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIProfileAnalysis {
  summary: string;
  keyStrengths: string[];
  recommendedJobTypes: string[];
  skillsExtracted: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'expert';
  careerHighlights: string[];
}

export interface AIJobMatch {
  matchingScore: number;
  reasoning: string;
  keyStrengths: string[];
  improvementSuggestions?: string[];
}

export class AIService {
  
  // Analyze career information from voice input or text
  async analyzeCareerProfile(careerText: string, resumeText?: string): Promise<AIProfileAnalysis> {
    const combinedText = [careerText, resumeText].filter(Boolean).join('\n\n');
    
    const prompt = `
한국의 50-60세 시니어 구직자의 경력 정보를 분석해주세요.
다음 정보를 바탕으로 구조화된 분석 결과를 JSON 형태로 제공해주세요:

경력 정보:
${combinedText}

다음 JSON 형식으로 응답해주세요:
{
  "summary": "2-3문장으로 경력 요약 (한국어)",
  "keyStrengths": ["주요 강점 1", "주요 강점 2", "주요 강점 3"],
  "recommendedJobTypes": ["추천 직종 1", "추천 직종 2", "추천 직종 3"],
  "skillsExtracted": ["추출된 스킬/역량 1", "추출된 스킬/역량 2", "추출된 스킬/역량 3"],
  "experienceLevel": "senior",
  "careerHighlights": ["경력 하이라이트 1", "경력 하이라이트 2"]
}

시니어 구직자의 풍부한 경험과 노하우를 긍정적으로 평가해주세요.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "당신은 한국의 시니어 구직자 전문 커리어 컨설턴트입니다. 50-60세 구직자들의 경험과 가치를 긍정적으로 분석하고 적합한 일자리를 추천하는 전문가입니다."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as AIProfileAnalysis;
    } catch (error) {
      console.error("AI profile analysis failed:", error);
      // Return default analysis
      return {
        summary: "경력 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        keyStrengths: ["풍부한 경험", "안정성", "책임감"],
        recommendedJobTypes: ["고객서비스", "상담", "관리업무"],
        skillsExtracted: ["커뮤니케이션", "문제해결", "리더십"],
        experienceLevel: 'senior',
        careerHighlights: ["다양한 업무 경험", "인적 네트워크"]
      };
    }
  }

  // Analyze resume from uploaded file (OCR text)
  async analyzeResumeText(resumeText: string): Promise<AIProfileAnalysis> {
    return this.analyzeCareerProfile(resumeText);
  }

  // Analyze resume image using vision
  async analyzeResumeImage(base64Image: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "이 이력서 이미지에서 텍스트를 추출해서 한국어로 정리해주세요. 개인정보는 제외하고 경력, 학력, 자격증, 기술/역량 정보만 추출해주세요."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 1500,
      });

      return response.choices[0].message.content || "이미지에서 텍스트를 추출할 수 없습니다.";
    } catch (error) {
      console.error("Resume image analysis failed:", error);
      throw new Error("이력서 이미지 분석에 실패했습니다.");
    }
  }

  // Calculate job matching score
  async calculateJobMatch(
    candidateProfile: IndividualProfile, 
    jobPosting: JobPosting
  ): Promise<AIJobMatch> {
    const prompt = `
시니어 구직자와 채용공고의 매칭도를 분석해주세요.

구직자 정보:
- 요약: ${candidateProfile.summary || '정보 없음'}
- 경험: ${JSON.stringify(candidateProfile.experience || [])}
- 스킬: ${JSON.stringify(candidateProfile.skills || [])}
- 희망 근무 조건: ${candidateProfile.workTimeFlexibility ? '시간 협의 가능' : '정규직 선호'}

채용공고 정보:
- 제목: ${jobPosting.title}
- 설명: ${jobPosting.description}
- 위치: ${jobPosting.location}
- 근무 조건: ${jobPosting.workSchedule}
- 시니어 우대: ${jobPosting.prefersSeniors ? 'Yes' : 'No'}

다음 JSON 형식으로 매칭 분석을 제공해주세요:
{
  "matchingScore": 85,
  "reasoning": "매칭 근거를 2-3문장으로 설명",
  "keyStrengths": ["매칭되는 강점 1", "매칭되는 강점 2", "매칭되는 강점 3"],
  "improvementSuggestions": ["개선 제안 1", "개선 제안 2"]
}

매칭 점수는 0-100 사이의 숫자로, 시니어의 경험가치를 높이 평가해주세요.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "당신은 시니어 구직자와 기업을 매칭하는 전문가입니다. 50-60세 구직자들의 풍부한 경험과 안정성을 높이 평가합니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        matchingScore: Math.max(0, Math.min(100, result.matchingScore || 50)),
        reasoning: result.reasoning || "매칭 분석을 완료했습니다.",
        keyStrengths: result.keyStrengths || ["경험", "안정성", "신뢰성"],
        improvementSuggestions: result.improvementSuggestions
      };
    } catch (error) {
      console.error("Job matching calculation failed:", error);
      return {
        matchingScore: 50,
        reasoning: "매칭 분석 중 오류가 발생했습니다.",
        keyStrengths: ["풍부한 경험", "높은 책임감"],
      };
    }
  }

  // Generate AI recommendations for companies
  async generateTalentRecommendations(
    jobPosting: JobPosting,
    candidates: IndividualProfile[]
  ): Promise<AIJobMatch[]> {
    const recommendations: AIJobMatch[] = [];
    
    for (const candidate of candidates) {
      try {
        const match = await this.calculateJobMatch(candidate, jobPosting);
        recommendations.push(match);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to analyze candidate ${candidate.id}:`, error);
      }
    }
    
    // Sort by matching score
    return recommendations.sort((a, b) => b.matchingScore - a.matchingScore);
  }

  // Extract job requirements and skills from job posting
  async extractJobRequirements(jobDescription: string): Promise<{
    requirements: string[];
    skills: string[];
    benefits: string[];
  }> {
    const prompt = `
다음 채용공고에서 요구사항, 필요 스킬, 복리혜택을 추출해주세요:

${jobDescription}

다음 JSON 형식으로 응답해주세요:
{
  "requirements": ["요구사항 1", "요구사항 2"],
  "skills": ["필요 스킬 1", "필요 스킬 2"],
  "benefits": ["혜택 1", "혜택 2"]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Job requirements extraction failed:", error);
      return {
        requirements: [],
        skills: [],
        benefits: []
      };
    }
  }

  // Voice transcript processing (Korean STT simulation)
  async processVoiceTranscript(audioText: string): Promise<string> {
    // In a real implementation, this would integrate with Korean STT service
    // For now, we'll clean up and structure the text
    
    const prompt = `
다음 음성 인식 텍스트를 정리하고 구조화해주세요:

"${audioText}"

경력 설명으로 정리해서 한국어로 반환해주세요. 문법을 교정하고 이해하기 쉽게 정리해주세요.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content || audioText;
    } catch (error) {
      console.error("Voice transcript processing failed:", error);
      return audioText;
    }
  }
}

export const aiService = new AIService();
