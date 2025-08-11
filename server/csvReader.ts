import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface CompanyJob {
  id: string;
  company: string;
  title: string;
  location: string;
  education: string;
  experience: string;
  field: string;
  deadline: string;
  employmentType: string;
  companySize: string;
  salary: string;
  sector: string;
}

export interface LearningProgram {
  id: string;
  title: string;
  sector: string;
  skills: string[];
  duration: string;
  provider: string;
  type: 'online' | 'offline';
}

// CSV 파일에서 회사 데이터 읽기
export function loadCompanyJobsBySector(sector: string): CompanyJob[] {
  try {
    let allJobs: CompanyJob[] = [];
    
    // 기존 제조업 파일 처리
    if (sector === '제조업') {
      const manufacturingPath1 = path.join(process.cwd(), 'attached_assets', `${sector}_1754742652412.csv`);
      const manufacturingPath2 = path.join(process.cwd(), 'attached_assets', '제조업2_processed.csv');
      
      // 첫 번째 제조업 파일 로드
      if (fs.existsSync(manufacturingPath1)) {
        const jobs1 = loadJobsFromFile(manufacturingPath1, sector, 'original');
        allJobs = allJobs.concat(jobs1);
      }
      
      // 두 번째 제조업 파일 로드
      if (fs.existsSync(manufacturingPath2)) {
        const jobs2 = loadJobsFromFile(manufacturingPath2, sector, 'new');
        allJobs = allJobs.concat(jobs2);
      }
      
      console.log(`제조업 총 ${allJobs.length}개 공고 로드됨`);
      return allJobs;
    }
    
    // 다른 업종 파일 처리 - 실제 파일명에 맞게 수정
    let csvPath = '';
    
    // 각 업종별 실제 파일명 매핑
    if (sector === '건설업') {
      csvPath = path.join(process.cwd(), 'attached_assets', '건설업_1754742652411.csv');
    } else if (sector === '공급업') {
      csvPath = path.join(process.cwd(), 'attached_assets', '공급업_1754742652409.csv');
    } else if (sector === '과학 기술 서비스업') {
      csvPath = path.join(process.cwd(), 'attached_assets', '과학 기술 서비스업_1754742652411.csv');
    } else if (sector === '마케팅') {
      csvPath = path.join(process.cwd(), 'attached_assets', '마케팅_1754742652409.csv');
    } else if (sector === '예술') {
      csvPath = path.join(process.cwd(), 'attached_assets', '예술_1754742652411.csv');
    } else if (sector === '운수 및 창고업') {
      csvPath = path.join(process.cwd(), 'attached_assets', '운수 및 창고업_1754742652410.csv');
    } else if (sector === '의료') {
      csvPath = path.join(process.cwd(), 'attached_assets', '의료_1754742652410.csv');
    } else if (sector === '정보통신') {
      csvPath = path.join(process.cwd(), 'attached_assets', '정보통신_1754742652410.csv');
    }
    
    if (!csvPath || !fs.existsSync(csvPath)) {
      console.log(`CSV 파일을 찾을 수 없습니다: ${csvPath}`);
      return [];
    }
    
    return loadJobsFromFile(csvPath, sector, 'original');
  } catch (error) {
    console.error(`${sector} 데이터 로드 중 오류:`, error);
    return [];
  }
}

