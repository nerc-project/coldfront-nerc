/**
 * Chart Utilities Module (Basic)
 * 
 * Basic utility functions for date label generation.
 * This is the foundational version for Issue #176.
 */

const ChartUtils = (function() {
  'use strict';

  /* ========================================
     DATE/LABEL UTILITIES
     ======================================== */

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /**
   * Checks if a year is a leap year.
   * @param {number} year - The year to check
   * @returns {boolean} - True if leap year
   */
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Gets the number of days in a given month.
   * @param {number} year - The year
   * @param {number} month - The month (0-indexed, 0 = January)
   * @returns {number} - Number of days in the month
   */
  function getDaysInMonth(year, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 1 && isLeapYear(year)) {
      return 29;
    }
    return daysInMonth[month];
  }

  /**
   * Generates date labels for a given month.
   * @param {number} year - The year
   * @param {number} month - The month (0-indexed)
   * @returns {Array} - Array of date label strings (e.g., ['Jan 1', 'Jan 2', ...])
   */
  function generateMonthLabels(year, month) {
    const monthName = MONTH_NAMES[month];
    const daysCount = getDaysInMonth(year, month);
    const labels = [];

    for (let day = 1; day <= daysCount; day++) {
      labels.push(`${monthName} ${day}`);
    }

    return labels;
  }

  /**
   * Generates usage labels for a given year/month or defaults to current.
   * @param {number|null} year - The year (defaults to current)
   * @param {number|null} month - The month (defaults to current)
   * @returns {Array} - Array of date label strings
   */
  function generateUsageLabels(year = null, month = null) {
    if (year === null || month === null) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }
    return generateMonthLabels(year, month);
  }

  /* ========================================
     PUBLIC API
     ======================================== */

  return {
    MONTH_NAMES,
    isLeapYear,
    getDaysInMonth,
    generateMonthLabels,
    generateUsageLabels
  };

})();
