// utils/generateIna.js
export function generateIna() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 caractères alphanumériques
  return `INE-${datePart}-${randomPart}`;
}
