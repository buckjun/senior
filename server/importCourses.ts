import XLSX from 'xlsx';
import { db } from './db';
import { courses } from '@shared/schema';

export async function importCoursesFromExcel() {
  try {
    console.log('Starting course import...');
    
    // Read Excel file
    const workbook = XLSX.readFile('attached_assets/seoul_learn_4050_ALL_courses_COLMOVE_20250809_131057_1754793148579.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} courses to import`);
    
    // Transform data to match our schema
    const coursesData = data.map((row: any) => ({
      category: row['강의 분류'],
      title: row['강의명'], 
      institution: row['교육기관'],
      duration: row['교육기간'],
      cost: row['교육비용'],
      address: row['주소'],
      city: row['시도'],
      district: row['구']
    })).filter(course => course.category && course.title && course.institution);
    
    console.log(`Importing ${coursesData.length} valid courses...`);
    
    // Insert in batches of 100 to avoid memory issues
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < coursesData.length; i += batchSize) {
      const batch = coursesData.slice(i, i + batchSize);
      
      try {
        await db.insert(courses).values(batch);
        imported += batch.length;
        console.log(`Imported ${imported}/${coursesData.length} courses...`);
      } catch (error) {
        console.error(`Error importing batch ${i}-${i + batch.length}:`, error);
      }
    }
    
    console.log(`Successfully imported ${imported} courses!`);
    
    // Show categories
    const categoriesResult = await db.selectDistinct({ category: courses.category }).from(courses);
    console.log('Available categories:', categoriesResult.map(r => r.category));
    
    return { imported, total: coursesData.length };
    
  } catch (error) {
    console.error('Error importing courses:', error);
    throw error;
  }
}