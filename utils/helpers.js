/**
 * Utility helper functions for the Chronological Timeline application
 * Provides text normalization, HTML escaping, and formatting utilities
 */

/**
 * Normalizes text for search operations
 * Removes diacritics and converts to lowercase for case-insensitive matching
 * @param {string} value - The text to normalize
 * @returns {string} Normalized text without accents
 */
function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Estimates a numeric year from a date text string
 * Handles various date formats including "av. J.-C." (BC), approximations, etc.
 * @param {string} text - Date text to parse
 * @returns {number|null} Numeric year (negative for BC) or null if unparseable
 */
function estimateYearFromText(text) {
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

/**
 * Formats a numeric year into a readable string
 * @param {number} year - Numeric year (can be negative for BC)
 * @returns {string} Formatted year string with spaces as thousands separators
 */
function formatYear(year) {
  const abs = Math.abs(year);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return year < 0 ? `${formatted} av. J.-C.` : `${formatted}`;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} value - Raw text to escape
 * @returns {string} HTML-safe string
 */
function escapeHtml(value) {
  return (value || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

/**
 * Maps an event category to its CSS class name
 * @param {string} category - Event category (Politique, Science, Culture, Exploration)
 * @returns {string} CSS class name for styling
 */
function getCategoryClass(category) {
  const normalized = normalizeText(category);
  if (normalized.includes('science')) return 'cat-science';
  if (normalized.includes('culture')) return 'cat-culture';
  if (normalized.includes('exploration')) return 'cat-exploration';
  return 'cat-politique';
}

// Export functions for use in other modules (if using ES modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeText,
    estimateYearFromText,
    formatYear,
    escapeHtml,
    getCategoryClass
  };
}