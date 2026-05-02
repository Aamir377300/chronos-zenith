/**
 * Returns today's date as YYYY-MM-DD string (local time)
 */
const todayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns yesterday's date as YYYY-MM-DD string (local time)
 */
const yesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if two YYYY-MM-DD strings are consecutive days.
 * Parses dates by splitting to avoid UTC vs local timezone issues.
 */
const areConsecutiveDays = (dateA, dateB) => {
  const [ayear, amonth, aday] = dateA.split('-').map(Number);
  const [byear, bmonth, bday] = dateB.split('-').map(Number);
  const a = new Date(ayear, amonth - 1, aday);
  const b = new Date(byear, bmonth - 1, bday);
  const diff = Math.abs(b - a);
  return diff === 86400000; // exactly 1 day in ms
};

module.exports = { todayString, yesterdayString, areConsecutiveDays };
