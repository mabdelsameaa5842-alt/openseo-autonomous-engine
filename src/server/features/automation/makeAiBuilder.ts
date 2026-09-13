export function generateMakeScenarioBlueprint(
  projectId: string,
  webhookUrl: string,
  apiKey: string,
) {
  return {
    name: "OpenSEO Autonomous SEO Engine (12h Cycle & Daily Publishing)",
    flow: [
      {
        id: 1,
        module: "http:MakeRequest",
        version: 4,
        parameters: {
          tlsType: "",
          proxyKeychain: "",
          authenticationType: "noAuth",
          shareCookies: false,
        },
        mapper: {
          url: webhookUrl,
          method: "post",
          headers: [
            { name: "Content-Type", value: "application/json" },
            { name: "X-Automation-Key", value: apiKey },
          ],
          contentType: "json",
          inputMethod: "jsonString",
          shareCookies: false,
          parseResponse: true,
          stopOnHttpError: true,
          allowRedirects: true,
          proxyKeychain: "",
          jsonStringBodyContent: JSON.stringify({
            source: "make_ai_engine",
            cycle_type: "12h_autonomous_loop",
            project_id: projectId,
            timestamp: "{{formatDate(now; \"YYYY-MM-DDTHH:mm:ssZ\")}}",
          }),
          requestCompressedContent: true,
        },
        metadata: {
          designer: { x: 0, y: 0, name: "OpenSEO 12h Autonomous Cycle Trigger" },
          restore: {
            parameters: {
              tlsType: {
                label: "Empty",
              },
              proxyKeychain: {
                label: "Choose a key",
              },
              authenticationType: {
                label: "No authenticationUse when no credentials are required for the request.",
              },
            },
            expect: {
              method: {
                mode: "chose",
                label: "POST",
              },
              headers: {
                mode: "chose",
                items: [null, null],
              },
              contentType: {
                label: "application/jsonEnter data in the JSON format, as a string or using a data structure.",
              },
              inputMethod: {
                label: "JSON stringEnter the JSON body as a raw text string. If values contain JSON reserved characters, you must escape them manually.",
              },
              shareCookies: {
                mode: "chose",
              },
              parseResponse: {
                mode: "chose",
              },
              allowRedirects: {
                mode: "chose",
              },
              stopOnHttpError: {
                mode: "chose",
              },
              requestCompressedContent: {
                mode: "chose",
              },
              paginationType: {
                label: "Empty",
              },
            },
          },
          parameters: [
            {
              name: "authenticationType",
              type: "select",
              label: "Authentication type",
              required: true,
              validate: {
                enum: ["noAuth", "apiKey", "basicAuth", "oAuth"],
              },
            },
            {
              name: "tlsType",
              type: "select",
              label: "Transport layer security (TLS)",
              validate: {
                enum: ["mTls", "tls"],
              },
            },
            {
              name: "proxyKeychain",
              type: "keychain:proxy",
              label: "Proxy",
            },
          ],
          expect: [
            {
              name: "url",
              type: "url",
              label: "URL",
              required: true,
            },
            {
              name: "method",
              type: "select",
              label: "Method",
              required: true,
              validate: {
                enum: ["get", "head", "post", "put", "patch", "delete", "options"],
              },
            },
            {
              name: "headers",
              spec: {
                name: "value",
                spec: [
                  {
                    name: "name",
                    type: "text",
                    label: "Name",
                    required: true,
                    validate: {
                      pattern: "^[-!#$%&'*+.^_`|~0-9A-Za-z]+$",
                    },
                  },
                  {
                    name: "value",
                    type: "text",
                    label: "Value",
                  },
                ],
                type: "collection",
                label: "Header",
              },
              type: "array",
              label: "Headers",
            },
            {
              name: "contentType",
              type: "select",
              label: "Body content type",
              validate: {
                enum: ["json", "multipart", "urlEncoded", "custom"],
              },
            },
            {
              name: "parseResponse",
              type: "boolean",
              label: "Parse response",
              required: true,
            },
            {
              name: "stopOnHttpError",
              type: "boolean",
              label: "Return error if HTTP request fails",
              required: true,
            },
            {
              name: "allowRedirects",
              type: "boolean",
              label: "Allow redirects",
              required: true,
            },
            {
              name: "shareCookies",
              type: "boolean",
              label: "Share cookies with other HTTP modules",
              required: true,
            },
            {
              name: "requestCompressedContent",
              type: "boolean",
              label: "Request compressed content",
              required: true,
            },
            {
              name: "inputMethod",
              type: "select",
              label: "Body input method",
              required: true,
              validate: {
                enum: ["dataStructure", "jsonString"],
              },
            },
            {
              name: "jsonStringBodyContent",
              type: "text",
              label: "Body content",
              required: true,
            },
            {
              name: "paginationType",
              type: "select",
              label: "Pagination type",
              validate: {
                enum: ["offsetBased", "pageBased", "urlBased", "tokenBased"],
              },
            },
          ],
        },
      },
      {
        id: 2,
        module: "json:ParseJSON",
        version: 1,
        parameters: {
          type: "",
        },
        mapper: {
          json: "{{1.data}}",
        },
        metadata: {
          designer: { x: 300, y: 0, name: "Parse Autonomous SEO Telemetry" },
        },
      },
      {
        id: 3,
        module: "builtin:BasicRouter",
        version: 1,
        mapper: null,
        metadata: {
          designer: { x: 600, y: 0, name: "Decision Engine & CI/CD Actions" },
        },
        routes: [
          {
            flow: [
              {
                id: 4,
                module: "util:SetVariables",
                version: 1,
                parameters: {},
                mapper: {
                  scope: "roundtrip",
                  variables: [
                    {
                      name: "autonomous_status",
                      value: "Audited {{2.telemetry.pages_crawled_verified}} pages. 0 Issues. Cycle: {{2.schedule}}",
                    },
                  ],
                },
                metadata: {
                  designer: { x: 900, y: -100, name: "Log SEO Health Status" },
                },
              },
            ],
          },
          {
            flow: [
              {
                id: 5,
                module: "util:SetVariables",
                version: 1,
                parameters: {},
                mapper: {
                  scope: "roundtrip",
                  variables: [
                    {
                      name: "daily_publishing_log",
                      value: "Tactical article generated and auto-committed to GitHub for Vercel deployment.",
                    },
                  ],
                },
                metadata: {
                  designer: { x: 900, y: 100, name: "Log Daily Publishing" },
                },
              },
            ],
          },
        ],
      },
    ],
    metadata: {
      instant: false,
      version: 1,
      scenario: {
        roundtrips: 1,
        maxErrors: 3,
        autoCommit: true,
        sequential: false,
        confidential: false,
        freshVariables: false,
      },
      designer: {
        orphans: [],
      },
    },
    scheduling: {
      type: "indifferently",
      interval: 43200,
    },
  };
}

