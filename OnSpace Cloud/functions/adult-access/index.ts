import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const PROXY_LIST = [
  "https://www.croxyproxy.com/?url=",
  "https://proxy.site/?url=",
  "https://blockaway.net/?url=",
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const body = req.method === "POST" ? await req.json() : {};
    let query = body.query || body.url || "";
    const fullBypass = body.fullBypass !== false;

    if (!query.trim()) {
      return new Response(JSON.stringify({ error: "Pornhub, Toonkor, Hitomi.la 주소나 검색어를 입력하세요" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    let target = query.trim();

    // 검색어 → 무검열 Google 검색
    if (!target.startsWith("http")) {
      target = `https://www.google.co.jp/search?gl=jp&hl=ko&safe=off&pws=0&nfpr=1&q=${encodeURIComponent(target)}`;
    }

    // 프록시 체인 적용
    let finalUrl = PROXY_LIST[0] + encodeURIComponent(target);

    if (fullBypass) {
      // 이중 우회 (현재 가장 잘 뚫림)
      finalUrl = PROXY_LIST[0] + encodeURIComponent(PROXY_LIST[1] + encodeURIComponent(target));
    }

    return new Response(
      JSON.stringify({
        success: true,
        finalUrl: finalUrl,
        backupUrl: PROXY_LIST[2] + encodeURIComponent(target),
        message: "🔥 Pornhub, Toonkor, Hitomi.la, XVideos, NHentai 등 접속 링크 생성 완료",
        note: "1번 링크가 안 되면 Backup 링크 사용하세요. fullBypass=true로 더 강력하게 시도 가능",
        fullBypass: fullBypass
      }),
      { 
        status: 200, 
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "접속 실패. 다시 시도해주세요." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});