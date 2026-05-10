export function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function debounce(fn, delay = 140) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

export function estimateYearFromText(text) {
  if (!text) return null;
  const clean = text
    .toLowerCase()
    .replace(/≈|vers|ca\.?|env\.?/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const firstYear = clean.match(/(\d[\d\s]*)/);
  if (!firstYear) return null;
  const numeric = parseInt(firstYear[1].replace(/\s/g, ''), 10);
  if (Number.isNaN(numeric)) return null;
  return clean.includes('av. j.-c') ? -numeric : numeric;
}

export function escapeHtml(value) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getCategoryClass(category) {
  const normalizedLabel = normalizeCategory(category);
  if (normalizedLabel === 'science') return 'cat-science';
  if (normalizedLabel === 'culture') return 'cat-culture';
  return 'cat-politique';
}

export function normalizeCategory(category) {
  const normalized = normalizeText(category);
  if (normalized.includes('science')) return 'science';
  if (normalized.includes('culture') || normalized.includes('exploration')) return 'culture';
  return 'politique';
}

export function getCategoryLabel(category) {
  const normalized = normalizeCategory(category);
  if (normalized === 'science') return 'Science';
  if (normalized === 'culture') return 'Culture';
  return 'Politique';
}

export function sanitizeExternalUrl(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return null;
  try {
    const parsed = new URL(rawValue, window.location.origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.href;
  } catch {
    return null;
  }
}
