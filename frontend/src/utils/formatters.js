/**
 * Utility functions for consistent formatting across SurgeShield AI.
 */

/**
 * Format monetary amount in INR (Indian Rupees ₹)
 * @param {number|null|undefined} amount
 * @returns {string} e.g. "₹12,450.00"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format integer or general numbers with commas
 * @param {number|null|undefined} num
 * @returns {string} e.g. "1,520"
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format percentage value
 * @param {number|null|undefined} value
 * @param {number} decimals
 * @returns {string} e.g. "3.2%"
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format probability (0.0 to 1.0) into clean decimal or percentage
 * @param {number|null|undefined} prob
 * @returns {string} e.g. "0.9124"
 */
export function formatProbability(prob, decimals = 4) {
  if (prob === null || prob === undefined || isNaN(prob)) return '0.0000';
  return Number(prob).toFixed(decimals);
}

/**
 * Format risk or score (0 to 100)
 * @param {number|null|undefined} score
 * @returns {string} e.g. "78.5"
 */
export function formatScore(score, decimals = 1) {
  if (score === null || score === undefined || isNaN(score)) return '0.0';
  return Number(score).toFixed(decimals);
}

/**
 * Format ISO datetime or timestamp
 * @param {string|Date|number|null|undefined} timestamp
 * @returns {string} e.g. "Sep 29, 2026, 03:45 AM"
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return String(timestamp);
  }
}

/**
 * Format time offset in seconds into human-readable hours & minutes
 * @param {number|null|undefined} seconds
 * @returns {string} e.g. "T+ 12.5h (45,000s)"
 */
export function formatTimeOffset(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0s';
  const hrs = (seconds / 3600).toFixed(1);
  return `${formatNumber(Math.round(seconds))}s (${hrs}h elapsed)`;
}
