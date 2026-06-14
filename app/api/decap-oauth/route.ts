/**
 * GitHub OAuth handler for Decap CMS.
 *
 * Decap CMS opens a popup to /api/decap-oauth?provider=github
 * This route:
 *   1. (no code)  → redirects the popup to GitHub for authorization
 *   2. (has code) → exchanges the code for a token and postMessages it back
 *
 * Required env vars:
 *   DECAP_GITHUB_CLIENT_ID     — GitHub OAuth App client ID
 *   DECAP_GITHUB_CLIENT_SECRET — GitHub OAuth App client secret
 *
 * GitHub OAuth App settings:
 *   Homepage URL:      https://abba-das.vercel.app
 *   Callback URL:      https://abba-das.vercel.app/api/decap-oauth
 */

import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.DECAP_GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.DECAP_GITHUB_CLIENT_SECRET;

function selfUrl(req: NextRequest): string {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/api/decap-oauth`;
}

function popupHtml(message: string): NextResponse {
  const safeMsg = JSON.stringify(message);
  // Decap CMS OAuth handshake protocol:
  // 1. Popup sends "authorizing:github" to opener (signals it's ready)
  // 2. CMS replies with its own origin
  // 3. Popup sends the token message back using that origin (not *)
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
  (function () {
    var msg = ${safeMsg};
    function receiveMessage(e) {
      window.removeEventListener('message', receiveMessage, false);
      window.opener.postMessage(msg, e.origin);
      window.close();
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body>
</html>`;
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new NextResponse('DECAP_GITHUB_CLIENT_ID / DECAP_GITHUB_CLIENT_SECRET not set', {
      status: 500,
    });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirectUri = selfUrl(req);

  // ── Step 1: No code — send the popup to GitHub ──────────────────────────
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'repo,user',
    });
    return NextResponse.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    );
  }

  // ── Step 2: Has code — exchange for token ───────────────────────────────
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await tokenRes.json();

    if (!data.access_token) {
      const errMsg = `authorization:github:error:${JSON.stringify({
        error: data.error_description || data.error || 'Token exchange failed',
      })}`;
      return popupHtml(errMsg);
    }

    const successMsg = `authorization:github:success:${JSON.stringify({
      token: data.access_token,
      provider: 'github',
    })}`;
    return popupHtml(successMsg);
  } catch (err) {
    const errMsg = `authorization:github:error:${JSON.stringify({
      error: err instanceof Error ? err.message : 'Unknown error',
    })}`;
    return popupHtml(errMsg);
  }
}
