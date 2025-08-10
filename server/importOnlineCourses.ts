import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from './db.js';
import { onlineCourses } from '@shared/schema';

export async function importOnlineCoursesFromCSV() {
  try {
    console.log('Starting online course import...');
    
    // Read CSV file
    const csvContent = fs.readFileSync('attached_assets/seoul_learn_4050_ONLINE_courses_RECAT_20250810_025713_1754796069639.csv', 'utf-8');
    
    // Parse CSV with proper options
    const data = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      encoding: 'utf8'
    });
    
    console.log(`Found ${data.length} online courses to import`);
    
    // Debug: Check first few rows
    console.log('CSV Headers:', Object.keys(data[0]));
    console.log('First 3 rows:', JSON.stringify(data.slice(0, 3), null, 2));
    
    // Debug key access issue
    console.log('Debugging first row key access:');
    const firstRow = data[0];
    const allKeys = Object.keys(firstRow);
    console.log('All keys:', allKeys);
    console.log('Keys with character codes:', allKeys.map(k => ({ key: k, codes: k.split('').map(c => c.charCodeAt(0)) })));
    
    // Try different key access methods
    const categoryKey = allKeys[0]; // Should be 강의분류
    const titleKey = allKeys[1];    // Should be 강의명
    
    console.log('Using detected keys:', { categoryKey, titleKey });
    console.log('First row values:', {
      category: firstRow[categoryKey],
      title: firstRow[titleKey]
    });
    
    // Filter and process valid rows using detected keys
    const validRows = data.filter((row: any, index: number) => {
      const category = row[categoryKey];
      const title = row[titleKey];
      
      // Debug first 5 rows
      if (index < 5) {
        console.log(`Row ${index} with detected keys:`, {
          category: category,
          title: title,
          hasCategory: !!(category && category.toString().trim()),
          hasTitle: !!(title && title.toString().trim())
        });
      }
      
      const hasCategory = category && category.toString().trim().length > 0;
      const hasTitle = title && title.toString().trim().length > 0;
      
      return hasCategory && hasTitle;
    });
    
    console.log(`Found ${validRows.length} valid rows out of ${data.length} total rows`);
    
    const onlineCoursesData = validRows.map((row: any) => ({
      category: row[categoryKey].toString().trim(),
      title: row[titleKey].toString().trim(),
      viewCount: parseInt(row[allKeys[3]]?.toString()) || 0, // 조회수_숫자
      viewCountText: row[allKeys[2]]?.toString()?.trim() || '' // 조회수
    }));
    
    console.log(`Importing ${onlineCoursesData.length} valid online courses...`);
    
    // Debug: Show first few valid courses
    console.log('First 3 valid courses:', JSON.stringify(onlineCoursesData.slice(0, 3), null, 2));
    
    // Clear existing online courses
    await db.delete(onlineCourses);
    
    // Insert in batches of 100 to avoid memory issues
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < onlineCoursesData.length; i += batchSize) {
      const batch = onlineCoursesData.slice(i, i + batchSize);
      
      try {
        await db.insert(onlineCourses).values(batch);
        imported += batch.length;
        console.log(`Imported ${imported}/${onlineCoursesData.length} online courses...`);
      } catch (error) {
        console.error(`Error importing batch ${i}-${i + batch.length}:`, error);
      }
    }
    
    console.log(`Successfully imported ${imported} online courses!`);
    
    // Show categories
    const categoriesResult = await db.selectDistinct({ category: onlineCourses.category }).from(onlineCourses);
    console.log('Available online course categories:', categoriesResult.map(r => r.category));
    
    return { imported, total: onlineCoursesData.length };
    
  } catch (error) {
    console.error('Error importing online courses:', error);
    throw error;
  }
}