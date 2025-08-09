import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { db } from './db';
import { companies, jobCategories, InsertCompany, InsertJobCategory } from '@shared/schema';

// Job category mappings
const JOB_CATEGORIES: InsertJobCategory[] = [
  { name: 'manufacturing', displayName: '제조업', description: '제조업 및 생산 관련 업무' },
  { name: 'information_technology', displayName: '정보통신', description: 'IT, 소프트웨어, 통신 관련 업무' },
  { name: 'logistics', displayName: '운수 및 창고업', description: '물류, 운송, 창고 관리 업무' },
  { name: 'construction', displayName: '건설', description: '건설, 건축, 토목 관련 업무' },
  { name: 'marketing', displayName: '마케팅', description: '마케팅, 홍보, 광고 관련 업무' },
  { name: 'healthcare', displayName: '의료', description: '의료, 제약, 헬스케어 관련 업무' },
  { name: 'science_technology', displayName: '과학 기술 서비스업', description: '연구개발, 기술서비스 업무' },
  { name: 'arts', displayName: '예술', description: '예술, 문화, 콘텐츠 관련 업무' },
  { name: 'supply', displayName: '공급업', description: '유통, 공급, 서비스업 관련 업무' },
];

// CSV file mappings
const CSV_FILES = [
  { file: 'attached_assets/마케팅_1754742652409.csv', category: 'marketing' },
  { file: 'attached_assets/공급업_1754742652409.csv', category: 'supply' },
  { file: 'attached_assets/정보통신_1754742652410.csv', category: 'information_technology' },
  { file: 'attached_assets/의료_1754742652410.csv', category: 'healthcare' },
  { file: 'attached_assets/운수 및 창고업_1754742652410.csv', category: 'logistics' },
  { file: 'attached_assets/과학 기술 서비스업_1754742652411.csv', category: 'science_technology' },
  { file: 'attached_assets/예술_1754742652411.csv', category: 'arts' },
  { file: 'attached_assets/제조업_1754742652412.csv', category: 'manufacturing' },
];

function parseExperience(experienceStr: string): string {
  if (!experienceStr) return '';
  // Extract years from various formats
  const cleanStr = experienceStr.replace(/경력\s*/, '').trim();
  return cleanStr;
}

function parseSalary(salaryStr: string): number | null {
  if (!salaryStr || salaryStr === '') return null;
  
  const numMatch = salaryStr.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }
  return null;
}

function extractSkillsFromCategory(category: string): string {
  // Extract skills and certifications from category field
  if (!category) return '';
  
  const skillsKeywords = [
    'ADSP', 'ISO', 'PMP', '자격증', '인증', '면허',
    'Java', 'Python', 'React', 'AWS', 'Docker',
    '품질관리', '생산관리', '마케팅', '영업', '기획'
  ];
  
  const foundSkills = skillsKeywords.filter(skill => 
    category.includes(skill)
  );
  
  return foundSkills.join(', ');
}

async function readCSVFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return resolve([]);
    }

    fs.createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        delimiter: ',',
        encoding: 'utf8'
      }))
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function importJobCategories() {
  console.log('Importing job categories...');
  
  try {
    // Insert categories, ignore conflicts if they already exist
    for (const category of JOB_CATEGORIES) {
      await db.insert(jobCategories)
        .values(category)
        .onConflictDoNothing({ target: jobCategories.name });
    }
    console.log(`Successfully imported ${JOB_CATEGORIES.length} job categories`);
  } catch (error) {
    console.error('Error importing job categories:', error);
    throw error;
  }
}

async function importCompaniesFromCSV(filePath: string, categoryName: string) {
  console.log(`Importing companies from ${filePath}...`);
  
  const data = await readCSVFile(filePath);
  if (data.length === 0) {
    console.warn(`No data found in ${filePath}`);
    return;
  }

  const companies_data: InsertCompany[] = [];
  
  for (const row of data) {
    // Different CSV files have different column structures
    const companyName = row['회사명'] || row['Company Name'] || '';
    const jobTitle = row['공고명'] || row['Job Title'] || '';
    const location = row['지역'] || row['Location'] || '';
    const education = row['학력'] || row['Education'] || '';
    const experience = parseExperience(row['경력'] || row['Experience'] || '');
    const category = row['분야'] || row['직무'] || row['Category'] || categoryName;
    const deadline = row['마감일'] || row['Deadline'] || '';
    const employmentType = row['고용형태'] || row['Employment Type'] || '';
    const companySize = row['기업규모'] || row['Company Size'] || '';
    const salary = parseSalary(row['급여(만원)'] || row['Salary'] || '');
    const skills = extractSkillsFromCategory(category);

    if (companyName && jobTitle) {
      companies_data.push({
        companyName,
        jobTitle,
        location,
        education,
        experience,
        category: categoryName, // Use the mapped category name
        deadline,
        employmentType,
        companySize,
        salary,
        skills,
        sourceFile: path.basename(filePath),
      });
    }
  }

  if (companies_data.length > 0) {
    try {
      await db.insert(companies).values(companies_data);
      console.log(`Successfully imported ${companies_data.length} companies from ${filePath}`);
    } catch (error) {
      console.error(`Error importing companies from ${filePath}:`, error);
      throw error;
    }
  }
}

async function importAllCSVData() {
  console.log('Starting CSV data import...');
  
  try {
    // First import job categories
    await importJobCategories();
    
    // Then import companies from each CSV file
    for (const csvFile of CSV_FILES) {
      await importCompaniesFromCSV(csvFile.file, csvFile.category);
    }
    
    console.log('CSV data import completed successfully!');
  } catch (error) {
    console.error('Error during CSV import:', error);
    throw error;
  }
}

// Run import if this file is executed directly
const isMainModule = process.argv[1] === import.meta.url.replace('file://', '');
if (isMainModule) {
  importAllCSVData()
    .then(() => {
      console.log('Import finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

export { importAllCSVData };