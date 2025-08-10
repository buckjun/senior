import { importOnlineCoursesFromCSV } from './server/importOnlineCourses.ts';

importOnlineCoursesFromCSV()
  .then(result => {
    console.log('Import completed:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });