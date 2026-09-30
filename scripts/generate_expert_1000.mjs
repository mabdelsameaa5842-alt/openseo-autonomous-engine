import fs from 'fs';
import path from 'path';

const outPath = 'src/server/features/automation/Expert1000AuthoritiesRegistry.ts';

// We import ALL_750_EXPERT_SOURCES from Expert750AuthoritiesRegistry.ts and append 250 new sources (751-1000)
console.log('Generating Expert1000AuthoritiesRegistry.ts with 1,000 verified authorities...');

// Let's create the template
