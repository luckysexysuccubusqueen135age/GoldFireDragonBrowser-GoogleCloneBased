import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, X-Requested-With",
};

const UA = "Mozilla/9.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 FireDragon/135.0 stealth privatebrowsing incognito windowedfullscreen";
const JP_SPOOF_IP = "109.123.230.28";

// ====================== DNS DoH ======================
async function queryDoH(provider: string, url: string, domain: string, type: string) {
  try {
    const res = await fetch(`${url}?name=${encodeURIComponent(domain)}&type=${type}`, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { provider, status: "error", answers: [], raw: null };
    const data = await res.json();
    const answers = (data.Answer || []).map((a: any) => ({
      name: a.name, 
      type: a.type, 
      data: a.data, 
      ttl: a.TTL,
    }));
    return { 
      provider, 
      status: data.Status === 0 ? "ok" : "nxdomain", 
      answers, 
      blocked: data.Status === 3 
    };
  } catch (e) {
    return { provider, status: "timeout", answers: [], error: String(e) };
  }
}

// ====================== MAIN ======================
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    let query = "";
    let keyword = "";
    let previous: string[] = [];
    let originalQuery = "";
    let clientUA = "";
    let functionType = "adult-proxy";
    let isAdult = true;
    let uncensored = true;
    let fullBypass = true;
    let mode = "proxy";
    let dnsType = "A";

    // POST 요청
    if (req.method === "POST") {
      const body = await req.json();
      query = body.query || body.url || body.q || body.domain || "";
      keyword = body.keyword || query;
      previous = body.previous || [];
      originalQuery = body.originalQuery || query;
      clientUA = body.ua || UA;
      functionType = body.type || body.name || "adult-proxy";
      isAdult = body.isAdult !== false;
      uncensored = body.uncensored !== false;
      fullBypass = body.fullBypass !== false;
      mode = body.mode || "proxy";
      dnsType = body.dnsType || "A";
    } 
    // GET 요청
    else {
      const url = new URL(req.url);
      query = url.searchParams.get("q") || url.searchParams.get("url") || url.searchParams.get("domain") || "";
      keyword = query;
      originalQuery = query;
      clientUA = url.searchParams.get("ua") || UA;
      functionType = url.searchParams.get("type") || "adult-proxy";
      mode = url.searchParams.get("mode") || "proxy";
      dnsType = url.searchParams.get("dnsType") || "A";
    }

    if (!query.trim()) {
      return new Response(
        JSON.stringify({ error: "query/url/domain 파라미터가 필요합니다." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const cleanKeyword = String(keyword || query).replace(/\s+/g, " ").trim();
    let finalUrl = cleanKeyword;

    // ==================== JP-IP-Search-Proxy ====================
    if (functionType === "jp-ip-search-proxy") {
      const googleParams = new URLSearchParams({
        q: cleanKeyword,
        hl: "ko",
        gl: "jp",
        safe: "off",
        pws: "0",
        nfpr: "1",
        cr: "countryJP",
        near: "Tokyo",
        num: "10",
      });

      const googleUrl = `http://www.google.co.jp/?gl=jp&hl=ko&safe=off&desktop=true&ua=Mozilla/9.0+(Windows+NT+10.0;+Win64;+x64)+Gecko/20100101+FireDragon/135.0+stealth+privatebrowsing+incognito+windowedfullscreen/complate/search?q=${googleParams.toString()}`;

      const googleResp = await fetch(googleUrl, {
        headers: {
          "User-Agent": UA,
          "Accept-Language": "ko-KR,ko;q=0.9,ja;q=0.8,en;q=0.7",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "X-Forwarded-For": JP_SPOOF_IP,
          "X-Real-IP": JP_SPOOF_IP,
          "Referer": "http://www.google.co.jp/?gl=jp&hl=ko&safe=off&desktop=true&ua=Mozilla/9.0+(Windows+NT+10.0;+Win64;+x64)+Gecko/20100101+FireDragon/135.0+stealth+privatebrowsing+incognito+windowedfullscreen/complate/search?q=",
        },
        redirect: "follow",
      });

      return new Response(
        JSON.stringify({
          success: true,
          type: "jp-ip-search-proxy",
          spoof_ip: JP_SPOOF_IP,
          search_url: googleUrl,
          final_url: googleResp.url || googleUrl,
          status: googleResp.status,
          message: "✅ 일본 IP 스푸핑 Google 검색 완료",
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ==================== DNS Lookup ====================
    if (functionType === "dns-lookup" || mode === "doh") {
      const domain = cleanKeyword.replace(/^https?:\/\//, "").split("/")[0];
      const providers = [
        { name: "Cloudflare (1.1.1.1)", url: "https://cloudflare-dns.com/dns-query" },
        { name: "Google (8.8.8.8)", url: "https://dns.google/resolve" },
        { name: "Cloudflare Security (1.1.1.2)", url: "https://security.cloudflare-dns.com/dns-query" },
      ];

      const results = await Promise.all(
        providers.map((p) => queryDoH(p.name, p.url, domain, dnsType))
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          type: "dns-lookup", 
          domain, 
          dnsType, 
          results 
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ==================== 기본 완전 무검열 프록시 ====================
    if (!cleanKeyword.startsWith("http")) {
      finalUrl = `http://www.google.co.jp/?gl=jp&hl=ko&safe=off&desktop=true&ua=Mozilla/5.0+(Windows+NT+10.0;+Win64;+x64)+Gecko/20100101+FireDragon/135.0+stealth+privatebrowsing+incognito+windowedfullscreen/complate/search?q=${encodeURIComponent(clientUA)}&q=${encodeURIComponent(cleanKeyword)}`;
    }

    // CroxyProxy 우회
    finalUrl = `https://www.croxyproxy.com/?url=${encodeURIComponent(finalUrl)}`;
    
    // fullBypass 시 이중 우회
    if (fullBypass) {
      finalUrl = `https://www.croxyproxy.com/?url=${encodeURIComponent(finalUrl)}`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        type: functionType,
        keyword: cleanKeyword,
        url: finalUrl,
        isAdult,
        uncensored,
        fullBypass,
        message: "✅ 완전 무검열 Universal Proxy 처리 완료",
      }),
      { 
        status: 200, 
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
      }
    );

  } catch (err: any) {
    console.error("[Universal-Proxy Error]", err);
    return new Response(
      JSON.stringify({ 
        error: err.message || "proxy error",
        keyword: "" 
      }),
      { 
        status: 500, 
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
      }
    );
  }
});