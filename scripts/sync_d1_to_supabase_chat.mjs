// scripts/sync_d1_to_supabase_chat.mjs
import { execSync } from "child_process";

const SUPABASE_URL = "https://cuffpkbuhwluirxuqmqk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZmZwa2J1aHdsdWlyeHVxbXFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMxMjI2NywiZXhwIjoyMTAwODg4MjY3fQ.3f8Olv09NlwFBmvvCdmlhO7Z19fvA8IxmN6Ity4VA4g";

function execD1WithRetry(sql, maxRetries = 4) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const cmd = `npx wrangler d1 execute open-seo --remote --json --command "${sql.replace(/"/g, '\\"')}"`;
      const raw = execSync(cmd, { encoding: "utf-8", maxBuffer: 25 * 1024 * 1024 });
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed[0]?.results) {
        return parsed[0].results;
      }
      throw new Error(`Unexpected D1 output: ${raw.slice(0, 200)}`);
    } catch (e) {
      console.warn(`⚠️ D1 attempt ${attempt}/${maxRetries} failed: ${e.message}. Retrying in 2s...`);
      if (attempt === maxRetries) throw e;
      execSync("sleep 2");
    }
  }
}

async function main() {
  console.log("🚀 Starting Cloudflare D1 -> Supabase Chat Synchronization...");

  // 1. Get total count from D1
  const countResults = execD1WithRetry("SELECT COUNT(*) as count FROM autonomous_agent_chat_history;");
  const totalD1 = countResults[0]?.count || 0;
  console.log(`📊 Found ${totalD1} total chat messages in Cloudflare D1.`);

  const BATCH_SIZE = 250;
  let syncedCount = 0;

  for (let offset = 0; offset < totalD1; offset += BATCH_SIZE) {
    console.log(`⏳ Fetching D1 batch: offset ${offset}, limit ${BATCH_SIZE}...`);
    const sql = `SELECT id, project_id, session_id, sender_type, agent_id, agent_name, role, phase, text, model_used, created_at FROM autonomous_agent_chat_history ORDER BY rowid ASC LIMIT ${BATCH_SIZE} OFFSET ${offset};`;
    const rows = execD1WithRetry(sql);

    if (!rows || rows.length === 0) break;

    const payload = rows.map((r) => ({
      id: r.id,
      project_id: r.project_id || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62",
      session_id: r.session_id || "session_main",
      sender_type: r.sender_type || "agent",
      agent_id: r.agent_id,
      agent_name: r.agent_name,
      role: r.role || "",
      phase: r.phase || "",
      text: r.text || "",
      model_used: r.model_used || "gemini-2.5-flash",
      time: r.created_at ? new Date(r.created_at).toLocaleTimeString("ar-EG") : "",
      created_at: r.created_at || new Date().toISOString(),
      is_vip_owner: r.sender_type === "user" || r.agent_id === "user",
    }));

    let postSuccess = false;
    for (let postAttempt = 1; postAttempt <= 3; postAttempt++) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/vorder_chat_history?on_conflict=id`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=minimal",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          postSuccess = true;
          syncedCount += rows.length;
          console.log(`✅ Synced ${syncedCount}/${totalD1} messages to Supabase.`);
          break;
        } else {
          const errText = await res.text();
          console.error(`❌ Post attempt ${postAttempt} failed at offset ${offset}: HTTP ${res.status} - ${errText}`);
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (postErr) {
        console.error(`❌ Post error at offset ${offset}:`, postErr.message);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  // 2. Verify final count in Supabase
  const headRes = await fetch(`${SUPABASE_URL}/rest/v1/vorder_chat_history?select=id&limit=1`, {
    method: "HEAD",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "count=exact",
    },
  });
  const finalRange = headRes.headers.get("content-range");
  console.log(`🎉 Synchronization Complete! Supabase final content-range: ${finalRange}`);
}

main().catch((err) => {
  console.error("FATAL sync error:", err);
  process.exit(1);
});
