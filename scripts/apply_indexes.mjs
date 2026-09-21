import { execSync } from 'child_process';
import fs from 'fs';

const lines = fs.readFileSync('drizzle/0045_performance_and_uniqueness_indexes.sql', 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.length > 0 && !l.startsWith('--'));

for (const sql of lines) {
  let attempts = 0;
  let success = false;
  console.log(`Executing: ${sql}`);
  while (attempts < 5 && !success) {
    attempts++;
    try {
      execSync(`NODE_OPTIONS="--dns-result-order=ipv4first" npx wrangler d1 execute open-seo --remote --command="${sql}" -y`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      console.log(`  ✓ Success on attempt ${attempts}`);
      success = true;
    } catch (err) {
      console.warn(`  Attempt ${attempts} failed: ${err.message.split('\n')[0]}. Retrying in 2s...`);
      execSync('sleep 2');
    }
  }
  if (!success) {
    console.error(`Failed after 5 attempts: ${sql}`);
  }
}
console.log('All indexes processed!');
