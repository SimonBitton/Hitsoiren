import { writeFile, mkdir } from 'node:fs/promises';

const ENDPOINT = 'https://query.wikidata.org/sparql';

function toFlagEmoji(iso2) {
  if (!iso2 || iso2.length !== 2) return '';
  const A = 0x1f1e6;
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => A + (char.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

function isoDateToYear(iso) {
  if (!iso) return null;
  const match = iso.match(/^(-?\d{1,4})/);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  return Number.isFinite(year) ? year : null;
}

function formatIsoToFrDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso.slice(0, 10);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

async function sparql(query) {
  const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'accept': 'application/sparql-results+json',
      'user-agent': 'Histoiren/1.0 (data sync; https://github.com/SimonBitton/Hitsoiren)'
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Wikidata query failed (${res.status}): ${text.slice(0, 400)}`);
  }
  return res.json();
}

function qidFromUri(uri) {
  const match = String(uri || '').match(/\/(Q\d+)$/);
  return match ? match[1] : null;
}

async function main() {
  // Countries list + ISO2 + inception
  const countriesQuery = `
SELECT ?country ?countryLabel ?iso2 ?inception WHERE {
  ?country wdt:P31 wd:Q6256 .
  OPTIONAL { ?country wdt:P297 ?iso2 . }
  FILTER(BOUND(?iso2))
  OPTIONAL { ?country wdt:P571 ?inception . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
`;
  const countriesJson = await sparql(countriesQuery);

  const countries = new Map();
  for (const row of countriesJson.results.bindings) {
    const qid = qidFromUri(row.country?.value);
    if (!qid) continue;
    const name = row.countryLabel?.value || qid;
    const iso2 = row.iso2?.value || null;
    const flag = iso2 ? toFlagEmoji(iso2) : '';
    const inceptionIso = row.inception?.value ? row.inception.value.slice(0, 10) : null;

    countries.set(qid, {
      qid,
      iso2,
      id: iso2 ? `country-${iso2.toLowerCase()}` : `country-${qid.toLowerCase()}`,
      name,
      flag,
      events: [],
      inception: inceptionIso
    });
  }

  // Fetch 10 notable dated events per country (event -> country (P17) + point in time (P585)),
  // ranked by sitelinks then date. This gives a usable "10 dates" baseline for most countries.
  const countryList = Array.from(countries.values());
  const concurrency = 6;
  let idx = 0;

  async function fetchEventsForCountry(country) {
    const qid = country.qid;
    const query = `
SELECT ?event ?eventLabel ?when ?sitelinks WHERE {
  ?event wdt:P17 wd:${qid} ;
         wdt:P585 ?when .
  ?event wdt:P31/wdt:P279* ?kind .
  VALUES ?kind {
    wd:Q46855          # war
    wd:Q180684         # conflict
    wd:Q1190554        # military conflict
    wd:Q124734         # revolution
    wd:Q177548         # coup d'état
    wd:Q131569         # treaty
    wd:Q168247         # election
    wd:Q8065           # natural disaster
    wd:Q7944           # earthquake
    wd:Q44512          # terrorist attack
    wd:Q82794          # genocide
    wd:Q1047113        # political crisis
  }
  OPTIONAL { ?event wikibase:sitelinks ?sitelinks . }
  FILTER(!BOUND(?sitelinks) || ?sitelinks >= 5)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
ORDER BY DESC(?sitelinks) DESC(?when)
LIMIT 120
`;
    const data = await sparql(query);
    const rows = data.results.bindings || [];
    const events = [];
    for (const row of rows) {
      const eventQid = qidFromUri(row.event?.value);
      const whenIso = row.when?.value ? row.when.value.slice(0, 10) : null;
      const title = row.eventLabel?.value || eventQid || 'Événement';
      if (!eventQid || !whenIso) continue;
      events.push({
        date: formatIsoToFrDate(whenIso),
        isoDate: whenIso,
        year: isoDateToYear(whenIso),
        name: title,
        context: '',
        category: 'Politique',
        source: { type: 'wikidata', countryQid: qid, eventQid }
      });
      if (events.length >= 40) break;
    }
    country.events = events;
  }

  const workers = Array.from({ length: concurrency }, async () => {
    while (idx < countryList.length) {
      const current = countryList[idx++];
      try {
        await fetchEventsForCountry(current);
      } catch {
        current.events = [];
      }
    }
  });

  await Promise.all(workers);

  // Normalize: sort by date asc and keep 10; fallback to inception
  const output = Array.from(countries.values())
    .map(country => {
      const unique = new Map();
      for (const ev of country.events) {
        const key = `${ev.isoDate}__${ev.name}`;
        if (!unique.has(key)) unique.set(key, ev);
      }
      const events = Array.from(unique.values())
        .sort((a, b) => (a.isoDate || '').localeCompare(b.isoDate || ''))
        .slice(0, 10);

      if (events.length < 10 && country.inception) {
        events.unshift({
          date: formatIsoToFrDate(country.inception),
          isoDate: country.inception,
          year: isoDateToYear(country.inception),
          name: `Création / début de l'État (${country.name})`,
          context: '',
          category: 'Politique',
          source: { type: 'wikidata', countryQid: country.qid, property: 'P571' }
        });
      }

      return {
        id: country.id,
        qid: country.qid,
        iso2: country.iso2,
        name: country.name,
        flag: country.flag,
        events: events.slice(0, 10)
      };
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));

  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(new URL('../data/countries.json', import.meta.url), JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Wrote data/countries.json with ${output.length} countries`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

