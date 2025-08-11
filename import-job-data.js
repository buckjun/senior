import fs from 'fs';
import path from 'path';
import { Pool } from '@neondatabase/serverless';

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Parse CSV manually
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/"/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/"/g, ''));
    
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }
  
  return data;
}

async function importJobData() {
  try {
    console.log('Starting job data import...');
    
    // Read 제조업2 processed CSV
    const manufacturing2Data = fs.readFileSync('attached_assets/제조업2_processed.csv', 'utf8');
    const jobs = parseCSV(manufacturing2Data);
    
    console.log(`Found ${jobs.length} jobs to import`);
    
    // Transform data to match our schema
    const transformedJobs = jobs.map(job => ({
      company: job['회사명'] || '',
      title: job['공고명'] || '',
      location: job['지역'] || '',
      education: job['학력'] || '',
      experience: job['경력'] || '',
      field: job['분야'] || '',
      deadline: job['마감일'] || '',
      employment_type: job['고용형태'] || '',
      company_size: job['기업규모'] || '',
      salary: parseInt(job['급여(만원)']) || 0,
      sector: '제조업'
    })).filter(job => job.company && job.title);
    
    console.log(`Importing ${transformedJobs.length} valid jobs...`);
    
    // Insert data
    const client = await pool.connect();
    let imported = 0;
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data
      await client.query('DELETE FROM job_postings WHERE sector = $1', ['제조업']);
      
      for (const job of transformedJobs) {
        await client.query(`
          INSERT INTO job_postings (
            company, title, location, education, experience, 
            field, deadline, employment_type, company_size, salary, sector
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          job.company, job.title, job.location, job.education, job.experience,
          job.field, job.deadline, job.employment_type, job.company_size, job.salary, job.sector
        ]);
        imported++;
      }
      
      await client.query('COMMIT');
      console.log(`Successfully imported ${imported} job postings!`);
      
      // Show summary
      const result = await client.query('SELECT COUNT(*) as total FROM job_postings');
      console.log(`Total job postings in database: ${result.rows[0].total}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error importing job data:', error);
  } finally {
    await pool.end();
  }
}

// Run import
importJobData();