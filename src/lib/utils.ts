/**
 * Calculate price from order text (preserved from original logic)
 */
export function calculatePrice(text: string): { original: number; advance: number } {
  if (!text.trim()) return { original: 0, advance: 0 };

  // Check for sculpture(x)
  const sculptureMatch = text.match(/sculpture\((.*?)\)/i);
  let originalPrice = 0;

  if (sculptureMatch) {
    originalPrice = 500;
  } else {
    const textWithoutSpaces = text.replace(/\s/g, '');
    // Count grapheme clusters for proper emoji/character counting
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const charCount = Array.from(segmenter.segment(textWithoutSpaces)).length;
    originalPrice = charCount > 4 ? charCount * 35 : 175;
  }

  return { original: originalPrice, advance: Math.ceil(originalPrice / 2) };
}

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const prefix = 'GG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Indian phone number
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  return /^(91)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate unique ID
 */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Order status labels and colors
 */
export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  in_progress: { label: 'In Progress', color: '#8b5cf6' },
  completed: { label: 'Completed', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};
