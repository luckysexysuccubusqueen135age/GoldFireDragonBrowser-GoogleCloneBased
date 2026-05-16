import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, X-Requested-With",
};

const UA = "Mozilla/9.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 FireDragon/135.0 stealth privatebrowsing incognito windowedfullscreen";

// 허용할 도메인 (보안상 제한)
const ALLOWED_DOMAINS = [
  "wikipedia.org",
  "wikimedia.org",
  "github.com",
  "stackoverflow.com",
  "reddit.com",
  "medium.com",
  "news.ycombinator.com",
  "dev.to",
  "gibiru.com",
  "duckduckgo.com",
  "bing.com",
  "yahoo.com",
  "naver.com",
  "daum.net",
  "nate.com",
  "youtube.com",
  "youtu.be",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "amazon.com",
  "amazon.co.jp",
  "coupang.com",
  "11st.co.kr",
  "gmarket.co.kr",
  "auction.co.kr",
  "tistory.com",
  "velog.io",
  "brunch.co.kr",
  "namu.wiki",
  "dcinside.com",
  "ruliweb.com",
  "clien.net",
  "fmkorea.com",
  "theqoo.net",
  "instiz.net",
  "pann.nate.com",
  "mlbpark.donga.com",
  "ygosu.com",
  "todayhumor.co.kr",
  "dogdrip.net",
  "bobaedream.co.kr",
  "cafe.naver.com",
  "blog.naver.com",
  "news.naver.com",
  "sports.naver.com",
  "entertain.naver.com",
  "finance.naver.com",
  "land.naver.com",
  "map.naver.com",
  "movie.naver.com",
  "book.naver.com",
  "shopping.naver.com",
  "store.naver.com",
  "smartstore.naver.com",
  "pay.naver.com",
  "mail.naver.com",
  "mybox.naver.com",
  "calendar.naver.com",
  "memo.naver.com",
  "contact.naver.com",
  "office.naver.com",
  "works.naver.com",
  "vibe.naver.com",
  "audioclip.naver.com",
  "series.naver.com",
  "serieson.naver.com",
  "chzzk.naver.com",
  "game.naver.com",
  "webtoon.naver.com",
  "novel.naver.com",
  "comic.naver.com",
  "koreanwebtoons.com",
  "kakaopage.co.kr",
  "page.kakao.com",
  "ridibooks.com",
  "kyobobook.co.kr",
  "yes24.com",
  "aladin.co.kr",
  "interpark.com",
  "ticket.interpark.com",
  "melon.com",
  "genie.co.kr",
  "bugs.co.kr",
  "flo.music",
  "soribada.com",
  "vibe.naver.com",
  "music.apple.com",
  "spotify.com",
  "soundcloud.com",
  "bandcamp.com",
  "mixcloud.com",
  "tidal.com",
  "deezer.com",
  "pandora.com",
  "iheart.com",
  "tunein.com",
  "last.fm",
  "allmusic.com",
  "discogs.com",
  "rateyourmusic.com",
  "genius.com",
  "azlyrics.com",
  "lyrics.com",
  "metrolyrics.com",
  "songlyrics.com",
  "elyrics.net",
  "lyricsmode.com",
  "lyricsfreak.com",
  "lyricsmania.com",
  "lyrics007.com",
  "lyricsondemand.com",
  "lyricsdepot.com",
  "lyricsbay.com",
  "lyricsverse.com",
  "lyricstranslate.com",
  "musixmatch.com",
  "shazam.com",
  "soundhound.com",
  "midomi.com",
  "watson.ch",
  "audiotag.info",
  "acoustid.org",
  "musicbrainz.org",
  "freedb.org",
  "gnudb.org",
  "cdtext.org",
  "isrc.org",
  "gracenote.com",
  "tunecore.com",
  "distrokid.com",
  "cdbaby.com",
  "reverbnation.com",
  "bandcamp.com",
  "soundclick.com",
  "numberonemusic.com",
  "ourstage.com",
  "garageband.com",
  "soundcloud.com",
  "hearthis.at",
  "mixcloud.com",
  "8tracks.com",
  "jamendo.com",
  "freemusicarchive.org",
  "ccmixter.org",
  "incompetech.com",
  "bensound.com",
  "musopen.org",
  "freepd.com",
  "dig.ccmixter.org",
  "ccmixter.org",
  "tribeofnoise.com",
  "jamendo.com",
  "pond5.com",
  "audiojungle.net",
  "envato.com",
  "videohive.net",
  "photodune.net",
  "graphicriver.net",
  "3docean.net",
  "codecanyon.net",
  "themeforest.net",
  "activeden.net",
  "flashden.net",
  "audiojungle.net",
  "videohive.net",
  "graphicriver.net",
  "3docean.net",
  "codecanyon.net",
  "themeforest.net",
  "activeden.net",
  "flashden.net",
  "audiojungle.net",
  "videohive.net",
  "graphicriver.net",
  "3docean.net",
  "codecanyon.net",
  "themeforest.net",
  "activeden.net",
  "flashden.net",
];

