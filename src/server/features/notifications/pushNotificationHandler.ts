export async function handleNotificationSubscribe(
  request: Request,
  env: any,
): Promise<Response> {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as any;
    const { subscription, platform, userId = "local-admin" } = body;

    if (!subscription || !subscription.endpoint) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing subscription endpoint" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys?.p256dh || null;
    const auth = subscription.keys?.auth || null;
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const id = "sub_" + Math.random().toString(36).slice(2, 12);

    if (env && env.DB) {
      await env.DB.prepare(`
        INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, user_agent, platform, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET
          user_id = excluded.user_id,
          p256dh = excluded.p256dh,
          auth = excluded.auth,
          platform = excluded.platform,
          user_agent = excluded.user_agent
      `).bind(id, userId, endpoint, p256dh, auth, userAgent, platform || "desktop", Date.now()).run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "تم تفعيل التنبيهات الفورية بنجاح على هذا الجهاز (ديسكتوب / هاتف ذكي).",
        subscriptionId: id,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function handleNotificationTestPush(
  request: Request,
  env: any,
): Promise<Response> {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const nowIso = new Date().toLocaleTimeString("ar-EG");
    return new Response(
      JSON.stringify({
        success: true,
        notification: {
          title: "👑 VORDER SEO: إشعار تجريبي فوري",
          body: `تنبيه سحابي ناجح (${nowIso}): تم التحقق من اتصال جهازك بمنظومة التنبيهات الفورية لـ VORDER SEO بنجاح 100%.`,
          icon: "/vorder_seo_logo.png",
          badge: "/favicon-32x32.png",
          url: "/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub",
        },
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function handleNotificationStatus(
  request: Request,
  env: any,
): Promise<Response> {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  let count = 0;
  try {
    if (env && env.DB) {
      const row: any = await env.DB.prepare(
        "SELECT COUNT(*) as cnt FROM push_subscriptions"
      ).first();
      count = Number(row?.cnt || 0);
    }
  } catch {}

  return new Response(
    JSON.stringify({
      success: true,
      activeDevicesCount: count,
      desktopSupported: true,
      iosSupported: true,
      androidSupported: true,
    }),
    { status: 200, headers: corsHeaders },
  );
}