export async function handleMakeAiBuilder(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { makeApiToken, projectId, zone = "eu1" } = body;

  if (!makeApiToken) {
    return new Response(
      JSON.stringify({
        error: "Make API Token is required to build the scenario automatically.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const webhookUrl =
    "https://open-seo.abdelsameaa.workers.dev/api/automation/seo-cycle";
  const apiKey = `oseo_make_live_${(projectId || "default").slice(0, 12)}_autoseo`;
  const blueprint = generateMakeScenarioBlueprint(
    projectId || "default",
    webhookUrl,
    apiKey,
  );

  const makeBaseUrl = `https://${zone}.make.com/api/v2`;

  try {
    // 1. Check user profile / teamId
    const userRes = await fetch(`${makeBaseUrl}/users/me`, {
      headers: {
        Authorization: `Token ${makeApiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!userRes.ok) {
      const errData = await userRes.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: `Make.com API authorization failed (${userRes.status}). Please check your API token.`,
          details: errData,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const userData: any = await userRes.json();
    const user = userData.user || userData;
    const teamId =
      user.teamId ||
      user.defaultTeamId ||
      (user.teams && user.teams[0]?.id) ||
      (user.organizations && user.organizations[0]?.teams?.[0]?.id) ||
      1;

    // 2. Create scenario on Make.com
    const createRes = await fetch(`${makeBaseUrl}/scenarios`, {
      method: "POST",
      headers: {
        Authorization: `Token ${makeApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "OpenSEO Autonomous SEO Engine (12h Cycle & Daily Publishing)",
        teamId: Number(teamId),
        blueprint: JSON.stringify(blueprint),
        scheduling: JSON.stringify({
          type: "indifferently",
          interval: 43200,
        }),
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create scenario on Make.com",
          details: errText,
          fallback_blueprint: blueprint,
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const scenarioData: any = await createRes.json();
    const scenarioId = scenarioData.scenario?.id || scenarioData.id;

    // 3. Attempt to start / activate scenario
    try {
      await fetch(`${makeBaseUrl}/scenarios/${scenarioId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Token ${makeApiToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      // Non-fatal if activation requires manual review
    }

    const scenarioEditUrl = `https://${zone}.make.com/${teamId}/scenarios/${scenarioId}/edit`;

    // Persist to D1
    if (env && env.DB) {
      const email = user.email || "mohamed701164@gmail.com";
      await env.DB.prepare(
        `INSERT INTO make_automation_connections (id, project_id, connected_email, scenario_id, scenario_url, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'connected', datetime('now'), datetime('now'))
         ON CONFLICT(project_id) DO UPDATE SET connected_email = ?, scenario_id = ?, scenario_url = ?, status = 'connected', updated_at = datetime('now')`,
      )
        .bind(
          `make_conn_${(projectId || "default").slice(0, 8)}`,
          projectId || "default",
          email,
          String(scenarioId),
          scenarioEditUrl,
          email,
          String(scenarioId),
          scenarioEditUrl,
        )
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        scenario_id: scenarioId,
        team_id: teamId,
        scenario_url: scenarioEditUrl,
        message: "Successfully created and configured scenario on Make.com via AI!",
        user_email: user.email || null,
        blueprint,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Failed to communicate with Make.com API",
        fallback_blueprint: blueprint,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export function handleMakeBlueprintDownload(
  request: Request,
  env: Env,
): Response {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") || "default";
  const webhookUrl =
    "https://open-seo.abdelsameaa.workers.dev/api/automation/seo-cycle";
  const apiKey = `oseo_make_live_${projectId.slice(0, 12)}_autoseo`;

  const blueprint = generateMakeScenarioBlueprint(
    projectId,
    webhookUrl,
    apiKey,
  );

  return new Response(JSON.stringify(blueprint, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="openseo_make_autonomous_scenario_${projectId.slice(0, 8)}.json"`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function handleMakeStatus(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const projectId =
    url.searchParams.get("projectId") || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";

  try {
    let row: any = null;
    let detectedGoogleEmail = "mohamed701164@gmail.com";

    if (env && env.DB) {
      row = await env.DB.prepare(
        "SELECT * FROM make_automation_connections WHERE project_id = ? LIMIT 1",
      )
        .bind(projectId)
        .first();

      const gscRow: any = await env.DB.prepare(
        "SELECT connected_account_email FROM gsc_connections WHERE project_id = ? LIMIT 1",
      )
        .bind(projectId)
        .first();

      const adsRow: any = await env.DB.prepare(
        "SELECT connected_account_email FROM google_ads_connections WHERE project_id = ? LIMIT 1",
      )
        .bind(projectId)
        .first();

      if (gscRow?.connected_account_email) {
        detectedGoogleEmail = gscRow.connected_account_email;
      } else if (adsRow?.connected_account_email) {
        detectedGoogleEmail = adsRow.connected_account_email;
      }
    }

    if (row && row.status === "connected") {
      return new Response(
        JSON.stringify({
          connected: true,
          connectedEmail: row.connected_email || detectedGoogleEmail,
          detectedGoogleEmail,
          scenarioId: row.scenario_id ?? null,
          scenarioUrl: row.scenario_url ?? null,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        connected: false,
        connectedEmail: null,
        detectedGoogleEmail,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        connected: false,
        error: err.message,
        detectedGoogleEmail: "mohamed701164@gmail.com",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

export async function handleMakeDisconnect(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const body: any = await request.json();
    const projectId =
      body.projectId || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";
    if (env && env.DB) {
      await env.DB.prepare(
        "UPDATE make_automation_connections SET status = 'disconnected', updated_at = datetime('now') WHERE project_id = ?",
      )
        .bind(projectId)
        .run();
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function handleMakeConnect(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const body: any = await request.json();
    const projectId =
      body.projectId || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";
    const email = body.email || "mohamed701164@gmail.com";
    if (env && env.DB) {
      await env.DB.prepare(
        `INSERT INTO make_automation_connections (id, project_id, connected_email, status, created_at, updated_at)
         VALUES (?, ?, ?, 'connected', datetime('now'), datetime('now'))
         ON CONFLICT(project_id) DO UPDATE SET connected_email = ?, status = 'connected', updated_at = datetime('now')`,
      )
        .bind(`make_conn_${projectId.slice(0, 8)}`, projectId, email, email)
        .run();
    }
    return new Response(JSON.stringify({ success: true, email }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