function isAllowed(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOWED_DOMAINS.some((d) => u.hostname.endsWith(d));
  } catch {
    return false;
  }
}

// HTML에서 본문 추출 (간단한 Readability)
function extractContent(html: string, url: string): { title: string; content: string; text: string } {
  // 제목 추출
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "제목 없음";

  // 본문 후보 태그들
  const contentPatterns = [
    /<article[^>]*>[\s\S]*?<\/article>/gi,
    /<main[^>]*>[\s\S]*?<\/main>/gi,
    /<div[^>]*class="[^"]*(?:content|article|post|entry|body|text|main)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    /<div[^>]*id="[^"]*(?:content|article|post|entry|body|text|main)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    /<section[^>]*>[\s\S]*?<\/section>/gi,
  ];

  let bestContent = "";
  let maxLength = 0;

  for (const pattern of contentPatterns) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const text = match.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (text.length > maxLength && text.length > 200) {
          maxLength = text.length;
          bestContent = match;
        }
      }
    }
  }

  // 본문을 못 찾으면 body 전체에서 추출
  if (!bestContent) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bestContent = bodyMatch[1];
    }
  }

  // HTML 태그 제거하고 텍스트 추출
  let text = bestContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 본문 HTML 정제 (이미지, 링크는 유지)
  let cleanHtml = bestContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/class="[^"]*"/g, "")
    .replace(/style="[^"]*"/g, "")
    .replace(/onclick="[^"]*"/g, "")
    .replace(/onload="[^"]*"/g, "")
    .replace(/onerror="[^"]*"/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .trim();

  // 이미지 URL 절대 경로로 변환
  const baseUrl = new URL(url).origin;
  cleanHtml = cleanHtml.replace(
    /src="(?!http)([^"]+)"/g,
    `src="${baseUrl}$1"`
  );
  cleanHtml = cleanHtml.replace(
    /href="(?!http)([^"]+)"/g,
    `href="${baseUrl}$1"`
  );

  return { title, content: cleanHtml, text };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get("url");
    const mode = url.searchParams.get("mode") ?? "html"; // html | text | json

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: "url 파라미터가 필요합니다." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!isAllowed(targetUrl)) {
      return new Response(
        JSON.stringify({ error: "이 도메인은 접근이 제한됩니다." }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `대상 서버 오류: ${res.status}` }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const contentType = res.headers.get("content-type") ?? "text/html";
    const body = await res.text();

    // JSON 모드: 본문 추출해서 반환
    if (mode === "json") {
      const extracted = extractContent(body, targetUrl);
      return new Response(
        JSON.stringify({
          title: extracted.title,
          content: extracted.content,
          text: extracted.text,
          url: targetUrl,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // HTML 모드: 정제된 HTML 반환
    if (mode === "html") {
      const extracted = extractContent(body, targetUrl);
      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${extracted.title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
h1, h2, h3, h4, h5, h6 { color: #1a1a1a; margin-top: 1.5em; margin-bottom: 0.5em; }
p { margin-bottom: 1em; }
img { max-width: 100%; height: auto; }
a { color: #0066cc; text-decoration: none; }
a:hover { text-decoration: underline; }
blockquote { border-left: 3px solid #ddd; padding-left: 1em; margin-left: 0; color: #666; }
pre { background: #f5f5f5; padding: 1em; overflow-x: auto; border-radius: 4px; }
code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
ul, ol { padding-left: 2em; }
table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
th, td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
th { background: #f5f5f5; }
</style>
</head>
<body>
<h1>${extracted.title}</h1>
${extracted.content}
<hr>
<p style="color: #999; font-size: 0.8em;">원본: <a href="${targetUrl}" target="_blank">${targetUrl}</a></p>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "text/html; charset=utf-8",
          "X-Proxied-URL": targetUrl,
        },
      });
    }

    // 기본: 원본 반환
    return new Response(body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
        "X-Proxied-URL": targetUrl,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "프록시 오류", detail: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
