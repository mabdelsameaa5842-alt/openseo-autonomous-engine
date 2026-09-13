const AUTH_SECRET = "open_seo_super_admin_sec_2026_mohamed_samee_99880";

export const SUPER_ADMIN_USER = {
  id: "local-admin",
  name: "م. محمد عبد السميع",
  email: "mohamed701164@gmail.com",
  role: "super_admin",
  roleTitle: "👑 المدير العام والتنفيذي (Super Admin)",
  avatar: "MA",
  permissions: ["PERM_ALL", "PERM_AUTONOMOUS_SEO", "PERM_MAKE_INTEGRATION", "PERM_PROJECTS_FULL"]
};

// SHA-256 hash of Mm201915842
const VALID_PASSWORD_HASH = "16c338b6b96054fb5a2d267cd9977df23cb1efa6e2146671a37b45322b87e7f2";

async function hashSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function signHmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const sigBytes = Array.from(new Uint8Array(signature));
  let binary = "";
  for (let i = 0; i < sigBytes.length; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyHmacSha256(message: string, signature: string, secret: string): Promise<boolean> {
  const expectedSig = await signHmacSha256(message, secret);
  return expectedSig === signature;
}

function base64UrlEncodeUtf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeUtf8(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function createAdminToken(rememberMe: boolean = false): Promise<{ token: string; expiresAt: string }> {
  const header = base64UrlEncodeUtf8(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const exp = Math.floor((Date.now() + durationMs) / 1000);
  
  const payloadData = {
    sub: SUPER_ADMIN_USER.id,
    email: SUPER_ADMIN_USER.email,
    name: SUPER_ADMIN_USER.name,
    role: SUPER_ADMIN_USER.role,
    roleTitle: SUPER_ADMIN_USER.roleTitle,
    permissions: SUPER_ADMIN_USER.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp
  };
  
  const payload = base64UrlEncodeUtf8(JSON.stringify(payloadData));
  const signature = await signHmacSha256(`${header}.${payload}`, AUTH_SECRET);

  return {
    token: `${header}.${payload}.${signature}`,
    expiresAt: new Date(exp * 1000).toISOString()
  };
}

export async function verifyAdminToken(token: string): Promise<any | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const isValid = await verifyHmacSha256(`${header}.${payload}`, signature, AUTH_SECRET);
  if (!isValid) return null;

  try {
    const rawPayload = base64UrlDecodeUtf8(payload);
    const data = JSON.parse(rawPayload);
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function handleSuperAdminLogin(request: Request, env: any): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = (await request.json()) as any;
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const rememberMe = Boolean(body.rememberMe);

    const isEmailValid = email === SUPER_ADMIN_USER.email || email === "mohame701164@gmail.com";
    const inputPassHash = await hashSha256(password);
    const isPasswordValid = inputPassHash === VALID_PASSWORD_HASH;

    if (!isEmailValid || !isPasswordValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "بيانات تسجيل الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور الخاصة بالمدير العام."
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        }
      );
    }

    const { token, expiresAt } = await createAdminToken(rememberMe);

    return new Response(
      JSON.stringify({
        success: true,
        authenticated: true,
        token,
        expiresAt,
        user: SUPER_ADMIN_USER,
        message: "تم تسجيل الدخول بنجاح وتوثيق جلسة المدير العام والتنفيذي."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Set-Cookie": `openseo_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${rememberMe ? 2592000 : 604800}`
        }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "فشل معالجة طلب تسجيل الدخول." }),
      { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}

export async function handleSuperAdminSession(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") || "";
  const cookieHeader = request.headers.get("cookie") || "";
  
  let token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token && cookieHeader) {
    const match = cookieHeader.match(/openseo_admin_token=([^;]+)/);
    if (match) token = match[1];
  }

  const session = await verifyAdminToken(token);
  if (!session) {
    return new Response(
      JSON.stringify({ authenticated: false, user: null }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        id: session.sub,
        email: session.email,
        name: session.name,
        role: session.role,
        roleTitle: session.roleTitle,
        permissions: session.permissions,
        avatar: SUPER_ADMIN_USER.avatar
      },
      expiresAt: new Date(session.exp * 1000).toISOString()
    }),
    { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}

export async function handleSuperAdminLogout(): Promise<Response> {
  return new Response(
    JSON.stringify({ success: true, message: "تم تسجيل الخروج بنجاح." }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": "openseo_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
      }
    }
  );
}
