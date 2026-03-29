import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DISCORD_API = "https://discord.com/api/v10";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const DISCORD_CLIENT_ID = Deno.env.get("DISCORD_CLIENT_ID")!;
    const DISCORD_CLIENT_SECRET = Deno.env.get("DISCORD_CLIENT_SECRET")!;
    const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")!;
    const DISCORD_GUILD_ID = Deno.env.get("DISCORD_GUILD_ID")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const redirectUri = `${SUPABASE_URL}/functions/v1/discord-auth`;

    // Step 1: Initiate OAuth - redirect to Discord
    if (action === "login") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract user ID from JWT to use as state for CSRF protection
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const anonClient = createClient(
        SUPABASE_URL,
        Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
      
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Capture app origin so the callback can redirect back to the correct app URL
      const appOrigin = url.searchParams.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";

      // Use user ID as state parameter for CSRF protection
      const stateParam = btoa(JSON.stringify({ userId: user.id, ts: Date.now(), appOrigin }));

      const discordAuthUrl = new URL(`${DISCORD_API}/oauth2/authorize`);
      discordAuthUrl.searchParams.set("client_id", DISCORD_CLIENT_ID);
      discordAuthUrl.searchParams.set("redirect_uri", redirectUri);
      discordAuthUrl.searchParams.set("response_type", "code");
      discordAuthUrl.searchParams.set("scope", "identify guilds.members.read");
      discordAuthUrl.searchParams.set("state", stateParam);

      return new Response(JSON.stringify({ url: discordAuthUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Handle OAuth callback
    if (code) {
      // Parse state to get user ID and app origin
      let userId: string;
      let appOrigin = "";
      try {
        const stateData = JSON.parse(atob(state || ""));
        userId = stateData.userId;
        appOrigin = stateData.appOrigin || "";
        // Check state isn't too old (10 minutes)
        if (Date.now() - stateData.ts > 600000) {
          throw new Error("State expired");
        }
      } catch {
        return redirectWithError("invalid_state", appOrigin);
      }

      // Exchange code for access token
      const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        console.error("Token exchange failed:", await tokenRes.text());
        return redirectWithError("token_failed");
      }

      const tokenData = await tokenRes.json();

      // Get Discord user info
      const userRes = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        console.error("User fetch failed:", await userRes.text());
        return redirectWithError("user_fetch_failed");
      }

      const discordUser = await userRes.json();

      // Check guild membership using Bot token
      const memberRes = await fetch(
        `${DISCORD_API}/guilds/${DISCORD_GUILD_ID}/members/${discordUser.id}`,
        {
          headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
        }
      );

      const isMember = memberRes.ok;

      // Update user_profiles with Discord info
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      if (isMember) {
        // User is a member - verify them
        const { error: upsertError } = await supabase
          .from("user_profiles")
          .upsert(
            {
              user_id: userId,
              discord_id: discordUser.id,
              discord_username: discordUser.username,
              discord_verified: true,
              discord_verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (upsertError) {
          console.error("Upsert error:", upsertError);
          return redirectWithError("db_error");
        }

        // Redirect back to app with success
        // Use a known app URL pattern
        const appUrl = req.headers.get("origin") || req.headers.get("referer") || "";
        const baseUrl = appUrl ? new URL(appUrl).origin : "";
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${baseUrl || "/"}?discord_verified=true`,
          },
        });
      } else {
        // User is NOT a member
        // Still save their Discord ID so we know who they are
        await supabase
          .from("user_profiles")
          .upsert(
            {
              user_id: userId,
              discord_id: discordUser.id,
              discord_username: discordUser.username,
              discord_verified: false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        const appUrl = req.headers.get("origin") || req.headers.get("referer") || "";
        const baseUrl = appUrl ? new URL(appUrl).origin : "";
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${baseUrl || "/"}?discord_error=not_member`,
          },
        });
      }
    }

    // Step 3: Check/recheck verification status
    if (action === "check") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const anonClient = createClient(
        SUPABASE_URL,
        Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await anonClient.auth.getUser(token);

      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Get user's Discord info
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("discord_id, discord_username, discord_verified, discord_verified_at")
        .eq("user_id", user.id)
        .single();

      if (!profile?.discord_id) {
        return new Response(
          JSON.stringify({
            verified: false,
            discord_username: null,
            message: "No Discord account linked",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Re-check guild membership
      const memberRes = await fetch(
        `${DISCORD_API}/guilds/${DISCORD_GUILD_ID}/members/${profile.discord_id}`,
        {
          headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
        }
      );

      const isMember = memberRes.ok;

      // Update verification status if changed
      if (isMember !== profile.discord_verified) {
        await supabase
          .from("user_profiles")
          .update({
            discord_verified: isMember,
            discord_verified_at: isMember ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }

      return new Response(
        JSON.stringify({
          verified: isMember,
          discord_username: profile.discord_username,
          message: isMember
            ? "Discord verified"
            : "Not a member of the Discord server",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Discord auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function redirectWithError(error: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: `/?discord_error=${error}` },
  });
}
