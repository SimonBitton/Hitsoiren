/* ══════════════════════════════════════════════════
   WIKIPÉDIA — récupération d'images & extraits réels
   Utilise l'API MediaWiki (CORS via origin=*).
══════════════════════════════════════════════════ */

const cache = new Map();
const MAX_CACHE_ENTRIES = 120;
const MAX_QUERY_LENGTH = 140;
const MAX_RESPONSE_CHARACTERS = 260_000;

function setCache(key, value) {
  if (!cache.has(key) && cache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, value);
}

function cleanQuery(name) {
  return (name || '')
    .replace(/\(.*?\)/g, '')
    .replace(/[—–-].*$/, '')
    .replace(/\b(début|fin|apogée|naissance|mort|composition|invention|découverte)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s'.,:;!?-]/gu, '')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}

export async function fetchWikiInfo(name) {
  const query = cleanQuery(name);
  if (!query) return null;
  if (cache.has(query)) return cache.get(query);

  const url = `https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*`
    + `&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1`
    + `&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=480&exintro=1&explaintext=1&exsentences=3`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      referrerPolicy: 'no-referrer'
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('http');
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) throw new Error('mime');
    const raw = await res.text();
    if (raw.length > MAX_RESPONSE_CHARACTERS) throw new Error('too-large');
    const data = JSON.parse(raw);
    const pages = data?.query?.pages;
    if (!pages) { setCache(query, null); return null; }

    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) { setCache(query, null); return null; }

    const title = typeof page.title === 'string' ? page.title.slice(0, 220) : '';
    const thumbnail = typeof page.thumbnail?.source === 'string' ? page.thumbnail.source : null;
    const extract = typeof page.extract === 'string' ? page.extract.trim().slice(0, 1200) : null;
    const pageid = Number.isInteger(page.pageid) ? page.pageid : null;

    const info = {
      title,
      thumbnail,
      extract: extract || null,
      pageUrl: pageid ? `https://fr.wikipedia.org/?curid=${pageid}` : null
    };
    setCache(query, info);
    return info;
  } catch {
    setCache(query, null);
    return null;
  }
}
