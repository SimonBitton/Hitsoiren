import { state } from './state.js';
import { normalizeText } from './utils.js';

/* ══════════════════════════════════════════════════
   LIENS ENTRE ÉVÉNEMENTS
   Trouve les événements connexes pour tisser des chaînes
   historiques (ex. Révolution → Napoléon → Empire).
══════════════════════════════════════════════════ */

function sharedPeople(a, b) {
  const namesA = (a.people || '').split(/[,;]/).map((p) => normalizeText(p).trim()).filter((p) => p.length > 3);
  const textB = normalizeText(`${b.name} ${b.people || ''}`);
  return namesA.some((name) => textB.includes(name));
}

export function findRelatedEvents(event, limit = 4) {
  const all = state.timelineData?.events || [];
  if (!event || all.length === 0) return [];

  const baseYear = Number.isFinite(event._year) ? event._year : null;
  const themes = new Set(event._themes || []);

  const scored = [];
  for (const candidate of all) {
    if (candidate.id === event.id) continue;

    let score = 0;
    if (candidate.era === event.era) score += 2;
    if (sharedPeople(event, candidate) || sharedPeople(candidate, event)) score += 6;

    const sharedThemes = (candidate._themes || []).filter((t) => themes.has(t)).length;
    score += sharedThemes * 2;

    if (baseYear !== null && Number.isFinite(candidate._year)) {
      const gap = Math.abs(candidate._year - baseYear);
      if (gap <= 5) score += 4;
      else if (gap <= 30) score += 3;
      else if (gap <= 100) score += 1;
    }

    if (score <= 0) continue;
    scored.push({ candidate, score, gap: baseYear !== null && Number.isFinite(candidate._year) ? Math.abs(candidate._year - baseYear) : Infinity });
  }

  scored.sort((a, b) => (b.score - a.score) || (a.gap - b.gap));
  return scored.slice(0, limit).map((entry) => entry.candidate);
}
