import XLSX from 'xlsx';
import { Pool } from '@neondatabase/serverless';

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function importCourses() {
  try {
    console.log('Starting course import...');
    
    // Read Excel file
    const workbook = XLSX.readFile('attached_assets/seoul_learn_4050_ALL_courses_COLMOVE_20250809_131057_1754793148579.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} courses to import`);
    
    // Transform data to match our schema
    const courses = data.map(row => ({
      category: row['강의 분류'],
      title: row['강의명'], 
      institution: row['교육기관'],
      duration: row['교육기간'],
      cost: row['교육비용'],
      address: row['주소'],
      city: row['시도'],
      district: row['구']
    })).filter(course => course.category && course.title && course.institution);
    
    console.log(`Importing ${courses.length} valid courses...`);
    
    // Insert in batches of 100
    const client = await pool.connect();
    const batchSize = 100;
    let imported = 0;
    
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < courses.length; i += batchSize) {
        const batch = courses.slice(i, i + batchSize);
        
        for (const course of batch) {
          await client.query(`
            INSERT INTO courses (category, title, institution, duration, cost, address, city, district)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            course.category,
            course.title,
            course.institution,
            course.duration,
            course.cost,
            course.address,
            course.city,
            course.district
          ]);
          imported++;
        }
        
        console.log(`Imported ${imported}/${courses.length} courses...`);
      }
      
      await client.query('COMMIT');
      console.log(`Successfully imported ${imported} courses!`);
      
      // Show categories
      const categoriesResult = await client.query('SELECT DISTINCT category FROM courses ORDER BY category');
      console.log('Available categories:', categoriesResult.rows.map(r => r.category));
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error importing courses:', error);
  } finally {
    await pool.end();
  }
}

// Run import
importCourses();