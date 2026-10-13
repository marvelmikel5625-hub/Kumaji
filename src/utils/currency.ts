/**
 * Financial utility for Kumaji Marketplace
 * All monetary amounts are stored in integer kobo (100 kobo = 1 NGN).
 * Floating-point values are strictly avoided in storage and mathematical operations.
 */

/**
 * Formats integer kobo into standard Nigerian Naira currency format (e.g., ₦150,000)
 */
export function formatKobo(kobo: number, includeKoboDecimals = false): string {
  if (isNaN(kobo) || kobo === null || kobo === undefined) {
    return '₦0';
  }

  const naira = kobo / 100;

  if (includeKoboDecimals || kobo % 100 !== 0) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(naira).replace('NGN', '₦');
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(naira).replace('NGN', '₦');
}

/**
 * Converts Naira input to integer kobo
 */
export function nairaToKobo(naira: number | string): number {
  const num = typeof naira === 'string' ? parseFloat(naira.replace(/[^0-9.-]+/g, '')) : naira;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts kobo to decimal Naira (for calculations or inputs)
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Calculates discount percentage
 */
export function calculateDiscountPercent(basePriceKobo: number, originalPriceKobo?: number): number {
  if (!originalPriceKobo || originalPriceKobo <= basePriceKobo) return 0;
  const discount = ((originalPriceKobo - basePriceKobo) / originalPriceKobo) * 100;
  return Math.round(discount);
}

/**
 * Calculates marketplace commission
 * Default standard rate is 8.5%
 */
export function calculateCommissionKobo(amountKobo: number, ratePercent = 8.5): number {
  return Math.round((amountKobo * ratePercent) / 100);
}
