import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'data.db'));

try {
  db.exec(`
    DROP TABLE IF EXISTS in_review;
    DROP TABLE IF EXISTS approved;
  `);

  // verify that the tables were created
  const remainingTables = db.prepare<unknown[], { name: string }>("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Remaining tables in database:', remainingTables);

  const hasInReview = remainingTables.some((table: { name: string }) => table.name === 'in_review');
  const hasApproved = remainingTables.some((table: { name: string }) => table.name === 'approved');

  if (!hasInReview && !hasApproved) {
    console.log('Successfully dropped both tables!');
    // Recreate the tables
    db.exec(`
  CREATE TABLE IF NOT EXISTS in_review (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spanish TEXT NOT NULL,
        english TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS approved (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spanish TEXT NOT NULL,
        english TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    console.log('Warning: Some tables still exist:', {
      inReviewExists: hasInReview,
      approvedExists: hasApproved
    });
  }
} catch (error) {
  console.error('Error:', error);
}