// 파일에서 Job 데이터 로드하는 헬퍼 함수  
function loadJobsFromFile(filePath: string, sector: string, source: string): CompanyJob[] {
  try {
    console.log(`Loading ${sector} from ${filePath}`);
    
    // 한글 CSV 파일을 위한 인코딩 시도 순서: utf-8, euc-kr, cp949
    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf-8');
      // UTF-8이 제대로 읽어지는지 확인 (한글이 깨지지 않았는지)
      if (content.includes('�') || content.includes('ȸ')) {
        throw new Error('UTF-8 encoding failed');
      }
    } catch {
      try {
        // EUC-KR 시도
        const iconv = require('iconv-lite');
        const buffer = fs.readFileSync(filePath);
        content = iconv.decode(buffer, 'euc-kr');
        console.log(`Successfully read with EUC-KR encoding`);
      } catch {
        // 최후 수단으로 UTF-8 사용
        content = fs.readFileSync(filePath, 'utf-8');
        console.log(`Fallback to UTF-8 encoding`);
      }
    }
    
    console.log(`First line of CSV: ${content.split('\n')[0].substring(0, 100)}`);
    
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Parsed ${records.length} records for ${sector}`);
    if (records.length > 0) {
      console.log(`Sample record keys:`, Object.keys(records[0] as Record<string, any>));
      console.log(`Sample record:`, records[0]);
    }

    const jobs = records.map((record: any, index: number) => {
      const job = {
        id: `job-${sector}-${source}-${index + 1}`,
        company: record['회사명'] || '',
        title: record['공고명'] || '',
        location: record['지역'] || '',
        education: record['학력'] || '',
        experience: record['경력'] || '',
        field: record['분야'] || '',
        deadline: record['마감일'] || '',
        employmentType: record['고용형태'] || '',
        companySize: record['기업규모'] || '',
        salary: record['급여(만원)'] || '',
        sector: sector
      };
      
      // 첫 번째 레코드만 로그 출력 (성능상 이유)
      if (index === 0) {
        console.log(`첫 번째 Job 매핑 결과:`, {
          company: job.company,
          title: job.title,
          location: job.location,
          salary: job.salary,
          field: job.field,
          experience: job.experience
        });
      }
      
      return job;
    });

    console.log(`Successfully loaded ${jobs.length} jobs for ${sector}`);
    return jobs.filter(job => job.company && job.title); // 빈 데이터 제외
  } catch (error) {
    console.error(`${sector} CSV 파일 읽기 오류:`, error);
    return [];
  }
}

// 모든 업종의 회사 데이터 로드
export function loadAllCompanyJobs(): CompanyJob[] {
  const sectors = [
    '건설업', '공급업', '과학 기술 서비스업', '마케팅', '예술',
    '운수 및 창고업', '의료', '정보통신', '제조업'
  ];
  
  let allJobs: CompanyJob[] = [];
  
  for (const sector of sectors) {
    const jobs = loadCompanyJobsBySector(sector);
    allJobs = allJobs.concat(jobs);
    console.log(`${sector}: ${jobs.length}개 공고 로드됨`);
  }
  
  console.log(`총 ${allJobs.length}개 공고 로드됨`);
  return allJobs;
}

// 학습 프로그램 데이터 로드 (온라인 과정)
export function loadLearningPrograms(): LearningProgram[] {
  try {
    const csvPath = path.join(process.cwd(), 'attached_assets', 'seoul_learn_4050_ONLINE_courses_RECAT_20250810_025713_1754796069639.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('학습 프로그램 CSV 파일을 찾을 수 없습니다');
      return [];
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    return records.map((record: any, index: number) => {
      const title = record['프로그램명'] || record['과정명'] || record['title'] || '';
      const category = record['카테고리'] || record['분야'] || record['category'] || '';
      
      // 카테고리를 업종으로 매핑
      let sector = '정보통신'; // 기본값
      if (category.includes('건설') || category.includes('토목')) sector = '건설업';
      else if (category.includes('제조') || category.includes('생산')) sector = '제조업';
      else if (category.includes('의료') || category.includes('보건')) sector = '의료';
      else if (category.includes('디자인') || category.includes('예술')) sector = '예술';
      else if (category.includes('물류') || category.includes('운송')) sector = '운수 및 창고업';
      else if (category.includes('마케팅') || category.includes('영업')) sector = '마케팅';
      
      return {
        id: `program-${index + 1}`,
        title: title,
        sector: sector,
        skills: title.split(' ').slice(0, 3), // 제목에서 키워드 추출
        duration: record['기간'] || record['duration'] || '2개월',
        provider: record['기관명'] || record['provider'] || '서울시',
        type: 'online' as const
      };
    }).filter(program => program.title.length > 0);
  } catch (error) {
    console.error('학습 프로그램 CSV 파일 읽기 오류:', error);
    return [];
  }
}

// 업종별 키워드 추출 함수
export function extractSectorKeywords(job: CompanyJob): string[] {
  const keywords: string[] = [];
  
  // 제목에서 키워드 추출
  const titleWords = job.title.toLowerCase().split(/[^가-힣a-z0-9]/);
  keywords.push(...titleWords.filter(word => word.length > 1));
  
  // 분야에서 키워드 추출
  if (job.field) {
    const fieldWords = job.field.split(/[,·\s]+/);
    keywords.push(...fieldWords.filter(word => word.length > 1));
  }
  
  return Array.from(new Set(keywords));
}