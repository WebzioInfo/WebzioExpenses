import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY, DATE_FORMATS } from "./constants";

/**
 * Utility for combining Tailwind classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to currency string (INR by default)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (date, options = DATE_FORMATS.DISPLAY) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat(CURRENCY.LOCALE, options).format(new Date(date));
};

/**
 * Returns a greeting based on the current hour
 */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/**
 * Generates a random alphanumeric ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Safe conversion to number
 */
export const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};
