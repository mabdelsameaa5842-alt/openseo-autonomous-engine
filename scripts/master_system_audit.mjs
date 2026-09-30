import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

console.log("=================================================");
console.log("  VORDER / OPENSEO MASTER FORENSIC AUDIT SUITE   ");
console.log("=================================================");

let failedChecks = 0;
let passedChecks = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedChecks++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${details}`);
    failedChecks++;
  }
}

// -------------------------------------------------------------
// TEST 1: ZERO-HARDCODE LINTER (Scan src/ for forbidden patterns)
// -------------------------------------------------------------
console.log("\n--- TEST 1: ZERO-HARDCODE AST & REGEX AUDIT ---");

const FORBIDDEN_PATTERNS = [
  { regex: /Math\.max\([^)]*,\s*734\)/, desc: "Math.max floor for 734 articles" },
  { regex: /Math\.max\([^)]*,\s*688\)/, desc: "Math.max floor for 688 articles" },
  { regex: /Math\.max\([^)]*,\s*3190\)/, desc: "Math.max floor for 3190 messages" },
  { regex: /Math\.max\([^)]*,\s*3120\)/, desc: "Math.max floor for 3120 messages" },
  { regex: /\[5,\s*4,\s*5,\s*3,\s*4,\s*4,\s*3,\s*4,\s*3,\s*2,\s*2,\s*1\]/, desc: "Fake GSC recentPattern array" },
  { regex: /\[vorder-tariq\]:\s*🛠️\s*افتتاح جلسة/, desc: "Fake canned roundtable dialogue" },
  { regex: /actionType:\s*["']VERIFY_AND_SYNC_734_ARTICLES["']/, desc: "Hardcoded 734 action type" },
];

function scanDirectory(dir, fileList = []) {
  const files = readdirSync(dir);
  for (const f of files) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) {
      if (f !== "node_modules" && f !== ".git" && f !== "dist" && f !== ".archive") {
        scanDirectory(full, fileList);
      }
    } else if (/\.(ts|tsx|js|mjs)$/.test(f)) {
      fileList.push(full);
    }
  }
  return fileList;
}

const allSrcFiles = scanDirectory("src");
let forbiddenFound = 0;

for (const file of allSrcFiles) {
  // Skip SVG icon coordinates files
  if (file.includes("BrandLogos") || file.includes("GoogleProductLogos") || file.includes("AgentIcons")) continue;
  const content = readFileSync(file, "utf8");
  for (const pat of FORBIDDEN_PATTERNS) {
    if (pat.regex.test(content)) {
      forbiddenFound++;
      console.error(`   Found ${pat.desc} in ${file}`);
    }
  }
}

assert(forbiddenFound === 0, "Zero Hardcoded Floors & Simulated Patterns in src/", `Found ${forbiddenFound} violations`);

// -------------------------------------------------------------
// TEST 2: SUPABASE PRODUCTION DATABASE AUDIT
// -------------------------------------------------------------
console.log("\n--- TEST 2: SUPABASE PRODUCTION DATABASE AUDIT ---");
const SUPABASE_PROD_URL = "https://cuffpkbuhwluirxuqmqk.supabase.co";
const SUPABASE_PROD_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZmZwa2J1aHdsdWlyeHVxbXFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMxMjI2NywiZXhwIjoyMTAwODg4MjY3fQ.3f8Olv09NlwFBmvvCdmlhO7Z19fvA8IxmN6Ity4VA4g";

try {
  const t0 = Date.now();
  const resSupaArticles = await fetch(`${SUPABASE_PROD_URL}/rest/v1/vorder_articles?select=id&limit=1`, {
    method: "HEAD",
    headers: {
      apikey: SUPABASE_PROD_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_PROD_SERVICE_ROLE_KEY}`,
      Prefer: "count=exact",
    },
  });
  const latArticles = Date.now() - t0;
  const rangeArticles = resSupaArticles.headers.get("content-range");
  const countArticles = rangeArticles ? Number(rangeArticles.split("/")[1]) : 0;
  
  assert(resSupaArticles.status === 206, "Supabase vorder_articles Table Responds HTTP 206", `Status: ${resSupaArticles.status}`);
  assert(countArticles >= 600, `Supabase Live Articles Count >= 600 (Actual: ${countArticles}, Latency: ${latArticles}ms)`);

  const t1 = Date.now();
  const resSupaChat = await fetch(`${SUPABASE_PROD_URL}/rest/v1/vorder_chat_history?select=id&limit=1`, {
    method: "HEAD",
    headers: {
      apikey: SUPABASE_PROD_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_PROD_SERVICE_ROLE_KEY}`,
      Prefer: "count=exact",
    },
  });
  const latChat = Date.now() - t1;
  const rangeChat = resSupaChat.headers.get("content-range");
  const countChat = rangeChat ? Number(rangeChat.split("/")[1]) : 0;

  assert(resSupaChat.status === 206, "Supabase vorder_chat_history Table Responds HTTP 206", `Status: ${resSupaChat.status}`);
  assert(countChat > 0, `Supabase Persistent Chat Rows > 0 (Actual: ${countChat}, Latency: ${latChat}ms)`);
} catch (e) {
  assert(false, "Supabase Direct Connectivity", e.message);
}

// -------------------------------------------------------------
// TEST 3: VERCEL PORTFOLIO BLOG API & SITEMAP AUDIT
// -------------------------------------------------------------
console.log("\n--- TEST 3: VERCEL PORTFOLIO BLOG API AUDIT ---");
try {
  const t0 = Date.now();
  const resBlog = await fetch("https://mohamed-abdelsamee-portfolio.vercel.app/api/articles", {
    signal: AbortSignal.timeout(8000),
  });
  const latBlog = Date.now() - t0;
  assert(resBlog.status === 200, "Vercel Portfolio /api/articles Responds HTTP 200", `Status: ${resBlog.status}`);
  
  const blogJson = await resBlog.json();
  const blogArticles = Array.isArray(blogJson) ? blogJson : blogJson.articles || [];
  assert(blogArticles.length > 300, `Vercel Live Blog Articles Count > 300 (Actual: ${blogArticles.length}, Latency: ${latBlog}ms)`);
} catch (e) {
  assert(false, "Vercel Portfolio Blog API Probe", e.message);
}

// -------------------------------------------------------------
// TEST 4: MEETING CHAMBER MODAL LATENCY & PAGINATION
// -------------------------------------------------------------
console.log("\n--- TEST 4: MEETING CHAMBER MODAL LATENCY AUDIT ---");
try {
  const t0 = Date.now();
  const resModal = await fetch("https://open-seo-ten.vercel.app/api/automation/agent-meetings?projectId=cc58e018-8ef9-4be7-8f3a-2af2bc158d62&limit=30", {
    signal: AbortSignal.timeout(8000),
  });
  const latModal = Date.now() - t0;
  assert(resModal.status === 200, "Meeting Chamber Initial 30 Batch Responds HTTP 200", `Status: ${resModal.status}`);
  assert(latModal < 2500, `Meeting Chamber Initial Batch Fast Load < 2500ms (Actual: ${latModal}ms)`);

  const modalData = await resModal.json();
  assert(typeof modalData.totalMessagesCount === "number" && modalData.totalMessagesCount > 0, `Dynamic totalMessagesCount exists (Actual: ${modalData.totalMessagesCount})`);
} catch (e) {
  assert(false, "Meeting Chamber Latency Probe", e.message);
}

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=================================================");
console.log(`AUDIT RESULTS: ${passedChecks} PASSED | ${failedChecks} FAILED`);
console.log("=================================================");
if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log("🚀 ALL FORENSIC CHECKS PASSED WITH 100% SUCCESS!");
}
