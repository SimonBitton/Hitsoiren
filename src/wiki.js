/* ══════════════════════════════════════════════════
   WIKIPÉDIA — récupération d'images & extraits réels
   Utilise l'API MediaWiki (CORS via origin=*).
══════════════════════════════════════════════════ */

const cache = new Map();

function cleanQuery(name) {
  return (name || '')
    .replace(/\(.*?\)/g, '')
    .replace(/[—–-].*$/, '')
    .replace(/\b(début|fin|apogée|naissance|mort|composition|invention|découverte)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
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
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('http');
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) { cache.set(query, null); return null; }

    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) { cache.set(query, null); return null; }

    const info = {
      title: page.title,
      thumbnail: page.thumbnail?.source || null,
      extract: (page.extract || '').trim() || null,
      pageUrl: `https://fr.wikipedia.org/?curid=${page.pageid}`
    };
    cache.set(query, info);
    return info;
  } catch {
    cache.set(query, null);
    return null;
  }
}
